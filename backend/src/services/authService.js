const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const env = require("../config/env");
const User = require("../models/User");
const Role = require("../models/Role");
const { AppError } = require("../middleware/errorHandler.middleware");

// Compared against when the email is unknown, so response time doesn't reveal which emails exist.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", env.bcryptRounds);

const signToken = (user) =>
  jwt.sign({ sub: user._id.toString(), tv: user.tokenVersion || 0 }, env.jwtSecret, {
    algorithm: "HS256",
    expiresIn: env.jwtExpiresIn,
  });

const register = async ({ name, email, password }) => {
  if (await User.exists({ email })) {
    throw new AppError(409, "An account with this email already exists");
  }

  await Role.ensureDefaults();
  // The very first account bootstraps the system as Admin; everyone after is a least-privilege Employee.
  const isFirstUser = !(await User.exists({}));
  const role = await Role.findOne({ name: isFirstUser ? "Admin" : "Employee" });

  const passwordHash = await bcrypt.hash(password, env.bcryptRounds);
  const user = await User.create({ name, email, passwordHash, role: role._id });
  await user.populate("role");
  return { user, token: signToken(user) };
};

const login = async ({ email, password }) => {
  const user = await User.findOne({ email }).select("+passwordHash").populate("role");
  const valid = await bcrypt.compare(password, user ? user.passwordHash : DUMMY_HASH);
  if (!user || !valid) throw new AppError(401, "Invalid email or password");
  if (user.status !== "active") throw new AppError(403, "This account has been deactivated");

  user.lastLoginAt = new Date();
  await user.save();
  return { user, token: signToken(user) };
};

// Changing the password signs out every other session and returns a fresh token for this one.
const changePassword = async (userId, { currentPassword, newPassword }) => {
  const user = await User.findById(userId).select("+passwordHash").populate("role");
  if (!user || !(await bcrypt.compare(currentPassword, user.passwordHash))) {
    throw new AppError(400, "Your current password is incorrect");
  }
  if (currentPassword === newPassword) throw new AppError(400, "Choose a password you have not used just now");

  user.passwordHash = await bcrypt.hash(newPassword, env.bcryptRounds);
  user.tokenVersion = (user.tokenVersion || 0) + 1;
  await user.save();
  return { user, token: signToken(user) };
};

module.exports = { register, login, changePassword, signToken };

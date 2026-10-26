const bcrypt = require("bcryptjs");
const env = require("../../config/env");
const User = require("../../models/User");
const Role = require("../../models/Role");
const { AppError } = require("../../middleware/errorHandler.middleware");
const { searchFilter } = require("../../utils/common");

const POPULATE = { path: "role", select: "name" };

const adminRoleId = async () => (await Role.findOne({ name: "Admin" }))?._id;

const list = async ({ search, roleId, status }) => {
  const filter = {};
  if (roleId && roleId !== "All") filter.role = roleId;
  if (status && status !== "All") filter.status = status;
  const clause = searchFilter(search, ["name", "email"]);
  if (clause) Object.assign(filter, clause);

  const adminId = await adminRoleId();
  const [items, total, active, admins, roles] = await Promise.all([
    User.find(filter).populate(POPULATE).sort({ createdAt: 1 }).limit(500),
    User.countDocuments(),
    User.countDocuments({ status: "active" }),
    User.countDocuments({ role: adminId, status: "active" }),
    Role.find().sort({ createdAt: 1 }).select("name"),
  ]);

  return {
    items,
    total,
    roles: roles.map((role) => ({ id: role.id, name: role.name })),
    summary: { total, active, inactive: total - active, admins },
  };
};

const create = async ({ name, email, password, roleId }) => {
  if (await User.exists({ email })) throw new AppError(409, "An account with this email already exists");
  if (!(await Role.exists({ _id: roleId }))) throw new AppError(404, "Role not found");

  const passwordHash = await bcrypt.hash(password, env.bcryptRounds);
  const user = await User.create({ name, email, passwordHash, role: roleId });
  return user.populate(POPULATE);
};

// Would this change leave the workspace without any active Admin?
const removesLastAdmin = async (user, { roleId, status }) => {
  const adminId = await adminRoleId();
  const isActiveAdmin = String(user.role) === String(adminId) && user.status === "active";
  if (!isActiveAdmin) return false;

  const staysAdmin = (roleId === undefined || String(roleId) === String(adminId)) && (status === undefined || status === "active");
  if (staysAdmin) return false;

  return (await User.countDocuments({ role: adminId, status: "active", _id: { $ne: user._id } })) === 0;
};

const update = async (id, { name, roleId, status, password }, actingUser) => {
  const user = await User.findById(id);
  if (!user) throw new AppError(404, "User not found");

  const isSelf = String(user._id) === String(actingUser._id);
  if (isSelf && status === "inactive") throw new AppError(400, "You cannot deactivate your own account");
  if (isSelf && roleId !== undefined && String(roleId) !== String(user.role)) {
    throw new AppError(400, "You cannot change your own role");
  }
  if (roleId !== undefined && !(await Role.exists({ _id: roleId }))) throw new AppError(404, "Role not found");
  if (await removesLastAdmin(user, { roleId, status })) {
    throw new AppError(409, "There must always be at least one active Admin");
  }

  if (name !== undefined) user.name = name;
  if (roleId !== undefined) user.role = roleId;
  if (status !== undefined) user.status = status;
  if (password !== undefined) user.passwordHash = await bcrypt.hash(password, env.bcryptRounds);
  await user.save();
  return user.populate(POPULATE);
};

module.exports = { list, create, update };

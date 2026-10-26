const jwt = require("jsonwebtoken");
const env = require("../config/env");
const User = require("../models/User");
const { AppError } = require("./errorHandler.middleware");

// Verifies the Bearer token and loads the user (with role) onto req.user.
// The user is re-read on every request so deactivation and role changes apply immediately.
const authenticate = async (req, _res, next) => {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) throw new AppError(401, "Authentication required");

  let payload;
  try {
    payload = jwt.verify(token, env.jwtSecret, { algorithms: ["HS256"] });
  } catch {
    throw new AppError(401, "Invalid or expired token");
  }

  const user = await User.findById(payload.sub).populate("role");
  if (!user || user.status !== "active") {
    throw new AppError(401, "Account not found or inactive");
  }

  req.user = user;
  next();
};

// Server-side permission check, e.g. authorize("finance", "create").
const authorize = (module, action) => (req, _res, next) => {
  if (!req.user) throw new AppError(401, "Authentication required");
  if (!req.user.role?.permissions?.[module]?.[action]) {
    throw new AppError(403, "You do not have permission to perform this action");
  }
  next();
};

module.exports = { authenticate, authorize };

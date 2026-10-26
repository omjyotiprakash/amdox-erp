const AuditLog = require("../models/AuditLog");
const logger = require("../config/logging");

const ACTIONS = { POST: "create", PUT: "update", PATCH: "update", DELETE: "delete" };
const isObjectId = (segment) => /^[0-9a-f]{24}$/i.test(segment);

// Records who changed what. It runs after the response is sent, so it never slows a request or
// breaks one: a failure to write the log is only reported to the server log.
module.exports = (req, res, next) => {
  const action = ACTIONS[req.method];
  if (!action) return next();

  res.on("finish", () => {
    // Only successful changes by a signed-in user (login and register have no req.user).
    if (res.statusCode >= 400 || !req.user) return;

    const path = req.originalUrl.split("?")[0].replace(/^\/api\/?/, "");
    const segments = path.split("/").filter(Boolean);

    AuditLog.create({
      user: req.user._id,
      userName: req.user.name,
      action,
      resource: segments.filter((segment) => !isObjectId(segment)).join("/"),
      target: segments.find(isObjectId) || "",
      method: req.method,
      path,
      status: res.statusCode,
      ip: req.ip || "",
    }).catch((err) => logger.error(`Audit log write failed: ${err.message}`));
  });

  next();
};

const logger = require("../config/logging");

class AppError extends Error {
  constructor(status, message, details) {
    super(message);
    this.status = status;
    this.details = details;
  }
}

const notFound = (req, _res, next) =>
  next(new AppError(404, `Route not found: ${req.method} ${req.originalUrl}`));

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, _req, res, _next) => {
  let status = err.status || 500;
  let message = err.message;

  if (err.code === 11000) {
    status = 409;
    message = "A record with that value already exists";
  } else if (err.name === "ValidationError" || err.name === "CastError") {
    status = 400;
  } else if (err.type === "entity.parse.failed") {
    status = 400;
    message = "Invalid JSON body";
  }

  if (status >= 500) {
    logger.error(err.stack || message);
    message = "Internal server error"; // never leak internals
  }

  res
    .status(status)
    .json({ success: false, message, ...(err.details && { details: err.details }) });
};

module.exports = { AppError, notFound, errorHandler };

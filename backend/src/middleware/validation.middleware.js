const { AppError } = require("./errorHandler.middleware");

// Validates req.body against a zod schema and replaces it with the parsed value.
const validate = (schema) => (req, _res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const details = result.error.issues.map((i) => ({
      field: i.path.join("."),
      message: i.message,
    }));
    return next(new AppError(400, details[0]?.message || "Invalid request", details));
  }
  req.body = result.data;
  next();
};

module.exports = { validate };

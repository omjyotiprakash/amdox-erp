const rateLimit = require("express-rate-limit");

const json = (message) => ({ success: false, message });

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: json("Too many requests, please try again later"),
});

// Strict limiter for login/register to slow down password guessing.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: Number(process.env.AUTH_RATE_LIMIT) || 20,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: json("Too many attempts, please try again in 15 minutes"),
});

module.exports = { apiLimiter, authLimiter };

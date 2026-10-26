require("dotenv").config();

const required = (name, fallback) => {
  const value = process.env[name] ?? fallback;
  if (value === undefined || value === "") {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const nodeEnv = process.env.NODE_ENV || "development";
const isProduction = nodeEnv === "production";

module.exports = {
  nodeEnv,
  isProduction,
  port: Number(process.env.PORT) || 5000,
  mongoUri: required("MONGODB_URI", isProduction ? undefined : "mongodb://127.0.0.1:27017/amdox_erp"),
  // No dev fallback in production: a guessable secret would let anyone forge tokens.
  jwtSecret: required("JWT_SECRET", isProduction ? undefined : "dev-only-insecure-secret-change-me"),
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "1d",
  // Behind a hosting proxy (Render, Vercel) the real client IP is in X-Forwarded-For.
  trustProxy: process.env.TRUST_PROXY ? Number(process.env.TRUST_PROXY) : isProduction ? 1 : false,
  // Public sign-up is closed once the first (Admin) account exists. Set to "true" only if you really
  // want anyone to be able to create an Employee account themselves.
  allowPublicRegistration: process.env.ALLOW_PUBLIC_REGISTRATION === "true",
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS) || 12,
  corsOrigins: (process.env.CORS_ORIGINS || "http://localhost:5173")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
};

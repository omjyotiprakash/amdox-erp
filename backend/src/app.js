const express = require("express");
const helmet = require("helmet");
const corsMiddleware = require("./middleware/cors.middleware");
const requestLogger = require("./middleware/requestLogger.middleware");
const { apiLimiter } = require("./middleware/rateLimiter.middleware");
const { notFound, errorHandler } = require("./middleware/errorHandler.middleware");
const routes = require("./routes");
const auditLogger = require("./middleware/audit.middleware");
const env = require("./config/env");

const app = express();

app.set("trust proxy", env.trustProxy);

app.use(helmet());
app.use(corsMiddleware);
app.use(express.json({ limit: "1mb" }));
app.use(requestLogger);

app.get("/", (_req, res) => res.send("AMDox ERP Backend is running!"));
app.use("/api", apiLimiter, auditLogger, routes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;

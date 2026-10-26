const app = require("./app");
const env = require("./config/env");
const logger = require("./config/logging");
const { connectDatabase } = require("./config/database");
const Role = require("./models/Role");

const start = async () => {
  await connectDatabase();
  logger.info("MongoDB connected");
  await Role.ensureDefaults();

  app.listen(env.port, () => logger.info(`Server running on http://localhost:${env.port}`));
};

start().catch((err) => {
  logger.error(`Failed to start server: ${err.message}`);
  process.exit(1);
});

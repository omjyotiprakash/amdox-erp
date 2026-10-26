const env = require("./env");

const log = (level, message, meta) => {
  const line = `[${new Date().toISOString()}] ${level.toUpperCase()} ${message}`;
  const out = level === "error" ? console.error : console.log;
  if (meta !== undefined) out(line, meta);
  else out(line);
};

module.exports = {
  info: (message, meta) => log("info", message, meta),
  warn: (message, meta) => log("warn", message, meta),
  error: (message, meta) => log("error", message, meta),
  debug: (message, meta) => {
    if (!env.isProduction) log("debug", message, meta);
  },
};

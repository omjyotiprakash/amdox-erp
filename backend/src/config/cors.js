const env = require("./env");

module.exports = {
  origin(origin, callback) {
    // Requests without an Origin header (curl, server-to-server) are allowed.
    if (!origin || env.corsOrigins.includes(origin)) return callback(null, true);
    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

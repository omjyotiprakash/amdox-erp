const mongoose = require("mongoose");
const env = require("./env");

const connectDatabase = async (uri = env.mongoUri) => {
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  return mongoose.connection;
};

const disconnectDatabase = () => mongoose.disconnect();

module.exports = { connectDatabase, disconnectDatabase };

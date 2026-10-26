const Setting = require("../../models/Setting");

const get = () => Setting.current();

const update = async (data) =>
  Setting.findOneAndUpdate({ _id: "default" }, { $set: data }, { upsert: true, returnDocument: "after", runValidators: true });

module.exports = { get, update };

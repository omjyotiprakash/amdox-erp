const mongoose = require("mongoose");

// Atomic sequence generator for human-readable codes (TXN-1001, AP-1001, ...).
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

counterSchema.statics.nextCode = async function nextCode(prefix, start = 1000) {
  const counter = await this.findOneAndUpdate(
    { _id: prefix },
    { $inc: { seq: 1 } },
    { upsert: true, returnDocument: "after" }
  );
  return `${prefix}-${start + counter.seq}`;
};

module.exports = mongoose.model("Counter", counterSchema);

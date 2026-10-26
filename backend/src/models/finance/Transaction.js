const mongoose = require("mongoose");
const { toDateString, toJSONTransform } = require("../../services/finance/financeUtils");

const transactionSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    date: { type: Date, required: true },
    description: { type: String, required: true, trim: true, maxlength: 200 },
    account: { type: String, required: true, trim: true, maxlength: 100 },
    type: { type: String, enum: ["Income", "Expense"], required: true },
    amount: { type: Number, required: true, min: 0.01 },
    status: { type: String, enum: ["Posted", "Pending"], default: "Posted" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

transactionSchema.index({ date: -1 });

transactionSchema.set(
  "toJSON",
  {
    transform: toJSONTransform((ret) => {
      ret.date = toDateString(ret.date);
      return ret;
    }),
  }
);

module.exports = mongoose.model("Transaction", transactionSchema);

const mongoose = require("mongoose");
const { startOfTodayUTC, toDateString, toJSONTransform } = require("../../services/finance/financeUtils");

// One model for both directions: "payable" (vendor bills we owe) and "receivable" (customer invoices owed to us).
const invoiceSchema = new mongoose.Schema(
  {
    kind: { type: String, enum: ["payable", "receivable"], required: true },
    code: { type: String, required: true, unique: true },
    party: { type: String, required: true, trim: true, maxlength: 150 }, // vendor or customer
    invoiceNumber: { type: String, required: true, trim: true, maxlength: 50 },
    dueDate: { type: Date, required: true },
    amount: { type: Number, required: true, min: 0.01 },
    // Only Pending/Paid are stored. "Overdue" is derived from dueDate so it can never go stale.
    status: { type: String, enum: ["Pending", "Paid"], default: "Pending" },
    paidAt: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

invoiceSchema.index({ kind: 1, party: 1, invoiceNumber: 1 }, { unique: true });
invoiceSchema.index({ kind: 1, dueDate: 1 });

invoiceSchema.set(
  "toJSON",
  {
    transform: toJSONTransform((ret) => {
      if (ret.status === "Pending" && new Date(ret.dueDate) < startOfTodayUTC()) {
        ret.status = "Overdue";
      }
      ret.dueDate = toDateString(ret.dueDate);
      return ret;
    }),
  }
);

module.exports = mongoose.model("Invoice", invoiceSchema);

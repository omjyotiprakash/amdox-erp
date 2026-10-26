const mongoose = require("mongoose");
const { toJSONTransform } = require("../../utils/common");

// One payslip row per employee per month. Salary figures are a snapshot taken when payroll is generated,
// so later changes to an employee's salary don't rewrite history.
const payrollSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    month: { type: String, required: true, match: /^\d{4}-(0[1-9]|1[0-2])$/ },
    basicSalary: { type: Number, required: true, min: 0 },
    deductions: { type: Number, required: true, min: 0 },
    netSalary: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["Pending", "Processing", "Paid"], default: "Pending" },
    paidAt: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

payrollSchema.index({ employee: 1, month: 1 }, { unique: true });
payrollSchema.index({ month: 1 });

payrollSchema.set("toJSON", { transform: toJSONTransform() });

module.exports = mongoose.model("Payroll", payrollSchema);

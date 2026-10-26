const mongoose = require("mongoose");
const { toDateString, toJSONTransform } = require("../../utils/common");

const employeeSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    department: { type: String, required: true, trim: true, maxlength: 80 },
    jobTitle: { type: String, required: true, trim: true, maxlength: 100 },
    joinedOn: { type: Date, required: true },
    status: { type: String, enum: ["Active", "On Leave", "Inactive"], default: "Active" },
    basicSalary: { type: Number, default: 0, min: 0 },
    deductions: { type: Number, default: 0, min: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

employeeSchema.index({ department: 1 });

employeeSchema.set("toJSON", {
  transform: toJSONTransform((ret) => {
    ret.joinedOn = toDateString(ret.joinedOn);
    return ret;
  }),
});

module.exports = mongoose.model("Employee", employeeSchema);

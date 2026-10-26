const mongoose = require("mongoose");
const { toDateString, toJSONTransform } = require("../../utils/common");

const LEAVE_TYPES = ["Casual Leave", "Sick Leave", "Annual Leave", "Unpaid Leave"];

const leaveSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    type: { type: String, enum: LEAVE_TYPES, required: true },
    from: { type: Date, required: true },
    to: { type: Date, required: true },
    days: { type: Number, required: true, min: 1 },
    reason: { type: String, trim: true, maxlength: 500, default: "" },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    decidedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    decidedAt: { type: Date },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

leaveSchema.index({ employee: 1, from: 1, to: 1 });

leaveSchema.set("toJSON", {
  transform: toJSONTransform((ret) => {
    ret.from = toDateString(ret.from);
    ret.to = toDateString(ret.to);
    return ret;
  }),
});

module.exports = mongoose.model("Leave", leaveSchema);
module.exports.LEAVE_TYPES = LEAVE_TYPES;

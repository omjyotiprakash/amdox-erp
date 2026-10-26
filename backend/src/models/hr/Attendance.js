const mongoose = require("mongoose");
const { toDateString, toJSONTransform } = require("../../utils/common");

// One record per employee per day. Times are "HH:MM" strings in the user's local time.
const attendanceSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    date: { type: Date, required: true },
    status: { type: String, enum: ["Present", "Late", "Absent", "On Leave"], required: true },
    checkIn: { type: String, default: "" },
    checkOut: { type: String, default: "" },
    markedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

attendanceSchema.index({ employee: 1, date: 1 }, { unique: true });
attendanceSchema.index({ date: 1 });

attendanceSchema.set("toJSON", {
  transform: toJSONTransform((ret) => {
    ret.date = toDateString(ret.date);
    return ret;
  }),
});

module.exports = mongoose.model("Attendance", attendanceSchema);

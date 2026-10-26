const mongoose = require("mongoose");
const { toJSONTransform } = require("../../utils/common");

// One employee working on one project at a given share of their time.
// An employee can have several assignments as long as the total stays within 100%.
const assignmentSchema = new mongoose.Schema(
  {
    employee: { type: mongoose.Schema.Types.ObjectId, ref: "Employee", required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    allocation: { type: Number, required: true, min: 1, max: 100, validate: Number.isInteger },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

assignmentSchema.index({ employee: 1, project: 1 }, { unique: true });
assignmentSchema.index({ project: 1 });

assignmentSchema.set("toJSON", { transform: toJSONTransform() });

module.exports = mongoose.model("Assignment", assignmentSchema);

const mongoose = require("mongoose");
const { toDateString, toJSONTransform } = require("../../utils/common");

const PROJECT_STATUSES = ["Planning", "In Progress", "Completed", "On Hold", "Cancelled"];

const milestoneSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 150 },
  dueDate: { type: Date, required: true },
  status: { type: String, enum: ["Upcoming", "In Progress", "Completed"], default: "Upcoming" },
});

const transformMilestone = (ret) => {
  ret.id = ret._id.toString();
  delete ret._id;
  ret.dueDate = toDateString(ret.dueDate);
  return ret;
};
milestoneSchema.set("toJSON", { transform: (_doc, ret) => transformMilestone(ret) });

const projectSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true, maxlength: 150 },
    description: { type: String, trim: true, maxlength: 2000, default: "" },
    client: { type: String, trim: true, maxlength: 150, default: "Internal" },
    manager: { type: String, trim: true, maxlength: 100, default: "" },
    priority: { type: String, enum: ["Low", "Medium", "High", "Critical"], default: "Medium" },
    startDate: { type: Date, required: true },
    dueDate: { type: Date, required: true },
    budget: { type: Number, default: 0, min: 0 },
    spent: { type: Number, default: 0, min: 0 },
    progress: { type: Number, default: 0, min: 0, max: 100 },
    status: { type: String, enum: PROJECT_STATUSES, default: "Planning" },
    milestones: [milestoneSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

projectSchema.set("toJSON", {
  transform: toJSONTransform((ret) => {
    ret.startDate = toDateString(ret.startDate);
    ret.dueDate = toDateString(ret.dueDate);
    return ret;
  }),
});

module.exports = mongoose.model("Project", projectSchema);
module.exports.PROJECT_STATUSES = PROJECT_STATUSES;

const Project = require("../../models/project/Project");
const Assignment = require("../../models/project/Resource");
const Counter = require("../../models/Counter");
const { AppError } = require("../../middleware/errorHandler.middleware");
const { searchFilter } = require("../../utils/common");

const assertDates = ({ startDate, dueDate }) => {
  if (dueDate < startDate) throw new AppError(400, "Due date cannot be before the start date");
};

const list = async ({ search, status }) => {
  const filter = {};
  if (status && status !== "All") filter.status = status;
  const clause = searchFilter(search, ["code", "name", "client", "manager"]);
  if (clause) Object.assign(filter, clause);

  const [items, total, counts, [money]] = await Promise.all([
    Project.find(filter).select("-milestones").sort({ code: 1 }).limit(500),
    Project.countDocuments(),
    Project.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Project.aggregate([{ $group: { _id: null, budget: { $sum: "$budget" }, spent: { $sum: "$spent" } } }]),
  ]);
  const countOf = (status) => counts.find((row) => row._id === status)?.count || 0;

  return {
    items,
    total,
    summary: {
      total,
      inProgress: countOf("In Progress"),
      completed: countOf("Completed"),
      totalBudget: money?.budget || 0,
      totalSpent: money?.spent || 0,
    },
  };
};

const get = async (id) => {
  const project = await Project.findById(id);
  if (!project) throw new AppError(404, "Project not found");

  // The team is whoever is assigned to this project on the Resource Planning page.
  const assignments = await Assignment.find({ project: id }).populate("employee", "code name jobTitle department");
  const team = assignments.map((assignment) => ({
    id: assignment.id,
    allocation: assignment.allocation,
    employee: assignment.employee,
  }));

  return { project, team };
};

const create = async (data, userId) => {
  assertDates(data);
  return Project.create({ ...data, code: await Counter.nextCode("PRJ"), createdBy: userId });
};

const update = async (id, data) => {
  const project = await Project.findById(id);
  if (!project) throw new AppError(404, "Project not found");

  project.set(data);
  assertDates(project);
  return project.save();
};

const remove = async (id) => {
  const project = await Project.findByIdAndDelete(id);
  if (!project) throw new AppError(404, "Project not found");
  await Assignment.deleteMany({ project: id });
};

const addMilestone = async (id, { title, dueDate }) => {
  const project = await Project.findByIdAndUpdate(
    id,
    { $push: { milestones: { title, dueDate } } },
    { returnDocument: "after", runValidators: true }
  );
  if (!project) throw new AppError(404, "Project not found");
  return project;
};

const setMilestoneStatus = async (id, milestoneId, status) => {
  const project = await Project.findOneAndUpdate(
    { _id: id, "milestones._id": milestoneId },
    { $set: { "milestones.$.status": status } },
    { returnDocument: "after" }
  );
  if (!project) throw new AppError(404, "Milestone not found");
  return project;
};

const removeMilestone = async (id, milestoneId) => {
  const project = await Project.findOneAndUpdate(
    { _id: id, "milestones._id": milestoneId },
    { $pull: { milestones: { _id: milestoneId } } },
    { returnDocument: "after" }
  );
  if (!project) throw new AppError(404, "Milestone not found");
  return project;
};

module.exports = { list, get, create, update, remove, addMilestone, setMilestoneStatus, removeMilestone };

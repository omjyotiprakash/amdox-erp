const Employee = require("../../models/hr/Employee");
const Leave = require("../../models/hr/Leave");
const Counter = require("../../models/Counter");
const { AppError } = require("../../middleware/errorHandler.middleware");
const { searchFilter } = require("../../utils/common");
const { matchingIds } = require("./employeeService");

const ONE_DAY = 24 * 60 * 60 * 1000;
const POPULATE = { path: "employee", select: "code name department" };

const list = async ({ search, status }) => {
  const filter = {};
  if (status && status !== "All") filter.status = status;

  const clause = searchFilter(search, ["code", "type"]);
  if (clause) {
    const employeeIds = await matchingIds(search);
    filter.$or = [...clause.$or, { employee: { $in: employeeIds } }];
  }

  const [items, total, all] = await Promise.all([
    Leave.find(filter).populate(POPULATE).sort({ from: -1, createdAt: -1 }).limit(500),
    Leave.countDocuments(),
    Leave.aggregate([{ $group: { _id: "$status", count: { $sum: 1 }, days: { $sum: "$days" } } }]),
  ]);
  const row = (status) => all.find((entry) => entry._id === status);

  return {
    items,
    total,
    summary: {
      total,
      pending: row("Pending")?.count || 0,
      approved: row("Approved")?.count || 0,
      approvedDays: row("Approved")?.days || 0,
    },
  };
};

const create = async ({ employeeId, type, from, to, reason }, userId) => {
  if (to < from) throw new AppError(400, "End date cannot be before the start date");

  const employee = await Employee.findById(employeeId);
  if (!employee) throw new AppError(404, "Employee not found");
  if (employee.status === "Inactive") throw new AppError(400, "Cannot request leave for an inactive employee");

  const overlapping = await Leave.exists({
    employee: employeeId,
    status: { $in: ["Pending", "Approved"] },
    from: { $lte: to },
    to: { $gte: from },
  });
  if (overlapping) throw new AppError(409, "This employee already has a leave request for those dates");

  const days = Math.round((to - from) / ONE_DAY) + 1;
  const leave = await Leave.create({
    employee: employeeId,
    type,
    from,
    to,
    days,
    reason,
    code: await Counter.nextCode("LV"),
    createdBy: userId,
  });
  return leave.populate(POPULATE);
};

// Only a Pending request can be decided, and only once.
const decide = async (id, status, userId) => {
  const leave = await Leave.findOneAndUpdate(
    { _id: id, status: "Pending" },
    { status, decidedBy: userId, decidedAt: new Date() },
    { returnDocument: "after" }
  ).populate(POPULATE);
  if (leave) return leave;
  if (await Leave.exists({ _id: id })) throw new AppError(409, "This request has already been decided");
  throw new AppError(404, "Leave request not found");
};

const remove = async (id) => {
  const leave = await Leave.findOneAndDelete({ _id: id, status: "Pending" });
  if (leave) return;
  if (await Leave.exists({ _id: id })) throw new AppError(409, "Only pending requests can be deleted");
  throw new AppError(404, "Leave request not found");
};

module.exports = { list, create, decide, remove };

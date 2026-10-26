const Employee = require("../../models/hr/Employee");
const Attendance = require("../../models/hr/Attendance");
const Leave = require("../../models/hr/Leave");
const Payroll = require("../../models/hr/Payroll");
const Counter = require("../../models/Counter");
const { AppError } = require("../../middleware/errorHandler.middleware");
const { searchFilter } = require("../../utils/common");

const NAME_FIELDS = ["code", "name", "email", "jobTitle", "department"];

// Ids of employees whose name/code/etc. contain `search` (used by leave and payroll searches).
const matchingIds = async (search) => {
  const clause = searchFilter(search, NAME_FIELDS);
  if (!clause) return null;
  return Employee.find(clause).distinct("_id");
};

const assertSalary = ({ basicSalary, deductions }) => {
  if (deductions > basicSalary) throw new AppError(400, "Deductions cannot exceed the basic salary");
};

const list = async ({ search, department, status }) => {
  const filter = {};
  if (department && department !== "All") filter.department = department;
  if (status && status !== "All") filter.status = status;
  const clause = searchFilter(search, NAME_FIELDS);
  if (clause) Object.assign(filter, clause);

  const [items, total, counts, departments] = await Promise.all([
    Employee.find(filter).sort({ code: 1 }).limit(500),
    Employee.countDocuments(),
    Employee.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Employee.distinct("department"),
  ]);
  const countOf = (status) => counts.find((row) => row._id === status)?.count || 0;

  return {
    items,
    total,
    departments: departments.sort(),
    summary: { total, active: countOf("Active"), onLeave: countOf("On Leave") },
  };
};

const create = async (data, userId) => {
  assertSalary(data);
  try {
    return await Employee.create({ ...data, code: await Counter.nextCode("EMP"), createdBy: userId });
  } catch (err) {
    if (err.code === 11000) throw new AppError(409, "An employee with this email already exists");
    throw err;
  }
};

const update = async (id, data) => {
  const employee = await Employee.findById(id);
  if (!employee) throw new AppError(404, "Employee not found");

  employee.set(data);
  assertSalary(employee);
  try {
    return await employee.save();
  } catch (err) {
    if (err.code === 11000) throw new AppError(409, "An employee with this email already exists");
    throw err;
  }
};

// Employees with history are never deleted: payroll and leave records must stay accurate.
const remove = async (id) => {
  const hasHistory = await Promise.all([
    Attendance.exists({ employee: id }),
    Leave.exists({ employee: id }),
    Payroll.exists({ employee: id }),
  ]);
  if (hasHistory.some(Boolean)) {
    throw new AppError(409, "This employee has attendance, leave or payroll records. Set the status to Inactive instead.");
  }
  const employee = await Employee.findByIdAndDelete(id);
  if (!employee) throw new AppError(404, "Employee not found");
};

module.exports = { list, create, update, remove, matchingIds };

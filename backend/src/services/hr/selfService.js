const Employee = require("../../models/hr/Employee");
const Attendance = require("../../models/hr/Attendance");
const Leave = require("../../models/hr/Leave");
const Payroll = require("../../models/hr/Payroll");
const leaveService = require("./leaveService");
const { AppError } = require("../../middleware/errorHandler.middleware");

// A login account is linked to its HR record by the work email, so HR only has to create the
// employee with the same email the person signs in with. Everything here is scoped to that one record.
const myEmployee = (user) => Employee.findOne({ email: user.email });

const requireEmployee = async (user) => {
  const employee = await myEmployee(user);
  if (!employee) {
    throw new AppError(404, `No employee record is linked to ${user.email}. Ask HR to add you using this work email.`);
  }
  return employee;
};

const profile = async (user) => {
  const employee = await myEmployee(user);
  return { linked: Boolean(employee), email: user.email, employee };
};

const monthRange = (month) => {
  const value = month || new Date().toISOString().slice(0, 7);
  const [year, number] = value.split("-").map(Number);
  return { month: value, from: new Date(Date.UTC(year, number - 1, 1)), to: new Date(Date.UTC(year, number, 1)) };
};

const attendance = async (user, month) => {
  const range = monthRange(month);
  const employee = await myEmployee(user);
  const items = employee
    ? await Attendance.find({ employee: employee._id, date: { $gte: range.from, $lt: range.to } }).sort({ date: -1 })
    : [];

  const count = (status) => items.filter((item) => item.status === status).length;
  return {
    linked: Boolean(employee),
    month: range.month,
    items,
    summary: { present: count("Present"), late: count("Late"), absent: count("Absent"), onLeave: count("On Leave") },
  };
};

const leave = async (user) => {
  const employee = await myEmployee(user);
  const items = employee ? await Leave.find({ employee: employee._id }).sort({ from: -1, createdAt: -1 }).limit(100) : [];
  const count = (status) => items.filter((item) => item.status === status).length;
  return {
    linked: Boolean(employee),
    items,
    summary: {
      pending: count("Pending"),
      approved: count("Approved"),
      approvedDays: items.filter((item) => item.status === "Approved").reduce((sum, item) => sum + item.days, 0),
    },
  };
};

// Employees can only ever request leave for themselves; the employee id comes from the account, not the request.
const requestLeave = async (user, { type, from, to, reason }) => {
  const employee = await requireEmployee(user);
  return leaveService.create({ employeeId: employee.id, type, from, to, reason }, user._id);
};

const cancelLeave = async (user, id) => {
  const employee = await requireEmployee(user);
  if (!(await Leave.exists({ _id: id, employee: employee._id }))) throw new AppError(404, "Leave request not found");
  await leaveService.remove(id); // refuses anything already decided
};

const payslips = async (user) => {
  const employee = await myEmployee(user);
  const items = employee ? await Payroll.find({ employee: employee._id }).sort({ month: -1 }).limit(36) : [];
  return { linked: Boolean(employee), items };
};

module.exports = { profile, attendance, leave, requestLeave, cancelLeave, payslips };

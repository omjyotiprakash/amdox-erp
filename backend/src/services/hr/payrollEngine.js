const Employee = require("../../models/hr/Employee");
const Payroll = require("../../models/hr/Payroll");
const Counter = require("../../models/Counter");
const { AppError } = require("../../middleware/errorHandler.middleware");
const { round2 } = require("../../utils/common");
const { matchingIds } = require("./employeeService");

const POPULATE = { path: "employee", select: "code name department" };

const list = async ({ month, search, status }) => {
  const filter = { month };
  if (status && status !== "All") filter.status = status;
  if ((search || "").trim()) {
    filter.employee = { $in: await matchingIds(search) };
  }

  const [items, total, all] = await Promise.all([
    Payroll.find(filter).populate(POPULATE).sort({ code: 1 }).limit(500),
    Payroll.countDocuments({ month }),
    Payroll.aggregate([
      { $match: { month } },
      { $group: { _id: "$status", count: { $sum: 1 }, net: { $sum: "$netSalary" } } },
    ]),
  ]);
  const row = (status) => all.find((entry) => entry._id === status);

  return {
    month,
    items,
    total,
    summary: {
      totalNet: all.reduce((sum, entry) => sum + entry.net, 0),
      paid: row("Paid")?.net || 0,
      pendingCount: row("Pending")?.count || 0,
    },
  };
};

// Creates a payroll row for every non-inactive employee that doesn't have one for `month` yet.
// Safe to run repeatedly: existing rows (and their statuses) are never touched.
const generate = async (month, userId) => {
  const [employees, existing] = await Promise.all([
    Employee.find({ status: { $ne: "Inactive" }, basicSalary: { $gt: 0 } }).sort({ code: 1 }),
    Payroll.find({ month }).distinct("employee"),
  ]);
  const done = new Set(existing.map(String));
  const todo = employees.filter((employee) => !done.has(employee.id));

  let created = 0;
  for (const employee of todo) {
    await Payroll.create({
      month,
      employee: employee._id,
      basicSalary: employee.basicSalary,
      deductions: employee.deductions,
      netSalary: round2(employee.basicSalary - employee.deductions),
      code: await Counter.nextCode("PAY"),
      createdBy: userId,
    });
    created += 1;
  }

  return { created, alreadyExisted: employees.length - created };
};

const NEXT = { Processing: "Pending", Paid: ["Pending", "Processing"] };

// Moves a payslip forward: Pending -> Processing -> Paid. Paid is final.
const setStatus = async (id, status) => {
  const from = NEXT[status];
  const payroll = await Payroll.findOneAndUpdate(
    { _id: id, status: { $in: [].concat(from) } },
    { status, ...(status === "Paid" && { paidAt: new Date() }) },
    { returnDocument: "after" }
  ).populate(POPULATE);
  if (payroll) return payroll;
  if (await Payroll.exists({ _id: id })) throw new AppError(409, `This payroll entry cannot be moved to ${status}`);
  throw new AppError(404, "Payroll entry not found");
};

module.exports = { list, generate, setStatus };

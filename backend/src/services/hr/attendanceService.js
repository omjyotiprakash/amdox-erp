const Employee = require("../../models/hr/Employee");
const Attendance = require("../../models/hr/Attendance");
const { AppError } = require("../../middleware/errorHandler.middleware");
const { toDateString } = require("../../utils/common");

const ONE_DAY = 24 * 60 * 60 * 1000;

// Everyone who isn't Inactive, each with their record for `date` (or "Not marked").
const daily = async (date) => {
  const [employees, records] = await Promise.all([
    Employee.find({ status: { $ne: "Inactive" } }).sort({ code: 1 }),
    Attendance.find({ date }),
  ]);
  const byEmployee = new Map(records.map((record) => [record.employee.toString(), record]));

  const items = employees.map((employee) => {
    const record = byEmployee.get(employee.id);
    return {
      employeeId: employee.id,
      code: employee.code,
      name: employee.name,
      department: employee.department,
      status: record?.status || "Not marked",
      checkIn: record?.checkIn || "",
      checkOut: record?.checkOut || "",
    };
  });

  const count = (status) => items.filter((item) => item.status === status).length;
  return {
    date: toDateString(date),
    items,
    summary: {
      present: count("Present"),
      late: count("Late"),
      absent: count("Absent"),
      onLeave: count("On Leave"),
      notMarked: count("Not marked"),
      total: items.length,
    },
  };
};

// Create or update the record for one employee on one day.
const mark = async ({ employeeId, date, status, checkIn, checkOut }, userId) => {
  if (date.getTime() > Date.now() + ONE_DAY) throw new AppError(400, "Cannot mark attendance for a future date");

  const employee = await Employee.findById(employeeId);
  if (!employee) throw new AppError(404, "Employee not found");
  if (employee.status === "Inactive") throw new AppError(400, "Cannot mark attendance for an inactive employee");

  const set = { status, markedBy: userId };
  if (status === "Absent" || status === "On Leave") {
    set.checkIn = "";
    set.checkOut = "";
  } else {
    if (checkIn !== undefined) set.checkIn = checkIn;
    if (checkOut !== undefined) set.checkOut = checkOut;
  }

  return Attendance.findOneAndUpdate(
    { employee: employeeId, date },
    { $set: set },
    { upsert: true, returnDocument: "after", setDefaultsOnInsert: true, runValidators: true }
  );
};

module.exports = { daily, mark };

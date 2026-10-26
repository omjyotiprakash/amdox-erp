const { z } = require("zod");
const { text, money, date, time, month } = require("../../utils/schemaHelpers");
const { LEAVE_TYPES } = require("../../models/hr/Leave");

const employeeFields = z.object({
  name: text("Name", 100),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  department: text("Department", 80),
  jobTitle: text("Role", 100),
  joinedOn: date("Join date"),
  status: z.enum(["Active", "On Leave", "Inactive"]),
  basicSalary: money("Basic salary"),
  deductions: money("Deductions"),
});

const employeeSchema = employeeFields.extend({
  status: employeeFields.shape.status.default("Active"),
  basicSalary: employeeFields.shape.basicSalary.default(0),
  deductions: employeeFields.shape.deductions.default(0),
});
const employeeUpdateSchema = employeeFields.partial();

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid employee");

const attendanceSchema = z.object({
  employeeId: objectId,
  date: date("Date"),
  status: z.enum(["Present", "Late", "Absent", "On Leave"], { error: "Invalid attendance status" }),
  checkIn: time("Check-in").optional(),
  checkOut: time("Check-out").optional(),
});

const leaveSchema = z.object({
  employeeId: objectId,
  type: z.enum(LEAVE_TYPES, { error: "Invalid leave type" }),
  from: date("Start date"),
  to: date("End date"),
  reason: z.string().trim().max(500).optional().default(""),
});

const leaveDecisionSchema = z.object({
  status: z.enum(["Approved", "Rejected"], { error: "Decision must be Approved or Rejected" }),
});

const payrollGenerateSchema = z.object({ month });
const payrollStatusSchema = z.object({
  status: z.enum(["Processing", "Paid"], { error: "Status must be Processing or Paid" }),
});

module.exports = {
  employeeSchema,
  employeeUpdateSchema,
  attendanceSchema,
  leaveSchema,
  leaveDecisionSchema,
  payrollGenerateSchema,
  payrollStatusSchema,
};

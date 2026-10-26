const { z } = require("zod");
const { round2 } = require("../../services/finance/financeUtils");

const text = (label, max) => z.string().trim().min(1, `${label} is required`).max(max);

const amount = z
  .coerce.number({ error: "Amount must be a number" })
  .positive("Amount must be greater than zero")
  .max(1e12, "Amount is too large")
  .transform(round2);

// Accepts YYYY-MM-DD and rejects impossible dates such as 2026-02-31.
const date = (label) =>
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, `${label} must be a valid date`)
    .transform((value) => new Date(`${value}T00:00:00.000Z`))
    .refine((value) => !Number.isNaN(value.getTime()), `${label} must be a valid date`);

const transactionFields = z.object({
  date: date("Date"),
  description: text("Description", 200),
  account: text("Account", 100),
  type: z.enum(["Income", "Expense"], { error: "Type must be Income or Expense" }),
  amount,
  status: z.enum(["Posted", "Pending"]),
});

// Create defaults the status; update only touches the fields that are sent.
const transactionSchema = transactionFields.extend({ status: transactionFields.shape.status.default("Posted") });
const transactionUpdateSchema = transactionFields.partial();

const invoiceSchema = z.object({
  party: text("Name", 150),
  invoiceNumber: text("Invoice number", 50),
  dueDate: date("Due date"),
  amount,
});

module.exports = { transactionSchema, transactionUpdateSchema, invoiceSchema };

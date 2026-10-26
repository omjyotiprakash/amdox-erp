const { z } = require("zod");
const { text, amount, date } = require("../../utils/schemaHelpers");

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

const { z } = require("zod");
const { round2 } = require("./common");

const text = (label, max) => z.string().trim().min(1, `${label} is required`).max(max);

const amount = z
  .coerce.number({ error: "Amount must be a number" })
  .positive("Amount must be greater than zero")
  .max(1e12, "Amount is too large")
  .transform(round2);

// Like amount, but zero is allowed (e.g. deductions).
const money = (label) =>
  z
    .coerce.number({ error: `${label} must be a number` })
    .min(0, `${label} cannot be negative`)
    .max(1e12, `${label} is too large`)
    .transform(round2);

// Accepts YYYY-MM-DD and rejects impossible dates such as 2026-02-31.
const date = (label) =>
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, `${label} must be a valid date`)
    .transform((value) => new Date(`${value}T00:00:00.000Z`))
    .refine((value) => !Number.isNaN(value.getTime()), `${label} must be a valid date`);

// 24-hour HH:MM
const time = (label) => z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, `${label} must be a valid time (HH:MM)`);

const month = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, "Month must be in YYYY-MM format");

module.exports = { text, amount, money, date, time, month };

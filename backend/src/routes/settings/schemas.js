const { z } = require("zod");
const { text } = require("../../utils/schemaHelpers");
const { MODULES, ACTIONS } = require("../../models/Permission");

const objectId = (label) => z.string().regex(/^[0-9a-fA-F]{24}$/, `Invalid ${label}`);

const optionalText = (max) => z.string().trim().max(max);

const settingsFields = z.object({
  companyName: text("Company name", 100),
  legalName: optionalText(150),
  email: z.union([z.literal(""), z.string().trim().toLowerCase().email("Enter a valid contact email")]),
  phone: optionalText(30),
  website: z.union([z.literal(""), z.string().trim().url("Website must be a full URL such as https://example.com").max(200)]),
  address: optionalText(250),
  timezone: z.enum(["Asia/Kolkata", "UTC", "America/New_York", "Europe/London"]),
  currency: z.enum(["INR", "USD", "EUR", "GBP"]),
  dateFormat: z.enum(["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]),
  language: z.enum(["English", "Hindi", "Odia"]),
  emailNotifications: z.boolean(),
  lowStockAlerts: z.boolean(),
  weeklyReports: z.boolean(),
});

const permissionsShape = z.object(
  Object.fromEntries(
    MODULES.map((module) => [
      module,
      z.object(Object.fromEntries(ACTIONS.map((action) => [action, z.boolean()]))).partial().optional(),
    ])
  )
);

module.exports = {
  settingsSchema: settingsFields.partial(),
  integrationSchema: z.object({ enabled: z.boolean({ error: "enabled must be true or false" }) }),
  roleSchema: z.object({ name: text("Role name", 60), description: optionalText(200).default("") }),
  rolePermissionsSchema: z.object({ permissions: permissionsShape }),
  userSchema: z.object({
    name: text("Name", 100),
    email: z.string().trim().toLowerCase().email("Enter a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters").max(128),
    roleId: objectId("role"),
  }),
  userUpdateSchema: z.object({
    name: text("Name", 100).optional(),
    roleId: objectId("role").optional(),
    status: z.enum(["active", "inactive"]).optional(),
    password: z.string().min(8, "Password must be at least 8 characters").max(128).optional(),
  }),
};

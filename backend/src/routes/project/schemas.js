const { z } = require("zod");
const { text, money, date } = require("../../utils/schemaHelpers");
const { PROJECT_STATUSES } = require("../../models/project/Project");

const objectId = (label) => z.string().regex(/^[0-9a-fA-F]{24}$/, `Invalid ${label}`);

const projectFields = z.object({
  name: text("Project name", 150),
  description: z.string().trim().max(2000),
  client: z.string().trim().max(150),
  manager: z.string().trim().max(100),
  priority: z.enum(["Low", "Medium", "High", "Critical"]),
  startDate: date("Start date"),
  dueDate: date("Due date"),
  budget: money("Budget"),
  spent: money("Amount spent"),
  progress: z.coerce
    .number({ error: "Progress must be a number" })
    .int("Progress must be a whole number")
    .min(0, "Progress must be between 0 and 100")
    .max(100, "Progress must be between 0 and 100"),
  status: z.enum(PROJECT_STATUSES, { error: "Invalid project status" }),
});

const projectSchema = projectFields.extend({
  description: projectFields.shape.description.default(""),
  client: projectFields.shape.client.default("Internal"),
  manager: projectFields.shape.manager.default(""),
  priority: projectFields.shape.priority.default("Medium"),
  budget: projectFields.shape.budget.default(0),
  spent: projectFields.shape.spent.default(0),
  progress: projectFields.shape.progress.default(0),
  status: projectFields.shape.status.default("Planning"),
});

module.exports = {
  projectSchema,
  projectUpdateSchema: projectFields.partial(),
  milestoneSchema: z.object({ title: text("Milestone name", 150), dueDate: date("Due date") }),
  milestoneStatusSchema: z.object({
    status: z.enum(["Upcoming", "In Progress", "Completed"], { error: "Invalid milestone status" }),
  }),
  assignSchema: z.object({
    employeeId: objectId("employee"),
    projectId: objectId("project"),
    allocation: z.coerce
      .number({ error: "Allocation must be a number" })
      .int("Allocation must be a whole number")
      .min(1, "Allocation must be between 1 and 100")
      .max(100, "Allocation must be between 1 and 100"),
  }),
};

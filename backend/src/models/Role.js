const mongoose = require("mongoose");
const { MODULES, ACTIONS, buildPermissions } = require("./Permission");

const actionSchema = Object.fromEntries(ACTIONS.map((a) => [a, { type: Boolean, default: false }]));
const permissionsSchema = Object.fromEntries(
  MODULES.map((m) => [m, new mongoose.Schema(actionSchema, { _id: false })])
);

const roleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    description: { type: String, trim: true, default: "" },
    // System roles cannot be deleted or renamed.
    isSystem: { type: Boolean, default: false },
    permissions: new mongoose.Schema(permissionsSchema, { _id: false }),
  },
  { timestamps: true }
);

roleSchema.set("toJSON", {
  transform(_doc, ret) {
    ret.id = ret._id.toString();
    delete ret._id;
    delete ret.__v;
    return ret;
  },
});

const all = ["view", "create", "edit", "delete"];

const DEFAULT_ROLES = [
  {
    name: "Admin",
    description: "Full access to every module",
    isSystem: true,
    permissions: buildPermissions(Object.fromEntries(MODULES.map((m) => [m, all]))),
  },
  {
    name: "Manager",
    description: "Manage business modules, no settings access",
    isSystem: true,
    permissions: buildPermissions({
      dashboard: ["view"],
      finance: all,
      hr: all,
      supplyChain: all,
      projects: all,
      reports: ["view"],
    }),
  },
  {
    name: "Employee",
    description: "Read-only access to day-to-day modules",
    isSystem: true,
    permissions: buildPermissions({
      dashboard: ["view"],
      projects: ["view"],
      supplyChain: ["view"],
    }),
  },
];

roleSchema.statics.ensureDefaults = async function ensureDefaults() {
  for (const role of DEFAULT_ROLES) {
    await this.updateOne({ name: role.name }, { $setOnInsert: role }, { upsert: true });
  }
};

module.exports = mongoose.model("Role", roleSchema);

const mongoose = require("mongoose");
const { toJSONTransform } = require("../utils/common");

const ONE_YEAR_SECONDS = 365 * 24 * 60 * 60;

// One row per successful change (create/update/delete) made through the API.
// Request bodies are deliberately NOT stored, so passwords and personal data never end up here.
const auditLogSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    userName: { type: String, required: true },
    action: { type: String, enum: ["create", "update", "delete"], required: true },
    resource: { type: String, required: true }, // e.g. "finance/payables" or "hr/leave/decision"
    target: { type: String, default: "" }, // id of the record that was changed, when the URL has one
    method: { type: String, required: true },
    path: { type: String, required: true },
    status: { type: Number, required: true },
    ip: { type: String, default: "" },
    createdAt: { type: Date, default: Date.now, expires: ONE_YEAR_SECONDS }, // old entries expire after a year
  },
  { versionKey: false }
);

auditLogSchema.index({ createdAt: -1 });

auditLogSchema.set("toJSON", { transform: toJSONTransform() });

module.exports = mongoose.model("AuditLog", auditLogSchema);

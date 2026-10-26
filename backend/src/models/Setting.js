const mongoose = require("mongoose");

// A single workspace-wide settings document (_id is always "default").
const settingSchema = new mongoose.Schema(
  {
    _id: { type: String, default: "default" },
    companyName: { type: String, default: "AMDox ERP", trim: true, maxlength: 100 },
    legalName: { type: String, default: "", trim: true, maxlength: 150 },
    email: { type: String, default: "", trim: true, lowercase: true },
    phone: { type: String, default: "", trim: true, maxlength: 30 },
    website: { type: String, default: "", trim: true, maxlength: 200 },
    address: { type: String, default: "", trim: true, maxlength: 250 },
    timezone: { type: String, default: "Asia/Kolkata" },
    currency: { type: String, default: "INR" },
    dateFormat: { type: String, default: "DD/MM/YYYY" },
    language: { type: String, default: "English" },
    emailNotifications: { type: Boolean, default: true },
    lowStockAlerts: { type: Boolean, default: true },
    weeklyReports: { type: Boolean, default: false },
    // integration key -> enabled
    integrations: { type: Map, of: Boolean, default: {} },
  },
  { timestamps: true }
);

settingSchema.statics.current = async function current() {
  return this.findOneAndUpdate({ _id: "default" }, { $setOnInsert: {} }, { upsert: true, returnDocument: "after" });
};

settingSchema.set("toJSON", {
  transform(_doc, ret) {
    delete ret._id;
    delete ret.__v;
    ret.integrations = ret.integrations || {};
    return ret;
  },
});

module.exports = mongoose.model("Setting", settingSchema);

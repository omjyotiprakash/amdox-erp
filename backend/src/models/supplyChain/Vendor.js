const mongoose = require("mongoose");
const { toJSONTransform } = require("../../utils/common");

const vendorSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true, unique: true, trim: true, maxlength: 150 },
    category: { type: String, required: true, trim: true, maxlength: 80 },
    contact: { type: String, required: true, trim: true, maxlength: 100 },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true, maxlength: 30 },
    location: { type: String, required: true, trim: true, maxlength: 100 },
    status: { type: String, enum: ["Active", "Pending", "Inactive"], default: "Pending" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

vendorSchema.set("toJSON", { transform: toJSONTransform() });

module.exports = mongoose.model("Vendor", vendorSchema);

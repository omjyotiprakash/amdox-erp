const mongoose = require("mongoose");
const { toJSONTransform } = require("../../utils/common");

const stockStatusOf = ({ quantity, reorderLevel }) => {
  if (quantity === 0) return "Out of Stock";
  if (quantity <= reorderLevel) return "Low Stock";
  return "In Stock";
};

// A stocked product. monthlyDemand/demandGrowth feed the (rule-based) forecasting page.
const productSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    name: { type: String, required: true, trim: true, maxlength: 150 },
    category: { type: String, required: true, trim: true, maxlength: 80 },
    sku: { type: String, required: true, unique: true, trim: true, uppercase: true, maxlength: 40 },
    quantity: { type: Number, required: true, min: 0, validate: Number.isInteger },
    price: { type: Number, required: true, min: 0 },
    reorderLevel: { type: Number, required: true, min: 0, validate: Number.isInteger },
    monthlyDemand: { type: Number, default: 0, min: 0 },
    demandGrowth: { type: Number, default: 0, min: -100, max: 1000 }, // expected % change in monthly demand
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

productSchema.index({ category: 1 });

productSchema.set("toJSON", {
  transform: toJSONTransform((ret) => {
    ret.stockStatus = stockStatusOf(ret);
    return ret;
  }),
});

module.exports = mongoose.model("Product", productSchema);

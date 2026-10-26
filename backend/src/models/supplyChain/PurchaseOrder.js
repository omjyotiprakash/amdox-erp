const mongoose = require("mongoose");
const { toDateString, toJSONTransform } = require("../../utils/common");

// Statuses an order may move to from its current one. Delivered and Cancelled are final.
const NEXT_STATUSES = {
  Pending: ["Approved", "Cancelled"],
  Approved: ["Ordered", "Cancelled"],
  Ordered: ["Delivered", "Cancelled"],
  Delivered: [],
  Cancelled: [],
};

const purchaseOrderSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },
    vendor: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
    orderDate: { type: Date, required: true },
    deliveryDate: { type: Date, required: true },
    items: { type: Number, required: true, min: 1, validate: Number.isInteger },
    amount: { type: Number, required: true, min: 0.01 },
    status: { type: String, enum: Object.keys(NEXT_STATUSES), default: "Pending" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

purchaseOrderSchema.index({ vendor: 1 });

purchaseOrderSchema.set("toJSON", {
  transform: toJSONTransform((ret) => {
    ret.orderDate = toDateString(ret.orderDate);
    ret.deliveryDate = toDateString(ret.deliveryDate);
    return ret;
  }),
});

module.exports = mongoose.model("PurchaseOrder", purchaseOrderSchema);
module.exports.NEXT_STATUSES = NEXT_STATUSES;

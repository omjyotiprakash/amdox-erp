const { z } = require("zod");
const { text, amount, money, date } = require("../../utils/schemaHelpers");

const wholeNumber = (label, { min = 0 } = {}) =>
  z.coerce
    .number({ error: `${label} must be a number` })
    .int(`${label} must be a whole number`)
    .min(min, `${label} must be at least ${min}`)
    .max(1e9, `${label} is too large`);

const productFields = z.object({
  name: text("Product name", 150),
  category: text("Category", 80),
  sku: text("SKU", 40),
  quantity: wholeNumber("Quantity"),
  price: money("Unit price"),
  reorderLevel: wholeNumber("Reorder level"),
  monthlyDemand: money("Monthly demand"),
  demandGrowth: z.coerce
    .number({ error: "Demand growth must be a number" })
    .min(-100, "Demand growth cannot be below -100%")
    .max(1000, "Demand growth is too large"),
});

const productSchema = productFields.extend({
  monthlyDemand: productFields.shape.monthlyDemand.default(0),
  demandGrowth: productFields.shape.demandGrowth.default(0),
});

const vendorFields = z.object({
  name: text("Vendor name", 150),
  category: text("Category", 80),
  contact: text("Contact person", 100),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  phone: text("Phone", 30),
  location: text("Location", 100),
  status: z.enum(["Active", "Pending", "Inactive"]),
});

const vendorSchema = vendorFields.extend({ status: vendorFields.shape.status.default("Pending") });

const objectId = (label) => z.string().regex(/^[0-9a-fA-F]{24}$/, `Invalid ${label}`);

const purchaseOrderSchema = z.object({
  vendorId: objectId("vendor"),
  orderDate: date("Order date"),
  deliveryDate: date("Delivery date"),
  items: wholeNumber("Items", { min: 1 }),
  amount,
});

module.exports = {
  productSchema,
  productUpdateSchema: productFields.partial(),
  stockSchema: z.object({ quantity: wholeNumber("Quantity") }),
  vendorSchema,
  vendorUpdateSchema: vendorFields.partial(),
  purchaseOrderSchema,
  poStatusSchema: z.object({
    status: z.enum(["Approved", "Ordered", "Delivered", "Cancelled"], { error: "Invalid status" }),
  }),
};

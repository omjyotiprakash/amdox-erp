const PurchaseOrder = require("../../models/supplyChain/PurchaseOrder");
const Vendor = require("../../models/supplyChain/Vendor");
const Counter = require("../../models/Counter");
const { AppError } = require("../../middleware/errorHandler.middleware");
const { searchFilter } = require("../../utils/common");
const { parsePaging, pageInfo } = require("../../utils/pagination");

const { NEXT_STATUSES } = PurchaseOrder;
const POPULATE = { path: "vendor", select: "code name" };

const list = async ({ search, status, vendorId, page, limit }) => {
  const paging = parsePaging({ page, limit });
  const filter = {};
  if (status && status !== "All") filter.status = status;
  if (vendorId && vendorId !== "All") filter.vendor = vendorId;

  const clause = searchFilter(search, ["code"]);
  if (clause) {
    const vendorIds = await Vendor.find(searchFilter(search, ["name"])).distinct("_id");
    filter.$or = [...clause.$or, { vendor: { $in: vendorIds } }];
  }

  const [items, total, all] = await Promise.all([
    PurchaseOrder.find(filter).populate(POPULATE).sort({ orderDate: -1, createdAt: -1 }).skip(paging.skip).limit(paging.limit),
    PurchaseOrder.countDocuments(),
    PurchaseOrder.aggregate([{ $group: { _id: "$status", count: { $sum: 1 }, value: { $sum: "$amount" } } }]),
  ]);
  const row = (status) => all.find((entry) => entry._id === status);

  const matching = await PurchaseOrder.countDocuments(filter);

  return {
    items,
    ...pageInfo(paging, matching),
    total,
    summary: {
      total,
      // Cancelled orders are not committed spend.
      totalValue: all.filter((entry) => entry._id !== "Cancelled").reduce((sum, entry) => sum + entry.value, 0),
      pending: row("Pending")?.count || 0,
      delivered: row("Delivered")?.count || 0,
    },
  };
};

const create = async ({ vendorId, orderDate, deliveryDate, items, amount }, userId) => {
  if (deliveryDate < orderDate) throw new AppError(400, "Delivery date cannot be before the order date");

  const vendor = await Vendor.findById(vendorId);
  if (!vendor) throw new AppError(404, "Vendor not found");
  if (vendor.status !== "Active") throw new AppError(400, "Purchase orders can only be raised with Active vendors");

  const order = await PurchaseOrder.create({
    vendor: vendorId,
    orderDate,
    deliveryDate,
    items,
    amount,
    code: await Counter.nextCode("PO"),
    createdBy: userId,
  });
  return order.populate(POPULATE);
};

const setStatus = async (id, status) => {
  const order = await PurchaseOrder.findById(id);
  if (!order) throw new AppError(404, "Purchase order not found");
  if (!NEXT_STATUSES[order.status].includes(status)) {
    throw new AppError(409, `A ${order.status} order cannot be moved to ${status}`);
  }

  // Conditional update so two simultaneous requests can't both apply.
  const updated = await PurchaseOrder.findOneAndUpdate(
    { _id: id, status: order.status },
    { status },
    { returnDocument: "after" }
  ).populate(POPULATE);
  if (!updated) throw new AppError(409, "This order was just changed by someone else. Refresh and try again.");
  return updated;
};

const remove = async (id) => {
  const order = await PurchaseOrder.findOneAndDelete({ _id: id, status: "Pending" });
  if (order) return;
  if (await PurchaseOrder.exists({ _id: id })) throw new AppError(409, "Only pending orders can be deleted. Cancel the order instead.");
  throw new AppError(404, "Purchase order not found");
};

module.exports = { list, create, setStatus, remove };

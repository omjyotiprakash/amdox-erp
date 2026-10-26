const Vendor = require("../../models/supplyChain/Vendor");
const PurchaseOrder = require("../../models/supplyChain/PurchaseOrder");
const Counter = require("../../models/Counter");
const { AppError } = require("../../middleware/errorHandler.middleware");
const { searchFilter } = require("../../utils/common");

const duplicateName = (err) => {
  if (err.code === 11000) throw new AppError(409, "A vendor with this name already exists");
  throw err;
};

const list = async ({ search, category, status }) => {
  const filter = {};
  if (category && category !== "All") filter.category = category;
  if (status && status !== "All") filter.status = status;
  const clause = searchFilter(search, ["name", "contact", "email", "location", "code"]);
  if (clause) Object.assign(filter, clause);

  const [items, total, counts, categories] = await Promise.all([
    Vendor.find(filter).sort({ code: 1 }).limit(500),
    Vendor.countDocuments(),
    Vendor.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
    Vendor.distinct("category"),
  ]);
  const countOf = (status) => counts.find((row) => row._id === status)?.count || 0;

  return {
    items,
    total,
    categories: categories.sort(),
    summary: { total, active: countOf("Active"), pending: countOf("Pending"), inactive: countOf("Inactive") },
  };
};

const create = async (data, userId) => {
  try {
    return await Vendor.create({ ...data, code: await Counter.nextCode("VEN"), createdBy: userId });
  } catch (err) {
    return duplicateName(err);
  }
};

const update = async (id, data) => {
  try {
    const vendor = await Vendor.findByIdAndUpdate(id, data, { returnDocument: "after", runValidators: true });
    if (!vendor) throw new AppError(404, "Vendor not found");
    return vendor;
  } catch (err) {
    return duplicateName(err);
  }
};

const remove = async (id) => {
  if (await PurchaseOrder.exists({ vendor: id })) {
    throw new AppError(409, "This vendor has purchase orders. Set the status to Inactive instead.");
  }
  const vendor = await Vendor.findByIdAndDelete(id);
  if (!vendor) throw new AppError(404, "Vendor not found");
};

module.exports = { list, create, update, remove };

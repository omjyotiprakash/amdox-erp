const Product = require("../../models/supplyChain/Inventory");
const Counter = require("../../models/Counter");
const { AppError } = require("../../middleware/errorHandler.middleware");
const { searchFilter } = require("../../utils/common");

// Mongo filters for the three derived stock statuses.
const STOCK_FILTERS = {
  "Out of Stock": { quantity: 0 },
  "Low Stock": { quantity: { $gt: 0 }, $expr: { $lte: ["$quantity", "$reorderLevel"] } },
  "In Stock": { $expr: { $gt: ["$quantity", "$reorderLevel"] } },
};

const duplicateSku = (err) => {
  if (err.code === 11000) throw new AppError(409, "A product with this SKU already exists");
  throw err;
};

const list = async ({ search, category, stock }) => {
  const filter = { ...STOCK_FILTERS[stock] };
  if (category && category !== "All") filter.category = category;
  const clause = searchFilter(search, ["name", "sku", "category", "code"]);
  if (clause) Object.assign(filter, clause);

  const [items, total, [totals], categories, lowStock, outOfStock] = await Promise.all([
    Product.find(filter).sort({ code: 1 }).limit(500),
    Product.countDocuments(),
    Product.aggregate([
      {
        $group: {
          _id: null,
          units: { $sum: "$quantity" },
          value: { $sum: { $multiply: ["$quantity", "$price"] } },
        },
      },
    ]),
    Product.distinct("category"),
    Product.countDocuments(STOCK_FILTERS["Low Stock"]),
    Product.countDocuments(STOCK_FILTERS["Out of Stock"]),
  ]);

  return {
    items,
    total,
    categories: categories.sort(),
    summary: { total, totalUnits: totals?.units || 0, stockValue: totals?.value || 0, lowStock, outOfStock },
  };
};

const create = async (data, userId) => {
  try {
    return await Product.create({ ...data, code: await Counter.nextCode("INV"), createdBy: userId });
  } catch (err) {
    return duplicateSku(err);
  }
};

const update = async (id, data) => {
  try {
    const product = await Product.findByIdAndUpdate(id, data, { returnDocument: "after", runValidators: true });
    if (!product) throw new AppError(404, "Product not found");
    return product;
  } catch (err) {
    return duplicateSku(err);
  }
};

const setStock = (id, quantity) => update(id, { quantity });

const remove = async (id) => {
  const product = await Product.findByIdAndDelete(id);
  if (!product) throw new AppError(404, "Product not found");
};

module.exports = { list, create, update, setStock, remove };

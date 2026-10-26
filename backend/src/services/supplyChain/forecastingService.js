const Product = require("../../models/supplyChain/Inventory");
const { searchFilter } = require("../../utils/common");

// Rule-based projection, not a trained model:
//   expected monthly demand = monthlyDemand x (1 + demandGrowth%)
//   forecast for N months   = expected monthly demand x N
// Both inputs are set per product on the Inventory page.
const forecast = async ({ months, category, search }) => {
  const filter = {};
  if (category && category !== "All") filter.category = category;
  const clause = searchFilter(search, ["name", "sku"]);
  if (clause) Object.assign(filter, clause);

  const [products, total, categories] = await Promise.all([
    Product.find(filter).sort({ name: 1 }),
    Product.countDocuments(),
    Product.distinct("category"),
  ]);

  const items = products.map((product) => {
    const expectedMonthly = product.monthlyDemand * (1 + product.demandGrowth / 100);
    const predictedDemand = Math.round(expectedMonthly * months);
    return {
      id: product.id,
      code: product.code,
      product: product.name,
      category: product.category,
      currentStock: product.quantity,
      monthlyDemand: product.monthlyDemand,
      demandGrowth: product.demandGrowth,
      unitPrice: product.price,
      predictedDemand,
      stockShortfall: Math.max(0, predictedDemand - product.quantity),
      estimatedValue: predictedDemand * product.price,
    };
  });

  return {
    months,
    items,
    total,
    categories: categories.sort(),
    summary: {
      forecastedUnits: items.reduce((sum, item) => sum + item.predictedDemand, 0),
      productsToReorder: items.filter((item) => item.stockShortfall > 0).length,
      totalShortfall: items.reduce((sum, item) => sum + item.stockShortfall, 0),
      estimatedValue: items.reduce((sum, item) => sum + item.estimatedValue, 0),
    },
  };
};

module.exports = { forecast };

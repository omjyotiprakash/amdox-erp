const Transaction = require("../../models/finance/Transaction");

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

// Income vs. expenses per calendar month for the last `months` months (current month included),
// plus the transactions in that window. Monthly totals count Posted entries only.
const summary = async (months) => {
  const now = new Date();
  const from = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - (months - 1), 1));

  const [rows, transactions] = await Promise.all([
    Transaction.aggregate([
      { $match: { status: "Posted", date: { $gte: from } } },
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" }, type: "$type" },
          total: { $sum: "$amount" },
        },
      },
    ]),
    Transaction.find({ date: { $gte: from } }).sort({ date: -1, createdAt: -1 }).limit(500),
  ]);

  const monthly = Array.from({ length: months }, (_, index) => {
    const date = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth() + index, 1));
    const year = date.getUTCFullYear();
    const month = date.getUTCMonth() + 1;
    const totalOf = (type) =>
      rows.find((r) => r._id.year === year && r._id.month === month && r._id.type === type)?.total || 0;
    return { month: MONTH_NAMES[month - 1], year, income: totalOf("Income"), expenses: totalOf("Expense") };
  });

  const income = monthly.reduce((sum, m) => sum + m.income, 0);
  const expenses = monthly.reduce((sum, m) => sum + m.expenses, 0);

  return { months: monthly, totals: { income, expenses, net: income - expenses }, transactions };
};

module.exports = { summary };

const Transaction = require("../../models/finance/Transaction");
const Counter = require("../../models/Counter");
const { AppError } = require("../../middleware/errorHandler.middleware");
const { searchFilter } = require("./financeUtils");

const MAX_LIMIT = 500;

// Totals count Posted entries only; Pending ones are listed but not yet part of the books.
const summarize = async () => {
  const rows = await Transaction.aggregate([
    { $match: { status: "Posted" } },
    { $group: { _id: "$type", total: { $sum: "$amount" } } },
  ]);
  const totalOf = (type) => rows.find((row) => row._id === type)?.total || 0;
  const income = totalOf("Income");
  const expenses = totalOf("Expense");
  return { income, expenses, net: income - expenses };
};

const list = async ({ search, type, limit }) => {
  const filter = {};
  if (type && type !== "All") filter.type = type;
  const searchClause = searchFilter(search, ["code", "description", "account"]);
  if (searchClause) Object.assign(filter, searchClause);

  const [items, total, summary] = await Promise.all([
    Transaction.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .limit(Math.min(Number(limit) || 200, MAX_LIMIT)),
    Transaction.countDocuments(),
    summarize(),
  ]);
  return { items, total, summary };
};

const create = async (data, userId) =>
  Transaction.create({ ...data, code: await Counter.nextCode("TXN"), createdBy: userId });

const update = async (id, data) => {
  const transaction = await Transaction.findByIdAndUpdate(id, data, {
    returnDocument: "after",
    runValidators: true,
  });
  if (!transaction) throw new AppError(404, "Transaction not found");
  return transaction;
};

const remove = async (id) => {
  const transaction = await Transaction.findByIdAndDelete(id);
  if (!transaction) throw new AppError(404, "Transaction not found");
};

module.exports = { list, create, update, remove };

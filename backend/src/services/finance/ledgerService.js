const Transaction = require("../../models/finance/Transaction");
const Counter = require("../../models/Counter");
const { AppError } = require("../../middleware/errorHandler.middleware");
const { searchFilter } = require("./financeUtils");
const { parsePaging, pageInfo } = require("../../utils/pagination");

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

const list = async ({ search, type, page, limit }) => {
  const paging = parsePaging({ page, limit });
  const filter = {};
  if (type && type !== "All") filter.type = type;
  const searchClause = searchFilter(search, ["code", "description", "account"]);
  if (searchClause) Object.assign(filter, searchClause);

  const [items, total, summary] = await Promise.all([
    Transaction.find(filter)
      .sort({ date: -1, createdAt: -1 })
      .skip(paging.skip).limit(paging.limit),
    Transaction.countDocuments(),
    summarize(),
  ]);
  const matching = await Transaction.countDocuments(filter);
  return { items, total, summary, ...pageInfo(paging, matching) };
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

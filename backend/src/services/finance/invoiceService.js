const Invoice = require("../../models/finance/Invoice");
const Counter = require("../../models/Counter");
const { AppError } = require("../../middleware/errorHandler.middleware");
const { searchFilter, startOfTodayUTC } = require("./financeUtils");
const { parsePaging, pageInfo } = require("../../utils/pagination");

// Builds the service for one invoice direction ("payable" or "receivable").
const createInvoiceService = (kind, codePrefix) => {
  const label = kind === "payable" ? "Payable" : "Receivable";

  const statusFilter = (status) => {
    const today = startOfTodayUTC();
    if (status === "Paid") return { status: "Paid" };
    if (status === "Pending") return { status: "Pending", dueDate: { $gte: today } };
    if (status === "Overdue") return { status: "Pending", dueDate: { $lt: today } };
    return null;
  };

  const summarize = async () => {
    const today = startOfTodayUTC();
    const [row] = await Invoice.aggregate([
      { $match: { kind } },
      {
        $group: {
          _id: null,
          outstanding: { $sum: { $cond: [{ $eq: ["$status", "Pending"] }, "$amount", 0] } },
          paid: { $sum: { $cond: [{ $eq: ["$status", "Paid"] }, "$amount", 0] } },
          overdueCount: {
            $sum: {
              $cond: [{ $and: [{ $eq: ["$status", "Pending"] }, { $lt: ["$dueDate", today] }] }, 1, 0],
            },
          },
        },
      },
    ]);
    return { outstanding: row?.outstanding || 0, paid: row?.paid || 0, overdueCount: row?.overdueCount || 0 };
  };

  const list = async ({ search, status, page, limit }) => {
    const paging = parsePaging({ page, limit });
    const filter = { kind, ...statusFilter(status) };
    const searchClause = searchFilter(search, ["party", "invoiceNumber", "code"]);
    if (searchClause) Object.assign(filter, searchClause);

    const [items, total, summary] = await Promise.all([
      Invoice.find(filter).sort({ dueDate: 1, createdAt: -1 }).skip(paging.skip).limit(paging.limit),
      Invoice.countDocuments({ kind }),
      summarize(),
    ]);
    const matching = await Invoice.countDocuments(filter);
    return { items, total, summary, ...pageInfo(paging, matching) };
  };

  const create = async (data, userId) =>
    Invoice.create({ ...data, kind, code: await Counter.nextCode(codePrefix), createdBy: userId });

  const markPaid = async (id) => {
    const invoice = await Invoice.findOneAndUpdate(
      { _id: id, kind, status: "Pending" },
      { status: "Paid", paidAt: new Date() },
      { returnDocument: "after" }
    );
    if (invoice) return invoice;
    if (await Invoice.exists({ _id: id, kind })) throw new AppError(409, `${label} is already paid`);
    throw new AppError(404, `${label} not found`);
  };

  const remove = async (id) => {
    const invoice = await Invoice.findOneAndDelete({ _id: id, kind });
    if (!invoice) throw new AppError(404, `${label} not found`);
  };

  return { list, create, markPaid, remove };
};

module.exports = { createInvoiceService };

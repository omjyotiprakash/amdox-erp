const AuditLog = require("../../models/AuditLog");
const { searchFilter } = require("../../utils/common");
const { parsePaging, pageInfo } = require("../../utils/pagination");

const list = async ({ search, action, page, limit }) => {
  const paging = parsePaging({ page, limit });
  const filter = {};
  if (action && action !== "All") filter.action = action;
  const clause = searchFilter(search, ["userName", "resource", "target"]);
  if (clause) Object.assign(filter, clause);

  const [items, total, matching] = await Promise.all([
    AuditLog.find(filter).sort({ createdAt: -1 }).skip(paging.skip).limit(paging.limit),
    AuditLog.countDocuments(),
    AuditLog.countDocuments(filter),
  ]);

  return { items, total, ...pageInfo(paging, matching) };
};

module.exports = { list };

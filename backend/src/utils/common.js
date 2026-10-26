const startOfTodayUTC = () => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return today;
};

const toDateString = (date) => (date ? new Date(date).toISOString().slice(0, 10) : date);

const round2 = (value) => Math.round(value * 100) / 100;

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Case-insensitive "contains" match across several fields.
const searchFilter = (search, fields) => {
  const term = (search || "").trim();
  if (!term) return null;
  const regex = new RegExp(escapeRegex(term), "i");
  return { $or: fields.map((field) => ({ [field]: regex })) };
};

const toJSONTransform = (extra) => (_doc, ret) => {
  ret.id = ret._id.toString();
  delete ret._id;
  delete ret.__v;
  return extra ? extra(ret) : ret;
};

module.exports = { startOfTodayUTC, toDateString, round2, searchFilter, toJSONTransform };

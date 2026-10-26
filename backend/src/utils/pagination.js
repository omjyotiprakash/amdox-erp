const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

// Reads ?page= and ?limit= (both optional) into safe numbers plus the skip for Mongo.
const parsePaging = ({ page, limit } = {}) => {
  const size = Math.min(Math.max(Math.floor(Number(limit)) || DEFAULT_LIMIT, 1), MAX_LIMIT);
  const current = Math.max(Math.floor(Number(page)) || 1, 1);
  return { page: current, limit: size, skip: (current - 1) * size };
};

// Fields every paginated list returns next to its items.
// `matching` is how many rows match the current filters; `total` stays the overall count.
const pageInfo = ({ page, limit }, matching) => ({
  page,
  limit,
  matching,
  pages: Math.max(1, Math.ceil(matching / limit)),
});

module.exports = { parsePaging, pageInfo, DEFAULT_LIMIT, MAX_LIMIT };

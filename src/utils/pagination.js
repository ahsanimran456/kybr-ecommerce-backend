/**
 * Parse pagination params from request query
 * Default: page=1, limit=20
 */
const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  return { page, limit, from, to };
};

module.exports = { parsePagination };

const { PAGINATION } = require('../constants');

const parsePagination = (query) => {
  const page = Math.max(1, parseInt(query.page, 10) || PAGINATION.DEFAULT_PAGE);
  let limit = parseInt(query.limit, 10) || PAGINATION.DEFAULT_LIMIT;
  limit = Math.min(Math.max(1, limit), PAGINATION.MAX_LIMIT);
  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

const buildPaginationMeta = (total, page, limit) => ({
  total,
  page,
  limit,
  totalPages: Math.ceil(total / limit) || 1,
  hasNextPage: page * limit < total,
  hasPrevPage: page > 1,
});

module.exports = { parsePagination, buildPaginationMeta };

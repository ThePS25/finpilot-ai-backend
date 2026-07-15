const incomeRepository = require('../repositories/income.repository');
const { assertProfileOwnership, buildDateFilter, resolveProfileIds } = require('../utils/profileHelper');
const { NotFoundError } = require('../utils/AppError');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

const incomeService = {
  create: async (userId, data) => {
    await assertProfileOwnership(userId, data.profileId);
    return incomeRepository.create({ ...data, userId });
  },

  getAll: async (userId, query) => {
    const { page, limit, skip } = parsePagination(query);
    const dateFilter = buildDateFilter(query);
    const filters = {
      profileId: query.profileId,
      dateFilter,
      skip,
      limit,
      type: query.type,
    };
    const [incomes, total] = await Promise.all([
      incomeRepository.findAll(userId, filters),
      incomeRepository.count(userId, filters),
    ]);
    return { incomes, pagination: buildPaginationMeta(total, page, limit) };
  },

  getById: async (userId, id) => {
    const income = await incomeRepository.findByIdAndUser(id, userId);
    if (!income) throw new NotFoundError('Income entry not found');
    return income;
  },

  update: async (userId, id, data) => {
    const income = await incomeRepository.findByIdAndUser(id, userId);
    if (!income) throw new NotFoundError('Income entry not found');
    if (data.profileId) await assertProfileOwnership(userId, data.profileId);
    return incomeRepository.update(id, userId, data);
  },

  delete: async (userId, id) => {
    const income = await incomeRepository.delete(id, userId);
    if (!income) throw new NotFoundError('Income entry not found');
    return { message: 'Income deleted successfully' };
  },

  getAnalytics: async (userId, query) => {
    const profileIds = await resolveProfileIds(
      userId,
      query.profileIds ? query.profileIds.split(',') : null
    );
    const dateFilter = buildDateFilter(query);
    const year = parseInt(query.year, 10) || new Date().getFullYear();

    const [byType, byMonth, totalResult] = await Promise.all([
      incomeRepository.aggregateByType(userId, profileIds, dateFilter),
      incomeRepository.aggregateByMonth(userId, profileIds, year),
      incomeRepository.sumByProfiles(userId, profileIds, dateFilter),
    ]);

    const total = totalResult[0]?.total || 0;
    const monthlyTrend = Array.from({ length: 12 }, (_, i) => {
      const found = byMonth.find((m) => m._id.month === i + 1);
      return { month: i + 1, total: found?.total || 0 };
    });

    return {
      total,
      byType: byType.map((t) => ({ type: t._id, total: t.total, count: t.count })),
      monthlyTrend,
    };
  },
};

module.exports = incomeService;

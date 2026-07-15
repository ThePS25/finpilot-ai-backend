const expenseRepository = require('../repositories/expense.repository');
const { DEFAULT_EXPENSE_CATEGORIES } = require('../constants');
const { assertProfileOwnership, buildDateFilter, resolveProfileIds } = require('../utils/profileHelper');
const { NotFoundError } = require('../utils/AppError');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

const expenseService = {
  create: async (userId, data) => {
    await assertProfileOwnership(userId, data.profileId);
    const isCustomCategory = !DEFAULT_EXPENSE_CATEGORIES.includes(data.category);
    return expenseRepository.create({ ...data, userId, isCustomCategory });
  },

  getAll: async (userId, query) => {
    const { page, limit, skip } = parsePagination(query);
    const dateFilter = buildDateFilter(query);
    const filters = { profileId: query.profileId, dateFilter, skip, limit, category: query.category };
    const [expenses, total] = await Promise.all([
      expenseRepository.findAll(userId, filters),
      expenseRepository.count(userId, filters),
    ]);
    return { expenses, pagination: buildPaginationMeta(total, page, limit) };
  },

  getById: async (userId, id) => {
    const expense = await expenseRepository.findByIdAndUser(id, userId);
    if (!expense) throw new NotFoundError('Expense not found');
    return expense;
  },

  update: async (userId, id, data) => {
    const expense = await expenseRepository.findByIdAndUser(id, userId);
    if (!expense) throw new NotFoundError('Expense not found');
    if (data.profileId) await assertProfileOwnership(userId, data.profileId);
    if (data.category) {
      data.isCustomCategory = !DEFAULT_EXPENSE_CATEGORIES.includes(data.category);
    }
    return expenseRepository.update(id, userId, data);
  },

  delete: async (userId, id) => {
    const expense = await expenseRepository.delete(id, userId);
    if (!expense) throw new NotFoundError('Expense not found');
    return { message: 'Expense deleted successfully' };
  },

  getCategories: async (userId) => {
    const custom = await expenseRepository.getCustomCategories(userId);
    return { default: DEFAULT_EXPENSE_CATEGORIES, custom };
  },

  getAnalytics: async (userId, query) => {
    const profileIds = await resolveProfileIds(
      userId,
      query.profileIds ? query.profileIds.split(',') : null
    );
    const dateFilter = buildDateFilter(query);
    const year = parseInt(query.year, 10) || new Date().getFullYear();

    const [byCategory, byMonth, totalResult] = await Promise.all([
      expenseRepository.aggregateByCategory(userId, profileIds, dateFilter),
      expenseRepository.aggregateByMonth(userId, profileIds, year),
      expenseRepository.sumByProfiles(userId, profileIds, dateFilter),
    ]);

    const total = totalResult[0]?.total || 0;
    const monthlyTrend = Array.from({ length: 12 }, (_, i) => {
      const found = byMonth.find((m) => m._id.month === i + 1);
      return { month: i + 1, total: found?.total || 0 };
    });

    return {
      total,
      byCategory: byCategory.map((c) => ({
        category: c._id,
        total: c.total,
        count: c.count,
        percentage: total > 0 ? Math.round((c.total / total) * 100) : 0,
      })),
      monthlyTrend,
    };
  },
};

module.exports = expenseService;

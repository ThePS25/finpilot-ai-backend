const budgetRepository = require('../repositories/budget.repository');
const expenseRepository = require('../repositories/expense.repository');
const notificationService = require('./notification.service');
const { assertProfileOwnership } = require('../utils/profileHelper');
const { NotFoundError } = require('../utils/AppError');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

const budgetService = {
  create: async (userId, data) => {
    await assertProfileOwnership(userId, data.profileId);
    const now = new Date();
    return budgetRepository.create({
      ...data,
      userId,
      month: data.month || now.getMonth() + 1,
      year: data.year || now.getFullYear(),
      alertThreshold: data.alertThreshold || 80,
    });
  },

  getAll: async (userId, query) => {
    const { page, limit, skip } = parsePagination(query);
    const now = new Date();
    const filters = {
      profileId: query.profileId,
      month: query.month || now.getMonth() + 1,
      year: query.year || now.getFullYear(),
      skip,
      limit,
    };
    const [budgets, total] = await Promise.all([
      budgetRepository.findAll(userId, filters),
      budgetRepository.count(userId, filters),
    ]);

    const monthStart = new Date(filters.year, filters.month - 1, 1);
    const monthEnd = new Date(filters.year, filters.month, 0, 23, 59, 59);
    const dateFilter = { $gte: monthStart, $lte: monthEnd };

    const withSpent = await Promise.all(
      budgets.map(async (budget) => {
        const spentAgg = await expenseRepository.sumByCategory(
          userId,
          [budget.profileId],
          budget.category,
          dateFilter
        );
        const spent = spentAgg[0]?.total || 0;
        const percentUsed = budget.limitAmount > 0 ? Math.round((spent / budget.limitAmount) * 100) : 0;
        return {
          ...budget.toObject(),
          spent,
          remaining: Math.max(0, budget.limitAmount - spent),
          percentUsed,
          isOverBudget: spent > budget.limitAmount,
        };
      })
    );

    return { budgets: withSpent, pagination: buildPaginationMeta(total, page, limit) };
  },

  update: async (userId, id, data) => {
    const budget = await budgetRepository.findByIdAndUser(id, userId);
    if (!budget) throw new NotFoundError('Budget not found');
    if (data.profileId) await assertProfileOwnership(userId, data.profileId);
    return budgetRepository.update(id, userId, data);
  },

  delete: async (userId, id) => {
    const budget = await budgetRepository.delete(id, userId);
    if (!budget) throw new NotFoundError('Budget not found');
    return { message: 'Budget deleted successfully' };
  },

  checkAlerts: async (userId, profileId) => {
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();
    const budgets = await budgetRepository.findForPeriod(userId, profileId, month, year);
    const monthStart = new Date(year, month - 1, 1);
    const monthEnd = new Date(year, month, 0, 23, 59, 59);
    const dateFilter = { $gte: monthStart, $lte: monthEnd };

    for (const budget of budgets) {
      const spentAgg = await expenseRepository.sumByCategory(
        userId,
        [budget.profileId],
        budget.category,
        dateFilter
      );
      const spent = spentAgg[0]?.total || 0;
      const percentUsed = budget.limitAmount > 0 ? (spent / budget.limitAmount) * 100 : 0;
      if (percentUsed >= budget.alertThreshold) {
        await notificationService.create(userId, {
          type: 'budget_alert',
          title: `Budget alert: ${budget.category}`,
          message: `You've used ${Math.round(percentUsed)}% of your ${budget.category} budget (₹${spent.toLocaleString('en-IN')} / ₹${budget.limitAmount.toLocaleString('en-IN')}).`,
          link: '/budgets',
          meta: { budgetId: budget._id, percentUsed },
        });
      }
    }
  },
};

module.exports = budgetService;

const recurringExpenseRepository = require('../repositories/recurringExpense.repository');
const expenseRepository = require('../repositories/expense.repository');
const notificationService = require('./notification.service');
const { assertProfileOwnership } = require('../utils/profileHelper');
const { NotFoundError } = require('../utils/AppError');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

const advanceDate = (date, frequency) => {
  const next = new Date(date);
  switch (frequency) {
    case 'Weekly':
      next.setDate(next.getDate() + 7);
      break;
    case 'Bi-weekly':
      next.setDate(next.getDate() + 14);
      break;
    case 'Monthly':
      next.setMonth(next.getMonth() + 1);
      break;
    case 'Quarterly':
      next.setMonth(next.getMonth() + 3);
      break;
    case 'Yearly':
      next.setFullYear(next.getFullYear() + 1);
      break;
    default:
      next.setMonth(next.getMonth() + 1);
  }
  return next;
};

const recurringExpenseService = {
  create: async (userId, data) => {
    await assertProfileOwnership(userId, data.profileId);
    return recurringExpenseRepository.create({
      ...data,
      userId,
      nextDueDate: data.nextDueDate || new Date(),
      isActive: data.isActive !== false,
    });
  },

  getAll: async (userId, query) => {
    const { page, limit, skip } = parsePagination(query);
    const filters = {
      profileId: query.profileId,
      skip,
      limit,
      isActive: query.isActive,
    };
    const [recurringExpenses, total] = await Promise.all([
      recurringExpenseRepository.findAll(userId, filters),
      recurringExpenseRepository.count(userId, filters),
    ]);
    return { recurringExpenses, pagination: buildPaginationMeta(total, page, limit) };
  },

  update: async (userId, id, data) => {
    const item = await recurringExpenseRepository.findByIdAndUser(id, userId);
    if (!item) throw new NotFoundError('Recurring expense not found');
    if (data.profileId) await assertProfileOwnership(userId, data.profileId);
    return recurringExpenseRepository.update(id, userId, data);
  },

  delete: async (userId, id) => {
    const item = await recurringExpenseRepository.delete(id, userId);
    if (!item) throw new NotFoundError('Recurring expense not found');
    return { message: 'Recurring expense deleted successfully' };
  },

  processDue: async () => {
    const dueItems = await recurringExpenseRepository.findDue(new Date());
    let generated = 0;

    for (const item of dueItems) {
      await expenseRepository.create({
        userId: item.userId,
        profileId: item.profileId,
        amount: item.amount,
        category: item.category,
        description: item.title,
        date: item.nextDueDate,
      });

      const nextDueDate = advanceDate(item.nextDueDate, item.frequency);
      const updates = {
        nextDueDate,
        lastGeneratedAt: new Date(),
      };
      if (item.endDate && nextDueDate > item.endDate) {
        updates.isActive = false;
      }

      await recurringExpenseRepository.update(item._id, item.userId, updates);

      await notificationService.create(item.userId.toString(), {
        type: 'recurring',
        title: 'Recurring expense logged',
        message: `${item.title} (₹${item.amount.toLocaleString('en-IN')}) was added to expenses.`,
        link: '/expenses',
        meta: { recurringId: item._id },
      });

      generated += 1;
    }

    return { generated };
  },
};

module.exports = recurringExpenseService;

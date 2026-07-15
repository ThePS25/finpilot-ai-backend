const { RecurringExpense } = require('../models');

const recurringExpenseRepository = {
  create: (data) => RecurringExpense.create(data),

  findByIdAndUser: (id, userId) => RecurringExpense.findOne({ _id: id, userId }),

  findAll: (userId, { profileId, skip, limit, isActive }) => {
    const query = { userId };
    if (profileId) query.profileId = profileId;
    if (isActive !== undefined) query.isActive = isActive === true || isActive === 'true';
    return RecurringExpense.find(query).sort({ nextDueDate: 1 }).skip(skip).limit(limit);
  },

  count: (userId, { profileId, isActive } = {}) => {
    const query = { userId };
    if (profileId) query.profileId = profileId;
    if (isActive !== undefined) query.isActive = isActive === true || isActive === 'true';
    return RecurringExpense.countDocuments(query);
  },

  update: (id, userId, data) =>
    RecurringExpense.findOneAndUpdate({ _id: id, userId }, data, { new: true, runValidators: true }),

  delete: (id, userId) => RecurringExpense.findOneAndDelete({ _id: id, userId }),

  findDue: (beforeDate = new Date()) =>
    RecurringExpense.find({
      isActive: true,
      nextDueDate: { $lte: beforeDate },
      $or: [{ endDate: null }, { endDate: { $exists: false } }, { endDate: { $gte: beforeDate } }],
    }),
};

module.exports = recurringExpenseRepository;

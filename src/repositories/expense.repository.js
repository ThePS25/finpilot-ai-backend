const { Expense } = require('../models');

const expenseRepository = {
  create: (data) => Expense.create(data),

  findByIdAndUser: (id, userId) => Expense.findOne({ _id: id, userId }),

  findAll: (userId, { profileId, dateFilter, skip, limit, category }) => {
    const query = { userId };
    if (profileId) query.profileId = profileId;
    if (dateFilter) query.date = dateFilter;
    if (category) query.category = category;
    return Expense.find(query).sort({ date: -1 }).skip(skip).limit(limit);
  },

  count: (userId, filters = {}) => {
    const query = { userId };
    if (filters.profileId) query.profileId = filters.profileId;
    if (filters.dateFilter) query.date = filters.dateFilter;
    if (filters.category) query.category = filters.category;
    return Expense.countDocuments(query);
  },

  update: (id, userId, data) =>
    Expense.findOneAndUpdate({ _id: id, userId }, data, { new: true, runValidators: true }),

  delete: (id, userId) => Expense.findOneAndDelete({ _id: id, userId }),

  aggregateByCategory: (userId, profileIds, dateFilter) => {
    const match = { userId, profileId: { $in: profileIds } };
    if (dateFilter) match.date = dateFilter;
    return Expense.aggregate([
      { $match: match },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);
  },

  aggregateByMonth: (userId, profileIds, year) => {
    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);
    return Expense.aggregate([
      {
        $match: {
          userId,
          profileId: { $in: profileIds },
          date: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: { month: { $month: '$date' } },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { '_id.month': 1 } },
    ]);
  },

  sumByProfiles: (userId, profileIds, dateFilter) => {
    const match = { userId, profileId: { $in: profileIds } };
    if (dateFilter) match.date = dateFilter;
    return Expense.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
  },

  sumByCategory: (userId, profileIds, category, dateFilter) => {
    const match = { userId, profileId: { $in: profileIds }, category };
    if (dateFilter) match.date = dateFilter;
    return Expense.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
  },

  getCustomCategories: (userId) =>
    Expense.distinct('category', { userId, isCustomCategory: true }),
};

module.exports = expenseRepository;

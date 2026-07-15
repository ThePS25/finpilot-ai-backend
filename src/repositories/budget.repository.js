const { Budget } = require('../models');

const budgetRepository = {
  create: (data) => Budget.create(data),

  findByIdAndUser: (id, userId) => Budget.findOne({ _id: id, userId }),

  findAll: (userId, { profileId, month, year, skip, limit }) => {
    const query = { userId };
    if (profileId) query.profileId = profileId;
    if (month) query.month = Number(month);
    if (year) query.year = Number(year);
    return Budget.find(query).sort({ category: 1 }).skip(skip).limit(limit);
  },

  count: (userId, filters = {}) => {
    const query = { userId };
    if (filters.profileId) query.profileId = filters.profileId;
    if (filters.month) query.month = Number(filters.month);
    if (filters.year) query.year = Number(filters.year);
    return Budget.countDocuments(query);
  },

  update: (id, userId, data) =>
    Budget.findOneAndUpdate({ _id: id, userId }, data, { new: true, runValidators: true }),

  delete: (id, userId) => Budget.findOneAndDelete({ _id: id, userId }),

  findForPeriod: (userId, profileId, month, year) => {
    const query = { userId, month, year };
    if (profileId) query.profileId = profileId;
    return Budget.find(query);
  },
};

module.exports = budgetRepository;

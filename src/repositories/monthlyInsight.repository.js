const { MonthlyInsight } = require('../models');

const monthlyInsightRepository = {
  findByMonth: (userId, profileId, month, year) =>
    MonthlyInsight.findOne({ userId, profileId: profileId || null, month, year }),

  upsert: (filter, data) =>
    MonthlyInsight.findOneAndUpdate(filter, data, { upsert: true, new: true }),

  findAll: (userId, { skip, limit }) =>
    MonthlyInsight.find({ userId }).sort({ year: -1, month: -1 }).skip(skip).limit(limit),

  count: (userId) => MonthlyInsight.countDocuments({ userId }),
};

module.exports = monthlyInsightRepository;

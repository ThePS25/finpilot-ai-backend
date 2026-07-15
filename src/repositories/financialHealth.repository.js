const { FinancialHealth } = require('../models');

const financialHealthRepository = {
  create: (data) => FinancialHealth.create(data),

  findLatest: (userId, profileId) =>
    FinancialHealth.findOne({ userId, profileId: profileId || null })
      .sort({ calculatedAt: -1 }),

  findHistory: (userId, profileId, limit = 12) =>
    FinancialHealth.find({ userId, profileId: profileId || null })
      .sort({ calculatedAt: -1 })
      .limit(limit),
};

module.exports = financialHealthRepository;

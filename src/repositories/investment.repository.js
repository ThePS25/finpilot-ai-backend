const { Investment } = require('../models');

const investmentRepository = {
  create: (data) => Investment.create(data),

  findByIdAndUser: (id, userId) => Investment.findOne({ _id: id, userId }),

  findAll: (userId, { profileId, skip, limit, investmentType }) => {
    const query = { userId };
    if (profileId) query.profileId = profileId;
    if (investmentType) query.investmentType = investmentType;
    return Investment.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
  },

  count: (userId, filters = {}) => {
    const query = { userId };
    if (filters.profileId) query.profileId = filters.profileId;
    if (filters.investmentType) query.investmentType = filters.investmentType;
    return Investment.countDocuments(query);
  },

  update: (id, userId, data) =>
    Investment.findOneAndUpdate({ _id: id, userId }, data, { new: true, runValidators: true }),

  delete: (id, userId) => Investment.findOneAndDelete({ _id: id, userId }),

  aggregateSummary: (userId, profileIds) =>
    Investment.aggregate([
      { $match: { userId, profileId: { $in: profileIds } } },
      {
        $group: {
          _id: '$investmentType',
          totalInvested: { $sum: '$amountInvested' },
          totalCurrent: { $sum: '$currentValue' },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalInvested: -1 } },
    ]),

  aggregateTotals: (userId, profileIds) =>
    Investment.aggregate([
      { $match: { userId, profileId: { $in: profileIds } } },
      {
        $group: {
          _id: null,
          totalInvested: { $sum: '$amountInvested' },
          totalCurrent: { $sum: '$currentValue' },
        },
      },
    ]),

  sumLiquidAssets: (userId, profileIds, liquidTypes) =>
    Investment.aggregate([
      {
        $match: {
          userId,
          profileId: { $in: profileIds },
          investmentType: { $in: liquidTypes },
        },
      },
      { $group: { _id: null, total: { $sum: '$currentValue' } } },
    ]),
};

module.exports = investmentRepository;

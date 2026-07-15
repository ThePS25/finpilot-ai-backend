const { Income } = require('../models');

const incomeRepository = {
  create: (data) => Income.create(data),

  findByIdAndUser: (id, userId) => Income.findOne({ _id: id, userId }),

  findAll: (userId, { profileId, dateFilter, skip, limit, type }) => {
    const query = { userId };
    if (profileId) query.profileId = profileId;
    if (dateFilter) query.date = dateFilter;
    if (type) query.type = type;
    return Income.find(query).sort({ date: -1 }).skip(skip).limit(limit);
  },

  count: (userId, { profileId, dateFilter, type } = {}) => {
    const query = { userId };
    if (profileId) query.profileId = profileId;
    if (dateFilter) query.date = dateFilter;
    if (type) query.type = type;
    return Income.countDocuments(query);
  },

  update: (id, userId, data) =>
    Income.findOneAndUpdate({ _id: id, userId }, data, { new: true, runValidators: true }),

  delete: (id, userId) => Income.findOneAndDelete({ _id: id, userId }),

  aggregateByType: (userId, profileIds, dateFilter) => {
    const match = { userId, profileId: { $in: profileIds } };
    if (dateFilter) match.date = dateFilter;
    return Income.aggregate([
      { $match: match },
      { $group: { _id: '$type', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);
  },

  aggregateByMonth: (userId, profileIds, year) => {
    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);
    return Income.aggregate([
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
    return Income.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: '$amount' } } },
    ]);
  },
};

module.exports = incomeRepository;

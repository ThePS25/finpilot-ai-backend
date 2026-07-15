const mongoose = require('mongoose');
const { Debt } = require('../models');

const toObjectId = (id) =>
  id instanceof mongoose.Types.ObjectId ? id : new mongoose.Types.ObjectId(String(id));

const debtRepository = {
  create: (data) => Debt.create(data),

  findByIdAndUser: (id, userId) => Debt.findOne({ _id: id, userId }),

  findAll: (userId, { profileId, skip, limit, isActive }) => {
    const query = { userId };
    if (profileId) query.profileId = profileId;
    if (isActive !== undefined) query.isActive = isActive === true || isActive === 'true';
    return Debt.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
  },

  count: (userId, { profileId, isActive } = {}) => {
    const query = { userId };
    if (profileId) query.profileId = profileId;
    if (isActive !== undefined) query.isActive = isActive === true || isActive === 'true';
    return Debt.countDocuments(query);
  },

  update: (id, userId, data) =>
    Debt.findOneAndUpdate({ _id: id, userId }, data, { new: true, runValidators: true }),

  delete: (id, userId) => Debt.findOneAndDelete({ _id: id, userId }),

  sumOutstanding: (userId, profileIds) => {
    const match = {
      userId: toObjectId(userId),
      isActive: true,
      profileId: { $in: profileIds.map(toObjectId) },
    };
    return Debt.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalOutstanding: { $sum: '$outstandingAmount' },
          totalEmi: { $sum: '$monthlyEmi' },
        },
      },
    ]);
  },

  aggregateByProfile: (userId, profileIds) =>
    Debt.aggregate([
      {
        $match: {
          userId: toObjectId(userId),
          isActive: true,
          profileId: { $in: profileIds.map(toObjectId) },
        },
      },
      {
        $group: {
          _id: '$profileId',
          totalOutstanding: { $sum: '$outstandingAmount' },
          totalEmi: { $sum: '$monthlyEmi' },
          count: { $sum: 1 },
        },
      },
    ]),
};

module.exports = debtRepository;

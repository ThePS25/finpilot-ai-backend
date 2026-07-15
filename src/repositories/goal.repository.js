const { Goal } = require('../models');

const goalRepository = {
  create: (data) => Goal.create(data),

  findByIdAndUser: (id, userId) => Goal.findOne({ _id: id, userId }),

  findAll: (userId, { profileId, skip, limit, isCompleted }) => {
    const query = { userId };
    if (profileId) query.profileId = profileId;
    if (isCompleted !== undefined) query.isCompleted = isCompleted === 'true';
    return Goal.find(query).sort({ targetDate: 1 }).skip(skip).limit(limit);
  },

  count: (userId, filters = {}) => {
    const query = { userId };
    if (filters.profileId) query.profileId = filters.profileId;
    if (filters.isCompleted !== undefined) query.isCompleted = filters.isCompleted === 'true';
    return Goal.countDocuments(query);
  },

  update: (id, userId, data) =>
    Goal.findOneAndUpdate({ _id: id, userId }, data, { new: true, runValidators: true }),

  delete: (id, userId) => Goal.findOneAndDelete({ _id: id, userId }),

  findByProfiles: (userId, profileIds) =>
    Goal.find({ userId, profileId: { $in: profileIds }, isCompleted: false }).sort({ targetDate: 1 }),
};

module.exports = goalRepository;

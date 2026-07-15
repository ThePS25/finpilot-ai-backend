const { Profile } = require('../models');

const profileRepository = {
  create: (data) => Profile.create(data),

  findById: (id) => Profile.findById(id),

  findByIdAndUser: (id, userId) => Profile.findOne({ _id: id, userId, isActive: true }),

  findAllByUser: (userId, { skip = 0, limit = 20 } = {}) =>
    Profile.find({ userId, isActive: true })
      .sort({ isPrimary: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit),

  countByUser: (userId) => Profile.countDocuments({ userId, isActive: true }),

  findPrimaryByUser: (userId) => Profile.findOne({ userId, isPrimary: true, isActive: true }),

  updateById: (id, userId, data) =>
    Profile.findOneAndUpdate({ _id: id, userId, isActive: true }, data, {
      new: true,
      runValidators: true,
    }),

  softDelete: (id, userId) =>
    Profile.findOneAndUpdate(
      { _id: id, userId, isActive: true },
      { isActive: false, isPrimary: false },
      { new: true }
    ),

  unsetPrimaryForUser: (userId) =>
    Profile.updateMany({ userId, isPrimary: true }, { isPrimary: false }),

  findByIdsAndUser: (ids, userId) =>
    Profile.find({ _id: { $in: ids }, userId, isActive: true }),

  findActiveByUser: (userId) =>
    Profile.find({ userId, isActive: true }).sort({ isPrimary: -1, createdAt: -1 }),
};

module.exports = profileRepository;

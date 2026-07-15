const profileRepository = require('../repositories/profile.repository');
const { NotFoundError, BadRequestError } = require('./AppError');

const assertProfileOwnership = async (userId, profileId) => {
  const profile = await profileRepository.findByIdAndUser(profileId, userId);
  if (!profile) throw new NotFoundError('Profile not found');
  return profile;
};

const resolveProfileIds = async (userId, profileIds) => {
  if (!profileIds || profileIds.length === 0) {
    const profiles = await profileRepository.findAllByUser(userId, { limit: 100 });
    return profiles.map((p) => p._id);
  }

  const profiles = await profileRepository.findByIdsAndUser(profileIds, userId);
  if (profiles.length !== profileIds.length) {
    throw new BadRequestError('One or more profile IDs are invalid');
  }
  return profiles.map((p) => p._id);
};

const buildDateFilter = (query) => {
  const filter = {};
  if (query.startDate) filter.$gte = new Date(query.startDate);
  if (query.endDate) filter.$lte = new Date(query.endDate);
  return Object.keys(filter).length ? filter : null;
};

const toMonthlyAmount = (amount, frequency) => {
  const multipliers = {
    'One-time': 0,
    Weekly: 4.33,
    'Bi-weekly': 2.17,
    Monthly: 1,
    Quarterly: 1 / 3,
    Yearly: 1 / 12,
  };
  return amount * (multipliers[frequency] ?? 1);
};

module.exports = {
  assertProfileOwnership,
  resolveProfileIds,
  buildDateFilter,
  toMonthlyAmount,
};

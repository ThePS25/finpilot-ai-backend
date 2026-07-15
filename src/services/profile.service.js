const profileRepository = require('../repositories/profile.repository');
const { NotFoundError, BadRequestError } = require('../utils/AppError');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

const profileService = {
  create: async (userId, data) => {
    const existingCount = await profileRepository.countByUser(userId);
    const isPrimary = data.isPrimary === true || existingCount === 0;

    if (isPrimary) {
      await profileRepository.unsetPrimaryForUser(userId);
    }

    const profile = await profileRepository.create({
      userId,
      name: data.name,
      relation: data.relation,
      dateOfBirth: data.dateOfBirth,
      occupation: data.occupation,
      isPrimary,
    });

    return profile;
  },

  getAll: async (userId, query) => {
    const { page, limit, skip } = parsePagination(query);
    const [profiles, total] = await Promise.all([
      profileRepository.findAllByUser(userId, { skip, limit }),
      profileRepository.countByUser(userId),
    ]);

    return {
      profiles,
      pagination: buildPaginationMeta(total, page, limit),
    };
  },

  getById: async (userId, profileId) => {
    const profile = await profileRepository.findByIdAndUser(profileId, userId);
    if (!profile) {
      throw new NotFoundError('Profile not found');
    }
    return profile;
  },

  update: async (userId, profileId, data) => {
    const profile = await profileRepository.findByIdAndUser(profileId, userId);
    if (!profile) {
      throw new NotFoundError('Profile not found');
    }

    if (data.isPrimary === true && !profile.isPrimary) {
      await profileRepository.unsetPrimaryForUser(userId);
    }

    if (data.isPrimary === false && profile.isPrimary) {
      const otherProfiles = await profileRepository.findAllByUser(userId, { limit: 2 });
      const hasOther = otherProfiles.some((p) => p._id.toString() !== profileId);
      if (!hasOther) {
        throw new BadRequestError('Cannot unset primary profile when it is the only profile');
      }
    }

    const updateData = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.relation !== undefined) updateData.relation = data.relation;
    if (data.dateOfBirth !== undefined) updateData.dateOfBirth = data.dateOfBirth;
    if (data.occupation !== undefined) updateData.occupation = data.occupation;
    if (data.isPrimary !== undefined) updateData.isPrimary = data.isPrimary;

    const updated = await profileRepository.updateById(profileId, userId, updateData);
    return updated;
  },

  delete: async (userId, profileId) => {
    const profile = await profileRepository.findByIdAndUser(profileId, userId);
    if (!profile) {
      throw new NotFoundError('Profile not found');
    }

    const totalProfiles = await profileRepository.countByUser(userId);
    if (totalProfiles <= 1) {
      throw new BadRequestError('Cannot delete the only profile');
    }

    if (profile.isPrimary) {
      const profiles = await profileRepository.findAllByUser(userId, { limit: 2 });
      const nextPrimary = profiles.find((p) => p._id.toString() !== profileId);
      if (nextPrimary) {
        await profileRepository.updateById(nextPrimary._id, userId, { isPrimary: true });
      }
    }

    await profileRepository.softDelete(profileId, userId);

    return { message: 'Profile deleted successfully' };
  },

  setPrimary: async (userId, profileId) => {
    const profile = await profileRepository.findByIdAndUser(profileId, userId);
    if (!profile) {
      throw new NotFoundError('Profile not found');
    }

    await profileRepository.unsetPrimaryForUser(userId);
    const updated = await profileRepository.updateById(profileId, userId, { isPrimary: true });
    return updated;
  },
};

module.exports = profileService;

const profileService = require('../services/profile.service');
const { sendSuccess, sendPaginated } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const profileController = {
  create: asyncHandler(async (req, res) => {
    const profile = await profileService.create(req.user.id, req.body);
    sendSuccess(res, { profile }, 'Profile created successfully', 201);
  }),

  getAll: asyncHandler(async (req, res) => {
    const { profiles, pagination } = await profileService.getAll(req.user.id, req.query);
    sendPaginated(res, { profiles }, pagination);
  }),

  getById: asyncHandler(async (req, res) => {
    const profile = await profileService.getById(req.user.id, req.params.id);
    sendSuccess(res, { profile });
  }),

  update: asyncHandler(async (req, res) => {
    const profile = await profileService.update(req.user.id, req.params.id, req.body);
    sendSuccess(res, { profile }, 'Profile updated successfully');
  }),

  delete: asyncHandler(async (req, res) => {
    const result = await profileService.delete(req.user.id, req.params.id);
    sendSuccess(res, null, result.message);
  }),

  setPrimary: asyncHandler(async (req, res) => {
    const profile = await profileService.setPrimary(req.user.id, req.params.id);
    sendSuccess(res, { profile }, 'Primary profile updated');
  }),
};

module.exports = profileController;

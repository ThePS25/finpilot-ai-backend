const goalService = require('../services/goal.service');
const { sendSuccess, sendPaginated } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

module.exports = {
  create: asyncHandler(async (req, res) => {
    const goal = await goalService.create(req.user.id, req.body);
    sendSuccess(res, { goal }, 'Goal created', 201);
  }),
  getAll: asyncHandler(async (req, res) => {
    const { goals, pagination } = await goalService.getAll(req.user.id, req.query);
    sendPaginated(res, { goals }, pagination);
  }),
  getById: asyncHandler(async (req, res) => {
    const goal = await goalService.getById(req.user.id, req.params.id);
    sendSuccess(res, { goal });
  }),
  update: asyncHandler(async (req, res) => {
    const goal = await goalService.update(req.user.id, req.params.id, req.body);
    sendSuccess(res, { goal }, 'Goal updated');
  }),
  delete: asyncHandler(async (req, res) => {
    const result = await goalService.delete(req.user.id, req.params.id);
    sendSuccess(res, null, result.message);
  }),
};

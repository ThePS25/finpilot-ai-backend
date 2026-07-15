const insightService = require('../services/insight.service');
const { sendSuccess, sendPaginated } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

module.exports = {
  generate: asyncHandler(async (req, res) => {
    const insight = await insightService.generate(req.user.id, req.query);
    sendSuccess(res, { insight });
  }),
  getAll: asyncHandler(async (req, res) => {
    const { insights, pagination } = await insightService.getAll(req.user.id, req.query);
    sendPaginated(res, { insights }, pagination);
  }),
  getByMonth: asyncHandler(async (req, res) => {
    const insight = await insightService.getByMonth(req.user.id, req.query);
    sendSuccess(res, { insight });
  }),
};

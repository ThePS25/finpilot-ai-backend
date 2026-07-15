const investmentService = require('../services/investment.service');
const { sendSuccess, sendPaginated } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

module.exports = {
  create: asyncHandler(async (req, res) => {
    const investment = await investmentService.create(req.user.id, req.body);
    sendSuccess(res, { investment }, 'Investment created', 201);
  }),
  getAll: asyncHandler(async (req, res) => {
    const { investments, pagination } = await investmentService.getAll(req.user.id, req.query);
    sendPaginated(res, { investments }, pagination);
  }),
  getById: asyncHandler(async (req, res) => {
    const investment = await investmentService.getById(req.user.id, req.params.id);
    sendSuccess(res, { investment });
  }),
  update: asyncHandler(async (req, res) => {
    const investment = await investmentService.update(req.user.id, req.params.id, req.body);
    sendSuccess(res, { investment }, 'Investment updated');
  }),
  delete: asyncHandler(async (req, res) => {
    const result = await investmentService.delete(req.user.id, req.params.id);
    sendSuccess(res, null, result.message);
  }),
  summary: asyncHandler(async (req, res) => {
    const summary = await investmentService.getSummary(req.user.id, req.query);
    sendSuccess(res, { summary });
  }),
};

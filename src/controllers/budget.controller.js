const budgetService = require('../services/budget.service');
const { sendSuccess, sendPaginated } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

module.exports = {
  create: asyncHandler(async (req, res) => {
    const budget = await budgetService.create(req.user.id, req.body);
    sendSuccess(res, { budget }, 'Budget created', 201);
  }),
  getAll: asyncHandler(async (req, res) => {
    const { budgets, pagination } = await budgetService.getAll(req.user.id, req.query);
    sendPaginated(res, { budgets }, pagination);
  }),
  update: asyncHandler(async (req, res) => {
    const budget = await budgetService.update(req.user.id, req.params.id, req.body);
    sendSuccess(res, { budget }, 'Budget updated');
  }),
  delete: asyncHandler(async (req, res) => {
    const result = await budgetService.delete(req.user.id, req.params.id);
    sendSuccess(res, null, result.message);
  }),
  checkAlerts: asyncHandler(async (req, res) => {
    await budgetService.checkAlerts(req.user.id, req.query.profileId);
    sendSuccess(res, null, 'Budget alerts checked');
  }),
};

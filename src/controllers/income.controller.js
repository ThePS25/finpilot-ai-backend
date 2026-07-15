const incomeService = require('../services/income.service');
const { sendSuccess, sendPaginated } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

module.exports = {
  create: asyncHandler(async (req, res) => {
    const income = await incomeService.create(req.user.id, req.body);
    sendSuccess(res, { income }, 'Income created', 201);
  }),
  getAll: asyncHandler(async (req, res) => {
    const { incomes, pagination } = await incomeService.getAll(req.user.id, req.query);
    sendPaginated(res, { incomes }, pagination);
  }),
  getById: asyncHandler(async (req, res) => {
    const income = await incomeService.getById(req.user.id, req.params.id);
    sendSuccess(res, { income });
  }),
  update: asyncHandler(async (req, res) => {
    const income = await incomeService.update(req.user.id, req.params.id, req.body);
    sendSuccess(res, { income }, 'Income updated');
  }),
  delete: asyncHandler(async (req, res) => {
    const result = await incomeService.delete(req.user.id, req.params.id);
    sendSuccess(res, null, result.message);
  }),
  analytics: asyncHandler(async (req, res) => {
    const analytics = await incomeService.getAnalytics(req.user.id, req.query);
    sendSuccess(res, { analytics });
  }),
};

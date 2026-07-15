const debtService = require('../services/debt.service');
const { sendSuccess, sendPaginated } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

module.exports = {
  create: asyncHandler(async (req, res) => {
    const debt = await debtService.create(req.user.id, req.body);
    sendSuccess(res, { debt }, 'Debt created', 201);
  }),
  getAll: asyncHandler(async (req, res) => {
    const { debts, pagination } = await debtService.getAll(req.user.id, req.query);
    sendPaginated(res, { debts }, pagination);
  }),
  getSummary: asyncHandler(async (req, res) => {
    const summary = await debtService.getSummary(req.user.id, req.query);
    sendSuccess(res, { summary });
  }),
  getById: asyncHandler(async (req, res) => {
    const debt = await debtService.getById(req.user.id, req.params.id);
    sendSuccess(res, { debt });
  }),
  update: asyncHandler(async (req, res) => {
    const debt = await debtService.update(req.user.id, req.params.id, req.body);
    sendSuccess(res, { debt }, 'Debt updated');
  }),
  delete: asyncHandler(async (req, res) => {
    const result = await debtService.delete(req.user.id, req.params.id);
    sendSuccess(res, null, result.message);
  }),
};

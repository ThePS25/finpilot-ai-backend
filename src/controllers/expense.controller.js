const expenseService = require('../services/expense.service');
const { sendSuccess, sendPaginated } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

module.exports = {
  create: asyncHandler(async (req, res) => {
    const expense = await expenseService.create(req.user.id, req.body);
    sendSuccess(res, { expense }, 'Expense created', 201);
  }),
  getAll: asyncHandler(async (req, res) => {
    const { expenses, pagination } = await expenseService.getAll(req.user.id, req.query);
    sendPaginated(res, { expenses }, pagination);
  }),
  getById: asyncHandler(async (req, res) => {
    const expense = await expenseService.getById(req.user.id, req.params.id);
    sendSuccess(res, { expense });
  }),
  update: asyncHandler(async (req, res) => {
    const expense = await expenseService.update(req.user.id, req.params.id, req.body);
    sendSuccess(res, { expense }, 'Expense updated');
  }),
  delete: asyncHandler(async (req, res) => {
    const result = await expenseService.delete(req.user.id, req.params.id);
    sendSuccess(res, null, result.message);
  }),
  getCategories: asyncHandler(async (req, res) => {
    const categories = await expenseService.getCategories(req.user.id);
    sendSuccess(res, { categories });
  }),
  analytics: asyncHandler(async (req, res) => {
    const analytics = await expenseService.getAnalytics(req.user.id, req.query);
    sendSuccess(res, { analytics });
  }),
};

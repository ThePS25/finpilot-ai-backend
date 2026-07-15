const recurringExpenseService = require('../services/recurringExpense.service');
const { sendSuccess, sendPaginated } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

module.exports = {
  create: asyncHandler(async (req, res) => {
    const recurringExpense = await recurringExpenseService.create(req.user.id, req.body);
    sendSuccess(res, { recurringExpense }, 'Recurring expense created', 201);
  }),
  getAll: asyncHandler(async (req, res) => {
    const { recurringExpenses, pagination } = await recurringExpenseService.getAll(
      req.user.id,
      req.query
    );
    sendPaginated(res, { recurringExpenses }, pagination);
  }),
  update: asyncHandler(async (req, res) => {
    const recurringExpense = await recurringExpenseService.update(
      req.user.id,
      req.params.id,
      req.body
    );
    sendSuccess(res, { recurringExpense }, 'Recurring expense updated');
  }),
  delete: asyncHandler(async (req, res) => {
    const result = await recurringExpenseService.delete(req.user.id, req.params.id);
    sendSuccess(res, null, result.message);
  }),
};

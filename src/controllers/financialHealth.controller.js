const financialHealthService = require('../services/financialHealth.service');
const { sendSuccess } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

module.exports = {
  calculate: asyncHandler(async (req, res) => {
    const health = await financialHealthService.calculate(req.user.id, req.query);
    sendSuccess(res, { health });
  }),
  getLatest: asyncHandler(async (req, res) => {
    const health = await financialHealthService.getLatest(req.user.id, req.query);
    sendSuccess(res, { health });
  }),
  getHistory: asyncHandler(async (req, res) => {
    const history = await financialHealthService.getHistory(req.user.id, req.query);
    sendSuccess(res, { history });
  }),
};

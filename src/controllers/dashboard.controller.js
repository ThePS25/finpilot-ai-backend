const dashboardService = require('../services/dashboard.service');
const { sendSuccess } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

module.exports = {
  overview: asyncHandler(async (req, res) => {
    const dashboard = await dashboardService.getOverview(req.user.id, req.query);
    sendSuccess(res, { dashboard });
  }),
  family: asyncHandler(async (req, res) => {
    const dashboard = await dashboardService.getFamilyDashboard(req.user.id, req.query);
    sendSuccess(res, { dashboard });
  }),
};

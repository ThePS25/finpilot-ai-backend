const scenarioService = require('../services/scenario.service');
const { sendSuccess, sendPaginated } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

module.exports = {
  simulate: asyncHandler(async (req, res) => {
    const scenario = await scenarioService.simulate(req.user.id, req.body);
    sendSuccess(res, { scenario }, 'Scenario simulated', 201);
  }),
  getAll: asyncHandler(async (req, res) => {
    const { scenarios, pagination } = await scenarioService.getAll(req.user.id, req.query);
    sendPaginated(res, { scenarios }, pagination);
  }),
  getById: asyncHandler(async (req, res) => {
    const scenario = await scenarioService.getById(req.user.id, req.params.id);
    sendSuccess(res, { scenario });
  }),
  delete: asyncHandler(async (req, res) => {
    const result = await scenarioService.delete(req.user.id, req.params.id);
    sendSuccess(res, null, result.message);
  }),
};

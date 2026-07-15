const exportService = require('../services/export.service');
const { sendSuccess } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

module.exports = {
  exportIncomes: asyncHandler(async (req, res) => {
    const { csv, filename } = await exportService.exportIncomes(req.user.id, req.query);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  }),
  exportExpenses: asyncHandler(async (req, res) => {
    const { csv, filename } = await exportService.exportExpenses(req.user.id, req.query);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  }),
  importExpenses: asyncHandler(async (req, res) => {
    const csvText = req.file?.buffer?.toString('utf8') || req.body.csv;
    const result = await exportService.importExpenses(req.user.id, req.body.profileId, csvText);
    sendSuccess(res, result, `Imported ${result.imported} expenses`);
  }),
};

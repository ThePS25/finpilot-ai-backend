const payslipService = require('../services/payslip.service');
const { sendSuccess, sendPaginated } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

module.exports = {
  upload: asyncHandler(async (req, res) => {
    const payslip = await payslipService.upload(req.user.id, req.body.profileId, req.file);
    const message =
      payslip.extractionStatus === 'success'
        ? 'Payslip uploaded and data extracted successfully'
        : 'Payslip uploaded. Please review and enter data manually.';
    sendSuccess(res, { payslip }, message, 201);
  }),

  getAll: asyncHandler(async (req, res) => {
    const { payslips, pagination } = await payslipService.getAll(req.user.id, req.query);
    sendPaginated(res, { payslips }, pagination);
  }),

  getById: asyncHandler(async (req, res) => {
    const payslip = await payslipService.getById(req.user.id, req.params.id);
    sendSuccess(res, { payslip });
  }),

  confirm: asyncHandler(async (req, res) => {
    const result = await payslipService.confirm(req.user.id, req.params.id, req.body);
    sendSuccess(
      res,
      result,
      result.syncedIncomes
        ? `Payslip saved and ${result.syncedIncomes} income record(s) created`
        : 'Payslip saved successfully'
    );
  }),

  reExtract: asyncHandler(async (req, res) => {
    const payslip = await payslipService.reExtract(req.user.id, req.params.id);
    sendSuccess(res, { payslip }, 'Payslip data re-extracted');
  }),

  delete: asyncHandler(async (req, res) => {
    const result = await payslipService.delete(req.user.id, req.params.id);
    sendSuccess(res, null, result.message);
  }),
};

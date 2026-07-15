const express = require('express');
const payslipController = require('../controllers/payslip.controller');
const authenticate = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate');
const upload = require('../middlewares/upload.middleware');
const { payslipConfirmValidator, idParam } = require('../validators/financial.validator');
const { body } = require('express-validator');

const router = express.Router();
router.use(authenticate);

router.post(
  '/upload',
  upload.single('file'),
  body('profileId').isMongoId().withMessage('Valid profileId is required'),
  validate,
  payslipController.upload
);
router.get('/', payslipController.getAll);
router.get('/:id', idParam, validate, payslipController.getById);
router.post('/:id/re-extract', idParam, validate, payslipController.reExtract);
router.patch('/:id/confirm', payslipConfirmValidator, validate, payslipController.confirm);
router.delete('/:id', idParam, validate, payslipController.delete);

module.exports = router;

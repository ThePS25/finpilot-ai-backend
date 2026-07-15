const express = require('express');
const investmentController = require('../controllers/investment.controller');
const authenticate = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate');
const {
  createInvestmentValidator,
  updateInvestmentValidator,
  idParam,
} = require('../validators/financial.validator');

const router = express.Router();
router.use(authenticate);

router.get('/summary', investmentController.summary);
router.post('/', createInvestmentValidator, validate, investmentController.create);
router.get('/', investmentController.getAll);
router.get('/:id', idParam, validate, investmentController.getById);
router.put('/:id', updateInvestmentValidator, validate, investmentController.update);
router.delete('/:id', idParam, validate, investmentController.delete);

module.exports = router;

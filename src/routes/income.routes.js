const express = require('express');
const incomeController = require('../controllers/income.controller');
const authenticate = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate');
const {
  createIncomeValidator,
  updateIncomeValidator,
  idParam,
} = require('../validators/financial.validator');

const router = express.Router();
router.use(authenticate);

router.post('/', createIncomeValidator, validate, incomeController.create);
router.get('/analytics', incomeController.analytics);
router.get('/', incomeController.getAll);
router.get('/:id', idParam, validate, incomeController.getById);
router.put('/:id', updateIncomeValidator, validate, incomeController.update);
router.delete('/:id', idParam, validate, incomeController.delete);

module.exports = router;

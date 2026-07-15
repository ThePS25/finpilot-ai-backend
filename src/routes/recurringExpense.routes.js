const express = require('express');
const recurringExpenseController = require('../controllers/recurringExpense.controller');
const authenticate = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate');
const {
  createRecurringExpenseValidator,
  updateRecurringExpenseValidator,
  idParam,
} = require('../validators/financial.validator');

const router = express.Router();
router.use(authenticate);

router.post('/', createRecurringExpenseValidator, validate, recurringExpenseController.create);
router.get('/', recurringExpenseController.getAll);
router.put('/:id', updateRecurringExpenseValidator, validate, recurringExpenseController.update);
router.delete('/:id', idParam, validate, recurringExpenseController.delete);

module.exports = router;

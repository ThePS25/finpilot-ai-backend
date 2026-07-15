const express = require('express');
const expenseController = require('../controllers/expense.controller');
const authenticate = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate');
const {
  createExpenseValidator,
  updateExpenseValidator,
  idParam,
} = require('../validators/financial.validator');

const router = express.Router();
router.use(authenticate);

router.get('/categories', expenseController.getCategories);
router.get('/analytics', expenseController.analytics);
router.post('/', createExpenseValidator, validate, expenseController.create);
router.get('/', expenseController.getAll);
router.get('/:id', idParam, validate, expenseController.getById);
router.put('/:id', updateExpenseValidator, validate, expenseController.update);
router.delete('/:id', idParam, validate, expenseController.delete);

module.exports = router;

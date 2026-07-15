const express = require('express');
const budgetController = require('../controllers/budget.controller');
const authenticate = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate');
const { createBudgetValidator, updateBudgetValidator, idParam } = require('../validators/financial.validator');

const router = express.Router();
router.use(authenticate);

router.post('/', createBudgetValidator, validate, budgetController.create);
router.get('/check-alerts', budgetController.checkAlerts);
router.get('/', budgetController.getAll);
router.put('/:id', updateBudgetValidator, validate, budgetController.update);
router.delete('/:id', idParam, validate, budgetController.delete);

module.exports = router;

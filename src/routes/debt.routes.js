const express = require('express');
const debtController = require('../controllers/debt.controller');
const authenticate = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate');
const { createDebtValidator, updateDebtValidator, idParam } = require('../validators/financial.validator');

const router = express.Router();
router.use(authenticate);

router.post('/', createDebtValidator, validate, debtController.create);
router.get('/summary', debtController.getSummary);
router.get('/', debtController.getAll);
router.get('/:id', idParam, validate, debtController.getById);
router.put('/:id', updateDebtValidator, validate, debtController.update);
router.delete('/:id', idParam, validate, debtController.delete);

module.exports = router;

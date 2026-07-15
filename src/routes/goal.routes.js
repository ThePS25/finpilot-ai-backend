const express = require('express');
const goalController = require('../controllers/goal.controller');
const authenticate = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate');
const {
  createGoalValidator,
  updateGoalValidator,
  idParam,
} = require('../validators/financial.validator');

const router = express.Router();
router.use(authenticate);

router.post('/', createGoalValidator, validate, goalController.create);
router.get('/', goalController.getAll);
router.get('/:id', idParam, validate, goalController.getById);
router.put('/:id', updateGoalValidator, validate, goalController.update);
router.delete('/:id', idParam, validate, goalController.delete);

module.exports = router;

const express = require('express');
const scenarioController = require('../controllers/scenario.controller');
const authenticate = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate');
const { createScenarioValidator, idParam } = require('../validators/financial.validator');

const router = express.Router();
router.use(authenticate);

router.post('/simulate', createScenarioValidator, validate, scenarioController.simulate);
router.get('/', scenarioController.getAll);
router.get('/:id', idParam, validate, scenarioController.getById);
router.delete('/:id', idParam, validate, scenarioController.delete);

module.exports = router;

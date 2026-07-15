const express = require('express');
const financialHealthController = require('../controllers/financialHealth.controller');
const authenticate = require('../middlewares/auth.middleware');

const router = express.Router();
router.use(authenticate);

router.post('/calculate', financialHealthController.calculate);
router.get('/latest', financialHealthController.getLatest);
router.get('/history', financialHealthController.getHistory);

module.exports = router;

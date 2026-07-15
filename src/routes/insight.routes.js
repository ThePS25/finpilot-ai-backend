const express = require('express');
const insightController = require('../controllers/insight.controller');
const authenticate = require('../middlewares/auth.middleware');

const router = express.Router();
router.use(authenticate);

router.post('/generate', insightController.generate);
router.get('/monthly', insightController.getByMonth);
router.get('/', insightController.getAll);

module.exports = router;

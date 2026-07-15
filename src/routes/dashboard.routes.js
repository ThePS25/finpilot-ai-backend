const express = require('express');
const dashboardController = require('../controllers/dashboard.controller');
const authenticate = require('../middlewares/auth.middleware');

const router = express.Router();
router.use(authenticate);

router.get('/overview', dashboardController.overview);
router.get('/family', dashboardController.family);

module.exports = router;

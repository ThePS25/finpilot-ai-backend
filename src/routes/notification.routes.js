const express = require('express');
const notificationController = require('../controllers/notification.controller');
const authenticate = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate');
const { idParam } = require('../validators/financial.validator');

const router = express.Router();
router.use(authenticate);

router.get('/', notificationController.getAll);
router.patch('/read-all', notificationController.markAllRead);
router.patch('/:id/read', idParam, validate, notificationController.markRead);
router.delete('/:id', idParam, validate, notificationController.delete);

module.exports = router;

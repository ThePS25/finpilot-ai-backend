const express = require('express');
const coachController = require('../controllers/coach.controller');
const authenticate = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate');
const { coachMessageValidator, idParam } = require('../validators/financial.validator');

const router = express.Router();
router.use(authenticate);

router.get('/', coachController.getConversations);
router.post('/', coachController.createConversation);
router.post('/message', coachMessageValidator, validate, coachController.sendMessage);
router.get('/:id', idParam, validate, coachController.getConversation);
router.delete('/:id', idParam, validate, coachController.deleteConversation);

module.exports = router;

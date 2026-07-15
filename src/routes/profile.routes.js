const express = require('express');
const profileController = require('../controllers/profile.controller');
const authenticate = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate');
const {
  createProfileValidator,
  updateProfileValidator,
  profileIdValidator,
} = require('../validators/profile.validator');

const router = express.Router();

router.use(authenticate);

router.post('/', createProfileValidator, validate, profileController.create);
router.get('/', profileController.getAll);
router.get('/:id', profileIdValidator, validate, profileController.getById);
router.put('/:id', updateProfileValidator, validate, profileController.update);
router.patch('/:id/primary', profileIdValidator, validate, profileController.setPrimary);
router.delete('/:id', profileIdValidator, validate, profileController.delete);

module.exports = router;

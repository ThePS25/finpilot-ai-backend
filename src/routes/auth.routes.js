const express = require('express');
const authController = require('../controllers/auth.controller');
const authenticate = require('../middlewares/auth.middleware');
const validate = require('../middlewares/validate');
const { authLimiter, passwordResetLimiter } = require('../middlewares/rateLimiter');
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  changePasswordValidator,
  verifyEmailValidator,
  totpValidator,
} = require('../validators/auth.validator');

const router = express.Router();

router.post('/register', authLimiter, registerValidator, validate, authController.register);
router.post('/login', authLimiter, loginValidator, validate, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authenticate, authController.logout);
router.post(
  '/forgot-password',
  passwordResetLimiter,
  forgotPasswordValidator,
  validate,
  authController.forgotPassword
);
router.post(
  '/reset-password',
  passwordResetLimiter,
  resetPasswordValidator,
  validate,
  authController.resetPassword
);
router.get('/me', authenticate, authController.getMe);
router.patch('/me', authenticate, authController.updateProfile);
router.post('/send-verification', authenticate, authController.sendVerification);
router.post('/verify-email', verifyEmailValidator, validate, authController.verifyEmail);
router.post(
  '/change-password',
  authenticate,
  changePasswordValidator,
  validate,
  authController.changePassword
);
router.post('/2fa/setup', authenticate, authController.setupTwoFactor);
router.post('/2fa/enable', authenticate, totpValidator, validate, authController.enableTwoFactor);
router.post('/2fa/disable', authenticate, totpValidator, validate, authController.disableTwoFactor);

module.exports = router;

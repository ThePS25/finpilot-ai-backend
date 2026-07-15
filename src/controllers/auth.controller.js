const authService = require('../services/auth.service');
const { setAuthCookies, clearAuthCookies } = require('../utils/cookieHelper');
const { sendSuccess } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const authController = {
  register: asyncHandler(async (req, res) => {
    const user = await authService.register(req.body);
    sendSuccess(res, { user }, 'Registration successful', 201);
  }),

  login: asyncHandler(async (req, res) => {
    const result = await authService.login({
      ...req.body,
      userAgent: req.get('user-agent'),
      ipAddress: req.ip,
    });

    if (result.requiresTwoFactor) {
      return sendSuccess(res, { requiresTwoFactor: true }, result.message);
    }

    setAuthCookies(res, result.accessToken, result.refreshToken);
    sendSuccess(res, { user: result.user }, 'Login successful');
  }),

  refresh: asyncHandler(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken || req.body.refreshToken;

    const { user, accessToken, refreshToken: newRefreshToken } =
      await authService.refreshTokens(refreshToken, req.get('user-agent'), req.ip);

    setAuthCookies(res, accessToken, newRefreshToken);
    sendSuccess(res, { user }, 'Token refreshed successfully');
  }),

  logout: asyncHandler(async (req, res) => {
    const refreshToken = req.cookies?.refreshToken;
    await authService.logout(refreshToken, req.user?.id);
    clearAuthCookies(res);
    sendSuccess(res, null, 'Logout successful');
  }),

  forgotPassword: asyncHandler(async (req, res) => {
    const result = await authService.forgotPassword(req.body.email);
    sendSuccess(res, null, result.message);
  }),

  resetPassword: asyncHandler(async (req, res) => {
    const result = await authService.resetPassword(req.body.token, req.body.password);
    sendSuccess(res, null, result.message);
  }),

  getMe: asyncHandler(async (req, res) => {
    const user = await authService.getCurrentUser(req.user.id);
    sendSuccess(res, { user });
  }),

  sendVerification: asyncHandler(async (req, res) => {
    const result = await authService.sendVerificationEmail(req.user.id);
    sendSuccess(res, null, result.message);
  }),

  verifyEmail: asyncHandler(async (req, res) => {
    const result = await authService.verifyEmail(req.body.token || req.query.token);
    sendSuccess(res, null, result.message);
  }),

  changePassword: asyncHandler(async (req, res) => {
    const result = await authService.changePassword(
      req.user.id,
      req.body.currentPassword,
      req.body.newPassword
    );
    clearAuthCookies(res);
    sendSuccess(res, null, result.message);
  }),

  updateProfile: asyncHandler(async (req, res) => {
    const user = await authService.updateProfile(req.user.id, req.body);
    sendSuccess(res, { user }, 'Profile updated');
  }),

  setupTwoFactor: asyncHandler(async (req, res) => {
    const data = await authService.setupTwoFactor(req.user.id);
    sendSuccess(res, data, 'Scan the QR code with your authenticator app');
  }),

  enableTwoFactor: asyncHandler(async (req, res) => {
    const result = await authService.enableTwoFactor(req.user.id, req.body.totpCode);
    sendSuccess(res, null, result.message);
  }),

  disableTwoFactor: asyncHandler(async (req, res) => {
    const result = await authService.disableTwoFactor(req.user.id, req.body.totpCode);
    sendSuccess(res, null, result.message);
  }),
};

module.exports = authController;

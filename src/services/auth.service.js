const userRepository = require('../repositories/user.repository');
const refreshTokenRepository = require('../repositories/refreshToken.repository');
const passwordResetRepository = require('../repositories/passwordReset.repository');
const emailVerificationRepository = require('../repositories/emailVerification.repository');
const profileRepository = require('../repositories/profile.repository');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  getRefreshTokenExpiry,
} = require('../utils/jwtHelper');
const { hashToken, generateRandomToken } = require('../utils/tokenHelper');
const { sendPasswordResetEmail, sendEmailVerification } = require('../utils/emailService');
const {
  ConflictError,
  UnauthorizedError,
  NotFoundError,
  BadRequestError,
} = require('../utils/AppError');
const logger = require('../utils/logger');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

const authService = {
  register: async ({ name, email, password }) => {
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new ConflictError('Email already registered');
    }

    const user = await userRepository.create({ name, email, password });

    await profileRepository.create({
      userId: user._id,
      name,
      relation: 'Self',
      isPrimary: true,
    });

    try {
      await authService.sendVerificationEmail(user._id.toString());
    } catch (error) {
      logger.warn('Failed to send verification email on register', error);
    }

    logger.auth('User registered', { userId: user._id, email });

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
    };
  },

  login: async ({ email, password, totpCode, userAgent, ipAddress }) => {
    const user = await userRepository.findByEmailWithSecrets(email);

    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.isTwoFactorEnabled) {
      if (!totpCode) {
        return { requiresTwoFactor: true, message: 'Two-factor code required' };
      }
      const valid = speakeasy.totp.verify({
        secret: user.totpSecret,
        encoding: 'base32',
        token: String(totpCode),
        window: 1,
      });
      if (!valid) throw new UnauthorizedError('Invalid two-factor code');
    }

    const tokens = await authService.generateTokens(user, userAgent, ipAddress);
    await userRepository.updateLastLogin(user._id);

    logger.auth('User logged in', { userId: user._id, email });

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
      },
      ...tokens,
    };
  },

  generateTokens: async (user, userAgent, ipAddress) => {
    const payload = { userId: user._id.toString(), email: user.email };

    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    const hashedRefreshToken = hashToken(refreshToken);

    await refreshTokenRepository.create({
      userId: user._id,
      token: hashedRefreshToken,
      expiresAt: new Date(Date.now() + getRefreshTokenExpiry()),
      userAgent,
      ipAddress,
    });

    return { accessToken, refreshToken };
  },

  refreshTokens: async (refreshToken, userAgent, ipAddress) => {
    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token required');
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const hashedToken = hashToken(refreshToken);
    const storedToken = await refreshTokenRepository.findByToken(hashedToken);

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedError('Invalid or expired refresh token');
    }

    const user = await userRepository.findById(decoded.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('User account is inactive or not found');
    }

    await refreshTokenRepository.revokeByToken(hashedToken);

    const tokens = await authService.generateTokens(user, userAgent, ipAddress);

    logger.auth('Tokens refreshed', { userId: user._id });

    return {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        isEmailVerified: user.isEmailVerified,
        isTwoFactorEnabled: user.isTwoFactorEnabled,
      },
      ...tokens,
    };
  },

  logout: async (refreshToken, userId) => {
    if (refreshToken) {
      const hashedToken = hashToken(refreshToken);
      await refreshTokenRepository.revokeByToken(hashedToken);
    } else if (userId) {
      await refreshTokenRepository.revokeAllByUserId(userId);
    }

    logger.auth('User logged out', { userId });
  },

  forgotPassword: async (email) => {
    const user = await userRepository.findByEmail(email);

    if (!user) {
      return { message: 'If the email exists, a reset link has been sent' };
    }

    const resetToken = generateRandomToken();
    const hashedToken = hashToken(resetToken);

    await passwordResetRepository.invalidateByUserId(user._id);
    await passwordResetRepository.create({
      userId: user._id,
      token: hashedToken,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    });

    await sendPasswordResetEmail(user.email, resetToken, user.name);

    logger.auth('Password reset requested', { userId: user._id, email });

    return { message: 'If the email exists, a reset link has been sent' };
  },

  resetPassword: async (token, newPassword) => {
    if (!token) {
      throw new BadRequestError('Reset token is required');
    }

    const hashedToken = hashToken(token);
    const resetRecord = await passwordResetRepository.findValidToken(hashedToken);

    if (!resetRecord) {
      throw new BadRequestError('Invalid or expired reset token');
    }

    const user = await userRepository.findByIdWithPassword(resetRecord.userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    user.password = newPassword;
    await user.save();

    await passwordResetRepository.markAsUsed(resetRecord._id);
    await refreshTokenRepository.revokeAllByUserId(user._id);

    logger.auth('Password reset completed', { userId: user._id });

    return { message: 'Password reset successful' };
  },

  sendVerificationEmail: async (userId) => {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    if (user.isEmailVerified) {
      return { message: 'Email is already verified' };
    }

    const token = generateRandomToken();
    await emailVerificationRepository.invalidateByUserId(user._id);
    await emailVerificationRepository.create({
      userId: user._id,
      token: hashToken(token),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    });

    await sendEmailVerification(user.email, token, user.name);
    return { message: 'Verification email sent' };
  },

  verifyEmail: async (token) => {
    if (!token) throw new BadRequestError('Verification token is required');
    const record = await emailVerificationRepository.findValidToken(hashToken(token));
    if (!record) throw new BadRequestError('Invalid or expired verification token');

    await userRepository.updateById(record.userId, { isEmailVerified: true });
    await emailVerificationRepository.markAsUsed(record._id);

    return { message: 'Email verified successfully' };
  },

  changePassword: async (userId, currentPassword, newPassword) => {
    const user = await userRepository.findByIdWithPassword(userId);
    if (!user) throw new NotFoundError('User not found');

    const valid = await user.comparePassword(currentPassword);
    if (!valid) throw new UnauthorizedError('Current password is incorrect');

    user.password = newPassword;
    await user.save();
    await refreshTokenRepository.revokeAllByUserId(user._id);

    return { message: 'Password changed successfully. Please log in again.' };
  },

  updateProfile: async (userId, { name }) => {
    const user = await userRepository.updateById(userId, { name });
    if (!user) throw new NotFoundError('User not found');
    return {
      id: user._id,
      name: user.name,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      isTwoFactorEnabled: user.isTwoFactorEnabled,
    };
  },

  setupTwoFactor: async (userId) => {
    const user = await userRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found');

    const secret = speakeasy.generateSecret({
      name: `FinPilot AI (${user.email})`,
      length: 20,
    });

    await userRepository.updateById(userId, {
      totpSecret: secret.base32,
      isTwoFactorEnabled: false,
    });

    const qrCodeDataUrl = await QRCode.toDataURL(secret.otpauth_url);
    return { secret: secret.base32, otpauthUrl: secret.otpauth_url, qrCodeDataUrl };
  },

  enableTwoFactor: async (userId, totpCode) => {
    const user = await userRepository.findByIdWithSecrets(userId);
    if (!user?.totpSecret) throw new BadRequestError('Run 2FA setup first');

    const valid = speakeasy.totp.verify({
      secret: user.totpSecret,
      encoding: 'base32',
      token: String(totpCode),
      window: 1,
    });
    if (!valid) throw new BadRequestError('Invalid two-factor code');

    await userRepository.updateById(userId, { isTwoFactorEnabled: true });
    return { message: 'Two-factor authentication enabled' };
  },

  disableTwoFactor: async (userId, totpCode) => {
    const user = await userRepository.findByIdWithSecrets(userId);
    if (!user) throw new NotFoundError('User not found');

    if (user.isTwoFactorEnabled) {
      const valid = speakeasy.totp.verify({
        secret: user.totpSecret,
        encoding: 'base32',
        token: String(totpCode),
        window: 1,
      });
      if (!valid) throw new BadRequestError('Invalid two-factor code');
    }

    await userRepository.updateById(userId, {
      isTwoFactorEnabled: false,
      totpSecret: null,
    });
    return { message: 'Two-factor authentication disabled' };
  },

  getCurrentUser: async (userId) => {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new NotFoundError('User not found');
    }

    return {
      id: user._id,
      name: user.name,
      email: user.email,
      isEmailVerified: user.isEmailVerified,
      isTwoFactorEnabled: user.isTwoFactorEnabled,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    };
  },
};

module.exports = authService;

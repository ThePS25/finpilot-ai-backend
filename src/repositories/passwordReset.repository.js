const { PasswordReset } = require('../models');

const passwordResetRepository = {
  create: (data) => PasswordReset.create(data),

  findValidToken: (token) =>
    PasswordReset.findOne({
      token,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    }),

  markAsUsed: (id) =>
    PasswordReset.findByIdAndUpdate(id, { isUsed: true }),

  invalidateByUserId: (userId) =>
    PasswordReset.updateMany({ userId, isUsed: false }, { isUsed: true }),
};

module.exports = passwordResetRepository;

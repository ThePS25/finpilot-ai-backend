const { EmailVerification } = require('../models');

const emailVerificationRepository = {
  create: (data) => EmailVerification.create(data),

  invalidateByUserId: (userId) =>
    EmailVerification.updateMany({ userId, isUsed: false }, { isUsed: true }),

  findValidToken: (token) =>
    EmailVerification.findOne({
      token,
      isUsed: false,
      expiresAt: { $gt: new Date() },
    }),

  markAsUsed: (id) =>
    EmailVerification.findByIdAndUpdate(id, { isUsed: true }, { new: true }),
};

module.exports = emailVerificationRepository;

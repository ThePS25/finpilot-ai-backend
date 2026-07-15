const { RefreshToken } = require('../models');

const refreshTokenRepository = {
  create: (data) => RefreshToken.create(data),

  findByToken: (token) => RefreshToken.findOne({ token, isRevoked: false }),

  revokeByToken: (token) =>
    RefreshToken.findOneAndUpdate({ token }, { isRevoked: true }),

  revokeAllByUserId: (userId) =>
    RefreshToken.updateMany({ userId, isRevoked: false }, { isRevoked: true }),

  deleteExpired: () => RefreshToken.deleteMany({ expiresAt: { $lt: new Date() } }),
};

module.exports = refreshTokenRepository;

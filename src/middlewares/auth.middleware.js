const jwt = require('jsonwebtoken');
const { verifyAccessToken } = require('../utils/jwtHelper');
const { UnauthorizedError } = require('../utils/AppError');
const asyncHandler = require('../utils/asyncHandler');
const userRepository = require('../repositories/user.repository');

const authenticate = asyncHandler(async (req, res, next) => {
  let token = req.cookies?.accessToken;

  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    throw new UnauthorizedError('Access token required');
  }

  try {
    const decoded = verifyAccessToken(token);
    const user = await userRepository.findById(decoded.userId);

    if (!user || !user.isActive) {
      throw new UnauthorizedError('User account is inactive or not found');
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      name: user.name,
    };

    next();
  } catch (error) {
    if (error instanceof UnauthorizedError) throw error;
    if (error.name === 'TokenExpiredError') {
      throw new UnauthorizedError('Access token expired');
    }
    if (error.name === 'JsonWebTokenError') {
      throw new UnauthorizedError('Invalid access token');
    }
    throw error;
  }
});

module.exports = authenticate;

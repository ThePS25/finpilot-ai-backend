const { validationResult } = require('express-validator');
const { ValidationError } = require('../utils/AppError');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path,
      message: err.msg,
    }));
    return next(new ValidationError('Validation failed', formattedErrors));
  }
  next();
};

module.exports = validate;

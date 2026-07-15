const { body, param } = require('express-validator');
const { PROFILE_RELATIONS } = require('../constants');

const createProfileValidator = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Name is required')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('relation')
    .notEmpty()
    .withMessage('Relation is required')
    .isIn(PROFILE_RELATIONS)
    .withMessage(`Relation must be one of: ${PROFILE_RELATIONS.join(', ')}`),
  body('dateOfBirth')
    .optional({ values: 'null' })
    .isISO8601()
    .withMessage('Date of birth must be a valid date'),
  body('occupation')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Occupation cannot exceed 100 characters'),
  body('isPrimary').optional().isBoolean().withMessage('isPrimary must be a boolean'),
];

const updateProfileValidator = [
  param('id').isMongoId().withMessage('Invalid profile ID'),
  body('name')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Name cannot be empty')
    .isLength({ max: 100 })
    .withMessage('Name cannot exceed 100 characters'),
  body('relation')
    .optional()
    .isIn(PROFILE_RELATIONS)
    .withMessage(`Relation must be one of: ${PROFILE_RELATIONS.join(', ')}`),
  body('dateOfBirth')
    .optional({ values: 'null' })
    .isISO8601()
    .withMessage('Date of birth must be a valid date'),
  body('occupation')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Occupation cannot exceed 100 characters'),
  body('isPrimary').optional().isBoolean().withMessage('isPrimary must be a boolean'),
];

const profileIdValidator = [param('id').isMongoId().withMessage('Invalid profile ID')];

module.exports = {
  createProfileValidator,
  updateProfileValidator,
  profileIdValidator,
};

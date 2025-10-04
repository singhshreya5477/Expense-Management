const { body, param, query, validationResult } = require('express-validator');
const AppError = require('../utils/AppError');

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    const extractedErrors = errors.array().map(err => ({
      field: err.path,
      message: err.msg
    }));

    return next(new AppError(`Validation failed: ${JSON.stringify(extractedErrors)}`, 400));
  };
};

const expenseValidation = {
  create: [
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
    body('currency').isLength({ min: 3, max: 3 }).withMessage('Currency must be a 3-letter code'),
    body('category').isIn(['Travel', 'Food', 'Accommodation', 'Transport', 'Office Supplies', 'Entertainment', 'Other'])
      .withMessage('Invalid category'),
    body('description').trim().isLength({ min: 3, max: 500 }).withMessage('Description must be 3-500 characters'),
    body('date').isISO8601().withMessage('Invalid date format')
  ],
  update: [
    body('amount').optional().isFloat({ min: 0.01 }),
    body('currency').optional().isLength({ min: 3, max: 3 }),
    body('category').optional().isIn(['Travel', 'Food', 'Accommodation', 'Transport', 'Office Supplies', 'Entertainment', 'Other']),
    body('description').optional().trim().isLength({ min: 3, max: 500 }),
    body('date').optional().isISO8601()
  ]
};

const userValidation = {
  create: [
    body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).withMessage('Password must contain uppercase, lowercase, and number'),
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    body('role').optional().isIn(['Admin', 'Manager', 'Employee']).withMessage('Invalid role')
  ],
  updateRole: [
    body('role').isIn(['Admin', 'Manager', 'Employee']).withMessage('Invalid role')
  ]
};

const approvalRuleValidation = {
  create: [
    body('name').trim().isLength({ min: 3, max: 100 }).withMessage('Name must be 3-100 characters'),
    body('ruleType').isIn(['Sequential', 'Conditional', 'Hybrid']).withMessage('Invalid rule type'),
    body('steps').isArray({ min: 1 }).withMessage('At least one step is required'),
    body('amountThreshold.min').isFloat({ min: 0 }).withMessage('Minimum threshold must be >= 0')
  ]
};

module.exports = {
  validate,
  expenseValidation,
  userValidation,
  approvalRuleValidation
};

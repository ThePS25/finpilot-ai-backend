const { body, param, query } = require('express-validator');
const {
  INCOME_TYPES,
  INCOME_FREQUENCIES,
  INVESTMENT_TYPES,
  GOAL_TYPES,
  SCENARIO_TYPES,
  DEBT_TYPES,
  RECURRING_FREQUENCIES,
} = require('../constants');

const mongoId = (field) => body(field).isMongoId().withMessage(`Invalid ${field}`);

const createIncomeValidator = [
  mongoId('profileId'),
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
  body('type').isIn(INCOME_TYPES).withMessage('Invalid income type'),
  body('frequency').isIn(INCOME_FREQUENCIES).withMessage('Invalid frequency'),
  body('date').isISO8601().withMessage('Valid date is required'),
];

const updateIncomeValidator = [
  param('id').isMongoId(),
  body('profileId').optional().isMongoId(),
  body('title').optional().trim().notEmpty(),
  body('amount').optional().isFloat({ min: 0 }),
  body('type').optional().isIn(INCOME_TYPES),
  body('frequency').optional().isIn(INCOME_FREQUENCIES),
  body('date').optional().isISO8601(),
];

const createExpenseValidator = [
  mongoId('profileId'),
  body('amount').isFloat({ min: 0 }).withMessage('Amount must be positive'),
  body('category').trim().notEmpty().withMessage('Category is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('description').optional().trim(),
];

const updateExpenseValidator = [
  param('id').isMongoId(),
  body('profileId').optional().isMongoId(),
  body('amount').optional().isFloat({ min: 0 }),
  body('category').optional().trim().notEmpty(),
  body('date').optional().isISO8601(),
  body('description').optional().trim(),
];

const createInvestmentValidator = [
  mongoId('profileId'),
  body('investmentType').isIn(INVESTMENT_TYPES),
  body('amountInvested').isFloat({ min: 0 }),
  body('currentValue').isFloat({ min: 0 }),
  body('name').optional().trim(),
  body('startDate').optional().isISO8601(),
];

const updateInvestmentValidator = [
  param('id').isMongoId(),
  body('profileId').optional().isMongoId(),
  body('investmentType').optional().isIn(INVESTMENT_TYPES),
  body('amountInvested').optional().isFloat({ min: 0 }),
  body('currentValue').optional().isFloat({ min: 0 }),
];

const createGoalValidator = [
  mongoId('profileId'),
  body('goalName').trim().notEmpty(),
  body('targetAmount').isFloat({ min: 0 }),
  body('targetDate').isISO8601(),
  body('currentSavings').optional().isFloat({ min: 0 }),
  body('goalType').optional().isIn(GOAL_TYPES),
];

const updateGoalValidator = [
  param('id').isMongoId(),
  body('goalName').optional().trim().notEmpty(),
  body('targetAmount').optional().isFloat({ min: 0 }),
  body('targetDate').optional().isISO8601(),
  body('currentSavings').optional().isFloat({ min: 0 }),
];

const createScenarioValidator = [
  body('name').trim().notEmpty(),
  body('scenarioType').isIn(SCENARIO_TYPES),
  body('parameters').isObject(),
  body('profileId').optional().isMongoId(),
];

const coachMessageValidator = [
  body('message').trim().notEmpty().withMessage('Message is required'),
  body('conversationId').optional().isMongoId(),
];

const payslipConfirmValidator = [
  param('id').isMongoId(),
  body('extractedData').optional().isObject(),
  body('extractedData.basicSalary').optional().isFloat({ min: 0 }),
  body('extractedData.hra').optional().isFloat({ min: 0 }),
  body('extractedData.specialAllowance').optional().isFloat({ min: 0 }),
  body('extractedData.otherAllowances').optional().isFloat({ min: 0 }),
  body('extractedData.grossSalary').optional().isFloat({ min: 0 }),
  body('extractedData.pf').optional().isFloat({ min: 0 }),
  body('extractedData.professionalTax').optional().isFloat({ min: 0 }),
  body('extractedData.tax').optional().isFloat({ min: 0 }),
  body('extractedData.otherDeductions').optional().isFloat({ min: 0 }),
  body('extractedData.totalDeductions').optional().isFloat({ min: 0 }),
  body('extractedData.bonus').optional().isFloat({ min: 0 }),
  body('extractedData.netSalary').optional().isFloat({ min: 0 }),
  body('extractedData.employerName').optional().isString(),
  body('extractedData.employeeName').optional().isString(),
  body('extractedData.employeeId').optional().isString(),
  body('extractedData.designation').optional().isString(),
  body('extractedData.panNumber').optional().isString(),
  body('extractedData.payPeriod').optional().isString(),
  body('month').optional().isInt({ min: 1, max: 12 }),
  body('year').optional().isInt({ min: 2000, max: 2100 }),
  body('syncToIncome').optional().isBoolean(),
];

const idParam = [param('id').isMongoId().withMessage('Invalid ID')];

const createDebtValidator = [
  mongoId('profileId'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('debtType').isIn(DEBT_TYPES).withMessage('Invalid debt type'),
  body('principalAmount').isFloat({ min: 0 }),
  body('outstandingAmount').optional().isFloat({ min: 0 }),
  body('interestRate').optional().isFloat({ min: 0, max: 100 }),
  body('monthlyEmi').optional().isFloat({ min: 0 }),
  body('startDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
];

const updateDebtValidator = [
  param('id').isMongoId(),
  body('name').optional().trim().notEmpty(),
  body('debtType').optional().isIn(DEBT_TYPES),
  body('principalAmount').optional().isFloat({ min: 0 }),
  body('outstandingAmount').optional().isFloat({ min: 0 }),
  body('interestRate').optional().isFloat({ min: 0, max: 100 }),
  body('monthlyEmi').optional().isFloat({ min: 0 }),
  body('isActive').optional().isBoolean(),
];

const createBudgetValidator = [
  mongoId('profileId'),
  body('category').trim().notEmpty(),
  body('limitAmount').isFloat({ min: 0 }),
  body('month').optional().isInt({ min: 1, max: 12 }),
  body('year').optional().isInt({ min: 2000, max: 2100 }),
  body('alertThreshold').optional().isInt({ min: 1, max: 100 }),
];

const updateBudgetValidator = [
  param('id').isMongoId(),
  body('category').optional().trim().notEmpty(),
  body('limitAmount').optional().isFloat({ min: 0 }),
  body('alertThreshold').optional().isInt({ min: 1, max: 100 }),
];

const createRecurringExpenseValidator = [
  mongoId('profileId'),
  body('title').trim().notEmpty(),
  body('amount').isFloat({ min: 0 }),
  body('category').trim().notEmpty(),
  body('frequency').isIn(RECURRING_FREQUENCIES),
  body('nextDueDate').optional().isISO8601(),
  body('endDate').optional().isISO8601(),
];

const updateRecurringExpenseValidator = [
  param('id').isMongoId(),
  body('title').optional().trim().notEmpty(),
  body('amount').optional().isFloat({ min: 0 }),
  body('category').optional().trim().notEmpty(),
  body('frequency').optional().isIn(RECURRING_FREQUENCIES),
  body('nextDueDate').optional().isISO8601(),
  body('isActive').optional().isBoolean(),
];

module.exports = {
  createIncomeValidator,
  updateIncomeValidator,
  createExpenseValidator,
  updateExpenseValidator,
  createInvestmentValidator,
  updateInvestmentValidator,
  createGoalValidator,
  updateGoalValidator,
  createScenarioValidator,
  coachMessageValidator,
  payslipConfirmValidator,
  createDebtValidator,
  updateDebtValidator,
  createBudgetValidator,
  updateBudgetValidator,
  createRecurringExpenseValidator,
  updateRecurringExpenseValidator,
  idParam,
};

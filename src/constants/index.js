const INCOME_TYPES = ['Salary', 'Freelancing', 'Rental Income', 'Interest', 'Dividend', 'Business'];

const INCOME_FREQUENCIES = ['One-time', 'Weekly', 'Bi-weekly', 'Monthly', 'Quarterly', 'Yearly'];

const DEFAULT_EXPENSE_CATEGORIES = [
  'Food',
  'Rent',
  'Travel',
  'Medical',
  'Insurance',
  'Shopping',
  'Entertainment',
  'Utilities',
];

const INVESTMENT_TYPES = [
  'Stocks',
  'Mutual Funds',
  'SIP',
  'PPF',
  'EPF',
  'Fixed Deposit',
  'Gold',
  'Crypto',
];

const GOAL_TYPES = ['Buy House', 'Buy Car', 'Vacation', 'Marriage', 'Retirement', 'Other'];

const PROFILE_RELATIONS = ['Self', 'Father', 'Mother', 'Spouse', 'Child', 'Sibling', 'Other'];

const SCENARIO_TYPES = ['Salary Increase', 'Expense Increase', 'New Investment', 'New Loan'];

const DEBT_TYPES = ['Home Loan', 'Car Loan', 'Personal Loan', 'Education Loan', 'Credit Card', 'Other'];

const RECURRING_FREQUENCIES = ['Weekly', 'Bi-weekly', 'Monthly', 'Quarterly', 'Yearly'];

const NOTIFICATION_TYPES = [
  'insight',
  'budget_alert',
  'recurring',
  'health',
  'system',
  'security',
];

const LIQUID_INVESTMENT_TYPES = ['Fixed Deposit', 'PPF', 'EPF'];

const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
};

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER: 500,
};

module.exports = {
  INCOME_TYPES,
  INCOME_FREQUENCIES,
  DEFAULT_EXPENSE_CATEGORIES,
  INVESTMENT_TYPES,
  GOAL_TYPES,
  PROFILE_RELATIONS,
  SCENARIO_TYPES,
  DEBT_TYPES,
  RECURRING_FREQUENCIES,
  NOTIFICATION_TYPES,
  LIQUID_INVESTMENT_TYPES,
  PAGINATION,
  HTTP_STATUS,
};

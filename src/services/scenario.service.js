const scenarioRepository = require('../repositories/scenario.repository');
const incomeRepository = require('../repositories/income.repository');
const expenseRepository = require('../repositories/expense.repository');
const investmentRepository = require('../repositories/investment.repository');
const goalRepository = require('../repositories/goal.repository');
const { assertProfileOwnership, resolveProfileIds } = require('../utils/profileHelper');
const { NotFoundError } = require('../utils/AppError');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

const getBaseline = async (userId, profileIds) => {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const dateFilter = { $gte: monthStart, $lte: monthEnd };

  const [income, expenses, investments, goals] = await Promise.all([
    incomeRepository.sumByProfiles(userId, profileIds, dateFilter),
    expenseRepository.sumByProfiles(userId, profileIds, dateFilter),
    investmentRepository.aggregateTotals(userId, profileIds),
    goalRepository.findByProfiles(userId, profileIds),
  ]);

  return {
    monthlyIncome: income[0]?.total || 0,
    monthlyExpenses: expenses[0]?.total || 0,
    netWorth: investments[0]?.totalCurrent || 0,
    goals,
  };
};

const projectScenario = (baseline, scenarioType, parameters) => {
  let { monthlyIncome, monthlyExpenses, netWorth } = baseline;
  const months = parameters.durationMonths || 24;

  switch (scenarioType) {
    case 'Salary Increase':
      monthlyIncome += parameters.amount || 0;
      break;
    case 'Expense Increase':
      monthlyExpenses += parameters.amount || 0;
      break;
    case 'New Investment':
      netWorth += parameters.amount || 0;
      monthlyExpenses += parameters.monthlyContribution || 0;
      break;
    case 'New Loan':
      monthlyExpenses += parameters.emi || 0;
      netWorth += parameters.amount || 0;
      break;
    default:
      break;
  }

  const monthlySavings = monthlyIncome - monthlyExpenses;
  const futureSavings = [];
  const netWorthGrowth = [];
  let cumulativeSavings = 0;
  let currentNetWorth = netWorth;

  for (let m = 1; m <= months; m++) {
    cumulativeSavings += monthlySavings;
    currentNetWorth += monthlySavings;
    if (scenarioType === 'New Investment' && parameters.expectedReturn) {
      currentNetWorth *= 1 + parameters.expectedReturn / 12 / 100;
    }
    futureSavings.push({ month: m, amount: Math.round(cumulativeSavings) });
    netWorthGrowth.push({ month: m, netWorth: Math.round(currentNetWorth) });
  }

  const goalTimelines = baseline.goals.map((goal) => {
    const remaining = Math.max(0, goal.targetAmount - goal.currentSavings);
    const monthsToGoal = monthlySavings > 0 ? Math.ceil(remaining / monthlySavings) : null;
    const projectedDate = monthsToGoal
      ? new Date(Date.now() + monthsToGoal * 30 * 24 * 60 * 60 * 1000)
      : null;
    return {
      goalId: goal._id.toString(),
      goalName: goal.goalName,
      projectedDate,
      monthsToGoal,
    };
  });

  return { futureSavings, netWorthGrowth, goalTimelines, monthlySavings };
};

const scenarioService = {
  simulate: async (userId, data) => {
    if (data.profileId) await assertProfileOwnership(userId, data.profileId);

    const profileIds = data.profileId
      ? [data.profileId]
      : await resolveProfileIds(userId, null);

    const baseline = await getBaseline(userId, profileIds);
    const projections = projectScenario(baseline, data.scenarioType, data.parameters);

    const summary = `With this ${data.scenarioType.toLowerCase()}, your monthly savings would be ₹${projections.monthlySavings.toLocaleString('en-IN')}. Over ${data.parameters.durationMonths || 24} months, net worth could grow to ₹${projections.netWorthGrowth[projections.netWorthGrowth.length - 1]?.netWorth.toLocaleString('en-IN') || 0}.`;

    const scenario = await scenarioRepository.create({
      userId,
      profileId: data.profileId,
      name: data.name,
      scenarioType: data.scenarioType,
      parameters: data.parameters,
      projections,
      summary,
    });

    return scenario;
  },

  getAll: async (userId, query) => {
    const { page, limit, skip } = parsePagination(query);
    const [scenarios, total] = await Promise.all([
      scenarioRepository.findAll(userId, { skip, limit }),
      scenarioRepository.count(userId),
    ]);
    return { scenarios, pagination: buildPaginationMeta(total, page, limit) };
  },

  getById: async (userId, id) => {
    const scenario = await scenarioRepository.findByIdAndUser(id, userId);
    if (!scenario) throw new NotFoundError('Scenario not found');
    return scenario;
  },

  delete: async (userId, id) => {
    const scenario = await scenarioRepository.delete(id, userId);
    if (!scenario) throw new NotFoundError('Scenario not found');
    return { message: 'Scenario deleted successfully' };
  },
};

module.exports = scenarioService;

const incomeRepository = require('../repositories/income.repository');
const expenseRepository = require('../repositories/expense.repository');
const investmentRepository = require('../repositories/investment.repository');
const debtRepository = require('../repositories/debt.repository');
const financialHealthRepository = require('../repositories/financialHealth.repository');
const { resolveProfileIds } = require('../utils/profileHelper');
const { LIQUID_INVESTMENT_TYPES } = require('../constants');

const calculateComponentScore = (value, thresholds) => {
  const { excellent, good, fair } = thresholds;
  if (value >= excellent) return 100;
  if (value >= good) return 75;
  if (value >= fair) return 50;
  return 25;
};

const financialHealthService = {
  calculate: async (userId, query) => {
    const profileId = query.profileId || null;
    const profileIds = profileId
      ? [profileId]
      : await resolveProfileIds(userId, null);

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const dateFilter = { $gte: monthStart, $lte: monthEnd };

    // Prior 3 months for residual cash estimate
    const threeMonthStart = new Date(now.getFullYear(), now.getMonth() - 2, 1);

    const [incomeResult, expenseResult, investmentResult, debtResult, liquidResult, priorIncome, priorExpense] =
      await Promise.all([
        incomeRepository.sumByProfiles(userId, profileIds, dateFilter),
        expenseRepository.sumByProfiles(userId, profileIds, dateFilter),
        investmentRepository.aggregateTotals(userId, profileIds),
        debtRepository.sumOutstanding(userId, profileIds),
        investmentRepository.sumLiquidAssets(userId, profileIds, LIQUID_INVESTMENT_TYPES),
        incomeRepository.sumByProfiles(userId, profileIds, {
          $gte: threeMonthStart,
          $lte: monthEnd,
        }),
        expenseRepository.sumByProfiles(userId, profileIds, {
          $gte: threeMonthStart,
          $lte: monthEnd,
        }),
      ]);

    const monthlyIncome = incomeResult[0]?.total || 0;
    const monthlyExpenses = expenseResult[0]?.total || 0;
    const savings = monthlyIncome - monthlyExpenses;
    const savingsRate = monthlyIncome > 0 ? (savings / monthlyIncome) * 100 : 0;

    const totalInvested = investmentResult[0]?.totalInvested || 0;
    const investmentRatio = monthlyIncome > 0 ? (totalInvested / (monthlyIncome * 12)) * 100 : 0;

    const liquidInvestments = liquidResult[0]?.total || 0;
    const residualCash = Math.max(0, (priorIncome[0]?.total || 0) - (priorExpense[0]?.total || 0));
    const cashReserve = liquidInvestments + residualCash;
    const emergencyFundMonths = monthlyExpenses > 0 ? cashReserve / monthlyExpenses : 0;

    const totalEmi = debtResult[0]?.totalEmi || 0;
    const debtRatio =
      monthlyIncome > 0 ? Math.min(100, Math.round((totalEmi / monthlyIncome) * 100)) : totalEmi > 0 ? 100 : 0;

    const components = {
      savingsRate: {
        score: calculateComponentScore(savingsRate, { excellent: 30, good: 20, fair: 10 }),
        value: Math.round(savingsRate),
        weight: 0.3,
      },
      debtRatio: {
        score: calculateComponentScore(100 - debtRatio, { excellent: 80, good: 60, fair: 40 }),
        value: debtRatio,
        weight: 0.2,
      },
      emergencyFund: {
        score: calculateComponentScore(emergencyFundMonths, { excellent: 6, good: 3, fair: 1 }),
        value: Math.round(emergencyFundMonths * 10) / 10,
        weight: 0.25,
      },
      investmentRatio: {
        score: calculateComponentScore(investmentRatio, { excellent: 50, good: 30, fair: 15 }),
        value: Math.round(investmentRatio),
        weight: 0.25,
      },
    };

    const score = Math.round(
      components.savingsRate.score * components.savingsRate.weight +
        components.debtRatio.score * components.debtRatio.weight +
        components.emergencyFund.score * components.emergencyFund.weight +
        components.investmentRatio.score * components.investmentRatio.weight
    );

    const reasons = [];
    if (components.savingsRate.score >= 75) reasons.push('Good savings habits');
    else if (components.savingsRate.score < 50)
      reasons.push('Low savings rate — consider reducing expenses');

    if (components.emergencyFund.score >= 75)
      reasons.push('Strong emergency fund (cash + liquid investments)');
    else reasons.push('Low emergency fund — aim for 3-6 months of expenses in liquid reserves');

    if (components.investmentRatio.score >= 75) reasons.push('Healthy investment ratio');
    else reasons.push('Investment allocation could be improved');

    if (components.debtRatio.score >= 75) reasons.push('Low debt burden');
    else if (debtRatio >= 40)
      reasons.push('High EMI-to-income ratio — consider reducing debt');

    const record = await financialHealthRepository.create({
      userId,
      profileId,
      score,
      components,
      reasons,
    });

    return record;
  },

  getLatest: async (userId, query) => {
    const record = await financialHealthRepository.findLatest(userId, query.profileId || null);
    if (!record) {
      return financialHealthService.calculate(userId, query);
    }
    return record;
  },

  getHistory: async (userId, query) =>
    financialHealthRepository.findHistory(userId, query.profileId || null),
};

module.exports = financialHealthService;

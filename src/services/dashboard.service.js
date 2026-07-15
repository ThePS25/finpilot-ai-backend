const incomeRepository = require('../repositories/income.repository');
const expenseRepository = require('../repositories/expense.repository');
const investmentRepository = require('../repositories/investment.repository');
const goalRepository = require('../repositories/goal.repository');
const debtRepository = require('../repositories/debt.repository');
const profileRepository = require('../repositories/profile.repository');
const financialHealthRepository = require('../repositories/financialHealth.repository');
const { resolveProfileIds, buildDateFilter } = require('../utils/profileHelper');

const dashboardService = {
  getOverview: async (userId, query) => {
    const profileIds = await resolveProfileIds(
      userId,
      query.profileIds ? query.profileIds.split(',') : null
    );

    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    const dateFilter = buildDateFilter({ startDate: monthStart, endDate: monthEnd }) || {
      $gte: monthStart,
      $lte: monthEnd,
    };

    const profiles = await profileRepository.findByIdsAndUser(profileIds, userId);

    const [incomeTotal, expenseTotal, investmentTotals, goals, healthScore, debtTotals] =
      await Promise.all([
        incomeRepository.sumByProfiles(userId, profileIds, dateFilter),
        expenseRepository.sumByProfiles(userId, profileIds, dateFilter),
        investmentRepository.aggregateTotals(userId, profileIds),
        goalRepository.findByProfiles(userId, profileIds),
        financialHealthRepository.findLatest(userId, query.profileId || null),
        debtRepository.sumOutstanding(userId, profileIds),
      ]);

    const monthlyIncome = incomeTotal[0]?.total || 0;
    const monthlyExpenses = expenseTotal[0]?.total || 0;
    const savings = monthlyIncome - monthlyExpenses;
    const totalInvested = investmentTotals[0]?.totalInvested || 0;
    const totalCurrent = investmentTotals[0]?.totalCurrent || 0;
    const totalDebt = debtTotals[0]?.totalOutstanding || 0;
    const netWorth = totalCurrent + savings - totalDebt;

    const profileBreakdown = await Promise.all(
      profiles.map(async (profile) => {
        const pid = profile._id;
        const [inc, exp] = await Promise.all([
          incomeRepository.sumByProfiles(userId, [pid], dateFilter),
          expenseRepository.sumByProfiles(userId, [pid], dateFilter),
        ]);
        return {
          profileId: pid,
          name: profile.name,
          relation: profile.relation,
          income: inc[0]?.total || 0,
          expenses: exp[0]?.total || 0,
          savings: (inc[0]?.total || 0) - (exp[0]?.total || 0),
        };
      })
    );

    const [incomeByType, expenseByCategory] = await Promise.all([
      incomeRepository.aggregateByType(userId, profileIds, dateFilter),
      expenseRepository.aggregateByCategory(userId, profileIds, dateFilter),
    ]);

    return {
      netWorth,
      monthlyIncome,
      monthlyExpenses,
      savings,
      savingsRate: monthlyIncome > 0 ? Math.round((savings / monthlyIncome) * 100) : 0,
      totalDebt,
      monthlyEmi: debtTotals[0]?.totalEmi || 0,
      investments: {
        totalInvested,
        totalCurrent,
        profitLoss: totalCurrent - totalInvested,
      },
      goalsProgress: goals.map((g) => ({
        id: g._id,
        goalName: g.goalName,
        targetAmount: g.targetAmount,
        currentSavings: g.currentSavings,
        completionPercentage:
          g.targetAmount > 0 ? Math.min(100, (g.currentSavings / g.targetAmount) * 100) : 0,
      })),
      financialHealthScore: healthScore?.score ?? null,
      profileBreakdown,
      charts: {
        incomeByType: incomeByType.map((t) => ({ name: t._id, value: t.total })),
        expenseByCategory: expenseByCategory.map((c) => ({ name: c._id, value: c.total })),
      },
    };
  },

  getFamilyDashboard: async (userId) => {
    const allProfiles = await profileRepository.findActiveByUser(userId);
    const profileIds = allProfiles.map((p) => p._id);

    // Empty profileIds string would break resolution — pass null to use all profiles
    const overview = await dashboardService.getOverview(
      userId,
      profileIds.length ? { profileIds: profileIds.map(String).join(',') } : {}
    );

    const debtByProfile =
      profileIds.length > 0
        ? await debtRepository.aggregateByProfile(userId, profileIds)
        : [];
    const debtMap = Object.fromEntries(debtByProfile.map((d) => [d._id.toString(), d]));

    const members = (overview.profileBreakdown || []).map((member) => {
      const debt = debtMap[member.profileId.toString()] || {
        totalOutstanding: 0,
        totalEmi: 0,
        count: 0,
      };
      const incomeShare =
        overview.monthlyIncome > 0
          ? Math.round((member.income / overview.monthlyIncome) * 100)
          : 0;
      const expenseShare =
        overview.monthlyExpenses > 0
          ? Math.round((member.expenses / overview.monthlyExpenses) * 100)
          : 0;
      return {
        ...member,
        debtOutstanding: debt.totalOutstanding,
        monthlyEmi: debt.totalEmi,
        debtCount: debt.count,
        incomeShare,
        expenseShare,
      };
    });

    const topEarner = [...members].sort((a, b) => b.income - a.income)[0] || null;
    const topSpender = [...members].sort((a, b) => b.expenses - a.expenses)[0] || null;

    return {
      ...overview,
      isFamilyView: true,
      memberCount: members.length,
      members,
      comparison: {
        topEarner: topEarner
          ? { name: topEarner.name, income: topEarner.income }
          : null,
        topSpender: topSpender
          ? { name: topSpender.name, expenses: topSpender.expenses }
          : null,
        // Aliases kept for frontend compatibility
        totalIncome: overview.monthlyIncome,
        totalExpenses: overview.monthlyExpenses,
        totalSavings: overview.savings,
        avgSavingsRate: overview.savingsRate,
        combinedIncome: overview.monthlyIncome,
        combinedExpenses: overview.monthlyExpenses,
        combinedSavings: overview.savings,
        combinedDebt: overview.totalDebt || 0,
      },
      charts: {
        ...overview.charts,
        incomeByMember: members.map((m) => ({ name: m.name, value: m.income })),
        expenseByMember: members.map((m) => ({ name: m.name, value: m.expenses })),
        savingsByMember: members.map((m) => ({ name: m.name, value: m.savings })),
      },
    };
  },
};

module.exports = dashboardService;

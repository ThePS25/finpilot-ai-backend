const monthlyInsightRepository = require('../repositories/monthlyInsight.repository');
const incomeRepository = require('../repositories/income.repository');
const expenseRepository = require('../repositories/expense.repository');
const { resolveProfileIds } = require('../utils/profileHelper');
const { generateText } = require('../utils/geminiService');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

const insightService = {
  generate: async (userId, query) => {
    const month = parseInt(query.month, 10) || new Date().getMonth() + 1;
    const year = parseInt(query.year, 10) || new Date().getFullYear();
    const profileId = query.profileId || null;

    const profileIds = profileId
      ? [profileId]
      : await resolveProfileIds(userId, null);

    const currentStart = new Date(year, month - 1, 1);
    const currentEnd = new Date(year, month, 0, 23, 59, 59);
    const prevStart = new Date(year, month - 2, 1);
    const prevEnd = new Date(year, month - 1, 0, 23, 59, 59);

    const currentFilter = { $gte: currentStart, $lte: currentEnd };
    const prevFilter = { $gte: prevStart, $lte: prevEnd };

    const [
      currentIncome,
      prevIncome,
      currentExpenses,
      prevExpenses,
      expenseByCategory,
    ] = await Promise.all([
      incomeRepository.sumByProfiles(userId, profileIds, currentFilter),
      incomeRepository.sumByProfiles(userId, profileIds, prevFilter),
      expenseRepository.sumByProfiles(userId, profileIds, currentFilter),
      expenseRepository.sumByProfiles(userId, profileIds, prevFilter),
      expenseRepository.aggregateByCategory(userId, profileIds, currentFilter),
    ]);

    const inc = currentIncome[0]?.total || 0;
    const prevInc = prevIncome[0]?.total || 0;
    const exp = currentExpenses[0]?.total || 0;
    const prevExp = prevExpenses[0]?.total || 0;
    const savings = inc - exp;
    const prevSavings = prevInc - prevExp;

    const pctChange = (current, previous) =>
      previous > 0 ? Math.round(((current - previous) / previous) * 100) : 0;

    const rawData = {
      month,
      year,
      income: inc,
      expenses: exp,
      savings,
      incomeChange: pctChange(inc, prevInc),
      expenseChange: pctChange(exp, prevExp),
      savingsChange: pctChange(savings, prevSavings),
      topCategories: expenseByCategory.slice(0, 5),
    };

    let aiInsights = [];
    let summary = '';

    try {
      const prompt = `Analyze this monthly financial data and return JSON only:
${JSON.stringify(rawData)}

Return format:
{
  "summary": "2-3 sentence overview",
  "insights": [
    { "category": "spending|savings|investment|general", "title": "...", "description": "...", "trend": "up|down|stable", "percentageChange": number }
  ]
}`;

      const response = await generateText(
        prompt,
        'You are a financial analyst. Return only valid JSON, no markdown.'
      );
      const parsed = JSON.parse(response.replace(/```json|```/g, '').trim());
      aiInsights = parsed.insights || [];
      summary = parsed.summary || '';
    } catch {
      aiInsights = [
        {
          category: 'spending',
          title: 'Expense Overview',
          description: `Total expenses: ₹${exp.toLocaleString('en-IN')} (${pctChange(exp, prevExp)}% vs last month)`,
          trend: exp > prevExp ? 'up' : 'down',
          percentageChange: pctChange(exp, prevExp),
        },
        {
          category: 'savings',
          title: 'Savings Trend',
          description: `Savings: ₹${savings.toLocaleString('en-IN')} (${pctChange(savings, prevSavings)}% vs last month)`,
          trend: savings > prevSavings ? 'up' : 'down',
          percentageChange: pctChange(savings, prevSavings),
        },
      ];
      summary = `In ${month}/${year}, you earned ₹${inc.toLocaleString('en-IN')} and spent ₹${exp.toLocaleString('en-IN')}.`;
    }

    const record = await monthlyInsightRepository.upsert(
      { userId, profileId, month, year },
      { userId, profileId, month, year, insights: aiInsights, summary, rawData }
    );

    try {
      const notificationService = require('./notification.service');
      await notificationService.create(userId, {
        type: 'insight',
        title: `Monthly insight ready — ${month}/${year}`,
        message: summary?.slice(0, 200) || 'Your monthly financial insight is ready.',
        link: '/insights',
        meta: { month, year, insightId: record._id },
      });
    } catch {
      // non-blocking
    }

    return record;
  },

  getAll: async (userId, query) => {
    const { page, limit, skip } = parsePagination(query);
    const [insights, total] = await Promise.all([
      monthlyInsightRepository.findAll(userId, { skip, limit }),
      monthlyInsightRepository.count(userId),
    ]);
    return { insights, pagination: buildPaginationMeta(total, page, limit) };
  },

  getByMonth: async (userId, query) => {
    const month = parseInt(query.month, 10);
    const year = parseInt(query.year, 10);
    let record = await monthlyInsightRepository.findByMonth(
      userId,
      query.profileId || null,
      month,
      year
    );
    if (!record) {
      record = await insightService.generate(userId, query);
    }
    return record;
  },
};

module.exports = insightService;

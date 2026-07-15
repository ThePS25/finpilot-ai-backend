const conversationRepository = require('../repositories/conversation.repository');
const incomeRepository = require('../repositories/income.repository');
const expenseRepository = require('../repositories/expense.repository');
const investmentRepository = require('../repositories/investment.repository');
const goalRepository = require('../repositories/goal.repository');
const profileRepository = require('../repositories/profile.repository');
const { generateText } = require('../utils/geminiService');
const { NotFoundError } = require('../utils/AppError');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

const buildFinancialContext = async (userId) => {
  const profiles = await profileRepository.findAllByUser(userId, { limit: 50 });
  const profileIds = profiles.map((p) => p._id);

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

  const monthlyIncome = income[0]?.total || 0;
  const monthlyExpenses = expenses[0]?.total || 0;

  return {
    profiles: profiles.map((p) => ({ name: p.name, relation: p.relation })),
    monthlyIncome,
    monthlyExpenses,
    monthlySavings: monthlyIncome - monthlyExpenses,
    totalInvestments: investments[0]?.totalCurrent || 0,
    goals: goals.map((g) => ({
      name: g.goalName,
      target: g.targetAmount,
      saved: g.currentSavings,
      targetDate: g.targetDate,
    })),
  };
};

const coachService = {
  createConversation: async (userId, title) =>
    conversationRepository.create({ userId, title: title || 'New Conversation', messages: [] }),

  getConversations: async (userId, query) => {
    const { page, limit, skip } = parsePagination(query);
    const [conversations, total] = await Promise.all([
      conversationRepository.findAll(userId, { skip, limit }),
      conversationRepository.count(userId),
    ]);
    return { conversations, pagination: buildPaginationMeta(total, page, limit) };
  },

  getConversation: async (userId, id) => {
    const conversation = await conversationRepository.findByIdAndUser(id, userId);
    if (!conversation) throw new NotFoundError('Conversation not found');
    return conversation;
  },

  sendMessage: async (userId, conversationId, userMessage) => {
    let conversation;
    if (conversationId) {
      conversation = await conversationRepository.findByIdAndUser(conversationId, userId);
      if (!conversation) throw new NotFoundError('Conversation not found');
    } else {
      conversation = await conversationRepository.create({
        userId,
        title: userMessage.slice(0, 50),
        messages: [],
      });
    }

    await conversationRepository.addMessage(conversation._id, userId, {
      role: 'user',
      content: userMessage,
    });

    const context = await buildFinancialContext(userId);
    const history = conversation.messages
      .slice(-10)
      .map((m) => `${m.role}: ${m.content}`)
      .join('\n');

    const systemInstruction = `You are FinPilot AI, a personal financial coach for Indian users. 
Use the user's actual financial data to give specific, actionable advice. 
Amounts are in INR (₹). Be concise, friendly, and practical.
Never make up data — only use what's provided in the context.`;

    const prompt = `User Financial Context:
${JSON.stringify(context, null, 2)}

Recent conversation:
${history}

User question: ${userMessage}

Provide a helpful financial answer based on their actual data.`;

    const assistantReply = await generateText(prompt, systemInstruction);

    const updated = await conversationRepository.addMessage(conversation._id, userId, {
      role: 'assistant',
      content: assistantReply,
    });

    return updated;
  },

  deleteConversation: async (userId, id) => {
    const conversation = await conversationRepository.softDelete(id, userId);
    if (!conversation) throw new NotFoundError('Conversation not found');
    return { message: 'Conversation deleted' };
  },
};

module.exports = coachService;

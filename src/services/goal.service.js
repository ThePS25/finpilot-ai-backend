const goalRepository = require('../repositories/goal.repository');
const { assertProfileOwnership } = require('../utils/profileHelper');
const { NotFoundError } = require('../utils/AppError');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

const enrichGoal = (goal) => {
  const obj = goal.toObject ? goal.toObject({ virtuals: true }) : goal;
  return {
    ...obj,
    remainingAmount: Math.max(0, obj.targetAmount - obj.currentSavings),
    completionPercentage: obj.targetAmount > 0
      ? Math.min(100, (obj.currentSavings / obj.targetAmount) * 100)
      : 100,
    monthsRemaining: (() => {
      const diff = new Date(obj.targetDate) - new Date();
      return diff <= 0 ? 0 : Math.ceil(diff / (1000 * 60 * 60 * 24 * 30));
    })(),
    monthlyRequiredInvestment: (() => {
      const remaining = Math.max(0, obj.targetAmount - obj.currentSavings);
      const diff = new Date(obj.targetDate) - new Date();
      const months = diff <= 0 ? 0 : Math.ceil(diff / (1000 * 60 * 60 * 24 * 30));
      return months <= 0 ? remaining : remaining / months;
    })(),
  };
};

const goalService = {
  create: async (userId, data) => {
    await assertProfileOwnership(userId, data.profileId);
    const goal = await goalRepository.create({ ...data, userId });
    return enrichGoal(goal);
  },

  getAll: async (userId, query) => {
    const { page, limit, skip } = parsePagination(query);
    const filters = { profileId: query.profileId, skip, limit, isCompleted: query.isCompleted };
    const [goals, total] = await Promise.all([
      goalRepository.findAll(userId, filters),
      goalRepository.count(userId, filters),
    ]);
    return {
      goals: goals.map(enrichGoal),
      pagination: buildPaginationMeta(total, page, limit),
    };
  },

  getById: async (userId, id) => {
    const goal = await goalRepository.findByIdAndUser(id, userId);
    if (!goal) throw new NotFoundError('Goal not found');
    return enrichGoal(goal);
  },

  update: async (userId, id, data) => {
    const goal = await goalRepository.findByIdAndUser(id, userId);
    if (!goal) throw new NotFoundError('Goal not found');
    if (data.profileId) await assertProfileOwnership(userId, data.profileId);
    if (data.currentSavings >= data.targetAmount || (data.targetAmount === undefined && data.currentSavings >= goal.targetAmount)) {
      data.isCompleted = true;
    }
    const updated = await goalRepository.update(id, userId, data);
    return enrichGoal(updated);
  },

  delete: async (userId, id) => {
    const goal = await goalRepository.delete(id, userId);
    if (!goal) throw new NotFoundError('Goal not found');
    return { message: 'Goal deleted successfully' };
  },
};

module.exports = goalService;

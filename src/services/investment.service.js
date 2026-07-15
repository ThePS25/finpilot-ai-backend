const investmentRepository = require('../repositories/investment.repository');
const { assertProfileOwnership, resolveProfileIds } = require('../utils/profileHelper');
const { NotFoundError } = require('../utils/AppError');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

const investmentService = {
  create: async (userId, data) => {
    await assertProfileOwnership(userId, data.profileId);
    return investmentRepository.create({ ...data, userId });
  },

  getAll: async (userId, query) => {
    const { page, limit, skip } = parsePagination(query);
    const filters = {
      profileId: query.profileId,
      skip,
      limit,
      investmentType: query.investmentType,
    };
    const [investments, total] = await Promise.all([
      investmentRepository.findAll(userId, filters),
      investmentRepository.count(userId, filters),
    ]);
    return { investments, pagination: buildPaginationMeta(total, page, limit) };
  },

  getById: async (userId, id) => {
    const investment = await investmentRepository.findByIdAndUser(id, userId);
    if (!investment) throw new NotFoundError('Investment not found');
    return investment;
  },

  update: async (userId, id, data) => {
    const investment = await investmentRepository.findByIdAndUser(id, userId);
    if (!investment) throw new NotFoundError('Investment not found');
    if (data.profileId) await assertProfileOwnership(userId, data.profileId);
    return investmentRepository.update(id, userId, data);
  },

  delete: async (userId, id) => {
    const investment = await investmentRepository.delete(id, userId);
    if (!investment) throw new NotFoundError('Investment not found');
    return { message: 'Investment deleted successfully' };
  },

  getSummary: async (userId, query) => {
    const profileIds = await resolveProfileIds(
      userId,
      query.profileIds ? query.profileIds.split(',') : null
    );

    const [byType, totals] = await Promise.all([
      investmentRepository.aggregateSummary(userId, profileIds),
      investmentRepository.aggregateTotals(userId, profileIds),
    ]);

    const totalInvested = totals[0]?.totalInvested || 0;
    const totalCurrent = totals[0]?.totalCurrent || 0;
    const profitLoss = totalCurrent - totalInvested;
    const roiPercentage = totalInvested > 0 ? (profitLoss / totalInvested) * 100 : 0;

    return {
      totalInvested,
      totalCurrent,
      profitLoss,
      roiPercentage: Math.round(roiPercentage * 100) / 100,
      byType: byType.map((t) => ({
        type: t._id,
        totalInvested: t.totalInvested,
        totalCurrent: t.totalCurrent,
        returns: t.totalCurrent - t.totalInvested,
        count: t.count,
      })),
    };
  },
};

module.exports = investmentService;

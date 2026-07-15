const debtRepository = require('../repositories/debt.repository');
const { assertProfileOwnership } = require('../utils/profileHelper');
const { NotFoundError } = require('../utils/AppError');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

const debtService = {
  create: async (userId, data) => {
    await assertProfileOwnership(userId, data.profileId);
    return debtRepository.create({
      ...data,
      userId,
      outstandingAmount: data.outstandingAmount ?? data.principalAmount,
      isActive: data.isActive !== false,
    });
  },

  getAll: async (userId, query) => {
    const { page, limit, skip } = parsePagination(query);
    const filters = {
      profileId: query.profileId,
      skip,
      limit,
      isActive: query.isActive,
    };
    const [debts, total] = await Promise.all([
      debtRepository.findAll(userId, filters),
      debtRepository.count(userId, filters),
    ]);
    return { debts, pagination: buildPaginationMeta(total, page, limit) };
  },

  getById: async (userId, id) => {
    const debt = await debtRepository.findByIdAndUser(id, userId);
    if (!debt) throw new NotFoundError('Debt not found');
    return debt;
  },

  update: async (userId, id, data) => {
    const debt = await debtRepository.findByIdAndUser(id, userId);
    if (!debt) throw new NotFoundError('Debt not found');
    if (data.profileId) await assertProfileOwnership(userId, data.profileId);
    return debtRepository.update(id, userId, data);
  },

  delete: async (userId, id) => {
    const debt = await debtRepository.delete(id, userId);
    if (!debt) throw new NotFoundError('Debt not found');
    return { message: 'Debt deleted successfully' };
  },

  getSummary: async (userId, query) => {
    const { resolveProfileIds } = require('../utils/profileHelper');
    const profileIds = await resolveProfileIds(
      userId,
      query.profileIds ? query.profileIds.split(',') : query.profileId ? [query.profileId] : null
    );
    const result = await debtRepository.sumOutstanding(userId, profileIds);
    return {
      totalOutstanding: result[0]?.totalOutstanding || 0,
      totalEmi: result[0]?.totalEmi || 0,
    };
  },
};

module.exports = debtService;

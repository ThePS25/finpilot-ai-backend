const { Payslip } = require('../models');

const payslipRepository = {
  create: (data) => Payslip.create(data),

  findByIdAndUser: (id, userId) => Payslip.findOne({ _id: id, userId }),

  findAll: (userId, { profileId, skip, limit }) => {
    const query = { userId };
    if (profileId) query.profileId = profileId;
    return Payslip.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
  },

  count: (userId, { profileId } = {}) => {
    const query = { userId };
    if (profileId) query.profileId = profileId;
    return Payslip.countDocuments(query);
  },

  update: (id, userId, data) =>
    Payslip.findOneAndUpdate({ _id: id, userId }, data, { new: true, runValidators: true }),

  delete: (id, userId) => Payslip.findOneAndDelete({ _id: id, userId }),
};

module.exports = payslipRepository;

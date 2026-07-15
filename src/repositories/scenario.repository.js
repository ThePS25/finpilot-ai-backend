const { Scenario } = require('../models');

const scenarioRepository = {
  create: (data) => Scenario.create(data),

  findByIdAndUser: (id, userId) => Scenario.findOne({ _id: id, userId }),

  findAll: (userId, { skip, limit }) =>
    Scenario.find({ userId }).sort({ createdAt: -1 }).skip(skip).limit(limit),

  count: (userId) => Scenario.countDocuments({ userId }),

  delete: (id, userId) => Scenario.findOneAndDelete({ _id: id, userId }),
};

module.exports = scenarioRepository;

const { User } = require('../models');

const userRepository = {
  create: (data) => User.create(data),

  findByEmail: (email) => User.findOne({ email }).select('+password'),

  findByEmailWithSecrets: (email) =>
    User.findOne({ email }).select('+password +totpSecret'),

  findById: (id) => User.findById(id),

  findByIdWithPassword: (id) => User.findById(id).select('+password'),

  findByIdWithSecrets: (id) => User.findById(id).select('+password +totpSecret'),

  updateById: (id, data) =>
    User.findByIdAndUpdate(id, data, { new: true, runValidators: true }),

  updateLastLogin: (id) =>
    User.findByIdAndUpdate(id, { lastLoginAt: new Date() }, { new: true }),
};

module.exports = userRepository;

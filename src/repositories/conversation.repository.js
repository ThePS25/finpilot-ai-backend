const { Conversation } = require('../models');

const conversationRepository = {
  create: (data) => Conversation.create(data),

  findByIdAndUser: (id, userId) => Conversation.findOne({ _id: id, userId, isActive: true }),

  findAll: (userId, { skip, limit }) =>
    Conversation.find({ userId, isActive: true })
      .sort({ updatedAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-messages'),

  count: (userId) => Conversation.countDocuments({ userId, isActive: true }),

  addMessage: (id, userId, message) =>
    Conversation.findOneAndUpdate(
      { _id: id, userId, isActive: true },
      { $push: { messages: message } },
      { new: true }
    ),

  updateTitle: (id, userId, title) =>
    Conversation.findOneAndUpdate({ _id: id, userId }, { title }, { new: true }),

  softDelete: (id, userId) =>
    Conversation.findOneAndUpdate({ _id: id, userId }, { isActive: false }),
};

module.exports = conversationRepository;

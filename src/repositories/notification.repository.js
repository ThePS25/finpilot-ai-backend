const { Notification } = require('../models');

const notificationRepository = {
  create: (data) => Notification.create(data),

  findAll: (userId, { skip, limit, unreadOnly }) => {
    const query = { userId };
    if (unreadOnly === true || unreadOnly === 'true') query.isRead = false;
    return Notification.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit);
  },

  count: (userId, { unreadOnly } = {}) => {
    const query = { userId };
    if (unreadOnly === true || unreadOnly === 'true') query.isRead = false;
    return Notification.countDocuments(query);
  },

  countUnread: (userId) => Notification.countDocuments({ userId, isRead: false }),

  markRead: (id, userId) =>
    Notification.findOneAndUpdate({ _id: id, userId }, { isRead: true }, { new: true }),

  markAllRead: (userId) =>
    Notification.updateMany({ userId, isRead: false }, { isRead: true }),

  delete: (id, userId) => Notification.findOneAndDelete({ _id: id, userId }),
};

module.exports = notificationRepository;

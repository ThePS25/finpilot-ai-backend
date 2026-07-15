const notificationRepository = require('../repositories/notification.repository');
const { NotFoundError } = require('../utils/AppError');
const { parsePagination, buildPaginationMeta } = require('../utils/pagination');

const notificationService = {
  create: async (userId, data) =>
    notificationRepository.create({ ...data, userId }),

  getAll: async (userId, query) => {
    const { page, limit, skip } = parsePagination(query);
    const filters = { skip, limit, unreadOnly: query.unreadOnly };
    const [notifications, total, unreadCount] = await Promise.all([
      notificationRepository.findAll(userId, filters),
      notificationRepository.count(userId, filters),
      notificationRepository.countUnread(userId),
    ]);
    return {
      notifications,
      unreadCount,
      pagination: buildPaginationMeta(total, page, limit),
    };
  },

  markRead: async (userId, id) => {
    const notification = await notificationRepository.markRead(id, userId);
    if (!notification) throw new NotFoundError('Notification not found');
    return notification;
  },

  markAllRead: async (userId) => {
    await notificationRepository.markAllRead(userId);
    return { message: 'All notifications marked as read' };
  },

  delete: async (userId, id) => {
    const notification = await notificationRepository.delete(id, userId);
    if (!notification) throw new NotFoundError('Notification not found');
    return { message: 'Notification deleted' };
  },
};

module.exports = notificationService;

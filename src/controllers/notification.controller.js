const notificationService = require('../services/notification.service');
const { sendSuccess, sendPaginated } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

module.exports = {
  getAll: asyncHandler(async (req, res) => {
    const { notifications, pagination, unreadCount } = await notificationService.getAll(
      req.user.id,
      req.query
    );
    sendPaginated(res, { notifications, unreadCount }, pagination);
  }),
  markRead: asyncHandler(async (req, res) => {
    const notification = await notificationService.markRead(req.user.id, req.params.id);
    sendSuccess(res, { notification }, 'Notification marked as read');
  }),
  markAllRead: asyncHandler(async (req, res) => {
    const result = await notificationService.markAllRead(req.user.id);
    sendSuccess(res, null, result.message);
  }),
  delete: asyncHandler(async (req, res) => {
    const result = await notificationService.delete(req.user.id, req.params.id);
    sendSuccess(res, null, result.message);
  }),
};

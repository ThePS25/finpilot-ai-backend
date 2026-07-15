const coachService = require('../services/coach.service');
const { sendSuccess, sendPaginated } = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

module.exports = {
  getConversations: asyncHandler(async (req, res) => {
    const { conversations, pagination } = await coachService.getConversations(req.user.id, req.query);
    sendPaginated(res, { conversations }, pagination);
  }),
  getConversation: asyncHandler(async (req, res) => {
    const conversation = await coachService.getConversation(req.user.id, req.params.id);
    sendSuccess(res, { conversation });
  }),
  sendMessage: asyncHandler(async (req, res) => {
    const conversation = await coachService.sendMessage(
      req.user.id,
      req.body.conversationId,
      req.body.message
    );
    sendSuccess(res, { conversation });
  }),
  createConversation: asyncHandler(async (req, res) => {
    const conversation = await coachService.createConversation(req.user.id, req.body.title);
    sendSuccess(res, { conversation }, 'Conversation created', 201);
  }),
  deleteConversation: asyncHandler(async (req, res) => {
    const result = await coachService.deleteConversation(req.user.id, req.params.id);
    sendSuccess(res, null, result.message);
  }),
};

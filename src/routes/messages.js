const express = require('express');
const { verifyToken } = require('../middleware/auth');
const {
  getMessages,
  getConversation,
  sendMessage,
  markAsRead,
  updateDeliveryStatus,
  deleteMessage
} = require('../controllers/messageController');

const router = express.Router();

/**
 * @route   GET /api/messages
 * @desc    Get all messages for authenticated user
 * @access  Private
 */
router.get('/', verifyToken, getMessages);

/**
 * @route   GET /api/messages/conversation/:userId
 * @desc    Get conversation between authenticated user and another user
 * @access  Private
 */
router.get('/conversation/:userId', verifyToken, getConversation);

/**
 * @route   POST /api/messages
 * @desc    Send a new message
 * @access  Private
 */
router.post('/', verifyToken, sendMessage);

/**
 * @route   PUT /api/messages/:messageId/read
 * @desc    Mark message as read
 * @access  Private
 */
router.put('/:messageId/read', verifyToken, markAsRead);

/**
 * @route   PUT /api/messages/:messageId/status
 * @desc    Update message delivery status
 * @access  Private
 */
router.put('/:messageId/status', verifyToken, updateDeliveryStatus);

/**
 * @route   DELETE /api/messages/:messageId
 * @desc    Delete a message
 * @access  Private
 */
router.delete('/:messageId', verifyToken, deleteMessage);

module.exports = router;

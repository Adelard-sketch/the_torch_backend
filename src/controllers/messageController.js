const Message = require('../models/Message');
const User = require('../models/User');

/**
 * Get all messages for the authenticated user
 * @route GET /api/messages
 */
const getMessages = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Find all messages where user is sender or recipient
    const messages = await Message.find({
      $or: [
        { fromId: userId },
        { toId: userId }
      ]
    })
    .populate('fromId', 'firstName lastName profilePicture')
    .populate('toId', 'firstName lastName profilePicture')
    .sort({ createdAt: -1 });

    // Map to frontend format
    const mappedMessages = messages.map(m => ({
      id: m._id,
      fromId: m.fromId._id,
      fromName: `${m.fromId.firstName} ${m.fromId.lastName}`,
      toId: m.toId._id,
      toName: `${m.toId.firstName} ${m.toId.lastName}`,
      content: m.content,
      read: m.read,
      deliveryStatus: m.deliveryStatus,
      attachments: m.attachments,
      sentAt: m.sentAt,
      deliveredAt: m.deliveredAt,
      receivedAt: m.receivedAt,
      readAt: m.readAt,
      createdAt: m.createdAt
    }));

    return res.status(200).json({
      status: 200,
      data: {
        messages: mappedMessages,
        count: mappedMessages.length
      }
    });

  } catch (error) {
    console.error('Get messages error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Failed to retrieve messages',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get conversation between two users
 * @route GET /api/messages/conversation/:userId
 */
const getConversation = async (req, res) => {
  try {
    const currentUserId = req.user.userId;
    const { userId } = req.params;

    // Find all messages between the two users
    const messages = await Message.find({
      $or: [
        { fromId: currentUserId, toId: userId },
        { fromId: userId, toId: currentUserId }
      ]
    })
    .populate('fromId', 'firstName lastName profilePicture')
    .populate('toId', 'firstName lastName profilePicture')
    .sort({ createdAt: 1 });

    // Map to frontend format
    const mappedMessages = messages.map(m => ({
      id: m._id,
      fromId: m.fromId._id,
      fromName: `${m.fromId.firstName} ${m.fromId.lastName}`,
      toId: m.toId._id,
      toName: `${m.toId.firstName} ${m.toId.lastName}`,
      content: m.content,
      read: m.read,
      deliveryStatus: m.deliveryStatus,
      attachments: m.attachments,
      sentAt: m.sentAt,
      deliveredAt: m.deliveredAt,
      receivedAt: m.receivedAt,
      readAt: m.readAt,
      createdAt: m.createdAt
    }));

    return res.status(200).json({
      status: 200,
      data: {
        messages: mappedMessages,
        count: mappedMessages.length
      }
    });

  } catch (error) {
    console.error('Get conversation error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Failed to retrieve conversation',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Send a new message
 * @route POST /api/messages
 */
const sendMessage = async (req, res) => {
  try {
    const fromId = req.user.userId;
    const { toId, content, attachments } = req.body;

    // Validate required fields
    if (!toId || !content) {
      return res.status(400).json({
        status: 400,
        message: 'Recipient and message content are required'
      });
    }

    // Check if recipient exists
    const recipient = await User.findById(toId);
    if (!recipient) {
      return res.status(404).json({
        status: 404,
        message: 'Recipient not found'
      });
    }

    // Create message
    const message = await Message.create({
      fromId,
      toId,
      content,
      attachments: attachments || [],
      deliveryStatus: 'sent',
      sentAt: new Date()
    });

    // Populate sender and recipient info
    await message.populate('fromId', 'firstName lastName profilePicture');
    await message.populate('toId', 'firstName lastName profilePicture');

    // Map to frontend format
    const mappedMessage = {
      id: message._id,
      fromId: message.fromId._id,
      fromName: `${message.fromId.firstName} ${message.fromId.lastName}`,
      toId: message.toId._id,
      toName: `${message.toId.firstName} ${message.toId.lastName}`,
      content: message.content,
      read: message.read,
      deliveryStatus: message.deliveryStatus,
      attachments: message.attachments,
      sentAt: message.sentAt,
      createdAt: message.createdAt
    };

    return res.status(201).json({
      status: 201,
      data: { message: mappedMessage }
    });

  } catch (error) {
    console.error('Send message error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Failed to send message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Mark message as read
 * @route PUT /api/messages/:messageId/read
 */
const markAsRead = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.userId;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        status: 404,
        message: 'Message not found'
      });
    }

    // Only recipient can mark as read
    if (message.toId.toString() !== userId) {
      return res.status(403).json({
        status: 403,
        message: 'Forbidden'
      });
    }

    message.read = true;
    message.deliveryStatus = 'read';
    message.readAt = new Date();
    await message.save();

    return res.status(200).json({
      status: 200,
      data: { message: 'Message marked as read' }
    });

  } catch (error) {
    console.error('Mark as read error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Failed to mark message as read',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update message delivery status
 * @route PUT /api/messages/:messageId/status
 */
const updateDeliveryStatus = async (req, res) => {
  try {
    const { messageId } = req.params;
    const { status } = req.body;

    if (!['sent', 'delivered', 'received', 'read'].includes(status)) {
      return res.status(400).json({
        status: 400,
        message: 'Invalid delivery status'
      });
    }

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        status: 404,
        message: 'Message not found'
      });
    }

    message.deliveryStatus = status;
    
    if (status === 'delivered' && !message.deliveredAt) {
      message.deliveredAt = new Date();
    } else if (status === 'received' && !message.receivedAt) {
      message.receivedAt = new Date();
    } else if (status === 'read') {
      message.read = true;
      message.readAt = new Date();
    }

    await message.save();

    return res.status(200).json({
      status: 200,
      data: { message: 'Delivery status updated' }
    });

  } catch (error) {
    console.error('Update delivery status error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Failed to update delivery status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete a message
 * @route DELETE /api/messages/:messageId
 */
const deleteMessage = async (req, res) => {
  try {
    const { messageId } = req.params;
    const userId = req.user.userId;

    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        status: 404,
        message: 'Message not found'
      });
    }

    // Only sender can delete their message
    if (message.fromId.toString() !== userId) {
      return res.status(403).json({
        status: 403,
        message: 'Forbidden'
      });
    }

    await Message.deleteOne({ _id: messageId });

    return res.status(200).json({
      status: 200,
      data: { message: 'Message deleted successfully' }
    });

  } catch (error) {
    console.error('Delete message error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Failed to delete message',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getMessages,
  getConversation,
  sendMessage,
  markAsRead,
  updateDeliveryStatus,
  deleteMessage
};

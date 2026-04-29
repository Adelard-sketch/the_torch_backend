const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  fromId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sender ID is required']
  },
  toId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Recipient ID is required']
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    trim: true
  },
  read: {
    type: Boolean,
    default: false
  },
  deliveryStatus: {
    type: String,
    enum: {
      values: ['sent', 'delivered', 'received', 'read'],
      message: '{VALUE} is not a valid delivery status'
    },
    default: 'sent'
  },
  attachments: {
    type: [{
      id: String,
      fileName: String,
      fileUrl: String,
      fileType: String,
      fileSize: Number
    }],
    default: []
  },
  sentAt: {
    type: Date,
    default: Date.now
  },
  deliveredAt: {
    type: Date,
    default: null
  },
  receivedAt: {
    type: Date,
    default: null
  },
  readAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Index for efficient message queries
MessageSchema.index({ fromId: 1, toId: 1, createdAt: -1 });
MessageSchema.index({ toId: 1, read: 1 });

module.exports = mongoose.model('Message', MessageSchema);

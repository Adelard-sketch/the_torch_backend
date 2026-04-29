const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  fileName: {
    type: String,
    required: [true, 'File name is required'],
    trim: true
  },
  fileSize: {
    type: Number,
    required: [true, 'File size is required'],
    min: [0, 'File size cannot be negative']
  },
  fileType: {
    type: String,
    required: [true, 'File type is required'],
    trim: true
  },
  fileUrl: {
    type: String,
    required: [true, 'File URL is required']
  },
  thumbnailUrl: {
    type: String,
    default: null
  },
  purpose: {
    type: String,
    enum: {
      values: ['profile', 'product', 'message', 'document', 'other'],
      message: '{VALUE} is not a valid purpose'
    },
    required: [true, 'Purpose is required']
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

// Index for efficient queries
FileSchema.index({ userId: 1, purpose: 1, createdAt: -1 });

module.exports = mongoose.model('File', FileSchema);

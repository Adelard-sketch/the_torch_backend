const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Agriculture', 'Gardening', 'Business', 'Irrigation', 'Other'],
    default: 'Agriculture'
  },
  content: {
    type: String,
    required: true
  },
  image: {
    type: String,
    default: null
  },
  durationMin: {
    type: Number,
    required: true,
    min: 1
  },
  level: {
    type: String,
    required: true,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  isPublished: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for searching lessons
lessonSchema.index({ title: 'text', content: 'text' });

module.exports = mongoose.model('Lesson', lessonSchema);

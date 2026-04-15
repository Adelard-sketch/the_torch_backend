const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address']
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    trim: true
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
    select: false  // Exclude from queries by default
  },
  role: {
    type: String,
    enum: {
      values: ['farmer', 'customer', 'vendor', 'gardener'],
      message: '{VALUE} is not a valid role'
    },
    default: 'customer'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true  // Automatically adds createdAt and updatedAt
});

// Note: email index is already created by unique: true, no need for explicit index

module.exports = mongoose.model('User', UserSchema);

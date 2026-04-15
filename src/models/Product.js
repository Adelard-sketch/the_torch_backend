const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  productName: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true
  },
  description: {
    type: String,
    default: '',
    trim: true
  },
  category: {
    type: String,
    enum: {
      values: ['produce', 'seeds', 'equipment', 'fertilizer', 'tools'],
      message: '{VALUE} is not a valid category'
    },
    default: 'produce'
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  quantityAvailable: {
    type: Number,
    required: [true, 'Quantity available is required'],
    min: [0, 'Quantity cannot be negative']
  },
  unit: {
    type: String,
    default: 'kg',
    trim: true
  },
  isAvailable: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true  // Automatically adds createdAt and updatedAt
});

// Text index for search functionality on productName and description
ProductSchema.index({ productName: 'text', description: 'text' });

// Compound index for common query pattern: available products by category, sorted by date
ProductSchema.index({ isAvailable: 1, category: 1, createdAt: -1 });

module.exports = mongoose.model('Product', ProductSchema);

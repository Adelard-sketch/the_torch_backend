/**
 * Application Constants
 * Centralized configuration values
 */

module.exports = {
  // File Upload Limits (in bytes)
  FILE_SIZE_LIMITS: {
    profile: 5 * 1024 * 1024,    // 5MB
    product: 5 * 1024 * 1024,    // 5MB
    message: 10 * 1024 * 1024,   // 10MB
    document: 10 * 1024 * 1024,  // 10MB
    other: 10 * 1024 * 1024      // 10MB
  },

  // Allowed File Types
  ALLOWED_FILE_TYPES: {
    profile: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    product: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
    message: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    other: ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'application/pdf']
  },

  // Upload Directories
  UPLOAD_DIRS: {
    profile: 'uploads/profile',
    product: 'uploads/product',
    message: 'uploads/message',
    document: 'uploads/document',
    other: 'uploads/other'
  },

  // User Roles
  USER_ROLES: {
    FARMER: 'farmer',
    CUSTOMER: 'customer',
    VENDOR: 'vendor',
    GARDENER: 'gardener',
    ADMIN: 'admin'
  },

  // Product Categories
  PRODUCT_CATEGORIES: {
    PRODUCE: 'produce',
    SEEDS: 'seeds',
    EQUIPMENT: 'equipment',
    FERTILIZER: 'fertilizer',
    TOOLS: 'tools'
  },

  // Order Status
  ORDER_STATUS: {
    PENDING: 'pending',
    CONFIRMED: 'confirmed',
    PROCESSING: 'processing',
    SHIPPED: 'shipped',
    DELIVERED: 'delivered',
    CANCELLED: 'cancelled'
  },

  // Message Delivery Status
  DELIVERY_STATUS: {
    SENT: 'sent',
    DELIVERED: 'delivered',
    RECEIVED: 'received',
    READ: 'read'
  },

  // Pagination Defaults
  PAGINATION: {
    DEFAULT_LIMIT: 20,
    MAX_LIMIT: 100,
    DEFAULT_OFFSET: 0
  },

  // JWT
  JWT: {
    EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d'
  },

  // Rate Limiting
  RATE_LIMIT: {
    WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    MAX_REQUESTS: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
  }
};

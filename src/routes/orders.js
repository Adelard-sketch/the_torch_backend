const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { 
  createOrder, 
  getUserOrders, 
  getOrder, 
  cancelOrder 
} = require('../controllers/orderController');

const router = express.Router();

/**
 * @route   POST /api/orders
 * @desc    Create new order
 * @access  Private (requires authentication)
 */
router.post('/', verifyToken, createOrder);

/**
 * @route   GET /api/orders
 * @desc    Get user's orders
 * @access  Private (requires authentication)
 */
router.get('/', verifyToken, getUserOrders);

/**
 * @route   GET /api/orders/:id
 * @desc    Get single order by ID
 * @access  Private (requires authentication and ownership)
 */
router.get('/:id', verifyToken, getOrder);

/**
 * @route   PUT /api/orders/:id/cancel
 * @desc    Cancel order
 * @access  Private (requires authentication and ownership)
 */
router.put('/:id/cancel', verifyToken, cancelOrder);

module.exports = router;

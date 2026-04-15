const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { sendOrderConfirmationEmail } = require('../services/emailService');

/**
 * Create new order
 * @route POST /api/orders
 */
const createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, notes } = req.body;

    // Validate items
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        status: 400,
        message: 'Order must contain at least one item'
      });
    }

    // Validate shipping address
    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address) {
      return res.status(400).json({
        status: 400,
        message: 'Shipping address is required (fullName, phone, address)'
      });
    }

    // Verify products exist and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      
      if (!product) {
        return res.status(404).json({
          status: 404,
          message: `Product ${item.productId} not found`
        });
      }

      if (!product.isAvailable) {
        return res.status(400).json({
          status: 400,
          message: `Product ${product.productName} is not available`
        });
      }

      if (product.quantityAvailable < item.quantity) {
        return res.status(400).json({
          status: 400,
          message: `Insufficient quantity for ${product.productName}. Available: ${product.quantityAvailable}`
        });
      }

      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      orderItems.push({
        productId: product._id,
        productName: product.productName,
        quantity: item.quantity,
        price: product.price,
        unit: product.unit
      });

      // Update product quantity
      product.quantityAvailable -= item.quantity;
      if (product.quantityAvailable === 0) {
        product.isAvailable = false;
      }
      await product.save();
    }

    // Create order
    const order = await Order.create({
      userId: req.user.userId,
      items: orderItems,
      totalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || 'cash',
      notes: notes || '',
      status: 'pending'
    });

    // Populate user info
    await order.populate('userId', 'firstName lastName email phone');

    // Send order confirmation email (don't wait for it to complete)
    sendOrderConfirmationEmail(
      order.userId.email, 
      order.userId.firstName, 
      order
    ).catch(err => 
      console.error('Failed to send order confirmation email:', err.message)
    );

    return res.status(201).json({
      status: 201,
      data: {
        order,
        message: 'Order created successfully'
      }
    });

  } catch (error) {
    console.error('Create order error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Failed to create order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get user's orders
 * @route GET /api/orders
 */
const getUserOrders = async (req, res) => {
  try {
    const { status, limit, offset } = req.query;

    const filter = { userId: req.user.userId };
    
    if (status) {
      filter.status = status;
    }

    const parsedLimit = Math.min(parseInt(limit) || 20, 100);
    const parsedOffset = parseInt(offset) || 0;

    const orders = await Order
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(parsedOffset)
      .limit(parsedLimit)
      .populate('items.productId', 'productName category');

    return res.status(200).json({
      status: 200,
      data: {
        orders,
        count: orders.length,
        limit: parsedLimit,
        offset: parsedOffset
      }
    });

  } catch (error) {
    console.error('Get orders error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Failed to retrieve orders',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get single order
 * @route GET /api/orders/:id
 */
const getOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order
      .findById(id)
      .populate('userId', 'firstName lastName email phone')
      .populate('items.productId', 'productName category');

    if (!order) {
      return res.status(404).json({
        status: 404,
        message: 'Order not found'
      });
    }

    // Check if user owns this order
    if (order.userId._id.toString() !== req.user.userId) {
      return res.status(403).json({
        status: 403,
        message: 'Forbidden'
      });
    }

    return res.status(200).json({
      status: 200,
      data: order
    });

  } catch (error) {
    console.error('Get order error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        status: 404,
        message: 'Order not found'
      });
    }

    return res.status(500).json({
      status: 500,
      message: 'Failed to retrieve order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Cancel order
 * @route PUT /api/orders/:id/cancel
 */
const cancelOrder = async (req, res) => {
  try {
    const { id } = req.params;

    const order = await Order.findById(id);

    if (!order) {
      return res.status(404).json({
        status: 404,
        message: 'Order not found'
      });
    }

    // Check ownership
    if (order.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        status: 403,
        message: 'Forbidden'
      });
    }

    // Can only cancel pending orders
    if (order.status !== 'pending') {
      return res.status(400).json({
        status: 400,
        message: `Cannot cancel order with status: ${order.status}`
      });
    }

    // Restore product quantities
    for (const item of order.items) {
      const product = await Product.findById(item.productId);
      if (product) {
        product.quantityAvailable += item.quantity;
        product.isAvailable = true;
        await product.save();
      }
    }

    // Update order status
    order.status = 'cancelled';
    await order.save();

    return res.status(200).json({
      status: 200,
      data: {
        order,
        message: 'Order cancelled successfully'
      }
    });

  } catch (error) {
    console.error('Cancel order error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Failed to cancel order',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrder,
  cancelOrder
};

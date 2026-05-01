const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const { sendOrderConfirmationEmail } = require('../services/emailService');

/**
 * Create new order (simplified for marketplace)
 * @route POST /api/orders
 */
const createOrder = async (req, res) => {
  try {
    const { product, quantity, totalPrice } = req.body;

    console.log('📥 Order creation request:', {
      body: req.body,
      product,
      quantity,
      totalPrice,
      userId: req.user?.userId
    });

    // Validate input
    if (!product || !quantity || !totalPrice) {
      console.log('❌ Validation failed:', {
        hasProduct: !!product,
        hasQuantity: !!quantity,
        hasTotalPrice: !!totalPrice
      });
      
      return res.status(400).json({
        status: 400,
        message: 'Product, quantity, and totalPrice are required',
        details: {
          product: product ? 'provided' : 'missing',
          quantity: quantity ? 'provided' : 'missing',
          totalPrice: totalPrice ? 'provided' : 'missing'
        }
      });
    }

    // Verify product exists
    const productDoc = await Product.findById(product).populate('userId', 'firstName lastName');
    
    if (!productDoc) {
      console.log('❌ Product not found:', product);
      return res.status(404).json({
        status: 404,
        message: 'Product not found'
      });
    }

    if (!productDoc.isAvailable) {
      console.log('❌ Product not available:', product);
      return res.status(400).json({
        status: 400,
        message: 'Product is not available'
      });
    }

    if (productDoc.quantityAvailable < quantity) {
      console.log('❌ Insufficient quantity:', {
        requested: quantity,
        available: productDoc.quantityAvailable
      });
      return res.status(400).json({
        status: 400,
        message: `Insufficient quantity. Available: ${productDoc.quantityAvailable}`
      });
    }

    // Get buyer info
    const buyer = await User.findById(req.user.userId);
    if (!buyer) {
      console.log('❌ Buyer not found:', req.user.userId);
      return res.status(404).json({
        status: 404,
        message: 'User not found'
      });
    }

    // Create order with simplified structure
    const order = await Order.create({
      userId: req.user.userId,
      items: [{
        productId: productDoc._id,
        productName: productDoc.productName,
        quantity: quantity,
        price: productDoc.price,
        unit: productDoc.unit || 'unit'
      }],
      totalAmount: totalPrice,
      shippingAddress: {
        fullName: `${buyer.firstName} ${buyer.lastName}`,
        phone: buyer.phone || '',
        address: 'To be provided',
        city: '',
        region: ''
      },
      paymentMethod: 'cash',
      notes: '',
      status: 'pending'
    });

    // Update product quantity
    productDoc.quantityAvailable -= quantity;
    if (productDoc.quantityAvailable === 0) {
      productDoc.isAvailable = false;
    }
    await productDoc.save();

    // Populate for response
    await order.populate('userId', 'firstName lastName email phone');

    console.log('✅ Order created:', {
      orderId: order._id,
      buyer: `${buyer.firstName} ${buyer.lastName}`,
      product: productDoc.productName,
      quantity,
      total: totalPrice
    });

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
 * Get user's orders (as buyer or seller)
 * @route GET /api/orders
 */
const getUserOrders = async (req, res) => {
  try {
    const { status, limit, offset } = req.query;

    const parsedLimit = Math.min(parseInt(limit) || 100, 100);
    const parsedOffset = parseInt(offset) || 0;

    // Find orders where user is the buyer
    const buyerFilter = { userId: req.user.userId };
    if (status) buyerFilter.status = status;

    const buyerOrders = await Order
      .find(buyerFilter)
      .sort({ createdAt: -1 })
      .skip(parsedOffset)
      .limit(parsedLimit)
      .populate('userId', 'firstName lastName email phone')
      .populate('items.productId', 'productName category image userId');

    // Find orders where user is the seller (products they own)
    const userProducts = await Product.find({ userId: req.user.userId }).select('_id');
    const productIds = userProducts.map(p => p._id);

    const sellerFilter = { 'items.productId': { $in: productIds } };
    if (status) sellerFilter.status = status;

    const sellerOrders = await Order
      .find(sellerFilter)
      .sort({ createdAt: -1 })
      .skip(parsedOffset)
      .limit(parsedLimit)
      .populate('userId', 'firstName lastName email phone')
      .populate('items.productId', 'productName category image userId');

    // Map orders to frontend format
    const mapOrder = (order, isSeller = false) => {
      const item = order.items[0]; // Simplified: one item per order
      const product = item.productId;
      
      return {
        _id: order._id,
        product: product?._id,
        productName: item.productName,
        productImage: product?.image || '/placeholder-product.jpg',
        buyer: order.userId._id,
        buyerName: `${order.userId.firstName} ${order.userId.lastName}`,
        seller: product?.userId,
        sellerName: isSeller ? 'You' : 'Seller',
        quantity: item.quantity,
        totalPrice: order.totalAmount,
        status: order.status,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      };
    };

    const mappedBuyerOrders = buyerOrders.map(o => mapOrder(o, false));
    const mappedSellerOrders = sellerOrders.map(o => mapOrder(o, true));

    console.log(`Found ${mappedBuyerOrders.length} buyer orders and ${mappedSellerOrders.length} seller orders for user ${req.user.userId}`);

    return res.status(200).json({
      status: 200,
      data: {
        orders: [...mappedBuyerOrders, ...mappedSellerOrders],
        buyerOrders: mappedBuyerOrders,
        sellerOrders: mappedSellerOrders,
        count: mappedBuyerOrders.length + mappedSellerOrders.length
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

/**
 * Update order status
 * @route PUT /api/orders/:id
 */
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        status: 400,
        message: 'Status is required'
      });
    }

    const validStatuses = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        status: 400,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const order = await Order.findById(id).populate('items.productId', 'userId');

    if (!order) {
      return res.status(404).json({
        status: 404,
        message: 'Order not found'
      });
    }

    // Check if user is the seller (owns the product) or the buyer
    const productOwnerId = order.items[0]?.productId?.userId?.toString();
    const isSeller = productOwnerId === req.user.userId;
    const isBuyer = order.userId.toString() === req.user.userId;

    if (!isSeller && !isBuyer) {
      return res.status(403).json({
        status: 403,
        message: 'Forbidden: You can only update orders you are involved in'
      });
    }

    // Update status
    order.status = status;
    await order.save();

    console.log('✅ Order status updated:', {
      orderId: order._id,
      newStatus: status,
      updatedBy: req.user.userId
    });

    return res.status(200).json({
      status: 200,
      data: {
        order,
        message: 'Order status updated successfully'
      }
    });

  } catch (error) {
    console.error('Update order status error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Failed to update order status',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrder,
  updateOrderStatus,
  cancelOrder
};

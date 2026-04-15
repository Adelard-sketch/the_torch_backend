const Product = require('../models/Product');

/**
 * Get all products with optional filters
 * @route GET /api/products
 */
const getProducts = async (req, res) => {
  try {
    const { category, search, limit, offset } = req.query;

    // Build query filter - always start with isAvailable: true
    const filter = { isAvailable: true };

    // Add category filter if provided
    if (category && category.trim()) {
      filter.category = category.trim();
    }

    // Add text search filter if search term provided
    if (search && search.trim()) {
      filter.$text = { $search: search.trim() };
    }

    // Parse and clamp pagination parameters
    const parsedLimit = Math.min(parseInt(limit) || 20, 100); // Default 20, max 100
    const parsedOffset = parseInt(offset) || 0; // Default 0

    // Query products with filters, populate seller info, sort by date
    const products = await Product
      .find(filter)
      .populate('userId', 'firstName lastName role') // Populate only needed fields
      .sort({ createdAt: -1 }) // Sort by creation date descending
      .skip(parsedOffset)
      .limit(parsedLimit);

    // Return response matching PHP format
    return res.status(200).json({
      status: 200,
      data: {
        products,
        count: products.length,
        limit: parsedLimit,
        offset: parsedOffset
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Failed to retrieve products',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get single product by ID
 * @route GET /api/products/:id
 */
const getProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Find product by ID where isAvailable is true
    const product = await Product
      .findOne({ _id: id, isAvailable: true })
      .populate('userId', 'firstName lastName role');

    // Return 404 if product not found or unavailable
    if (!product) {
      return res.status(404).json({
        status: 404,
        message: 'Product not found'
      });
    }

    // Return product details
    return res.status(200).json({
      status: 200,
      data: product
    });

  } catch (error) {
    console.error('Get product error:', error);
    
    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      return res.status(404).json({
        status: 404,
        message: 'Product not found'
      });
    }

    return res.status(500).json({
      status: 500,
      message: 'Failed to retrieve product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create new product (requires authentication)
 * @route POST /api/products
 */
const createProduct = async (req, res) => {
  try {
    const { productName, description, category, price, quantityAvailable, unit } = req.body;

    // Validate required fields
    if (!productName || price === undefined || quantityAvailable === undefined) {
      return res.status(400).json({
        status: 400,
        message: 'Product name, price, and quantity available are required'
      });
    }

    // Validate price is non-negative
    if (price < 0) {
      return res.status(400).json({
        status: 400,
        message: 'Price cannot be negative'
      });
    }

    // Validate quantityAvailable is non-negative
    if (quantityAvailable < 0) {
      return res.status(400).json({
        status: 400,
        message: 'Quantity cannot be negative'
      });
    }

    // Create product with authenticated user as owner
    const product = await Product.create({
      userId: req.user.userId, // From JWT token
      productName,
      description: description || '',
      category: category || 'produce',
      price,
      quantityAvailable,
      unit: unit || 'kg'
    });

    // Populate seller info before returning
    await product.populate('userId', 'firstName lastName role');

    // Return created product
    return res.status(201).json({
      status: 201,
      data: {
        product
      }
    });

  } catch (error) {
    console.error('Create product error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Failed to create product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update product (requires authentication and ownership)
 * @route PUT /api/products/:id
 */
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { productName, description, category, price, quantityAvailable, unit, isAvailable } = req.body;

    // Find product by ID
    const product = await Product.findById(id);

    // Return 404 if product not found
    if (!product) {
      return res.status(404).json({
        status: 404,
        message: 'Product not found'
      });
    }

    // Check ownership - only owner can update
    if (product.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        status: 403,
        message: 'Forbidden'
      });
    }

    // Build update object with only provided fields (partial updates)
    const updates = {};
    if (productName !== undefined) updates.productName = productName;
    if (description !== undefined) updates.description = description;
    if (category !== undefined) updates.category = category;
    if (price !== undefined) {
      if (price < 0) {
        return res.status(400).json({
          status: 400,
          message: 'Price cannot be negative'
        });
      }
      updates.price = price;
    }
    if (quantityAvailable !== undefined) {
      if (quantityAvailable < 0) {
        return res.status(400).json({
          status: 400,
          message: 'Quantity cannot be negative'
        });
      }
      updates.quantityAvailable = quantityAvailable;
    }
    if (unit !== undefined) updates.unit = unit;
    if (isAvailable !== undefined) updates.isAvailable = isAvailable;

    // Apply updates
    Object.assign(product, updates);
    await product.save();

    // Populate seller info
    await product.populate('userId', 'firstName lastName role');

    // Return updated product
    return res.status(200).json({
      status: 200,
      data: {
        product
      }
    });

  } catch (error) {
    console.error('Update product error:', error);
    
    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      return res.status(404).json({
        status: 404,
        message: 'Product not found'
      });
    }

    return res.status(500).json({
      status: 500,
      message: 'Failed to update product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete product (requires authentication and ownership)
 * @route DELETE /api/products/:id
 */
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    // Find product by ID
    const product = await Product.findById(id);

    // Return 404 if product not found
    if (!product) {
      return res.status(404).json({
        status: 404,
        message: 'Product not found'
      });
    }

    // Check ownership - only owner can delete
    if (product.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        status: 403,
        message: 'Forbidden'
      });
    }

    // Delete product
    await Product.deleteOne({ _id: id });

    // Return success response
    return res.status(200).json({
      status: 200,
      data: {
        message: 'Product deleted successfully'
      }
    });

  } catch (error) {
    console.error('Delete product error:', error);
    
    // Handle invalid ObjectId format
    if (error.name === 'CastError') {
      return res.status(404).json({
        status: 404,
        message: 'Product not found'
      });
    }

    return res.status(500).json({
      status: 500,
      message: 'Failed to delete product',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
};

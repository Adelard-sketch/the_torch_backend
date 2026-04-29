const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { 
  getProducts, 
  getProduct, 
  createProduct, 
  updateProduct, 
  deleteProduct 
} = require('../controllers/productController');

const router = express.Router();

/**
 * @route   GET /api/products
 * @desc    Get all products with optional filters (category, search, limit, offset)
 * @access  Public
 */
router.get('/', getProducts);

/**
 * @route   GET /api/products/:id
 * @desc    Get single product by ID
 * @access  Public
 */
router.get('/:id', getProduct);

/**
 * @route   POST /api/products
 * @desc    Create new product
 * @access  Private (requires authentication)
 */
router.post('/', verifyToken, createProduct);

/**
 * @route   PUT /api/products/:id
 * @desc    Update product by ID
 * @access  Private (requires authentication and ownership)
 */
router.put('/:id', verifyToken, updateProduct);

/**
 * @route   DELETE /api/products/:id
 * @desc    Delete product by ID
 * @access  Private (requires authentication and ownership)
 */
router.delete('/:id', verifyToken, deleteProduct);

module.exports = router;

const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { 
  uploadFile, 
  getFile, 
  deleteFile,
  updateProfilePicture,
  addProductImage
} = require('../controllers/fileController');

const router = express.Router();

/**
 * @route   POST /api/files/upload
 * @desc    Upload file (generic endpoint)
 * @access  Private
 */
router.post('/upload', verifyToken, uploadFile);

/**
 * @route   GET /api/files/:fileId
 * @desc    Get file by ID
 * @access  Public
 */
router.get('/:fileId', getFile);

/**
 * @route   DELETE /api/files/:fileId
 * @desc    Delete file by ID
 * @access  Private (owner only)
 */
router.delete('/:fileId', verifyToken, deleteFile);

/**
 * @route   POST /api/users/:userId/profile-picture
 * @desc    Update user profile picture
 * @access  Private
 */
router.post('/users/:userId/profile-picture', verifyToken, updateProfilePicture);

/**
 * @route   POST /api/products/:productId/images
 * @desc    Add product image
 * @access  Private (owner only)
 */
router.post('/products/:productId/images', verifyToken, addProductImage);

module.exports = router;

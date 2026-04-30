const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { upload } = require('../middleware/upload');
const { uploadProfilePicture, uploadCoverImage, getUserProfile, updateUserProfile } = require('../controllers/userController');

const router = express.Router();

/**
 * @route   POST /api/users/:userId/profile-picture
 * @desc    Upload or update user profile picture
 * @access  Private
 */
router.post('/:userId/profile-picture', verifyToken, upload.single('image'), uploadProfilePicture);

/**
 * @route   POST /api/users/:userId/cover-image
 * @desc    Upload or update user cover image
 * @access  Private
 */
router.post('/:userId/cover-image', verifyToken, upload.single('image'), uploadCoverImage);

/**
 * @route   GET /api/users/:userId
 * @desc    Get user profile including picture
 * @access  Private
 */
router.get('/:userId', verifyToken, getUserProfile);

/**
 * @route   PUT /api/users/:userId
 * @desc    Update user profile information
 * @access  Private
 */
router.put('/:userId', verifyToken, updateUserProfile);

module.exports = router;

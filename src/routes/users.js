const express = require('express');
const { uploadProfilePicture, uploadCoverImage, getUserProfile, updateUserProfile } = require('../controllers/userController');

const router = express.Router();

/**
 * @route   POST /api/users/:userId/profile-picture
 * @desc    Upload or update user profile picture
 * @access  Private
 */
router.post('/:userId/profile-picture', uploadProfilePicture);

/**
 * @route   POST /api/users/:userId/cover-image
 * @desc    Upload or update user cover image
 * @access  Private
 */
router.post('/:userId/cover-image', uploadCoverImage);

/**
 * @route   GET /api/users/:userId
 * @desc    Get user profile including picture
 * @access  Private
 */
router.get('/:userId', getUserProfile);

/**
 * @route   PUT /api/users/:userId
 * @desc    Update user profile information
 * @access  Private
 */
router.put('/:userId', updateUserProfile);

module.exports = router;

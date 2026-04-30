const User = require('../models/User');
const { uploadToCloudinary } = require('../middleware/upload');

/**
 * @route   POST /api/users/:userId/profile-picture
 * @desc    Upload or update user profile picture
 * @access  Private
 */
exports.uploadProfilePicture = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ 
        status: 400, 
        message: 'No image file provided' 
      });
    }

    // Verify user owns this profile or is admin
    if (req.user.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 403,
        message: 'Forbidden'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        status: 404, 
        message: 'User not found' 
      });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, 'thetorch/profiles');
    
    // Update user profile picture
    user.profilePicture = result.secure_url;
    await user.save();

    res.json({
      status: 200,
      message: 'Profile picture updated successfully',
      data: {
        userId: user._id,
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('Profile picture upload error:', error);
    res.status(500).json({
      status: 500,
      message: 'Error uploading profile picture',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @route   POST /api/users/:userId/cover-image
 * @desc    Upload or update user cover image
 * @access  Private
 */
exports.uploadCoverImage = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ 
        status: 400, 
        message: 'No image file provided' 
      });
    }

    // Verify user owns this profile or is admin
    if (req.user.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 403,
        message: 'Forbidden'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        status: 404, 
        message: 'User not found' 
      });
    }

    // Upload to Cloudinary
    const result = await uploadToCloudinary(req.file.buffer, 'thetorch/covers');
    
    // Update user cover image
    user.coverImage = result.secure_url;
    await user.save();

    res.json({
      status: 200,
      message: 'Cover image updated successfully',
      data: {
        userId: user._id,
        coverImage: user.coverImage
      }
    });
  } catch (error) {
    console.error('Cover image upload error:', error);
    res.status(500).json({
      status: 500,
      message: 'Error uploading cover image',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @route   GET /api/users/:userId
 * @desc    Get user profile including picture
 * @access  Private
 */
exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        status: 404, 
        message: 'User not found' 
      });
    }

    res.json({
      status: 200,
      message: 'User profile retrieved successfully',
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profilePicture: user.profilePicture,
        coverImage: user.coverImage,
        isVerified: user.isVerified,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      status: 500,
      message: 'Error retrieving user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * @route   PUT /api/users/:userId
 * @desc    Update user profile information
 * @access  Private
 */
exports.updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, phone, bio } = req.body;

    // Verify user owns this profile or is admin
    if (req.user.userId !== userId && req.user.role !== 'admin') {
      return res.status(403).json({
        status: 403,
        message: 'Forbidden'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        status: 404, 
        message: 'User not found' 
      });
    }

    // Update fields if provided
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (bio !== undefined) user.bio = bio;

    await user.save();

    res.json({
      status: 200,
      message: 'Profile updated successfully',
      data: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        bio: user.bio,
        profilePicture: user.profilePicture,
        coverImage: user.coverImage
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      status: 500,
      message: 'Error updating profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

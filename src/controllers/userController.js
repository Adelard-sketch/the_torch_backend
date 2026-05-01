const User = require('../models/User');

/**
 * @route   POST /api/users/:userId/profile-picture
 * @desc    Upload or update user profile picture
 * @access  Private
 */
exports.uploadProfilePicture = async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!req.file && !req.body.profilePicture) {
      return res.status(400).json({ 
        status: 400, 
        message: 'No file or image data provided' 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        status: 404, 
        message: 'User not found' 
      });
    }

    // Handle file upload or base64 data
    if (req.file) {
      // If using multer or similar file upload middleware
      user.profilePicture = req.file.path || req.file.filename;
    } else if (req.body.profilePicture) {
      // Handle base64 image data (for small images)
      user.profilePicture = req.body.profilePicture;
    }

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
      error: error.message
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
    
    if (!req.file && !req.body.coverImage) {
      return res.status(400).json({ 
        status: 400, 
        message: 'No file or image data provided' 
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        status: 404, 
        message: 'User not found' 
      });
    }

    // Handle file upload or base64 data
    if (req.file) {
      user.coverImage = req.file.path || req.file.filename;
    } else if (req.body.coverImage) {
      user.coverImage = req.body.coverImage;
    }

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
      error: error.message
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
        isVerified: user.isVerified,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      status: 500,
      message: 'Error retrieving user profile',
      error: error.message
    });
  }
};

/**
 * @route   GET /api/users
 * @desc    Get all users (admin only)
 * @access  Private (admin only)
 */
exports.getAllUsers = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 403,
        message: 'Forbidden: Admin access required'
      });
    }

    // Fetch all users, excluding password
    const users = await User.find({ isActive: true })
      .select('-passwordHash')
      .sort({ createdAt: -1 });

    res.json({
      status: 200,
      message: 'Users retrieved successfully',
      data: {
        users: users.map(user => ({
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          profilePicture: user.profilePicture,
          coverImage: user.coverImage,
          bio: user.bio,
          isVerified: user.isVerified,
          createdAt: user.createdAt
        })),
        count: users.length
      }
    });
  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      status: 500,
      message: 'Error retrieving users',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};
exports.updateUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const { firstName, lastName, phone } = req.body;

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
        profilePicture: user.profilePicture
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      status: 500,
      message: 'Error updating profile',
      error: error.message
    });
  }
};

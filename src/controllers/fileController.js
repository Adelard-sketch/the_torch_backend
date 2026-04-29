const File = require('../models/File');
const User = require('../models/User');
const Product = require('../models/Product');
const fs = require('fs').promises;
const path = require('path');
const { FILE_SIZE_LIMITS, ALLOWED_FILE_TYPES, UPLOAD_DIRS } = require('../config/constants');

/**
 * Upload file endpoint
 * @route POST /api/files/upload
 */
const uploadFile = async (req, res) => {
  try {
    const { userId, fileName, fileSize, fileType, fileData, purpose, metadata } = req.body;

    // Validate required fields
    if (!userId || !fileName || !fileSize || !fileType || !fileData || !purpose) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, fileName, fileSize, fileType, fileData, purpose'
      });
    }

    // Validate file size limits based on purpose
    const maxSize = FILE_SIZE_LIMITS[purpose];
    if (!maxSize) {
      return res.status(400).json({
        success: false,
        error: `Invalid purpose: ${purpose}`
      });
    }

    if (fileSize > maxSize) {
      return res.status(413).json({
        success: false,
        error: `File size exceeds ${maxSize / (1024 * 1024)}MB limit for ${purpose} files`
      });
    }

    // Validate file type based on purpose
    const allowedTypes = ALLOWED_FILE_TYPES[purpose];
    if (!allowedTypes || !allowedTypes.includes(fileType)) {
      return res.status(415).json({
        success: false,
        error: `File type ${fileType} not allowed for ${purpose}. Allowed types: ${allowedTypes.join(', ')}`
      });
    }

    // Generate unique file ID and name
    const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const ext = path.extname(fileName) || `.${fileType.split('/')[1]}`;
    const uniqueFileName = `${fileId}${ext}`;

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(__dirname, '../..', UPLOAD_DIRS[purpose]);
    await fs.mkdir(uploadDir, { recursive: true });

    // Decode base64 and save file
    const buffer = Buffer.from(fileData, 'base64');
    const filePath = path.join(uploadDir, uniqueFileName);
    await fs.writeFile(filePath, buffer);

    // Generate file URL (adjust based on your server setup)
    const fileUrl = `/uploads/${purpose}/${uniqueFileName}`;
    
    // For images, create thumbnail (simplified - in production use sharp or similar)
    let thumbnailUrl = null;
    if (fileType.startsWith('image/')) {
      thumbnailUrl = fileUrl; // In production, generate actual thumbnail
    }

    // Save file metadata to database
    const file = await File.create({
      userId,
      fileName,
      fileSize,
      fileType,
      fileUrl,
      thumbnailUrl,
      purpose,
      metadata: metadata || {}
    });

    // Return success response
    return res.status(200).json({
      success: true,
      data: {
        id: file._id,
        userId: file.userId,
        fileName: file.fileName,
        fileSize: file.fileSize,
        fileType: file.fileType,
        fileUrl: file.fileUrl,
        thumbnailUrl: file.thumbnailUrl,
        uploadedAt: file.createdAt,
        purpose: file.purpose,
        metadata: file.metadata
      }
    });

  } catch (error) {
    console.error('File upload error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to process file upload'
    });
  }
};

/**
 * Get file by ID
 * @route GET /api/files/:fileId
 */
const getFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    // In production, redirect to CDN or serve file directly
    return res.status(200).json({
      success: true,
      data: file
    });

  } catch (error) {
    console.error('Get file error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve file'
    });
  }
};

/**
 * Delete file by ID
 * @route DELETE /api/files/:fileId
 */
const deleteFile = async (req, res) => {
  try {
    const { fileId } = req.params;

    const file = await File.findById(fileId);
    if (!file) {
      return res.status(404).json({
        success: false,
        error: 'File not found'
      });
    }

    // Verify user owns the file
    if (file.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized - only file owner can delete'
      });
    }

    // Delete physical file
    const filePath = path.join(__dirname, '../..', file.fileUrl);
    try {
      await fs.unlink(filePath);
    } catch (err) {
      console.error('Error deleting physical file:', err);
    }

    // Delete database record
    await File.deleteOne({ _id: fileId });

    return res.status(200).json({
      success: true,
      message: 'File deleted successfully'
    });

  } catch (error) {
    console.error('Delete file error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to delete file'
    });
  }
};

/**
 * Update user profile picture
 * @route POST /api/users/:userId/profile-picture
 */
const updateProfilePicture = async (req, res) => {
  try {
    const { userId } = req.params;
    const { fileName, fileSize, fileType, fileData } = req.body;

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    // Upload file using uploadFile logic
    const uploadResult = await uploadFile({
      body: {
        userId,
        fileName,
        fileSize,
        fileType,
        fileData,
        purpose: 'profile',
        metadata: { type: 'avatar' }
      }
    }, {
      status: (code) => ({
        json: (data) => ({ statusCode: code, ...data })
      })
    });

    if (uploadResult.statusCode !== 200) {
      return res.status(uploadResult.statusCode).json(uploadResult);
    }

    // Update user profile picture
    user.profilePicture = uploadResult.data.fileUrl;
    await user.save();

    return res.status(200).json({
      success: true,
      data: {
        id: user._id,
        avatar: user.profilePicture,
        uploadedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Update profile picture error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update profile picture'
    });
  }
};

/**
 * Add product image
 * @route POST /api/products/:productId/images
 */
const addProductImage = async (req, res) => {
  try {
    const { productId } = req.params;
    const { userId, fileName, fileSize, fileType, fileData } = req.body;

    // Verify product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      });
    }

    // Verify user owns the product
    if (product.userId.toString() !== req.user.userId) {
      return res.status(403).json({
        success: false,
        error: 'Unauthorized - only product owner can add images'
      });
    }

    // Create file upload directory
    const uploadDir = path.join(__dirname, '../../uploads/product');
    await fs.mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const ext = path.extname(fileName) || `.${fileType.split('/')[1]}`;
    const uniqueFileName = `${fileId}${ext}`;

    // Decode and save file
    const buffer = Buffer.from(fileData, 'base64');
    const filePath = path.join(uploadDir, uniqueFileName);
    await fs.writeFile(filePath, buffer);

    const fileUrl = `/uploads/product/${uniqueFileName}`;

    // Save to database
    await File.create({
      userId,
      fileName,
      fileSize,
      fileType,
      fileUrl,
      thumbnailUrl: fileUrl,
      purpose: 'product',
      metadata: { productId }
    });

    // Update product images array
    if (!product.images) {
      product.images = [];
    }
    product.images.push(fileUrl);
    
    // Set as primary image if first image
    if (!product.image || product.images.length === 1) {
      product.image = fileUrl;
    }

    await product.save();

    return res.status(200).json({
      success: true,
      data: {
        id: product._id,
        image: product.image,
        images: product.images,
        uploadedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Add product image error:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to add product image'
    });
  }
};

module.exports = {
  uploadFile,
  getFile,
  deleteFile,
  updateProfilePicture,
  addProductImage
};

/**
 * File Utility Functions
 * Helper functions for file operations
 */

const fs = require('fs').promises;
const path = require('path');

/**
 * Generate unique file ID
 */
function generateFileId() {
  return `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Get file extension from MIME type or filename
 */
function getFileExtension(fileName, mimeType) {
  // Try to get extension from filename first
  const extFromName = path.extname(fileName);
  if (extFromName) {
    return extFromName;
  }

  // Fallback to MIME type
  const mimeToExt = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'application/pdf': '.pdf',
    'application/msword': '.doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx'
  };

  return mimeToExt[mimeType] || '';
}

/**
 * Ensure directory exists
 */
async function ensureDirectoryExists(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    return true;
  } catch (error) {
    console.error('Error creating directory:', error);
    return false;
  }
}

/**
 * Delete file safely
 */
async function deleteFileSafely(filePath) {
  try {
    await fs.unlink(filePath);
    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    return false;
  }
}

/**
 * Check if file exists
 */
async function fileExists(filePath) {
  try {
    await fs.access(filePath);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get file size
 */
async function getFileSize(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

/**
 * Format file size for display
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Validate base64 string
 */
function isValidBase64(str) {
  if (!str || typeof str !== 'string') {
    return false;
  }
  
  try {
    return Buffer.from(str, 'base64').toString('base64') === str;
  } catch {
    return false;
  }
}

/**
 * Clean filename (remove special characters)
 */
function cleanFileName(fileName) {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
}

module.exports = {
  generateFileId,
  getFileExtension,
  ensureDirectoryExists,
  deleteFileSafely,
  fileExists,
  getFileSize,
  formatFileSize,
  isValidBase64,
  cleanFileName
};

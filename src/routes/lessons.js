const express = require('express');
const { verifyToken } = require('../middleware/auth');
const { 
  getLessons, 
  getLesson, 
  createLesson, 
  updateLesson, 
  deleteLesson 
} = require('../controllers/lessonController');

const router = express.Router();

/**
 * @route   GET /api/lessons
 * @desc    Get all published lessons with optional filters
 * @access  Public
 */
router.get('/', getLessons);

/**
 * @route   GET /api/lessons/:id
 * @desc    Get single lesson by ID
 * @access  Public
 */
router.get('/:id', getLesson);

/**
 * @route   POST /api/lessons
 * @desc    Create new lesson (admin only)
 * @access  Private (admin)
 */
router.post('/', verifyToken, createLesson);

/**
 * @route   PUT /api/lessons/:id
 * @desc    Update lesson by ID (admin only)
 * @access  Private (admin)
 */
router.put('/:id', verifyToken, updateLesson);

/**
 * @route   DELETE /api/lessons/:id
 * @desc    Delete lesson by ID (admin only)
 * @access  Private (admin)
 */
router.delete('/:id', verifyToken, deleteLesson);

module.exports = router;

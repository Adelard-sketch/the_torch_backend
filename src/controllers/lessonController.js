const Lesson = require('../models/Lesson');

/**
 * Get all published lessons
 * @route GET /api/lessons
 */
const getLessons = async (req, res) => {
  try {
    const { category, level, search } = req.query;

    // Build query filter
    const filter = { isPublished: true };

    if (category) filter.category = category;
    if (level) filter.level = level;
    if (search) filter.$text = { $search: search };

    const lessons = await Lesson
      .find(filter)
      .sort({ createdAt: -1 });

    return res.status(200).json({
      status: 200,
      data: {
        lessons,
        count: lessons.length
      }
    });

  } catch (error) {
    console.error('Get lessons error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Failed to retrieve lessons',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Get single lesson by ID
 * @route GET /api/lessons/:id
 */
const getLesson = async (req, res) => {
  try {
    const { id } = req.params;

    const lesson = await Lesson.findOne({ _id: id, isPublished: true });

    if (!lesson) {
      return res.status(404).json({
        status: 404,
        message: 'Lesson not found'
      });
    }

    return res.status(200).json({
      status: 200,
      data: lesson
    });

  } catch (error) {
    console.error('Get lesson error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        status: 404,
        message: 'Lesson not found'
      });
    }

    return res.status(500).json({
      status: 500,
      message: 'Failed to retrieve lesson',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Create new lesson (admin only)
 * @route POST /api/lessons
 */
const createLesson = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 403,
        message: 'Only admins can create lessons'
      });
    }

    const { title, category, content, image, durationMin, level, isPublished } = req.body;

    // Validate required fields
    if (!title || !content || !durationMin) {
      return res.status(400).json({
        status: 400,
        message: 'Title, content, and duration are required'
      });
    }

    // Create lesson
    const lesson = await Lesson.create({
      title,
      category: category || 'Agriculture',
      content,
      image: image || null,
      durationMin,
      level: level || 'beginner',
      isPublished: isPublished !== undefined ? isPublished : true
    });

    return res.status(201).json({
      status: 201,
      data: { lesson }
    });

  } catch (error) {
    console.error('Create lesson error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Failed to create lesson',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Update lesson (admin only)
 * @route PUT /api/lessons/:id
 */
const updateLesson = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 403,
        message: 'Only admins can update lessons'
      });
    }

    const { id } = req.params;
    const { title, category, content, image, durationMin, level, isPublished } = req.body;

    const lesson = await Lesson.findById(id);

    if (!lesson) {
      return res.status(404).json({
        status: 404,
        message: 'Lesson not found'
      });
    }

    // Build update object
    const updates = {};
    if (title !== undefined) updates.title = title;
    if (category !== undefined) updates.category = category;
    if (content !== undefined) updates.content = content;
    if (image !== undefined) updates.image = image;
    if (durationMin !== undefined) updates.durationMin = durationMin;
    if (level !== undefined) updates.level = level;
    if (isPublished !== undefined) updates.isPublished = isPublished;

    Object.assign(lesson, updates);
    await lesson.save();

    return res.status(200).json({
      status: 200,
      data: { lesson }
    });

  } catch (error) {
    console.error('Update lesson error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        status: 404,
        message: 'Lesson not found'
      });
    }

    return res.status(500).json({
      status: 500,
      message: 'Failed to update lesson',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Delete lesson (admin only)
 * @route DELETE /api/lessons/:id
 */
const deleteLesson = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        status: 403,
        message: 'Only admins can delete lessons'
      });
    }

    const { id } = req.params;

    const lesson = await Lesson.findById(id);

    if (!lesson) {
      return res.status(404).json({
        status: 404,
        message: 'Lesson not found'
      });
    }

    await Lesson.deleteOne({ _id: id });

    return res.status(200).json({
      status: 200,
      data: {
        message: 'Lesson deleted successfully'
      }
    });

  } catch (error) {
    console.error('Delete lesson error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        status: 404,
        message: 'Lesson not found'
      });
    }

    return res.status(500).json({
      status: 500,
      message: 'Failed to delete lesson',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getLessons,
  getLesson,
  createLesson,
  updateLesson,
  deleteLesson
};

const express = require('express');
const router = express.Router();
const { submitContact, getContacts } = require('../controllers/contactController');
const { protect, restrictTo } = require('../middleware/auth');

/**
 * @route POST /api/contact
 * @desc Submit contact form
 * @access Public
 */
router.post('/', submitContact);

/**
 * @route GET /api/contact
 * @desc Get all contacts (admin only)
 * @access Private (farmer role)
 */
router.get('/', protect, restrictTo('farmer'), getContacts);

module.exports = router;

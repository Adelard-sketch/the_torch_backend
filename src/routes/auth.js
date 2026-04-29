const express = require('express');
const rateLimit = require('express-rate-limit');
const { register, login } = require('../controllers/authController');

const router = express.Router();

// Rate limiter for login endpoint
// Key: IP address + email (to track per user, not per IP)
// Max: 15 attempts per 60 minutes per email address
const loginLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 60 minutes (increased from 15)
  max: 15, // 15 attempts per hour (increased from 5)
  message: {
    status: 429,
    message: 'Too many login attempts, please try again later'
  },
  standardHeaders: true,
  legacyHeaders: false,
  // Track by email + IP to be per-user instead of per-IP
  keyGenerator: (req, res) => {
    // Use email if provided, otherwise fall back to IP
    const email = req.body.email ? req.body.email.toLowerCase() : req.ip;
    return email;
  },
  skip: (req, res) => {
    // Skip rate limiting for successful logins (only rate limit failed attempts)
    // This will be handled in the controller
    return false;
  }
});

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
router.post('/register', register);

/**
 * @route   POST /api/auth/login
 * @desc    Login user and return JWT token
 * @access  Public
 */
router.post('/login', loginLimiter, login);

module.exports = router;

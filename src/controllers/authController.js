const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { sendWelcomeEmail } = require('../services/emailService');

/**
 * Register a new user
 * @route POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, role, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        status: 400,
        message: 'Email and password are required'
      });
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({
        status: 400,
        message: 'Password must be at least 6 characters'
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({
        status: 409,
        message: 'Email already registered'
      });
    }

    // Hash password with bcrypt (cost factor 10)
    const passwordHash = await bcrypt.hash(password, 10);

    // Create new user
    const user = await User.create({
      firstName: firstName || 'User',
      lastName: lastName || '',
      email: email.toLowerCase(),
      phone: phone || '',
      role: role || 'customer',
      passwordHash
    });

    // Send welcome email (don't wait for it to complete)
    sendWelcomeEmail(user.email, user.firstName).catch(err => 
      console.error('Failed to send welcome email:', err.message)
    );

    // Return success response (matching PHP response format)
    return res.status(201).json({
      status: 201,
      data: {
        userId: user._id,
        email: user.email,
        message: 'Registration successful'
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Registration failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Login user
 * @route POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res.status(400).json({
        status: 400,
        message: 'Email and password are required'
      });
    }

    // Find user by email and isActive status (include passwordHash)
    const user = await User.findOne({ 
      email: email.toLowerCase(), 
      isActive: true 
    }).select('+passwordHash');

    // Return consistent error message if user not found
    if (!user) {
      return res.status(401).json({
        status: 401,
        message: 'Invalid credentials'
      });
    }

    // Compare password with bcrypt
    const isMatch = await bcrypt.compare(password, user.passwordHash);

    // Return consistent error message if password doesn't match
    if (!isMatch) {
      return res.status(401).json({
        status: 401,
        message: 'Invalid credentials'
      });
    }

    // Generate JWT token with userId and role (expires in 1 hour)
    const token = jwt.sign(
      { 
        userId: user._id, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Return success response (matching PHP response format)
    return res.status(200).json({
      status: 200,
      data: {
        token,
        userId: user._id,
        userName: user.firstName,
        userRole: user.role,
        isVerified: user.isVerified,
        message: 'Login successful'
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({
      status: 500,
      message: 'Login failed',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  register,
  login
};

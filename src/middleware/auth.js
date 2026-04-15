const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT token and attach user payload to request
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const verifyToken = (req, res, next) => {
  // Get token from Authorization header
  const authHeader = req.headers.authorization;

  // Check if Authorization header exists and starts with 'Bearer '
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 401,
      message: 'No token provided'
    });
  }

  // Extract token (remove 'Bearer ' prefix)
  const token = authHeader.split(' ')[1];

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Attach decoded user payload to request object
    req.user = decoded;
    
    // Continue to next middleware/route handler
    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 401,
        message: 'Token expired'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 401,
        message: 'Invalid token'
      });
    }

    // Handle any other errors
    return res.status(401).json({
      status: 401,
      message: 'Token verification failed'
    });
  }
};

/**
 * Alias for verifyToken - protects routes by requiring authentication
 */
const protect = verifyToken;

/**
 * Middleware to restrict access to specific user roles
 * @param {...string} roles - Allowed roles (e.g., 'farmer', 'customer')
 * @returns {Function} Express middleware function
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    // Check if user exists (should be set by protect middleware)
    if (!req.user) {
      return res.status(401).json({
        status: 401,
        message: 'Not authenticated'
      });
    }

    // Check if user's role is in the allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 403,
        message: 'You do not have permission to perform this action'
      });
    }

    next();
  };
};

module.exports = { verifyToken, protect, restrictTo };

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');
const orderRoutes = require('./routes/orders');
const contactRoutes = require('./routes/contact');
const userRoutes = require('./routes/users');
const fileRoutes = require('./routes/files');
const lessonRoutes = require('./routes/lessons');
const messageRoutes = require('./routes/messages');

const app = express();

// Security middleware - helmet sets various HTTP headers for security
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// CORS configuration - allow frontend origin
app.use(cors({
  origin: true, // Allow all origins temporarily
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
}));

// Explicit OPTIONS handling for all routes
app.options('*', cors());

// Body parser middleware - parse JSON request bodies (increased limit for base64 files)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Database connection middleware for serverless
app.use(async (req, res, next) => {
  // Skip DB check for health endpoints
  if (req.path === '/health' || req.path === '/api/health') {
    return next();
  }

  const mongoose = require('mongoose');
  if (mongoose.connection.readyState !== 1) {
    try {
      console.log('Connecting to database...');
      await connectDB();
      console.log('Database connected successfully');
    } catch (error) {
      console.error('Database connection failed:', error.message);
      return res.status(503).json({
        status: 503,
        message: 'Service temporarily unavailable - database connection failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
  next();
});

// Health check endpoint (no DB required)
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'The Torch backend is running',
    timestamp: new Date().toISOString(),
    env: {
      nodeEnv: process.env.NODE_ENV,
      hasMongoUri: !!process.env.MONGODB_URI,
      hasJwtSecret: !!process.env.JWT_SECRET,
    }
  });
});

// API health check with DB status
app.get('/api/health', async (req, res) => {
  const mongoose = require('mongoose');
  res.status(200).json({
    status: 'ok',
    message: 'API is running',
    timestamp: new Date().toISOString(),
    database: {
      connected: mongoose.connection.readyState === 1,
      state: mongoose.connection.readyState,
      host: mongoose.connection.host || 'not connected'
    }
  });
});

// Serve static files from uploads directory
app.use('/uploads', express.static('uploads'));

// Mount routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/users', userRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/messages', messageRoutes);

// 404 handler - catch all unmatched routes
app.use((req, res) => {
  res.status(404).json({
    status: 404,
    message: 'Route not found'
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error handler:', err);
  console.error('Error stack:', err.stack);

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      status: 400,
      message: 'Validation error',
      errors: Object.values(err.errors).map(e => e.message)
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    return res.status(409).json({
      status: 409,
      message: 'Duplicate entry',
      field: Object.keys(err.keyPattern)[0]
    });
  }

  // CORS error
  if (err.message && err.message.includes('CORS')) {
    return res.status(403).json({
      status: 403,
      message: 'CORS error',
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }

  // Default error response
  res.status(err.status || 500).json({
    status: err.status || 500,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Catch any unhandled errors
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

module.exports = app;

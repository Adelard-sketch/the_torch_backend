// Vercel serverless function entry point
require('dotenv').config();
const app = require('../src/app');
const connectDB = require('../src/config/db');

// Initialize database connection
let dbInitialized = false;

const initializeDB = async () => {
  if (!dbInitialized) {
    try {
      await connectDB();
      dbInitialized = true;
      console.log('Database initialized for serverless function');
    } catch (error) {
      console.error('Database initialization failed:', error);
    }
  }
};

// Initialize DB on cold start
initializeDB();

// Export the Express app as a serverless function
module.exports = app;

require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// For Vercel serverless deployment
if (process.env.VERCEL) {
  module.exports = app;
} else {
  // Start server for local development
  const server = app.listen(PORT, () => {
    console.log(`The Torch backend running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
  });

  // Graceful shutdown
  process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });

  process.on('SIGINT', () => {
    console.log('SIGINT signal received: closing HTTP server');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  });
}

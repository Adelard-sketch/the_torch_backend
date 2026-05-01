require('dotenv').config();
const app = require('./src/app');
const connectDB = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// Initialize database connection immediately
connectDB().catch(err => {
  console.error('Initial DB connection failed:', err);
});

// Export for Vercel serverless
module.exports = app;

// Only start server if not in Vercel environment
if (!process.env.VERCEL && require.main === module) {
  const server = app.listen(PORT, () => {
    console.log(`The Torch backend running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
  });

  // Graceful shutdown
  const shutdown = () => {
    console.log('Shutting down gracefully...');
    server.close(() => {
      console.log('HTTP server closed');
      process.exit(0);
    });
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

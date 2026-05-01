const cloudinary = require('cloudinary').v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Log configuration status (without exposing secrets)
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('WARNING: Cloudinary environment variables are not fully configured');
  console.error('Missing:', {
    cloud_name: !process.env.CLOUDINARY_CLOUD_NAME,
    api_key: !process.env.CLOUDINARY_API_KEY,
    api_secret: !process.env.CLOUDINARY_API_SECRET
  });
}

module.exports = cloudinary;

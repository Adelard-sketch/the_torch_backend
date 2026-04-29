# File Upload System - Backend Setup Guide

## Overview

This backend now supports complete file upload functionality for:
- User profile pictures
- User cover images
- Product images (single and multiple)
- Message attachments
- General document uploads

All files are received as base64-encoded data from the frontend and stored locally in the `/uploads` directory.

## Installation

No additional dependencies required! The file upload system uses Node.js built-in modules:
- `fs/promises` for file operations
- `path` for file path handling
- `Buffer` for base64 decoding

## Directory Structure

```
back/
├── uploads/
│   ├── profile/        # User profile pictures
│   ├── product/        # Product images
│   ├── message/        # Message attachments
│   ├── document/       # Documents (PDFs, etc.)
│   └── other/          # Other file types
├── src/
│   ├── models/
│   │   ├── File.js     # File metadata model
│   │   ├── User.js     # Updated with profilePicture & coverImage
│   │   ├── Product.js  # Updated with image & images[]
│   │   └── Message.js  # New model with attachments
│   ├── controllers/
│   │   ├── fileController.js    # File upload logic
│   │   ├── userController.js    # Updated with cover image
│   │   └── productController.js # Updated with image support
│   └── routes/
│       ├── files.js    # File upload routes
│       ├── users.js    # Updated with cover image route
│       └── products.js # Existing product routes
```

## API Endpoints

### 1. Generic File Upload
```
POST /api/files/upload
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "userId": "user-id",
  "fileName": "image.jpg",
  "fileSize": 245632,
  "fileType": "image/jpeg",
  "fileData": "base64-encoded-data",
  "purpose": "product",
  "metadata": {
    "productId": "optional-product-id"
  }
}

Response:
{
  "success": true,
  "data": {
    "id": "file-id",
    "fileUrl": "/uploads/product/file-123.jpg",
    "thumbnailUrl": "/uploads/product/file-123.jpg",
    "uploadedAt": "2024-04-28T14:27:38.000Z"
  }
}
```

### 2. Update Profile Picture
```
POST /api/users/:userId/profile-picture
Authorization: Bearer {token}

Body:
{
  "profilePicture": "base64-encoded-data"
}

Response:
{
  "status": 200,
  "message": "Profile picture updated successfully",
  "data": {
    "userId": "user-id",
    "profilePicture": "/uploads/profile/file-123.jpg"
  }
}
```

### 3. Update Cover Image
```
POST /api/users/:userId/cover-image
Authorization: Bearer {token}

Body:
{
  "coverImage": "base64-encoded-data"
}

Response:
{
  "status": 200,
  "message": "Cover image updated successfully",
  "data": {
    "userId": "user-id",
    "coverImage": "/uploads/profile/file-123.jpg"
  }
}
```

### 4. Add Product Image
```
POST /api/files/products/:productId/images
Authorization: Bearer {token}

Body:
{
  "userId": "user-id",
  "fileName": "product.jpg",
  "fileSize": 245632,
  "fileType": "image/jpeg",
  "fileData": "base64-encoded-data"
}

Response:
{
  "success": true,
  "data": {
    "id": "product-id",
    "image": "/uploads/product/file-123.jpg",
    "images": ["/uploads/product/file-123.jpg"],
    "uploadedAt": "2024-04-28T14:27:38.000Z"
  }
}
```

### 5. Get File
```
GET /api/files/:fileId

Response:
{
  "success": true,
  "data": {
    "id": "file-id",
    "fileName": "image.jpg",
    "fileUrl": "/uploads/product/file-123.jpg",
    ...
  }
}
```

### 6. Delete File
```
DELETE /api/files/:fileId
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "File deleted successfully"
}
```

## File Size Limits

- Profile pictures: 5MB
- Product images: 5MB
- Message attachments: 10MB
- Documents: 10MB
- Other: 10MB

## Allowed File Types

### Profile & Product Images
- image/jpeg
- image/png
- image/webp
- image/gif

### Documents
- application/pdf
- application/msword
- application/vnd.openxmlformats-officedocument.wordprocessingml.document

### Message Attachments
- All image types
- application/pdf

## Database Models

### File Model
```javascript
{
  userId: ObjectId,
  fileName: String,
  fileSize: Number,
  fileType: String,
  fileUrl: String,
  thumbnailUrl: String,
  purpose: String, // 'profile' | 'product' | 'message' | 'document' | 'other'
  metadata: Object,
  createdAt: Date,
  updatedAt: Date
}
```

### User Model (Updated)
```javascript
{
  // ... existing fields
  profilePicture: String,
  coverImage: String
}
```

### Product Model (Updated)
```javascript
{
  // ... existing fields
  image: String,
  images: [String]
}
```

### Message Model (New)
```javascript
{
  fromId: ObjectId,
  toId: ObjectId,
  content: String,
  read: Boolean,
  deliveryStatus: String,
  attachments: [{
    id: String,
    fileName: String,
    fileUrl: String,
    fileType: String,
    fileSize: Number
  }],
  sentAt: Date,
  deliveredAt: Date,
  receivedAt: Date,
  readAt: Date
}
```

## Testing

### Test File Upload
```bash
curl -X POST http://localhost:5000/api/files/upload \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "userId": "user-id",
    "fileName": "test.jpg",
    "fileSize": 245632,
    "fileType": "image/jpeg",
    "fileData": "base64-data-here",
    "purpose": "product"
  }'
```

### Test Profile Picture Upload
```bash
curl -X POST http://localhost:5000/api/users/USER_ID/profile-picture \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "profilePicture": "base64-data-here"
  }'
```

## Security Features

✅ File size validation
✅ File type validation
✅ User authentication required
✅ Ownership verification for deletions
✅ Unique file naming to prevent collisions
✅ Directory traversal protection

## Production Considerations

### 1. Use Cloud Storage
For production, replace local file storage with:
- AWS S3
- Azure Blob Storage
- Google Cloud Storage
- Cloudinary

### 2. Image Processing
Install `sharp` for thumbnail generation:
```bash
npm install sharp
```

Then update `fileController.js` to generate thumbnails:
```javascript
const sharp = require('sharp');

// Generate thumbnail
const thumbnail = await sharp(buffer)
  .resize(200, 200, { fit: 'cover' })
  .toBuffer();
```

### 3. CDN Integration
Serve uploaded files through a CDN for better performance.

### 4. Virus Scanning
Integrate antivirus scanning for uploaded files:
```bash
npm install clamav.js
```

### 5. Rate Limiting
Add rate limiting to prevent abuse:
```javascript
const rateLimit = require('express-rate-limit');

const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/files/upload', uploadLimiter);
```

## Environment Variables

Add to `.env`:
```env
# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_DIR=./uploads
FILE_URL_BASE=http://localhost:5000

# For production with cloud storage
AWS_S3_BUCKET=your-bucket-name
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
```

## Troubleshooting

### Issue: "File size exceeds limit"
- Check the file size before upload
- Increase `express.json({ limit: '50mb' })` in app.js if needed

### Issue: "File type not allowed"
- Verify the file MIME type matches allowed types
- Check file extension matches MIME type

### Issue: "Unauthorized"
- Ensure valid JWT token is provided
- Check token expiration

### Issue: "Failed to save file"
- Verify uploads directory exists and is writable
- Check disk space

## Frontend Integration

The frontend is already configured to work with these endpoints. See:
- `src/utils/fileUploadService.ts` - Upload utilities
- `src/components/FileUpload.tsx` - Upload component
- `BACKEND_INTEGRATION.md` - Complete integration guide

## Next Steps

1. ✅ Backend file upload endpoints created
2. ✅ Database models updated
3. ✅ File storage directories created
4. ⏳ Test endpoints with frontend
5. ⏳ Deploy to production
6. ⏳ Integrate cloud storage (optional)
7. ⏳ Add image processing (optional)

## Support

For issues or questions:
- Check `BACKEND_INTEGRATION.md` for frontend integration
- Review error logs in console
- Test endpoints with curl or Postman

---

**Status:** ✅ Ready for Integration
**Last Updated:** April 28, 2026

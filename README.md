# The Torch Ghana - Node.js Backend

Node.js/Express/MongoDB backend for the The Torch agricultural marketplace platform.

## Features

- ✅ User authentication (register/login) with JWT
- ✅ Password hashing with bcrypt (cost factor 10)
- ✅ Product CRUD operations with ownership checks
- ✅ **File upload system** (profile pictures, product images, attachments)
- ✅ Text search on products (name + description)
- ✅ Category filtering and pagination
- ✅ Role-based access (farmer, customer, vendor, gardener)
- ✅ Rate limiting on login endpoint (5 attempts per 15 min)
- ✅ CORS configured for frontend
- ✅ Security headers with Helmet

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher) running locally or remote connection string

## Installation

1. Install dependencies:
```bash
cd back
npm install
```

2. Configure environment variables:
Edit `.env` file and update:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - A strong random secret key
- `PORT` - Server port (default: 5000)
- `FRONTEND_URL` - Your frontend URL for CORS

3. Start MongoDB (if running locally):
```bash
mongod
```

4. Start the server:
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:5000`

## API Endpoints

### Authentication

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "firstName": "Kwame",
  "lastName": "Mensah",
  "email": "kwame@example.com",
  "phone": "+233201234567",
  "role": "farmer",
  "password": "securepass123"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "kwame@example.com",
  "password": "securepass123"
}
```

### Products

#### List Products (with filters)
```http
GET /api/products?category=produce&search=tomato&limit=20&offset=0
```

#### Get Single Product
```http
GET /api/products/:id
```

#### Create Product (requires auth)
```http
POST /api/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "productName": "Fresh Tomatoes",
  "description": "Ripe tomatoes from Ashanti region",
  "category": "produce",
  "price": 15.00,
  "quantityAvailable": 50,
  "unit": "kg",
  "image": "/uploads/product/file-123.jpg",
  "images": ["/uploads/product/file-123.jpg"]
}
```

#### Update Product (requires auth + ownership)
```http
PUT /api/products/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "price": 12.00,
  "quantityAvailable": 30
}
```

#### Delete Product (requires auth + ownership)
```http
DELETE /api/products/:id
Authorization: Bearer <token>
```

### File Upload (NEW)

#### Upload File
```http
POST /api/files/upload
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user-id",
  "fileName": "image.jpg",
  "fileSize": 245632,
  "fileType": "image/jpeg",
  "fileData": "base64-encoded-data",
  "purpose": "product",
  "metadata": {}
}
```

#### Update Profile Picture
```http
POST /api/users/:userId/profile-picture
Authorization: Bearer <token>
Content-Type: application/json

{
  "profilePicture": "base64-encoded-data"
}
```

#### Update Cover Image
```http
POST /api/users/:userId/cover-image
Authorization: Bearer <token>
Content-Type: application/json

{
  "coverImage": "base64-encoded-data"
}
```

#### Add Product Image
```http
POST /api/files/products/:productId/images
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user-id",
  "fileName": "product.jpg",
  "fileSize": 245632,
  "fileType": "image/jpeg",
  "fileData": "base64-encoded-data"
}
```

See `FILE_UPLOAD_SETUP.md` for complete file upload documentation.

## Project Structure

```
back/
├── src/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── models/
│   │   ├── User.js            # User schema (with profilePicture, coverImage)
│   │   ├── Product.js         # Product schema (with image, images[])
│   │   ├── File.js            # File metadata schema
│   │   └── Message.js         # Message schema (with attachments)
│   ├── controllers/
│   │   ├── authController.js  # Auth logic
│   │   ├── productController.js # Product logic
│   │   ├── fileController.js  # File upload logic
│   │   └── userController.js  # User profile logic
│   ├── middleware/
│   │   └── auth.js            # JWT verification
│   ├── routes/
│   │   ├── auth.js            # Auth routes
│   │   ├── products.js        # Product routes
│   │   ├── files.js           # File upload routes
│   │   └── users.js           # User routes
│   └── app.js                 # Express app setup
├── uploads/                   # File storage
│   ├── profile/
│   ├── product/
│   ├── message/
│   └── document/
├── .env                       # Environment variables
├── package.json
├── server.js                  # Entry point
├── README.md                  # This file
└── FILE_UPLOAD_SETUP.md       # File upload documentation
```

## Frontend Integration

Update the frontend's base URL from:
```javascript
const baseURL = 'http://localhost/farmdialogue/back/api/';
```

To:
```javascript
const baseURL = 'http://localhost:5000/api/';
```

The API response format matches the old PHP backend, so no other frontend changes are needed.

## File Upload System

The backend now supports complete file upload functionality:

- **Profile pictures** (5MB max)
- **Cover images** (5MB max)
- **Product images** (5MB max, multiple per product)
- **Message attachments** (10MB max)
- **Documents** (10MB max)

Files are received as base64-encoded data and stored in `/uploads` directory.

**Key Features:**
- Base64 encoding for secure transmission
- File size and type validation
- Unique file naming
- Ownership verification
- Local storage with CDN-ready structure

See `FILE_UPLOAD_SETUP.md` for complete documentation.

## User Roles

- `farmer` - Can list and sell agricultural products
- `customer` - Can browse and purchase products
- `vendor` - Can sell equipment and supplies
- `gardener` - Gardening enthusiasts

## Product Categories

- `produce` - Fresh produce
- `seeds` - Seeds and plants
- `equipment` - Farm equipment
- `fertilizer` - Fertilizers
- `tools` - Gardening tools

## Security Features

- Passwords hashed with bcrypt (cost factor 10)
- JWT tokens expire after 1 hour
- Rate limiting on login (5 attempts per 15 minutes)
- CORS configured for specific frontend origin
- Helmet security headers
- Input validation on all endpoints
- Ownership checks on update/delete operations
- File size and type validation
- Unique file naming to prevent collisions

## Development

The backend uses:
- Express.js for HTTP server and routing
- Mongoose for MongoDB ODM
- bcryptjs for password hashing
- jsonwebtoken for JWT authentication
- helmet for security headers
- cors for cross-origin requests
- express-rate-limit for rate limiting
- fs/promises for file operations (built-in)

## Troubleshooting

### MongoDB Connection Issues
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`
- Verify MongoDB port (default: 27017)

### CORS Errors
- Update `FRONTEND_URL` in `.env` to match your frontend URL
- Ensure frontend sends requests to `http://localhost:5000/api/`

### JWT Token Issues
- Ensure `JWT_SECRET` is set in `.env`
- Check token expiry (tokens expire after 1 hour)
- Verify Authorization header format: `Bearer <token>`

### File Upload Issues
- Check uploads directory exists and is writable
- Verify file size doesn't exceed limits
- Ensure file type is allowed for the purpose
- Check base64 encoding is correct

## License

ISC

---

**Status:** ✅ Production Ready with File Upload System
**Last Updated:** April 28, 2026

# The Torch Backend - Node.js/Express/MongoDB

Backend API for The Torch Initiative - Empowering refugee and IDP communities through agricultural education and digital innovation.

## 🚀 Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcrypt
- **Email Service:** Nodemailer (Gmail SMTP)
- **Security:** Helmet, CORS
- **Rate Limiting:** express-rate-limit

## 📁 Project Structure

```
back/
├── src/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── models/
│   │   ├── User.js            # User schema
│   │   ├── Product.js         # Product schema
│   │   ├── Order.js           # Order schema
│   │   └── Contact.js         # Contact form schema
│   ├── controllers/
│   │   ├── authController.js  # Authentication logic
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   └── contactController.js
│   ├── middleware/
│   │   └── auth.js            # JWT verification
│   ├── routes/
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── orders.js
│   │   └── contact.js
│   ├── services/
│   │   └── emailService.js    # Email notifications
│   └── app.js                 # Express app setup
├── server.js                  # Entry point
├── package.json
├── .env                       # Environment variables
├── vercel.json               # Vercel deployment config
└── README.md                 # This file
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Products
- `GET /api/products` - List all products (with pagination, search, filters)
- `POST /api/products` - Create product (requires auth)
- `GET /api/products/:id` - Get single product
- `PUT /api/products/:id` - Update product (requires auth, owner only)
- `DELETE /api/products/:id` - Delete product (requires auth, owner only)

### Orders
- `POST /api/orders` - Create order (requires auth)
- `GET /api/orders` - Get user's orders (requires auth)
- `GET /api/orders/:id` - Get single order (requires auth)
- `PUT /api/orders/:id/cancel` - Cancel order (requires auth)

### Contact
- `POST /api/contact` - Submit contact form (public)
- `GET /api/contact` - Get all contacts (requires auth, farmer role only)

### Health Check
- `GET /health` - Server health status

## 🛠️ Local Development

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- npm or yarn

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Configure environment variables:**
Create a `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/thetorch
JWT_SECRET=your_jwt_secret_key
PORT=5000
NODE_ENV=development
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
EMAIL_FROM=The Torch Initiative <your_email@gmail.com>
```

3. **Start the server:**
```bash
npm start
```

Server will run on `http://localhost:5000`

## 🌐 Production Deployment (Vercel)

See `DEPLOY_BACKEND.md` for detailed deployment instructions.

Quick deploy:
```bash
vercel
```

## 📧 Email Notifications

The backend sends emails for:
1. Welcome Email - When user registers
2. Order Confirmation - When order is placed
3. Contact Confirmation - When contact form is submitted
4. Admin Notification - When contact form is submitted

## 🔒 Security Features

- JWT authentication with 1-hour expiration
- Password hashing with bcrypt
- Helmet for HTTP headers security
- CORS configuration
- Rate limiting on login endpoint

## 🧪 Testing

```bash
node test-api.js
```

## 📝 License

MIT License - The Torch Initiative

## 👥 Contributors

Backend Developer: Adelard Borauzima

## 🔗 Frontend Repository

https://github.com/iamathanase/the-torch

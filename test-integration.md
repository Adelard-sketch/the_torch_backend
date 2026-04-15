# The Torch - Frontend & Backend Integration Test

## Backend Status
✅ Server running on: http://localhost:5000
✅ Database: MongoDB (thetorch)
✅ Environment: development

## API Endpoints Available

### Authentication
- POST `/api/auth/register` - User registration
- POST `/api/auth/login` - User login

### Products
- GET `/api/products` - List all products (with pagination, search, filters)
- POST `/api/products` - Create product (requires auth)
- GET `/api/products/:id` - Get single product
- PUT `/api/products/:id` - Update product (requires auth, owner only)
- DELETE `/api/products/:id` - Delete product (requires auth, owner only)

### Orders
- POST `/api/orders` - Create order (requires auth)
- GET `/api/orders` - Get user's orders (requires auth)
- GET `/api/orders/:id` - Get single order (requires auth)
- PUT `/api/orders/:id/cancel` - Cancel order (requires auth)

### Contact
- POST `/api/contact` - Submit contact form (public)
- GET `/api/contact` - Get all contacts (requires auth, farmer role only)

## Frontend Pages

### Public Pages
- `/index.html` - Homepage
- `/pages/about.html` - About page
- `/pages/products.html` - Products marketplace
- `/pages/learning.html` - Learning resources
- `/pages/contact.html` - Contact form
- `/pages/login.html` - Login page
- `/pages/register.html` - Registration page

### Protected Pages
- `/pages/dashboard.html` - User dashboard (requires login)

## Integration Points

### 1. Registration Flow
- Frontend: `register.html` → `handleRegister()` in script.js
- API: POST `http://localhost:5000/api/auth/register`
- Response: User created, welcome email sent
- Redirect: → `login.html`

### 2. Login Flow
- Frontend: `login.html` → `handleLogin()` in script.js
- API: POST `http://localhost:5000/api/auth/login`
- Response: JWT token, userId, userRole
- Storage: localStorage (authToken, userId, userRole)
- Redirect: → `dashboard.html`

### 3. Contact Form
- Frontend: `contact.html` → `handleContactForm()` in script.js
- API: POST `http://localhost:5000/api/contact`
- Response: Contact saved, emails sent (user confirmation + admin notification)

### 4. Dashboard
- Frontend: `dashboard.html`
- Auth Check: Validates localStorage.authToken
- Displays: User stats, orders, quick actions

## Email Notifications

All emails sent from: **The Torch Initiative <adelardborauzima7@gmail.com>**

1. **Welcome Email** - Sent on registration
2. **Order Confirmation** - Sent when order is placed
3. **Contact Confirmation** - Sent to user who submits contact form
4. **Admin Notification** - Sent to admin when contact form is submitted

## Testing Checklist

### Backend Tests
- [x] Health endpoint responding
- [x] MongoDB connected
- [x] All routes mounted
- [x] CORS configured for localhost:5500
- [x] Email service configured

### Frontend Tests
- [ ] Register new user
- [ ] Login with credentials
- [ ] Access dashboard
- [ ] Submit contact form
- [ ] View products
- [ ] Logout

### Integration Tests
- [ ] Registration → Welcome email received
- [ ] Login → Token stored → Dashboard accessible
- [ ] Contact form → Confirmation email + Admin notification
- [ ] Protected routes redirect to login when not authenticated

## Known Configuration

### CORS Origins Allowed
- `http://localhost:5500` (Live Server)
- `http://127.0.0.1:5500`
- `http://localhost:3000`
- `null` (file:// protocol for local development)

### Database
- Name: `thetorch`
- Collections: users, products, orders, contacts

### JWT
- Expiration: 1 hour
- Stored in: localStorage as 'authToken'

## How to Test

1. **Start Backend:**
   ```bash
   cd back
   npm start
   ```

2. **Start Frontend:**
   - Open `front/index.html` with Live Server (port 5500)
   - Or use any local server on port 5500

3. **Test Registration:**
   - Go to http://localhost:5500/pages/register.html
   - Fill form and submit
   - Check email for welcome message
   - Should redirect to login

4. **Test Login:**
   - Go to http://localhost:5500/pages/login.html
   - Use registered credentials
   - Should redirect to dashboard

5. **Test Contact Form:**
   - Go to http://localhost:5500/pages/contact.html
   - Fill and submit form
   - Check email for confirmation
   - Admin should receive notification

## Troubleshooting

### CORS Errors
- Ensure backend is running on port 5000
- Ensure frontend is on port 5500
- Check browser console for specific CORS messages

### Login Not Working
- Check browser console for errors
- Verify API URL is `http://localhost:5000/api/auth/login`
- Check if MongoDB is running
- Verify user exists in database

### Emails Not Sending
- Check `.env` file has correct email credentials
- Verify nodemailer configuration
- Check backend console for email errors

### Dashboard Not Loading
- Check if authToken exists in localStorage
- Verify token is valid (not expired)
- Check if user is redirected to login page

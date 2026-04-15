# Deploy Backend Separately to Vercel

## Quick Deploy Steps

### 1. Setup MongoDB Atlas
1. Go to https://cloud.mongodb.com
2. Your project: "The Torch"
3. Your credentials:
   - Username: `adelborauzima_db_user`
   - Password: `IqUFSqQO8CDfUqdq`
4. Connection string:
   ```
   mongodb+srv://adelborauzima_db_user:IqUFSqQO8CDfUqdq@cluster0.9o4elub.mongodb.net/thetorch?retryWrites=true&w=majority
   ```

### 2. Deploy Backend to Vercel

**Option A: Using Vercel Dashboard**

1. Go to https://vercel.com
2. Click "Add New" → "Project"
3. Import: `iamathanase/the-torch`
4. **Important:** Set Root Directory to `back`
5. Framework Preset: Other
6. Build Command: (leave empty)
7. Output Directory: (leave empty)
8. Add Environment Variables:

```env
MONGODB_URI=mongodb+srv://adelborauzima_db_user:IqUFSqQO8CDfUqdq@cluster0.9o4elub.mongodb.net/thetorch?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_12345
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-url.vercel.app
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=adelardborauzima7@gmail.com
EMAIL_PASSWORD=xiip npht njtv mlre
EMAIL_FROM=The Torch Initiative <adelardborauzima7@gmail.com>
```

9. Click "Deploy"
10. Your backend will be at: `https://the-torch-backend-xxx.vercel.app`

**Option B: Using Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Go to backend folder
cd back

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Y
# - Which scope? Select your account
# - Link to existing project? N
# - Project name? the-torch-backend
# - Directory? ./ (current directory)
# - Override settings? N

# Add environment variables
vercel env add MONGODB_URI
# Paste: mongodb+srv://adelborauzima_db_user:IqUFSqQO8CDfUqdq@cluster0.9o4elub.mongodb.net/thetorch?retryWrites=true&w=majority

vercel env add JWT_SECRET
# Enter: your_super_secret_jwt_key_change_this_in_production_12345

vercel env add NODE_ENV
# Enter: production

vercel env add EMAIL_HOST
# Enter: smtp.gmail.com

vercel env add EMAIL_PORT
# Enter: 587

vercel env add EMAIL_USER
# Enter: adelardborauzima7@gmail.com

vercel env add EMAIL_PASSWORD
# Enter: xiip npht njtv mlre

vercel env add EMAIL_FROM
# Enter: The Torch Initiative <adelardborauzima7@gmail.com>

# Deploy to production
vercel --prod
```

### 3. Test Your Backend

```bash
# Test health endpoint
curl https://your-backend.vercel.app/health

# Should return:
# {"status":"ok","message":"The Torch backend is running","timestamp":"..."}

# Test registration
curl -X POST https://your-backend.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "Test",
    "lastName": "User",
    "email": "test@example.com",
    "phone": "+256123456789",
    "role": "customer",
    "password": "password123"
  }'
```

### 4. Update Frontend to Use Backend URL

Once backend is deployed, update the frontend to use your backend URL.

**Frontend is deployed separately, so you'll need to:**
1. Get your backend URL: `https://the-torch-backend-xxx.vercel.app`
2. Update CORS in backend to allow frontend domain
3. Frontend will make API calls to your backend URL

### 5. Update CORS for Production

After deploying, update `back/src/app.js` to allow your frontend domain:

```javascript
const allowedOrigins = [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'https://your-frontend-domain.vercel.app',  // Add your frontend URL
  'null'
];
```

Then redeploy:
```bash
cd back
vercel --prod
```

## Separate Deployments

**Frontend:** Deployed from root with `vercel.json` (frontend only)
- URL: `https://the-torch-frontend.vercel.app`
- Serves static files from `front/` folder

**Backend:** Deployed from `back/` folder with `back/vercel.json`
- URL: `https://the-torch-backend.vercel.app`
- Serves API at `/api/*` routes

## Benefits of Separate Deployment

✅ Frontend and backend can be updated independently
✅ Different scaling configurations
✅ Clearer separation of concerns
✅ Can use different domains/subdomains

## Troubleshooting

### CORS Errors
Add your frontend domain to `allowedOrigins` in `back/src/app.js`

### MongoDB Connection Failed
- Check MongoDB Atlas IP whitelist (0.0.0.0/0)
- Verify connection string in environment variables
- Check database user permissions

### Environment Variables Not Working
- Set them in Vercel Dashboard → Project → Settings → Environment Variables
- Redeploy after adding variables

## Monitoring

View logs:
- Vercel Dashboard → Your Project → Deployments → Click deployment → Functions tab
- Or use CLI: `vercel logs`

## Cost

- Vercel: FREE (Hobby plan)
- MongoDB Atlas: FREE (M0 Sandbox)
- Total: $0/month

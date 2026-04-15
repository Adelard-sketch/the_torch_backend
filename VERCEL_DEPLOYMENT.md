# Deploying The Torch Backend to Vercel

## Overview
This guide explains how to deploy only the backend (Node.js/Express) to Vercel while keeping the frontend separate.

## Project Structure
```
FarmDialogue/
├── back/           # Backend (will be deployed to Vercel)
│   ├── server.js
│   ├── src/
│   └── package.json
├── front/          # Frontend (ignored by Vercel)
└── vercel.json     # Vercel configuration
```

## Prerequisites
1. Vercel account (sign up at https://vercel.com)
2. Vercel CLI installed: `npm install -g vercel`
3. MongoDB Atlas account (for production database)

## Step 1: Set Up MongoDB Atlas

1. Go to https://www.mongodb.com/cloud/atlas
2. Create a free cluster
3. Create a database user
4. Whitelist all IPs (0.0.0.0/0) for Vercel
5. Get your connection string:
   ```
   mongodb+srv://<username>:<password>@cluster.mongodb.net/thetorch
   ```

## Step 2: Configure Environment Variables

In your Vercel project dashboard, add these environment variables:

```env
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/thetorch
JWT_SECRET=your_strong_jwt_secret_here_change_this
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=adelardborauzima7@gmail.com
EMAIL_PASSWORD=xiip npht njtv mlre
EMAIL_FROM=The Torch Initiative <adelardborauzima7@gmail.com>
```

## Step 3: Deploy to Vercel

### Option A: Using Vercel CLI

1. Login to Vercel:
   ```bash
   vercel login
   ```

2. Deploy from project root:
   ```bash
   vercel
   ```

3. Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N**
   - Project name? **the-torch-backend**
   - Directory? **./back** (or just press Enter)
   - Override settings? **N**

4. For production deployment:
   ```bash
   vercel --prod
   ```

### Option B: Using Vercel Dashboard

1. Go to https://vercel.com/new
2. Import your Git repository
3. Configure project:
   - **Framework Preset:** Other
   - **Root Directory:** Leave as is (vercel.json handles this)
   - **Build Command:** Leave empty
   - **Output Directory:** Leave empty
4. Add environment variables (see Step 2)
5. Click "Deploy"

## Step 4: Update Frontend API URLs

After deployment, update your frontend to use the Vercel backend URL:

In `front/assets/js/script.js`:
```javascript
// Change from:
const baseURL = 'http://localhost:5000/api/';

// To:
const baseURL = 'https://your-backend.vercel.app/api/';
```

Also update in:
- `front/pages/register.html`
- `front/assets/js/script.js` (handleContactForm)

## Step 5: Configure CORS

Update `back/src/app.js` to allow your frontend domain:

```javascript
const allowedOrigins = [
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'https://your-frontend-domain.com',  // Add your frontend URL
  'null'
];
```

## Vercel Configuration Explained

### vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "back/server.js",      // Entry point
      "use": "@vercel/node"          // Node.js runtime
    }
  ],
  "routes": [
    {
      "src": "/(.*)",                // All routes
      "dest": "back/server.js"       // Go to server.js
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### .vercelignore
Excludes frontend and unnecessary files from deployment:
- `front/` - Frontend folder
- `.kiro/` - Spec files
- Test files and documentation

## Testing Your Deployment

1. Check health endpoint:
   ```bash
   curl https://your-backend.vercel.app/health
   ```

2. Test registration:
   ```bash
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

## Common Issues & Solutions

### Issue: "Cannot find module"
**Solution:** Make sure all dependencies are in `back/package.json` and committed to Git.

### Issue: MongoDB connection timeout
**Solution:** 
- Check MongoDB Atlas IP whitelist (should include 0.0.0.0/0)
- Verify connection string in environment variables
- Ensure database user has correct permissions

### Issue: CORS errors
**Solution:** Add your frontend domain to `allowedOrigins` in `back/src/app.js`

### Issue: Environment variables not working
**Solution:** 
- Set them in Vercel dashboard under Project Settings > Environment Variables
- Redeploy after adding variables

## Deployment Checklist

- [ ] MongoDB Atlas cluster created
- [ ] Database user created with password
- [ ] IP whitelist configured (0.0.0.0/0)
- [ ] Environment variables set in Vercel
- [ ] vercel.json configured
- [ ] .vercelignore updated
- [ ] Backend deployed successfully
- [ ] Health endpoint responding
- [ ] Frontend API URLs updated
- [ ] CORS configured for frontend domain
- [ ] Test registration and login
- [ ] Test email sending

## Monitoring & Logs

View logs in Vercel dashboard:
1. Go to your project
2. Click on a deployment
3. Click "Functions" tab
4. View logs for debugging

## Updating Your Deployment

To deploy updates:
```bash
git add .
git commit -m "Update backend"
git push
```

Vercel will automatically redeploy on push (if connected to Git).

Or manually:
```bash
vercel --prod
```

## Alternative: Deploy Frontend Separately

You can deploy the frontend to:
- **Vercel:** Create a separate project for `front/` folder
- **Netlify:** Drag and drop `front/` folder
- **GitHub Pages:** Push `front/` to gh-pages branch
- **Firebase Hosting:** Use Firebase CLI

Then update the backend CORS to allow the frontend domain.

## Support

For issues:
- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas Docs: https://docs.atlas.mongodb.com/
- Check Vercel deployment logs for errors

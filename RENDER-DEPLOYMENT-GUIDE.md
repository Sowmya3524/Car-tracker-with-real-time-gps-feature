# 🚀 Render Deployment Guide for Backend

This guide will help you deploy your backend server on Render.

## 📋 Prerequisites

1. **Render Account**: Sign up at [render.com](https://render.com) (free tier available)
2. **GitHub Account**: Your code should be in a GitHub repository
3. **Node.js**: Your project should have `package.json` with dependencies

## 📁 Files Required

Make sure these files are in your repository:
- ✅ `backend-example.js` (or rename to `server.js`)
- ✅ `package.json`
- ✅ `hyderabad-locations.json`
- ✅ `hyderabad-metro-stations.json`
- ✅ `search-history.json` (will be created automatically)

## 🔧 Step 1: Prepare Your Backend

### Option A: Use existing `backend-example.js`

The file is already configured to use `process.env.PORT` which works with Render.

### Option B: Rename to `server.js` (Recommended)

1. Rename `backend-example.js` to `server.js`
2. Update `package.json`:
   ```json
   {
     "main": "server.js",
     "scripts": {
       "start": "node server.js"
     }
   }
   ```

## 🚀 Step 2: Deploy on Render

### 2.1 Create a New Web Service

1. **Login to Render**: Go to [dashboard.render.com](https://dashboard.render.com)
2. **Click "New +"** → Select **"Web Service"**
3. **Connect Repository**:
   - If using GitHub: Click "Connect GitHub"
   - Authorize Render to access your repositories
   - Select your repository

### 2.2 Configure Your Service

Fill in the following details:

**Basic Settings:**
- **Name**: `hyderabad-location-backend` (or any name you prefer)
- **Region**: Choose closest to you (e.g., `Oregon (US West)`)
- **Branch**: `main` (or your default branch)
- **Root Directory**: Leave empty (or specify if your backend is in a subfolder)

**Build & Deploy:**
- **Runtime**: `Node`
- **Build Command**: `npm install` (or leave empty, Render auto-detects)
- **Start Command**: `npm start` (or `node backend-example.js`)

**Environment:**
- **Environment Variables**: (Optional - not needed for basic setup)
  - `NODE_ENV=production`

### 2.3 Advanced Settings (Optional)

**Health Check Path:**
- Leave empty or use: `/api/locations`

**Auto-Deploy:**
- ✅ Enable "Auto-Deploy" (deploys on every push to main branch)

### 2.4 Create Service

Click **"Create Web Service"**

## ⏳ Step 3: Wait for Deployment

1. Render will:
   - Clone your repository
   - Run `npm install`
   - Start your server with `npm start`
2. **Watch the logs** - You'll see:
   ```
   Loaded X Hyderabad locations
   Server running on http://localhost:PORT
   ```
3. **Get your URL**: Render will provide a URL like:
   ```
   https://your-app-name.onrender.com
   ```

## 🔗 Step 4: Update Frontend to Use Backend

Once deployed, update your frontend to use the Render backend URL:

### Option A: Update `location-search.js`

Find the API calls and update the base URL:

```javascript
// Change from:
const response = await fetch('/api/history', { ... });

// To:
const response = await fetch('https://your-app-name.onrender.com/api/history', { ... });
```

### Option B: Use Environment Variable (Better)

Create a config file:

```javascript
// config.js
const API_BASE_URL = window.location.hostname === 'localhost' 
    ? 'http://localhost:3000'  // Local development
    : 'https://your-app-name.onrender.com';  // Production

// Then use:
const response = await fetch(`${API_BASE_URL}/api/history`, { ... });
```

## 📝 Step 5: Test Your Deployment

1. **Test API Endpoints**:
   - `https://your-app-name.onrender.com/api/locations`
   - `https://your-app-name.onrender.com/api/history`
   - `https://your-app-name.onrender.com/location-search.html`

2. **Check Logs**:
   - Go to Render Dashboard → Your Service → Logs
   - Check for any errors

## 🐛 Troubleshooting

### Issue: "Build failed"
**Solution**: 
- Check that `package.json` exists
- Verify all dependencies are listed
- Check build logs for specific errors

### Issue: "Service crashed"
**Solution**:
- Check logs in Render dashboard
- Verify `PORT` is using `process.env.PORT`
- Ensure all JSON files are in the repository

### Issue: "502 Bad Gateway"
**Solution**:
- Check if server is starting correctly
- Verify start command in Render settings
- Check server logs

### Issue: "CORS errors"
**Solution**:
- Backend already has CORS enabled
- If still issues, check CORS settings in `backend-example.js`

## 🔄 Updating Your Deployment

Every time you push to your GitHub repository:
1. Render automatically detects changes
2. Runs build command
3. Restarts the service
4. Your changes go live!

## 💰 Free Tier Limitations

Render's free tier:
- ✅ Free SSL certificate
- ✅ Automatic deployments
- ⚠️ Services spin down after 15 minutes of inactivity
- ⚠️ First request after spin-down may take 30-60 seconds
- ⚠️ 750 hours/month free (enough for 24/7 if you have 1 service)

## 📚 Additional Resources

- [Render Documentation](https://render.com/docs)
- [Node.js on Render](https://render.com/docs/node)
- [Environment Variables](https://render.com/docs/environment-variables)

## ✅ Deployment Checklist

- [ ] Backend code uses `process.env.PORT`
- [ ] `package.json` has correct start script
- [ ] All JSON files are in repository
- [ ] GitHub repository is connected
- [ ] Service is created on Render
- [ ] Build completes successfully
- [ ] Service is running (green status)
- [ ] API endpoints are accessible
- [ ] Frontend is updated with backend URL

## 🎉 You're Done!

Your backend is now live on Render! 🚀

Your backend URL: `https://your-app-name.onrender.com`

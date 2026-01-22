# 🚀 Netlify Deployment Guide

This guide will help you deploy your Hyderabad Location Search website to Netlify.

## 📋 Prerequisites

- A Netlify account (free at [netlify.com](https://www.netlify.com))
- Your project files ready to deploy

## 🎯 Method 1: Drag and Drop (Easiest - Recommended for First Time)

This is the quickest way to deploy if you're new to Netlify:

### Steps:

1. **Create a Netlify Account**
   - Go to [https://app.netlify.com](https://app.netlify.com)
   - Sign up for a free account (GitHub, Google, or Email)

2. **Prepare Your Files**
   - Make sure all your files are in one folder:
     - `location-search.html`
     - `location-search.css`
     - `location-search.js`
     - `hyderabad-locations.json`
     - `hyderabad-metro-stations.json`
     - `search-history.json` (optional, can be empty initially)
     - `netlify.toml` (this file)

3. **Deploy**
   - Go to Netlify dashboard
   - Click **"Add new site"** → **"Deploy manually"**
   - Drag and drop your entire project folder into the drop zone
   - Wait for deployment to complete (usually 30-60 seconds)

4. **Get Your Live URL**
   - Netlify will give you a URL like: `https://random-name-123456.netlify.app`
   - Your site is now live! 🎉

---

## 🔗 Method 2: Git Integration (Recommended for Updates)

This method is better if you want to update your site automatically:

### Steps:

1. **Create a GitHub Repository**
   - Create a new repository on GitHub
   - Push your project files to GitHub

2. **Connect to Netlify**
   - Go to Netlify dashboard
   - Click **"Add new site"** → **"Import an existing project"**
   - Select **"GitHub"** and authorize Netlify
   - Choose your repository

3. **Configure Build Settings**
   - Build command: Leave empty (no build needed)
   - Publish directory: `.` (current directory)
   - Click **"Deploy site"**

4. **Automatic Deployments**
   - Every time you push to GitHub, Netlify will automatically redeploy your site!

---

## 💻 Method 3: Netlify CLI (For Developers)

Use the command line for more control:

### Installation:

```bash
# Install Netlify CLI globally
npm install -g netlify-cli
```

### Deployment:

```bash
# Navigate to your project folder
cd "C:\Raam Groups - Intern\Test drive vehicles"

# Login to Netlify
netlify login

# Initialize and deploy
netlify deploy

# For production deployment (live site)
netlify deploy --prod
```

---

## ⚙️ Configuration Options

### Custom Domain (Optional)

1. Go to your site settings in Netlify
2. Click **"Domain settings"**
3. Click **"Add custom domain"**
4. Follow the instructions to connect your domain

### Environment Variables (If Needed)

If you ever need to add API keys (though you don't need any for this project):
1. Go to **Site settings** → **Build & deploy** → **Environment**
2. Add any variables you need

---

## 📁 What Files to Deploy

**Required Files:**
- ✅ `location-search.html` (main page)
- ✅ `location-search.css` (styling)
- ✅ `location-search.js` (functionality)
- ✅ `hyderabad-locations.json` (location data)
- ✅ `hyderabad-metro-stations.json` (metro data)
- ✅ `netlify.toml` (configuration)

**Optional Files:**
- `search-history.json` (can be empty or start fresh)
- `README.md` or documentation files

**Don't Deploy:**
- ❌ `node_modules/` (if you have any)
- ❌ `backend-example.js` (this is for local testing)
- ❌ `.git/` folder (Git manages this)

---

## 🔧 Troubleshooting

### Issue: Site shows 404 error
**Solution:** Make sure `location-search.html` is in the root folder, and check that `netlify.toml` is configured correctly.

### Issue: JSON files not loading
**Solution:** Check browser console for CORS errors. Netlify serves files from the same domain, so this shouldn't be an issue. Make sure file paths are correct.

### Issue: Map not showing
**Solution:** 
- Check that external CDN links (Leaflet.js) are loading
- Check browser console for errors
- Make sure HTTPS is enabled (Netlify uses HTTPS by default)

### Issue: Search history not saving
**Solution:** This is expected - `search-history.json` is stored locally in the browser, not on the server. If you want persistent history, you'd need a backend (like the `backend-example.js`).

---

## ✅ After Deployment

1. **Test Your Site**
   - Visit your Netlify URL
   - Test location search
   - Test map display
   - Test directions functionality

2. **Share Your Site**
   - Share your Netlify URL with others
   - The site is live and accessible worldwide!

3. **Update Your Site**
   - Edit files locally
   - If using Git: push to GitHub (auto-deploys)
   - If using drag-drop: redeploy manually
   - If using CLI: run `netlify deploy --prod`

---

## 🎉 You're Done!

Your Hyderabad Location Search website is now live on Netlify!

**Example URL:** `https://your-site-name.netlify.app`

Need help? Check Netlify's documentation: [https://docs.netlify.com](https://docs.netlify.com)

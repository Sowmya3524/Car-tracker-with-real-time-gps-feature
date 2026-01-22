# 🌐 GitHub Pages Deployment Guide for Frontend

This guide will help you deploy your frontend on GitHub Pages.

## 📋 Prerequisites

1. **GitHub Account**: You need a GitHub account
2. **Repository**: Your code should be in a GitHub repository
3. **Backend URL**: Your backend should be deployed on Render (or another service)

## 🚀 Step 1: Prepare Your Repository

### 1.1 Push Your Code to GitHub

If you haven't already:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Location Search App"

# Add remote (replace with your GitHub repo URL)
git remote add origin https://github.com/your-username/your-repo-name.git

# Push to GitHub
git push -u origin main
```

### 1.2 Enable GitHub Pages

1. Go to your GitHub repository
2. Click **"Settings"** tab
3. Scroll down to **"Pages"** section (left sidebar)
4. Under **"Source"**, select:
   - **Branch**: `main` (or `master`)
   - **Folder**: `/ (root)` or `/docs` (if you use docs folder)
5. Click **"Save"**
6. GitHub will provide your site URL:
   ```
   https://your-username.github.io/your-repo-name/
   ```

## 🔧 Step 2: Update Frontend for Production

### 2.1 Create Config File

Create a `config.js` file to handle different environments:

```javascript
// config.js
const CONFIG = {
    // Backend URL - Change this to your Render backend URL
    API_BASE_URL: 'https://your-app-name.onrender.com',
    
    // Or use environment detection:
    // API_BASE_URL: window.location.hostname === 'localhost' 
    //     ? 'http://localhost:3000'
    //     : 'https://your-app-name.onrender.com'
};

// Make it globally available
window.CONFIG = CONFIG;
```

### 2.2 Update HTML to Include Config

Add to `location-search.html` before the main script:

```html
<script src="config.js"></script>
<script src="location-search.js"></script>
```

### 2.3 Update JavaScript to Use Config

Update API calls in `location-search.js` to use the config:

```javascript
// Instead of:
fetch('/api/history', ...)

// Use:
fetch(`${window.CONFIG.API_BASE_URL}/api/history`, ...)
```

## 📁 Step 3: File Structure

Your repository should look like this:

```
your-repo/
├── location-search.html
├── location-search.js
├── location-search.css
├── config.js              ← New file
├── hyderabad-locations.json
├── hyderabad-metro-stations.json
├── README.md
└── .gitignore
```

## 🎯 Step 4: Test Locally First

1. Update `config.js` with your Render backend URL
2. Test locally:
   ```bash
   python -m http.server 8000
   ```
3. Visit: `http://localhost:8000/location-search.html`
4. Test that API calls work with your Render backend

## 🚀 Step 5: Deploy to GitHub Pages

### Option A: Automatic (Recommended)

1. **Push your changes**:
   ```bash
   git add .
   git commit -m "Add config for GitHub Pages deployment"
   git push origin main
   ```

2. **GitHub Pages auto-deploys**:
   - Wait 1-2 minutes
   - Your site will be live at: `https://your-username.github.io/your-repo-name/`

### Option B: Manual

1. Go to repository **Settings** → **Pages**
2. Select branch and folder
3. Click **Save**
4. Wait for deployment

## 🔗 Step 6: Update Backend CORS (If Needed)

If you get CORS errors, update `backend-example.js`:

```javascript
app.use(cors({
    origin: [
        'http://localhost:8000',
        'https://your-username.github.io',
        'https://your-username.github.io/your-repo-name'
    ],
    credentials: true
}));
```

Or allow all origins (for development):

```javascript
app.use(cors({
    origin: '*',
    credentials: true
}));
```

## ✅ Step 7: Verify Deployment

1. Visit your GitHub Pages URL
2. Test the location search
3. Check browser console (F12) for errors
4. Verify API calls are going to your Render backend

## 🔄 Updating Your Site

Every time you push to GitHub:

1. Make changes locally
2. Commit and push:
   ```bash
   git add .
   git commit -m "Update frontend"
   git push origin main
   ```
3. GitHub Pages automatically rebuilds (takes 1-2 minutes)
4. Your changes go live!

## 🐛 Troubleshooting

### Issue: "404 Not Found"
**Solution**: 
- Check that `location-search.html` is in the root folder
- Verify GitHub Pages is enabled in Settings
- Check the branch/folder settings

### Issue: "CORS errors"
**Solution**:
- Update backend CORS settings (see Step 6)
- Check that backend URL in `config.js` is correct

### Issue: "API calls failing"
**Solution**:
- Verify backend is running on Render
- Check `config.js` has correct backend URL
- Test backend URL directly: `https://your-app.onrender.com/api/locations`

### Issue: "Site not updating"
**Solution**:
- Wait 2-3 minutes (GitHub Pages takes time to rebuild)
- Check Actions tab for deployment status
- Clear browser cache (Ctrl+F5)

## 📝 Custom Domain (Optional)

If you want a custom domain:

1. Go to repository **Settings** → **Pages**
2. Enter your custom domain
3. Update DNS records as instructed
4. GitHub will provide SSL certificate automatically

## 🎉 You're Done!

Your frontend is now live on GitHub Pages! 🚀

**Frontend URL**: `https://your-username.github.io/your-repo-name/`  
**Backend URL**: `https://your-app-name.onrender.com`

## 📚 Additional Resources

- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [Custom Domains](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)

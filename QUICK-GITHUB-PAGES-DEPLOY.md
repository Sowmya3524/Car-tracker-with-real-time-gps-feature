# ⚡ Quick GitHub Pages Deployment

## 🚀 3 Simple Steps

### Step 1: Update Config
Edit `config.js` and replace:
```javascript
return 'https://your-app-name.onrender.com';
```
With your actual Render backend URL.

### Step 2: Push to GitHub
```bash
git add .
git commit -m "Deploy to GitHub Pages"
git push origin main
```

### Step 3: Enable GitHub Pages
1. Go to your GitHub repo
2. **Settings** → **Pages**
3. Select branch: `main`
4. Select folder: `/ (root)`
5. Click **Save**

## ✅ Done!

Your site will be live at:
```
https://your-username.github.io/your-repo-name/
```

Wait 1-2 minutes for deployment.

## 📝 Important

- Update `config.js` with your Render backend URL
- Make sure backend CORS allows your GitHub Pages domain
- Test locally first before deploying

## 🔗 Full Guide

See `GITHUB-PAGES-DEPLOYMENT-GUIDE.md` for detailed instructions.

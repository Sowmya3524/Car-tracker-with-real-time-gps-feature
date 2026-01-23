# 🔧 Fix GitHub Pages 404 Error

## Common Causes & Solutions

### ✅ Solution 1: Create index.html (RECOMMENDED)

GitHub Pages looks for `index.html` by default. I've created `index.html` for you.

**Steps:**
1. Make sure `index.html` is in your repository root
2. Push to GitHub:
   ```bash
   git add index.html
   git commit -m "Add index.html for GitHub Pages"
   git push origin main
   ```
3. Wait 1-2 minutes
4. Visit: `https://your-username.github.io/your-repo-name/`

### ✅ Solution 2: Check GitHub Pages Settings

1. Go to your GitHub repository
2. Click **Settings** → **Pages**
3. Verify:
   - **Source**: Branch `main` (or `master`)
   - **Folder**: `/ (root)` (not `/docs`)
4. Click **Save**
5. Wait 1-2 minutes for rebuild

### ✅ Solution 3: Check File Paths

Make sure all files are in the **root directory**:
- ✅ `index.html` (or `location-search.html`)
- ✅ `location-search.js`
- ✅ `location-search.css`
- ✅ `config.js`
- ✅ `hyderabad-locations.json`
- ✅ `hyderabad-metro-stations.json`

### ✅ Solution 4: Use Correct URL

GitHub Pages URL format:
```
https://your-username.github.io/your-repo-name/
```

**NOT:**
- ❌ `https://your-username.github.io/your-repo-name/location-search.html`
- ❌ `https://your-username.github.io/location-search.html`

If you want to access `location-search.html` directly:
```
https://your-username.github.io/your-repo-name/location-search.html
```

### ✅ Solution 5: Check Branch Name

GitHub Pages works with:
- `main` branch (newer repos)
- `master` branch (older repos)
- `gh-pages` branch (if using docs folder)

Make sure your code is on the correct branch.

## 🔍 Debugging Steps

### Step 1: Verify Files Are Pushed

1. Go to your GitHub repository
2. Check that `index.html` exists in the root
3. Click on it to verify it's not empty

### Step 2: Check Deployment Status

1. Go to repository **Settings** → **Pages**
2. Look for deployment status
3. If it says "Failed", check the error message

### Step 3: Check Actions Tab

1. Go to **Actions** tab in your repository
2. Look for "pages build and deployment"
3. Check if there are any errors

### Step 4: Test Direct File Access

Try accessing files directly:
- `https://your-username.github.io/your-repo-name/index.html`
- `https://your-username.github.io/your-repo-name/location-search.html`
- `https://your-username.github.io/your-repo-name/config.js`

If these work, the issue is with routing, not file access.

## 🚀 Quick Fix Checklist

- [ ] `index.html` exists in repository root
- [ ] Files are pushed to GitHub
- [ ] GitHub Pages is enabled in Settings
- [ ] Correct branch selected (`main` or `master`)
- [ ] Correct folder selected (`/ (root)`)
- [ ] Waited 1-2 minutes after enabling
- [ ] Using correct URL format

## 💡 Pro Tips

1. **Always use `index.html`** - GitHub Pages serves it automatically
2. **Check case sensitivity** - File names are case-sensitive
3. **Wait for deployment** - Changes take 1-2 minutes to go live
4. **Clear browser cache** - Use Ctrl+Shift+R after deployment

## 🆘 Still Getting 404?

1. **Check repository name** - Make sure it matches in the URL
2. **Check username** - Make sure it's correct
3. **Try incognito mode** - Rule out cache issues
4. **Check browser console** - Look for 404 errors on specific files

## ✅ After Fix

Once `index.html` is created and pushed:
- Your site will be at: `https://your-username.github.io/your-repo-name/`
- It will automatically load `index.html`
- All features should work!

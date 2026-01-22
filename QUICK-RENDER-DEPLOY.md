# ⚡ Quick Render Deployment Steps

## 🚀 Fast Track (5 Minutes)

### 1. Push to GitHub
```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

### 2. Deploy on Render

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Fill in:
   - **Name**: `hyderabad-location-backend`
   - **Start Command**: `npm start`
5. Click **"Create Web Service"**
6. Wait 2-3 minutes for deployment
7. Copy your URL: `https://your-app.onrender.com`

### 3. Test

Visit: `https://your-app.onrender.com/api/locations`

Should return JSON with locations! ✅

## 📝 What Render Needs

✅ `package.json` - Already exists  
✅ `backend-example.js` - Already exists  
✅ `npm start` script - Already configured  
✅ `process.env.PORT` - Already updated  

## 🔗 After Deployment

Update your frontend to use:
```
https://your-app.onrender.com/api/history
```

Instead of:
```
/api/history
```

## ⚠️ Important Notes

- **Free tier**: Service sleeps after 15 min inactivity
- **First request**: May take 30-60 seconds to wake up
- **Auto-deploy**: Enabled by default (deploys on every push)

## 🆘 Need Help?

See full guide: `RENDER-DEPLOYMENT-GUIDE.md`

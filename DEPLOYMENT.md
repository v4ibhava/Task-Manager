# Task Manager - Deployment Guide

## 🚀 Deployment Setup

### Backend (Render)

1. **Create `.env` file in `/server`** (not committed to git):
   ```
   PORT=5000
   MONGO_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   ```

2. **Push to GitHub**
   - Remove old `.env` files from git history (they contain exposed credentials)
   - Use `git rm --cached server/.env` and commit

3. **Deploy on Render**
   - Go to [https://render.com](https://render.com)
   - Create new Web Service
   - Connect GitHub repository
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Add Environment Variables:
     - `MONGO_URI`: Your MongoDB connection string
     - `JWT_SECRET`: Your JWT secret key
     - `PORT`: 5000

4. **Update Frontend API URL**
   - Copy your Render URL (e.g., `https://task-manager-xxxxx.onrender.com`)
   - Update in client `.env`

---

### Frontend (Vercel)

1. **Create `.env` file in `/client`** (not committed to git):
   ```
   VITE_API_URL=https://your-render-backend.onrender.com
   ```

2. **Deploy on Vercel**
   - Go to [https://vercel.com](https://vercel.com)
   - Connect GitHub repository
   - Framework: `Vite`
   - Root Directory: `client`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Add Environment Variables:
     - `VITE_API_URL`: Your Render backend URL

---

## ✅ Pre-Deployment Checklist

- [x] `.env` files added to `.gitignore`
- [x] `.env.example` files created for reference
- [x] CORS configured for frontend domain
- [x] MongoDB error handling added
- [x] `nodemon` moved to devDependencies
- [x] `vercel.json` configuration added
- [x] Environment variable documentation created

## 🔒 Security Notes

- Never commit `.env` files with real credentials
- Use `.env.example` as a template
- Rotate MongoDB credentials if they were exposed
- Use strong JWT secrets in production
- Add API rate limiting in production

## 📝 Environment Variables Required

### Server
- `PORT` - Server port (default: 5000)
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret

### Client
- `VITE_API_URL` - Backend API URL

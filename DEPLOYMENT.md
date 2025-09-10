# Deployment Guide

## 🚀 Quick Deploy Options

### Option 1: Vercel + Railway (Recommended)

#### Frontend (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy frontend
cd frontend
vercel --prod
```

#### Backend (Railway)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy backend
cd backend
railway login
railway init
railway up
```

### Option 2: Netlify + Heroku

#### Frontend (Netlify)
```bash
# Build frontend
cd frontend
npm run build

# Deploy to Netlify (drag & drop build folder)
```

#### Backend (Heroku)
```bash
# Install Heroku CLI
cd backend
heroku create your-app-name
git push heroku main
```

### Option 3: Local Development

#### Prerequisites
- Node.js (v14+)
- MongoDB (local or Atlas)
- Git

#### Setup
```bash
# Clone repository
git clone <your-repo-url>
cd oral-health-app

# Backend setup
cd backend
npm install
npm run setup-test-users
npm run dev

# Frontend setup (new terminal)
cd frontend
npm install
npm start
```

## 🌐 Environment Variables

### Backend (.env)
```bash
JWT_SECRET=your_jwt_secret_key
MONGO_URI=mongodb://localhost:27017/oral-health-app
PORT=5001

# AWS S3 (Optional)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
USE_S3=true
```

### Frontend (.env)
```bash
REACT_APP_API_URL=http://localhost:5001/api
```

## 📦 Production Build

### Frontend
```bash
cd frontend
npm run build
```

### Backend
```bash
cd backend
npm start
```

## 🔧 Database Setup

### MongoDB Atlas (Cloud)
1. Create account at mongodb.com
2. Create cluster
3. Get connection string
4. Update MONGO_URI in .env

### Local MongoDB
```bash
# Install MongoDB
brew install mongodb/brew/mongodb-community

# Start MongoDB
brew services start mongodb-community
```

## 🎯 Demo Deployment

### Live Demo URLs
- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-api.railway.app
- **API Docs**: https://your-api.railway.app/api

### Test Credentials
- **Admin**: admin@example.com / admin123
- **Patient**: patient@example.com / patient123

## 📋 Deployment Checklist

- [ ] Environment variables configured
- [ ] Database connected
- [ ] Test users created
- [ ] Frontend build successful
- [ ] Backend API responding
- [ ] File uploads working
- [ ] PDF generation working
- [ ] S3 integration (if enabled)
- [ ] CORS configured for production
- [ ] SSL certificates (HTTPS)

## 🐛 Troubleshooting

### Common Issues

#### CORS Errors
```javascript
// backend/server.js
app.use(cors({
  origin: ['http://localhost:3000', 'https://your-frontend-url.com'],
  credentials: true
}));
```

#### File Upload Issues
- Check upload directory permissions
- Verify multer configuration
- Ensure file size limits

#### Database Connection
- Verify MongoDB URI
- Check network access (Atlas)
- Confirm credentials
# 🚀 Deployment Guide

## Production Deployment Checklist

### 1. Environment Setup
```bash
# Backend .env
NODE_ENV=production
JWT_SECRET=your_strong_production_secret_here
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/oral-health-prod
PORT=5001

# Optional AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-production-bucket
USE_S3=true
```

### 2. Database Setup
- Create production MongoDB database
- Run `npm run setup-test-users` for initial admin account
- Configure database backups

### 3. Security Configuration
- Enable HTTPS/SSL certificates
- Configure CORS for production domains
- Set up firewall rules
- Enable MongoDB authentication

### 4. Deployment Options

#### Option A: Traditional Server (PM2)
```bash
# Install PM2
npm install -g pm2

# Start backend
cd backend
pm2 start server.js --name "oral-health-backend"

# Start frontend (build first)
cd frontend
npm run build
# Serve with nginx or Apache
```

#### Option B: Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

#### Option C: Cloud Deployment
- **Heroku**: Use provided Procfile
- **AWS**: Deploy with Elastic Beanstalk
- **DigitalOcean**: Use App Platform
- **Vercel**: Frontend deployment

### 5. Monitoring & Maintenance
- Set up health checks
- Configure logging (Winston)
- Monitor database performance
- Regular security updates

### 6. Backup Strategy
- Daily database backups
- File storage backups (if using local storage)
- Environment configuration backups

## Quick Deploy Commands

```bash
# Production build
cd frontend && npm run build
cd backend && npm install --production

# Start services
pm2 start ecosystem.config.js
```
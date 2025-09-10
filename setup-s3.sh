#!/bin/bash

echo "🚀 Setting up AWS S3 integration for Oral Health App..."

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install aws-sdk multer-s3

echo "✅ Backend dependencies installed!"

echo ""
echo "🔧 AWS S3 Setup Instructions:"
echo "1. Create an AWS S3 bucket"
echo "2. Create an IAM user with S3 permissions"
echo "3. Update backend/.env with your AWS credentials:"
echo "   AWS_ACCESS_KEY_ID=your_access_key_here"
echo "   AWS_SECRET_ACCESS_KEY=your_secret_key_here"
echo "   AWS_REGION=us-east-1"
echo "   AWS_S3_BUCKET=your-bucket-name"
echo "   USE_S3=true"
echo ""
echo "4. Restart the backend server: npm run dev"
echo ""
echo "📝 Note: The app works without S3 - files are stored locally by default"
echo "🎉 Setup complete!"
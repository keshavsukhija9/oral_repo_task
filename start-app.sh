#!/bin/bash
set -e

echo "🚀 Starting DentalCare Pro Application..."

# Kill existing processes
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "npm start" 2>/dev/null || true
sleep 2

# Start backend
echo "📦 Starting backend server..."
cd backend
npm run dev > backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 5

# Create test users
echo "👥 Creating test users..."
cd backend
npm run setup-test-users
cd ..

# Start frontend
echo "🎨 Starting frontend server..."
cd frontend
npm start > frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

echo "✅ Application started successfully!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:5001"
echo ""
echo "🔑 Test Credentials:"
echo "Admin: admin@example.com / admin123"
echo "Patient: patient@example.com / patient123"
echo ""
echo "Press Ctrl+C to stop all servers"

# Wait for user interrupt
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
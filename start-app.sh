#!/bin/bash

echo "🚀 Starting Oral Health App..."

# Check if MongoDB is running
if ! pgrep -x "mongod" > /dev/null; then
    echo "📦 Starting MongoDB..."
    nohup mongod --dbpath /tmp/mongodb --port 27017 > /dev/null 2>&1 &
    sleep 3
fi

echo "✅ MongoDB is running"

# Start backend in background
echo "🔧 Starting backend server..."
cd backend
nohup npm run dev > backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
sleep 5

# Start frontend
echo "🎨 Starting frontend server..."
cd frontend
npm start &
FRONTEND_PID=$!
cd ..

echo "🎉 Application started!"
echo "📱 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:5001"
echo ""
echo "Test credentials:"
echo "👤 Patient: patient@example.com / patient123"
echo "👨‍⚕️ Admin: admin@example.com / admin123"
echo ""
echo "Press Ctrl+C to stop all services"

# Function to cleanup on exit
cleanup() {
    echo "🛑 Stopping services..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    pkill -f "npm run dev" 2>/dev/null
    pkill -f "react-scripts start" 2>/dev/null
    exit 0
}

trap cleanup INT

# Wait for user to stop
wait
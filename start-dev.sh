#!/bin/bash

# TutorUp Development Startup Script
# This script starts both backend and frontend in development mode

echo "🚀 Starting TutorUp in Development Mode..."
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down TutorUp..."
    kill $(jobs -p) 2>/dev/null
    exit
}

trap cleanup SIGINT SIGTERM

# Start backend with nodemon
echo "📡 Starting Backend (with auto-restart)..."
cd back-end
npm run dev &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start frontend
echo "🎨 Starting Frontend..."
cd ../front-end
npm start &
FRONTEND_PID=$!

echo ""
echo "✅ TutorUp is running!"
echo "   Backend:  http://localhost:3001"
echo "   Frontend: http://localhost:3000"
echo ""
echo "📝 Backend will auto-restart when you save changes"
echo "Press Ctrl+C to stop both servers"
echo ""

# Wait for both processes
wait

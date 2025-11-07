#!/bin/bash

echo "🚀 Starting SocialSync Development Environment..."
echo ""

# Check if .env files exist
if [ ! -f "backend/.env" ]; then
    echo "⚠️  Creating backend/.env file..."
    cat > backend/.env << EOF
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
BACKEND_URL=http://localhost:3000
JWT_SECRET=socialsync-dev-secret-key-change-in-production-2024
JWT_EXPIRES_IN=7d
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
TWITTER_CLIENT_ID=your-twitter-client-id
TWITTER_CLIENT_SECRET=your-twitter-client-secret
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
EOF
    echo "✅ Created backend/.env"
fi

if [ ! -f "frontend/.env" ]; then
    echo "⚠️  Creating frontend/.env file..."
    echo "VITE_API_URL=http://localhost:3000" > frontend/.env
    echo "✅ Created frontend/.env"
fi

echo ""
echo "📦 Starting Backend..."
cd backend
npm run start:dev &
BACKEND_PID=$!
cd ..

echo "⏳ Waiting for backend to start..."
sleep 5

echo ""
echo "🎨 Starting Frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Development servers starting..."
echo ""
echo "📍 Backend: http://localhost:3000/api"
echo "📍 Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all servers"
echo ""

# Wait for user interrupt
wait $BACKEND_PID $FRONTEND_PID


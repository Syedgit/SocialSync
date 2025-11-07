# Starting SocialSync Locally

## Quick Start

### Option 1: Use the Startup Script
```bash
chmod +x start-dev.sh
./start-dev.sh
```

### Option 2: Manual Start

#### 1. Create Environment Files

**Backend** (`backend/.env`):
```env
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
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:3000
```

#### 2. Start Backend (Terminal 1)
```bash
cd backend
npm run start:dev
```

Backend will start on: http://localhost:3000/api

#### 3. Start Frontend (Terminal 2)
```bash
cd frontend
npm run dev
```

Frontend will start on: http://localhost:5173

#### 4. Using npm workspaces (Terminal 1)
```bash
# From root directory
npm run dev
```

This will start both backend and frontend simultaneously.

---

## Verify Everything is Working

### 1. Check Backend Health
```bash
curl http://localhost:3000/api/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "...",
  "service": "socialsync-backend"
}
```

### 2. Open Frontend
Visit: http://localhost:5173

You should see the landing page.

### 3. Test Authentication
1. Click "Sign up" or go to http://localhost:5173/signup
2. Create a test account
3. You'll be redirected to the dashboard

### 4. Test Account Connection
1. Go to Dashboard → Connect Accounts
2. Try connecting an account (you'll need OAuth credentials configured)

---

## Database

**SQLite is used automatically** - No setup needed!
- Database file: `backend/socialsync.db` (created automatically)
- Tables are auto-created on first run

---

## Troubleshooting

### Backend won't start
- Check if port 3000 is already in use: `lsof -i :3000`
- Make sure all dependencies are installed: `cd backend && npm install`
- Check for errors in the terminal

### Frontend won't start
- Check if port 5173 is already in use: `lsof -i :5173`
- Make sure all dependencies are installed: `cd frontend && npm install`
- Check for errors in the terminal

### Database errors
- Delete `backend/socialsync.db` and restart (will recreate)
- Check backend logs for database errors

### CORS errors
- Make sure `FRONTEND_URL` in backend/.env matches your frontend URL
- Check backend CORS configuration in `backend/src/main.ts`

---

## What to Test

1. ✅ User registration
2. ✅ User login
3. ✅ Dashboard loads
4. ✅ Create a post (will save to database)
5. ✅ View accounts page
6. ✅ Connect account (requires OAuth setup)

---

**Ready to test!** 🚀


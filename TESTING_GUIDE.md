# Testing Guide - SocialSync

## 🚀 Starting the Application

### Quick Start (Recommended)
```bash
# From project root
npm run dev
```

This will start both backend and frontend using npm workspaces.

### Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

---

## ✅ Testing Checklist

### 1. Health Check
- [ ] Backend is running: http://localhost:3000/api/health
- [ ] Frontend is running: http://localhost:5173

### 2. Authentication Flow
- [ ] Visit landing page: http://localhost:5173
- [ ] Click "Sign up" or go to http://localhost:5173/signup
- [ ] Create a test account:
  - Name: Test User
  - Email: test@example.com
  - Password: test123456
- [ ] Successfully redirected to dashboard
- [ ] Can see user profile in sidebar

### 3. Dashboard
- [ ] Dashboard loads with stats cards
- [ ] Stats show 0 for all metrics (no accounts/posts yet)
- [ ] Quick action cards are visible
- [ ] Navigation sidebar works

### 4. Account Connection (UI Test)
- [ ] Navigate to "Connect Accounts" from dashboard
- [ ] See all platform cards (Facebook, Instagram, Twitter, etc.)
- [ ] Click "Connect Account" on any platform
- [ ] Note: OAuth will fail without credentials (expected)
- [ ] Error message is displayed properly

### 5. Post Creation
- [ ] Navigate to "Create Post" from dashboard
- [ ] Select platforms (shows only connected accounts)
- [ ] Enter post content
- [ ] Choose "Post Now" or "Schedule"
- [ ] If scheduling, select date/time
- [ ] Submit post
- [ ] Post is saved (check database or posts list)

### 6. Account Management
- [ ] Navigate to "Accounts" from sidebar
- [ ] See empty state if no accounts
- [ ] Can navigate back to connect accounts

### 7. Logout
- [ ] Click "Sign out" in sidebar
- [ ] Redirected to login page
- [ ] Cannot access dashboard without login

---

## 🧪 API Testing (Using curl)

### Health Check
```bash
curl http://localhost:3000/api/health
```

### Signup
```bash
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123456"
  }'
```

### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "test123456"
  }'
```

### Get User Profile (requires token)
```bash
curl http://localhost:3000/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Get Connected Accounts (requires token)
```bash
curl http://localhost:3000/api/social-accounts \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Create Post (requires token)
```bash
curl -X POST http://localhost:3000/api/posts \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This is a test post!",
    "platforms": ["facebook"],
    "status": "draft"
  }'
```

---

## 🐛 Common Issues & Solutions

### Backend won't start
**Error:** Port 3000 already in use
**Solution:**
```bash
lsof -ti:3000 | xargs kill -9
# Or change PORT in backend/.env
```

### Frontend won't start
**Error:** Port 5173 already in use
**Solution:**
```bash
lsof -ti:5173 | xargs kill -9
# Or Vite will automatically use next available port
```

### Database errors
**Error:** SQLite database locked
**Solution:**
- Close any database viewers
- Restart backend
- Delete `backend/socialsync.db` if needed (will recreate)

### CORS errors
**Error:** CORS policy blocked
**Solution:**
- Verify `FRONTEND_URL` in `backend/.env` matches frontend URL
- Check backend is running on correct port
- Clear browser cache

### OAuth errors
**Error:** Invalid redirect URI
**Solution:**
- OAuth requires real credentials (currently using placeholders)
- This is expected - OAuth won't work without setup
- See `OAUTH_SETUP.md` for configuration

---

## 📊 Expected Results

### First Time Setup
1. Backend starts successfully
2. Database is created automatically (`backend/socialsync.db`)
3. Frontend starts successfully
4. Can create account and login
5. Dashboard shows empty state
6. Can navigate to all pages

### After Creating Posts
1. Posts appear in database
2. Dashboard stats update
3. Can view posts (when posts list page is built)

### After Connecting Accounts
1. Accounts appear in accounts page
2. Dashboard shows connected account count
3. Can select accounts when creating posts

---

## 🎯 Next Steps After Testing

Once everything works:
1. ✅ Verify all UI pages load
2. ✅ Test authentication flow
3. ✅ Create test posts
4. ⏳ Set up OAuth credentials (optional for now)
5. ⏳ Build post publishing (next task)

---

**Happy Testing!** 🚀


# Quick Test Guide

## 🚀 Start Servers Manually

Open **2 terminal windows** and run:

### Terminal 1 - Backend
```bash
cd /Users/subhan/Documents/Code/SocialSync/backend
npm run start:dev
```

You should see:
```
🚀 Application is running on: http://localhost:3000/api
```

### Terminal 2 - Frontend  
```bash
cd /Users/subhan/Documents/Code/SocialSync/frontend
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

---

## ✅ Quick Test Steps

### 1. Verify Backend
Open: http://localhost:3000/api/health

Should see:
```json
{"status":"ok","timestamp":"...","service":"socialsync-backend"}
```

### 2. Open Frontend
Open: http://localhost:5173

Should see the landing page with "SocialSync" branding.

### 3. Create Account
1. Click "Get Started Free" or go to http://localhost:5173/signup
2. Fill in:
   - Name: Test User
   - Email: test@example.com
   - Password: test123456
   - Confirm Password: test123456
3. Check "I agree to terms"
4. Click "Create account"
5. Should redirect to dashboard

### 4. Test Dashboard
- Should see stats cards (all showing 0)
- Should see "Connect Accounts" and "Create Post" cards
- Sidebar shows your user info

### 5. Test Post Creation
1. Click "Create Post" card or go to http://localhost:5173/dashboard/posts/create
2. Select platforms (if any connected)
3. Enter some text: "Hello from SocialSync! 🚀"
4. Choose "Post Now"
5. Click "Post Now" button
6. Should save successfully

### 6. Test Account Connection
1. Go to http://localhost:5173/dashboard/connect
2. Click "Connect Account" on any platform
3. Will show OAuth error (expected - needs credentials)
4. This confirms OAuth flow is set up correctly

---

## 🎯 What Should Work

✅ User registration and login
✅ Dashboard with stats
✅ Post creation (saves to database)
✅ Account connection UI (OAuth flow ready)
✅ Navigation between pages
✅ Logout functionality

## ⚠️ What Won't Work Yet

⏳ OAuth connection (needs real credentials)
⏳ Post publishing (not implemented yet)
⏳ Scheduling (not implemented yet)
⏳ Posts list page (not built yet)

---

## 🐛 Troubleshooting

### Backend errors
- Check `backend/.env` exists
- Check port 3000 is free: `lsof -i :3000`
- Look for error messages in terminal

### Frontend errors  
- Check `frontend/.env` exists
- Check port 5173 is free: `lsof -i :5173`
- Look for error messages in terminal
- Clear browser cache

### Database errors
- Database file: `backend/socialsync.db` (auto-created)
- If issues, delete it and restart backend

---

**Ready to test!** Open the URLs above and start testing! 🎉


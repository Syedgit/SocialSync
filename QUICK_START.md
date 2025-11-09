# Quick Start Guide

## For Now: Skip Database Setup

Since Docker isn't available and there are Homebrew permission issues, we can **start building the application** without the database initially. We'll set up the database later when needed.

## Start Building Now

### 1. Install Dependencies

```bash
npm run install:all
```

### 2. Start Backend (without database for now)

The backend will start but database features won't work yet. That's fine - we can build other features first!

```bash
cd backend
npm install
npm run start:dev
```

### 3. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

You should see:
- ✅ Frontend at http://localhost:5173
- ✅ Backend at http://localhost:3000 (health check should work)

## What We Can Build First

Since we're building step by step, we can start with:

1. **Frontend UI Components** - Build the interface
2. **Authentication UI** - Login/signup pages
3. **Post Creation UI** - Form for creating posts
4. **Dashboard Layout** - Main application layout

Then when you're ready, we'll:
- Fix Homebrew permissions or install Docker
- Set up the database
- Connect everything together

## Fix Homebrew Later (Optional)

When you want to set up the database:

1. Fix permissions:
   ```bash
   sudo chown -R $(whoami) /usr/local/Cellar
   ```

2. Install PostgreSQL and Redis:
   ```bash
   brew install postgresql redis
   brew services start postgresql
   brew services start redis
   createdb socialsync
   ```

Or install Docker Desktop from: https://www.docker.com/products/docker-desktop

---

**Ready to start building?** Let's continue! 🚀


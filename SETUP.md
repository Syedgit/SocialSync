# SocialSync Setup Guide

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0
- Docker and Docker Compose (for database and Redis)

## Initial Setup

### 1. Install Dependencies

From the root directory:

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

Or use the workspace script:
```bash
npm run install:all
```

### 2. Start Database and Redis

**Option A: Using Docker (Recommended)**

If you have Docker installed:
```bash
docker compose up -d
```

This will start:
- PostgreSQL on port 5432
- Redis on port 6379

**Option B: Local Installation**

If you don't have Docker, install locally:

**macOS (using Homebrew):**
```bash
brew install postgresql@15 redis
brew services start postgresql@15
brew services start redis
```

**Create the database:**
```bash
createdb socialsync
# Or using psql:
psql postgres -c "CREATE DATABASE socialsync;"
```

**Verify Redis is running:**
```bash
redis-cli ping
# Should return: PONG
```

> ℹ️ **Scheduler requirement:** The BullMQ-based post scheduler relies on Redis. Make sure Redis is running before starting the backend so scheduled posts are processed correctly.

### 3. Configure Environment Variables

**Backend** (`
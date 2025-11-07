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

### 3. Configure Environment Variables

**Backend** (`backend/.env`):
```env
PORT=3000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=socialsync

JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

REDIS_HOST=localhost
REDIS_PORT=6379
```

**Frontend** (`frontend/.env`):
```env
VITE_API_URL=http://localhost:3000
```

### 4. Run the Application

**Development mode (runs both frontend and backend):**
```bash
npm run dev
```

**Or run separately:**

Backend:
```bash
npm run dev:backend
```

Frontend:
```bash
npm run dev:frontend
```

### 5. Access the Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- Backend Health Check: http://localhost:3000/health

## Project Structure

```
SocialSync/
├── backend/          # NestJS backend API
│   ├── src/
│   │   ├── auth/     # Authentication module
│   │   ├── users/    # User management
│   │   ├── posts/    # Post management
│   │   └── ...
│   └── package.json
├── frontend/         # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── ...
│   └── package.json
└── docker-compose.yml
```

## Next Steps

1. Set up database entities and migrations
2. Implement user authentication
3. Add social media OAuth integrations
4. Build post creation UI
5. Implement scheduling system

## Troubleshooting

### Docker Not Installed
If you don't have Docker, use Option B in Step 2 above to install PostgreSQL and Redis locally.

### Database Connection Issues

**If using Docker:**
- Ensure Docker containers are running: `docker ps`
- Check logs: `docker compose logs postgres`
- Restart containers: `docker compose restart`

**If using local installation:**
- Check PostgreSQL is running: `brew services list` (macOS) or `sudo systemctl status postgresql` (Linux)
- Check Redis is running: `redis-cli ping`
- Verify database exists: `psql -l | grep socialsync`

### Port Already in Use
- Change ports in `docker-compose.yml` or `.env` files
- Kill processes using the ports

### Node Version Issues
- Use `nvm` to switch Node versions
- Required: Node.js >= 18.0.0


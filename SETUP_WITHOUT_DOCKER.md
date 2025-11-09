# Setup Without Docker

If you don't have Docker installed, follow these instructions to set up PostgreSQL and Redis locally.

## macOS Setup (using Homebrew)

### 1. Install PostgreSQL

```bash
# Install PostgreSQL
brew install postgresql@15

# Start PostgreSQL service
brew services start postgresql@15

# Create the database
createdb socialsync

# Verify database was created
psql -l | grep socialsync
```

### 2. Install Redis

```bash
# Install Redis
brew install redis

# Start Redis service
brew services start redis

# Verify Redis is running
redis-cli ping
# Should return: PONG
```

### 3. Configure Backend Environment

Update `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=$(whoami)  # Your macOS username
DB_PASSWORD=           # Leave empty for local development
DB_NAME=socialsync

REDIS_HOST=localhost
REDIS_PORT=6379
```

### 4. Test Database Connection

```bash
# Connect to PostgreSQL
psql socialsync

# Test Redis
redis-cli ping
```

## Linux Setup

### 1. Install PostgreSQL

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Create database and user
sudo -u postgres psql
```

In PostgreSQL shell:
```sql
CREATE DATABASE socialsync;
CREATE USER socialsync_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE socialsync TO socialsync_user;
\q
```

### 2. Install Redis

```bash
# Ubuntu/Debian
sudo apt install redis-server

# Start Redis
sudo systemctl start redis-server
sudo systemctl enable redis-server

# Verify
redis-cli ping
```

### 3. Configure Backend Environment

Update `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=socialsync_user
DB_PASSWORD=your_password
DB_NAME=socialsync

REDIS_HOST=localhost
REDIS_PORT=6379
```

## Windows Setup

### 1. Install PostgreSQL

1. Download from: https://www.postgresql.org/download/windows/
2. Run the installer
3. During installation, set password for `postgres` user
4. Use pgAdmin or command line to create database:

```sql
CREATE DATABASE socialsync;
```

### 2. Install Redis

1. Download from: https://github.com/microsoftarchive/redis/releases
2. Or use WSL (Windows Subsystem for Linux)
3. Or use a cloud Redis service

### 3. Configure Backend Environment

Update `backend/.env`:

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_postgres_password
DB_NAME=socialsync

REDIS_HOST=localhost
REDIS_PORT=6379
```

## Troubleshooting

### PostgreSQL Connection Issues

**macOS:**
```bash
# Check if PostgreSQL is running
brew services list

# Restart PostgreSQL
brew services restart postgresql@15

# Check connection
psql socialsync
```

**Linux:**
```bash
# Check status
sudo systemctl status postgresql

# Restart
sudo systemctl restart postgresql

# Check connection
sudo -u postgres psql -d socialsync
```

### Redis Connection Issues

**macOS:**
```bash
# Check if Redis is running
brew services list

# Restart Redis
brew services restart redis

# Test connection
redis-cli ping
```

**Linux:**
```bash
# Check status
sudo systemctl status redis-server

# Restart
sudo systemctl restart redis-server

# Test connection
redis-cli ping
```

### Permission Issues

If you get permission errors:

**macOS:**
- Make sure your user has access: `createdb -U $(whoami) socialsync`

**Linux:**
- Grant proper permissions in PostgreSQL or use the postgres superuser

## Next Steps

Once PostgreSQL and Redis are running:

1. Start the backend: `npm run dev:backend`
2. Start the frontend: `npm run dev:frontend`
3. Check backend health: http://localhost:3000/health


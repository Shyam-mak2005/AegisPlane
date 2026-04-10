# Deployment Guide

## Overview

AegisPlane is a multi-tenant SaaS platform that requires three core services for production:

- **MongoDB Atlas** for primary data storage
- **Redis** for queues, caching, and session management
- **Backend Express API** behind a reverse proxy
- **Frontend static bundle** served by Nginx or CDN

## MongoDB Atlas Migration

### Prerequisites

- MongoDB Atlas account (free tier available at https://cloud.mongodb.com)
- MongoDB cluster created and accessible
- Network access configured (IP whitelist or VPC peering)

### Step 1: Create MongoDB Atlas Cluster

1. Go to https://cloud.mongodb.com and sign in
2. Create a new project or use existing
3. Click "Build a Database" and create a cluster
4. Choose cloud provider and region closest to your deployment
5. Wait for cluster to be ready (5-10 minutes)

### Step 2: Create Database User

1. Go to Database > Security > Database Access
2. Click "Add New Database User"
3. Choose "Password" authentication method
4. Enter username and generate secure password
5. Set appropriate permissions (e.g., readWriteAnyDatabase for application user)
6. Click "Add User"

### Step 3: Configure Network Access

1. Go to Database > Network Access
2. Click "Add IP Address"
3. For production: Add specific IP addresses or CIDR blocks
4. For development: Temporarily allow 0.0.0.0/0 (NOT recommended for production)
5. Add your deployment platform IPs (e.g., AWS EC2, Heroku, DigitalOcean)

### Step 4: Get Connection String

1. Go to Database > Databases
2. Click "Connect" on your cluster
3. Select "Drivers" (choose Node.js)
4. Copy the connection string provided
5. Replace `<username>` and `<password>` with your database user credentials

**Connection String Format:**

```
mongodb+srv://username:password@cluster-name.mongodb.net/?retryWrites=true&w=majority
```

**Important:** URL-encode special characters in password using https://www.urlencoder.org/

### Step 5: Update Environment Variables

Update `.env` in your deployment environment:

```env
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster-name.mongodb.net/?retryWrites=true&w=majority
REDIS_URL=redis://user:password@redis-host:6379
JWT_ACCESS_SECRET=your-strong-32-char-secret
JWT_REFRESH_SECRET=your-strong-32-char-secret
COOKIE_DOMAIN=your-domain.com
COOKIE_SECURE=true
APP_ORIGIN=https://your-domain.com
```

### Verification

After deployment, verify MongoDB Atlas connection:

```bash
# Backend logs should show:
# "Database connection established"
# "MongoDB connected successfully"
```

### Troubleshooting MongoDB Atlas Connection

| Issue                   | Solution                                                                   |
| ----------------------- | -------------------------------------------------------------------------- |
| Connection timeout      | Check IP whitelist in Network Access, ensure cluster is running            |
| Authentication failed   | Verify username/password in connection string, check URL encoding          |
| SSL/TLS error           | MongoDB Atlas requires TLS; ensure `retryWrites=true` in connection string |
| Database not found      | Backend automatically creates database; check MONGO_URI format             |
| Slow initial connection | First connection from new IP may take longer; increase timeout to 10000ms  |

## Runtime Services

### MongoDB Atlas

- Primary data store for multi-tenant data
- Automatically scales storage
- Built-in backups and point-in-time recovery
- Monitor performance in Atlas UI

### Redis

For production, use managed Redis service:

- **AWS ElastiCache** - Managed Redis on AWS
- **Redis Cloud** - Fully managed Redis (https://redis.com/try-free/)
- **DigitalOcean Managed Databases** - Redis on DigitalOcean
- **Azure Cache for Redis** - Redis on Azure

Update `REDIS_URL` with service provider connection string.

### Backend API

- ExpressJS application deployed behind reverse proxy
- Horizontal scaling requires shared database (MongoDB owns state)
- Queue workers run as separate scalable processes using BullMQ

### Frontend

- Static bundle built from web workspace
- Served by Nginx, CDN, or cloud storage (S3, CloudFront, etc)
- Must be available at domain specified in `APP_ORIGIN`

## Production Checklist

### Security

- [ ] Replace all `.env.example` values with production secrets
- [ ] Generate strong JWT secrets (32+ characters, random)
- [ ] Set `COOKIE_SECURE=true` (HTTPS only)
- [ ] Set `COOKIE_DOMAIN` to your production domain
- [ ] Change default `PLATFORM_ADMIN_PASSWORD` immediately
- [ ] Enable MongoDB Atlas IP whitelist (not 0.0.0.0/0)
- [ ] Use HTTPS/TLS for all connections
- [ ] Enable MongoDB encryption at rest

### Database

- [ ] MongoDB Atlas cluster created in production region
- [ ] Database user created with appropriate permissions
- [ ] Automated daily backups enabled
- [ ] Network access restricted to application servers only
- [ ] Connection string verified and tested
- [ ] Monitor connection pool settings (`serverSelectionTimeoutMS`, `socketTimeoutMS`)

### Redis

- [ ] Managed Redis service provisioned
- [ ] Authentication enabled (strong password)
- [ ] Persistence enabled (AOF or RDB)
- [ ] Memory policy configured appropriately
- [ ] Connection tested from application

### Environment Variables

- [ ] `NODE_ENV` set to `production`
- [ ] `PORT` configured for deployment platform
- [ ] `APP_ORIGIN` matches frontend domain exactly
- [ ] `MONGO_URI` uses MongoDB Atlas connection string
- [ ] `REDIS_URL` uses managed Redis connection string
- [ ] JWT secrets are strong and unique
- [ ] SMTP configured for email notifications
- [ ] `LOG_LEVEL` set to `info` or `warn` (not `debug`)

### Deployment

- [ ] Install production dependencies only
- [ ] Build backend TypeScript (`npm run build`)
- [ ] Run `npm start` instead of `npm run dev`
- [ ] Backend starts successfully and connects to services
- [ ] Web frontend built and deployed to CDN/static host
- [ ] Reverse proxy (Nginx) configured and healthy
- [ ] TLS/SSL certificates installed and valid
- [ ] Health checks configured (e.g., `GET /health`)

### Monitoring & Logging

- [ ] Application logs shipped to centralized logging (Datadog, ELK, etc)
- [ ] MongoDB Atlas monitoring dashboard reviewed
- [ ] Redis monitoring dashboard reviewed
- [ ] Alerts configured for errors and performance issues
- [ ] Setup error tracking (Sentry, Rollbar, etc)
- [ ] Monitor database performance and slow queries

### Scaling

- [ ] Queue workers run as separate processes
- [ ] Multiple API instances behind load balancer
- [ ] Database connection pool sized appropriately
- [ ] Redis backed by persistent storage
- [ ] Auto-scaling configured for API and worker pods

## CI/CD Expectations

### Build Pipeline

- [ ] Install dependencies
- [ ] Lint backend and web (`npm run lint`)
- [ ] Type-check backend (`tsc --noEmit`)
- [ ] Build backend (`npm run build`)
- [ ] Build web frontend
- [ ] Build Docker images for backend and web
- [ ] Push Docker images to registry

### Deploy Pipeline

- [ ] Pull Docker images from registry
- [ ] Set environment variables from secrets manager
- [ ] Run database migrations (if applicable)
- [ ] Deploy backend API pods
- [ ] Deploy queue worker pods
- [ ] Deploy frontend static bundle
- [ ] Run smoke tests against deployed environment
- [ ] Monitor deployment health

## Example Docker Deployment

```dockerfile
# apps/backend/Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

ENV NODE_ENV=production
EXPOSE 4000

CMD ["node", "dist/server.js"]
```

```bash
# Build and run
docker build -t aegisplane-backend:latest -f apps/backend/Dockerfile .
docker run -e MONGO_URI="mongodb+srv://..." -e REDIS_URL="redis://..." aegisplane-backend
```

## Verifying Production Deployment

```bash
# Check backend health
curl https://your-domain.com/api/v1/health

# Check authentication
curl -X POST https://your-domain.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@aegisplane.dev","password":"..."}'

# Check MongoDB connection in logs
# Should see: "Database connection established"

# Monitor MongoDB Atlas
# Visit https://cloud.mongodb.com -> Database -> Databases
```

## Rollback Procedure

MongoDB Atlas automatic backups enable point-in-time recovery:

1. Go to MongoDB Atlas > Database > Backup
2. Click "Restore" next to desired backup
3. Choose target cluster and restore point
4. Wait for restore to complete (10-30 minutes)
5. Verify data integrity
6. Update application if needed

## Additional Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com)
- [MongoDB Connection String Reference](https://docs.mongodb.com/manual/reference/connection-string/)
- [AegisPlane Architecture](./architecture.md)
- Backend: [apps/backend/src](../apps/backend/src)

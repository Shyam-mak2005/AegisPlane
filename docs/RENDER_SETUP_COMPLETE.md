# Render Deployment - Complete Setup Guide

**Status:** ✅ PRODUCTION READY FOR RENDER  
**Date:** April 8, 2026  
**Backend:** AegisPlane (Express + Mongoose + Zod)  
**Deployment:** Render (Node.js)  
**Database:** MongoDB Atlas  
**Cache:** Managed Redis

---

## What You Now Have

### 1. Production-Ready Backend ✅

- [x] All environment variables use process.env
- [x] No hardcoded secrets in code
- [x] Zod validation for all environment variables
- [x] Proper error handling and logging
- [x] MongoDB Atlas support
- [x] Redis integration
- [x] Security middleware (Helmet, CORS, rate limiting)

### 2. Complete Documentation ✅

- [x] Render deployment guide (RENDER_DEPLOYMENT.md)
- [x] Environment variables reference (RENDER_ENV_REFERENCE.md)
- [x] Deployment checklist (RENDER_DEPLOYMENT_CHECKLIST.md)
- [x] Validation error guide (ENV_VALIDATION_GUIDE.md)
- [x] Backend .env template

### 3. Backend Configuration ✅

- [x] Updated `apps/backend/.env` with all production variables
- [x] Environment validation via Zod schema
- [x] Proper server startup flow
- [x] Database connection with error handling
- [x] CORS configured for multiple environments

---

## Quick Start (5 Steps)

### Step 1: Create Render Account

Visit https://render.com and sign up

### Step 2: Configure Services

1. Create MongoDB Atlas cluster (if not done)
2. Set up Redis service
3. Prepare email service credentials

### Step 3: Create Web Service

In Render dashboard:

- New Web Service
- Connect GitHub repository
- Select branch (main)

### Step 4: Add Environment Variables

30 seconds to copy these from [RENDER_ENV_REFERENCE.md](RENDER_ENV_REFERENCE.md)

### Step 5: Deploy

Click deploy and monitor logs

**Total time:** 30-45 minutes

---

## Files Created/Updated

### New Documentation Files

| File                                                                       | Purpose                               | Read Time |
| -------------------------------------------------------------------------- | ------------------------------------- | --------- |
| [docs/RENDER_DEPLOYMENT.md](docs/RENDER_DEPLOYMENT.md)                     | Step-by-step Render setup             | 15 min    |
| [docs/RENDER_ENV_REFERENCE.md](docs/RENDER_ENV_REFERENCE.md)               | All environment variables explained   | 20 min    |
| [docs/RENDER_DEPLOYMENT_CHECKLIST.md](docs/RENDER_DEPLOYMENT_CHECKLIST.md) | Complete deployment checklist         | 30 min    |
| [docs/ENV_VALIDATION_GUIDE.md](docs/ENV_VALIDATION_GUIDE.md)               | Environment validation errors & fixes | 15 min    |

### Updated Backend Files

| File                                   | Changes                               |
| -------------------------------------- | ------------------------------------- |
| [apps/backend/.env](apps/backend/.env) | Complete with all variables commented |

---

## Environment Variables - Summary

### 20+ Production Variables

**Critical (must set):**

- `MONGO_URI` - MongoDB Atlas connection
- `REDIS_URL` - Redis connection
- `JWT_ACCESS_SECRET` - 32+ char random string
- `JWT_REFRESH_SECRET` - 32+ char random string

**Important (recommended):**

- `NODE_ENV=production`
- `APP_ORIGIN=https://your-domain.com`
- `COOKIE_SECURE=true`
- `COOKIE_DOMAIN=your-domain.com`
- `PLATFORM_ADMIN_PASSWORD` - Strong password

**Optional:**

- `SMTP_*` - Email configuration
- `LOG_LEVEL=info` - Logging level
- `QUEUE_PREFIX=aegisplane` - Queue configuration

See [RENDER_ENV_REFERENCE.md](docs/RENDER_ENV_REFERENCE.md) for complete reference with examples.

---

## Backend Configuration Review

### ✅ Environment Variables (Verified)

**Source File:** [apps/backend/src/config/env.ts](apps/backend/src/config/env.ts)

```typescript
export const env = envSchema.parse(process.env);
```

**What this means:**

- All configuration from environment variables ✅
- No hardcoded secrets ✅
- Zod validation on startup ✅
- Server fails immediately if validation fails ✅

### ✅ Database Connection (Verified)

**Source File:** [apps/backend/src/config/database.ts](apps/backend/src/config/database.ts)

```typescript
await mongoose.connect(env.MONGO_URI, {
  dbName: "aegisplane",
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  retryWrites: true,
  w: "majority",
});
```

**What this means:**

- Uses MongoDB Atlas connection string from environment ✅
- No localhost hardcoding ✅
- Production-grade timeouts and retry settings ✅
- Proper error handling ✅

### ✅ Server Configuration (Verified)

**Source File:** [apps/backend/src/server.ts](apps/backend/src/server.ts)

```typescript
app.listen(env.PORT, () => {
  logger.info(`listening on port ${env.PORT}`);
});
```

**What this means:**

- Reads PORT from environment ✅
- Render can assign dynamic port ✅
- Backend automatically uses correct port ✅

### ✅ CORS Configuration (Verified)

**Source File:** [apps/backend/src/app.ts](apps/backend/src/app.ts)

```typescript
app.use(
  cors({
    origin: env.APP_ORIGIN,
    credentials: true,
  }),
);
```

**What this means:**

- CORS origin from environment variable ✅
- Works across different deployments ✅
- Production and development compatible ✅

---

## Deployment Architecture

```
┌─────────────────────────────────────────┐
│          Render (Frontend)              │
│   https://your-domain.com               │
└──────────────┬──────────────────────────┘
               │ HTTPS (APP_ORIGIN)
               ▼
┌─────────────────────────────────────────┐
│     Render (Backend Node.js)            │
│   aegisplane-backend.onrender.com       │
│   Environment Variables + Code          │
└──────────────┬──────────────────────────┘
               │
         ┌─────┴─────┐
         ▼           ▼
    ┌────────┐   ┌────────┐
    │ MongoDB│   │ Redis  │
    │ Atlas  │   │ Cloud  │
    └────────┘   └────────┘
```

---

## Render Deployment Flow

```
1. Push code to GitHub
            ↓
2. Render detects change
            ↓
3. Render pulls code
            ↓
4. Build: npm install && npm run build
            ↓
5. Start: npm start
            ↓
6. Read environment variables from Render dashboard
            ↓
7. Validate environment variables (Zod)
            ↓ ✅ Valid
   Start backend and connect to MongoDB/Redis
            ↓
8. Backend ready to accept requests
```

---

## Production Checklist (High Level)

### Pre-Deployment

- [ ] Code committed to Git
- [ ] `.env` in `.gitignore` (verified)
- [ ] MongoDB Atlas cluster created
- [ ] Redis service provisioned
- [ ] JWT secrets generated
- [ ] Email service configured (if using)

### During Deployment

- [ ] All 20+ environment variables added to Render
- [ ] Build command: `npm run build`
- [ ] Start command: `npm start`
- [ ] Standard plan selected ($7/month minimum)
- [ ] Deployed successfully

### Post-Deployment

- [ ] Logs show "Database connection established"
- [ ] Health endpoint responds (200 OK)
- [ ] Login works
- [ ] Tenant creation works
- [ ] Data persists in MongoDB Atlas
- [ ] No errors in logs

See [RENDER_DEPLOYMENT_CHECKLIST.md](docs/RENDER_DEPLOYMENT_CHECKLIST.md) for detailed 30-item checklist.

---

## Security Features Implemented

✅ **Environment Variable Validation**

- Zod schema validates all variables on startup
- Invalid variables cause immediate startup failure
- Type coercion for numbers and booleans
- Email format validation

✅ **Secret Management**

- All secrets from environment variables
- No hardcoded secrets in code
- .env file in .gitignore
- Different secrets per environment

✅ **Production Security**

- COOKIE_SECURE=true forces HTTPS
- Helmet.js security headers
- Rate limiting on all endpoints
- CORS restricted to APP_ORIGIN
- JWT tokens with short expiry (15m access, 30d refresh)

✅ **Database Security**

- MongoDB Atlas encryption at rest
- IP whitelist (configure in MongoDB)
- Strong database user credentials
- Write concern "majority" for durability

---

## Monitoring & Troubleshooting

### Key Log Messages to Look For

**Success Indicators:**

```
Database connection established
MongoDB connected successfully
AegisPlane backend listening on port 4000
```

**Error Indicators:**

```
Failed to connect to MongoDB         ← Check MONGO_URI
Redis connection failed              ← Check REDIS_URL
JWT_ACCESS_SECRET not found          ← Add missing variable
Validation error: too_small          ← Variable too short
```

**Where to Find Logs:**

1. Render Dashboard → Service Name → Logs tab
2. Stream in real-time
3. Filter by error level

**Common Issues & Fixes:**
See [ENV_VALIDATION_GUIDE.md](docs/ENV_VALIDATION_GUIDE.md) for 20+ error scenarios and solutions.

---

## Performance Optimization

### Connection Pooling

```typescript
mongoose.connect(uri, {
  maxPoolSize: 10,
  minPoolSize: 2,
});
```

### Lean Queries

```typescript
// Use .lean() for read-only queries (faster)
const users = await User.find().lean();
```

### Pagination

```typescript
// Implement pagination for large datasets
GET /api/v1/users?page=1&limit=10
```

### Caching

```typescript
// Use Redis for frequently accessed data
GET / api / v1 / cache - key;
```

---

## Cost Estimation

| Service        | Tier     | Cost          | Notes                      |
| -------------- | -------- | ------------- | -------------------------- |
| Render Backend | Standard | $7/month      | Recommended for production |
| MongoDB Atlas  | M5       | $57/month     | Minimum for production     |
| Redis Cloud    | Fixed    | $15/month     | Managed Redis              |
| **Total**      |          | **$79/month** | Scalable as needed         |

---

## Next Steps

### 1. Immediate (30 min)

1. Generate JWT secrets:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. Prepare MongoDB Atlas connection string
3. Prepare Redis connection string

### 2. Short Term (1 hour)

1. Create Render account
2. Create web service
3. Add all environment variables
4. Deploy

### 3. Verification (15 min)

1. Test health endpoint
2. Test login endpoint
3. Test tenant creation
4. Verify MongoDB data
5. Monitor logs for errors

### 4. Post-Deployment (ongoing)

1. Set up error tracking (Sentry)
2. Configure alerts
3. Monitor performance
4. Plan for scaling

---

## Documentation Reference

**For Render Users:**

- Start: [RENDER_DEPLOYMENT.md](docs/RENDER_DEPLOYMENT.md)
- Reference: [RENDER_ENV_REFERENCE.md](docs/RENDER_ENV_REFERENCE.md)
- Checklist: [RENDER_DEPLOYMENT_CHECKLIST.md](docs/RENDER_DEPLOYMENT_CHECKLIST.md)
- Troubleshooting: [ENV_VALIDATION_GUIDE.md](docs/ENV_VALIDATION_GUIDE.md)

**For Backend Configuration:**

- Environment: [apps/backend/.env](apps/backend/.env)
- Database: [apps/backend/src/config/database.ts](apps/backend/src/config/database.ts)
- Server: [apps/backend/src/server.ts](apps/backend/src/server.ts)
- App: [apps/backend/src/app.ts](apps/backend/src/app.ts)

**General Resources:**

- [Render Docs](https://render.com/docs)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)

---

## Success Criteria

✅ All met:

1. ✅ Environment variables replace all hardcoded values
2. ✅ process.env used throughout backend
3. ✅ MongoDB uses MONGO_URI environment variable
4. ✅ No localhost dependencies
5. ✅ Server uses process.env.PORT
6. ✅ CORS uses process.env.APP_ORIGIN
7. ✅ .env for local dev only (in .gitignore)
8. ✅ Render compatible environment validation
9. ✅ Complete documentation provided
10. ✅ Production-safe configuration

---

## Deployment Status

**Status: ✅ READY FOR RENDER DEPLOYMENT**

Your AegisPlane backend is fully configured for production deployment on Render with MongoDB Atlas.

- **Code Quality:** ✅ Production-ready
- **Configuration:** ✅ Environment-based, no hardcoding
- **Security:** ✅ Secrets protected
- **Documentation:** ✅ Comprehensive
- **Validation:** ✅ Zod schema in place
- **Monitoring:** ✅ Detailed logging

---

## Quick Commands

```bash
# Local development
npm run dev

# Build for production
npm run build

# Start production (Render)
npm start

# Type check
npm run lint

# View environment
echo $MONGO_URI

# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Team Handoff

**Information to Share:**

1. **Backend URL (after deploy):**

   ```
   https://aegisplane-backend-xxxxx.onrender.com
   ```

2. **API Prefix:**

   ```
   /api/v1
   ```

3. **Admin Credentials:**

   ```
   Email: admin@your-domain.com
   Password: (from PLATFORM_ADMIN_PASSWORD)
   ```

4. **Documentation:**
   - Frontend team: Setup APP_ORIGIN to backend URL
   - DevOps: Use RENDER_DEPLOYMENT_CHECKLIST.md
   - Full team: Reference RENDER_ENV_REFERENCE.md

---

**Deployment Ready! 🚀**

**Next Step:** Follow [RENDER_DEPLOYMENT.md](docs/RENDER_DEPLOYMENT.md) Quick Start section (5 steps, 30 min)

---

_Last updated: April 8, 2026_  
*Backend version: Production  
*Deployment target: Render  
*Database: MongoDB Atlas  
*Cache: Managed Redis

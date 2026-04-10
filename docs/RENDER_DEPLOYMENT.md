# Render Deployment Guide - AegisPlane Backend

**Purpose:** Deploy AegisPlane backend to Render with MongoDB Atlas and secure environment variable handling.

**Prerequisites:**

- MongoDB Atlas cluster (from previous migration)
- Render account (https://render.com)
- Redis service (Redis Cloud or similar)
- Git repository with code committed

---

## Quick Start (5 Steps)

### Step 1: Create Render Web Service

1. Go to https://dashboard.render.com
2. Click "New+" → "Web Service"
3. Select "Build and deploy from Git repository"
4. Connect your GitHub repository
5. Select the repository and branch (`main` or `develop`)

### Step 2: Configure Build Settings

```
Name: aegisplane-backend
Environment: Node
Region: Choose closest to your users
Build Command: npm run build
Start Command: npm start
```

### Step 3: Add Environment Variables

Go to **Settings** → **Environment** tab and add:

```
NODE_ENV=production
PORT=4000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
REDIS_URL=redis://default:password@redis-host:6379
JWT_ACCESS_SECRET=[generate strong secret]
JWT_REFRESH_SECRET=[generate strong secret]
COOKIE_DOMAIN=your-domain.com
COOKIE_SECURE=true
APP_ORIGIN=https://your-frontend-domain.com
PLATFORM_ADMIN_EMAIL=admin@your-domain.com
PLATFORM_ADMIN_PASSWORD=[strong password]
SMTP_FROM=noreply@your-domain.com
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
LOG_LEVEL=info
```

### Step 4: Add render.yaml

Create `render.yaml` in project root (optional but recommended):

```yaml
services:
  - type: web
    name: aegisplane-backend
    env: node
    plan: standard
    buildCommand: npm run build
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 4000
```

### Step 5: Deploy

Click "Deploy" and monitor the build logs.

---

## Detailed Render Configuration

### 1. Create Web Service

**URL:** https://dashboard.render.com/new/web

**Fill in:**

- **Name:** aegisplane-backend (will be part of your URL)
- **GitHub repo:** Select your repository
- **Branch:** main

### 2. Build & Start Commands

**Build Command:**

```bash
npm run build
```

This runs in the backend directory automatically if detected.

**Start Command:**

```bash
npm start
```

### 3. Environment Settings

#### Node Version

- Render uses latest Node.js by default
- Verify in your `apps/backend/package.json`: `"type": "module"` (ES modules)

#### Environment Variables

**Critical Variables:**

| Variable             | Example             | Notes                                                                                     |
| -------------------- | ------------------- | ----------------------------------------------------------------------------------------- |
| `NODE_ENV`           | `production`        | MUST be production                                                                        |
| `PORT`               | `4000`              | Render assigns dynamically, backend reads env var                                         |
| `MONGO_URI`          | `mongodb+srv://...` | From MongoDB Atlas                                                                        |
| `REDIS_URL`          | `redis://...`       | From managed Redis service                                                                |
| `JWT_ACCESS_SECRET`  | [32+ char random]   | Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |
| `JWT_REFRESH_SECRET` | [32+ char random]   | Generate with same command                                                                |

**Optional but Recommended:**

| Variable                  | Example                            | Notes                |
| ------------------------- | ---------------------------------- | -------------------- |
| `COOKIE_DOMAIN`           | `your-domain.com`                  | Your actual domain   |
| `COOKIE_SECURE`           | `true`                             | HTTPS only           |
| `APP_ORIGIN`              | `https://your-frontend-domain.com` | CORS origin          |
| `LOG_LEVEL`               | `info`                             | Production log level |
| `PLATFORM_ADMIN_EMAIL`    | `admin@your-domain.com`            | Change from default  |
| `PLATFORM_ADMIN_PASSWORD` | [strong password]                  | Change from default  |
| `SMTP_FROM`               | `noreply@your-domain.com`          | Email sender         |
| `SMTP_HOST`               | `smtp.provider.com`                | Email service        |

### 4. Plan Selection

**Free Plan:**

- 0.1 CPU, 512MB RAM
- Suitable for testing/staging
- ❌ Not recommended for production
- Sleeps after 15 mins of inactivity

**Standard Plan ($7/month):**

- 0.5 CPU, 512MB RAM
- ✅ Recommended for production
- No sleep/auto-shutdown
- Supports horizontal scaling

**Pro Plan ($25+/month):**

- 2 CPU, 2GB RAM
- For high-traffic applications

### 5. Deployment Process

#### First Deploy

1. Render automatically:
   - Pulls your code from GitHub
   - Installs dependencies (`npm ci`)
   - Builds backend (`npm run build`)
   - Starts backend (`npm start`)

2. Check logs:
   - Click service name → **Logs**
   - Look for: `"Database connection established"`
   - Look for: `"listening on port"`

#### Auto-Redeploy

- Render auto-deploys on git push to connected branch
- Disable in **Settings** → **Auto-Deploy** if needed

---

## Environment Variables Setup

### Generating Secure Secrets

```bash
# Generate JWT secrets
node -e "console.log('JWT_ACCESS_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

### Required Environment Variables for Render

**Copy this and fill in your values:**

```env
# === ENVIRONMENT ===
NODE_ENV=production
PORT=4000

# === FRONTEND ===
APP_ORIGIN=https://your-frontend-domain.com
API_PREFIX=/api/v1

# === DATABASE (MongoDB Atlas) ===
MONGO_URI=mongodb+srv://username:password@cluster-name.mongodb.net/?retryWrites=true&w=majority

# === CACHE (Managed Redis) ===
REDIS_URL=redis://default:password@host:6379

# === SECURITY ===
JWT_ACCESS_SECRET=generate-strong-random-32-chars
JWT_REFRESH_SECRET=generate-strong-random-32-chars
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=30d
COOKIE_SECURE=true
COOKIE_DOMAIN=your-domain.com
BCRYPT_SALT_ROUNDS=12

# === ADMIN ===
PLATFORM_ADMIN_EMAIL=admin@your-domain.com
PLATFORM_ADMIN_PASSWORD=StrongPassword123!

# === LOGGING ===
LOG_LEVEL=info

# === QUEUE ===
QUEUE_PREFIX=aegisplane

# === SMTP ===
SMTP_FROM=noreply@your-domain.com
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
```

---

## Adding Environment Variables in Render

### Via Dashboard

1. Navigate to your service
2. Click **Settings**
3. Scroll to **Environment**
4. Click **Add Environment Variable**
5. Enter Key and Value
6. Click **Save Changes**
7. Service auto-redeploys

### Via render.yaml

```yaml
services:
  - type: web
    name: aegisplane-backend
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGO_URI
        sync: false # Don't sync with .env
```

---

## Monitoring & Logging

### Logs Tab

```
Render Dashboard → Your Service → Logs
```

**Expected startup logs:**

```
Database connection established
MongoDB connected successfully
AegisPlane backend listening on port PORT
```

### Key Log Lines to Look For

| Log                               | Meaning              |
| --------------------------------- | -------------------- |
| `Database connection established` | ✅ MongoDB connected |
| `listening on port 4000`          | ✅ Server running    |
| `Failed to connect to MongoDB`    | ❌ Check MONGO_URI   |
| `REDIS_URL not found`             | ❌ Check REDIS_URL   |
| `JWT_ACCESS_SECRET not set`       | ❌ Add env var       |

### Monitoring Best Practices

1. **Error Tracking:** Set up Sentry integration
2. **Logs:** Stream logs to logging service
3. **Metrics:** Monitor via Render dashboard
4. **Alerts:** Set up alerts for errors

---

## Testing After Deployment

### Test Backend Health

```bash
curl https://aegisplane-backend-xxxxx.onrender.com/api/v1/health
```

Expected response: 200 OK

### Test Authentication

```bash
curl -X POST https://aegisplane-backend-xxxxx.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@aegisplane.dev",
    "password": "ChangeMeNow123!"
  }'
```

Expected response: 200 with access token

### Verify Database Connection

1. Go to MongoDB Atlas dashboard
2. Click **Databases** → **Browse Collections**
3. Select `aegisplane` database
4. Verify collections exist (users, tenants, roles, etc.)
5. Check for data after login/tenant creation

---

## Troubleshooting

### Build Failures

| Error                | Solution                                                         |
| -------------------- | ---------------------------------------------------------------- |
| `npm WARN` on sharp  | Ignore; cross-platform compatibility                             |
| `Cannot find module` | Run `npm ci` locally, verify dependencies                        |
| `tsc not found`      | Ensure TypeScript installed: `npm install typescript --save-dev` |

### Runtime Errors

| Error                     | Solution                                                 |
| ------------------------- | -------------------------------------------------------- |
| `MONGO_URI not found`     | Add to Render Environment variables                      |
| `Connection timeout`      | Check MongoDB Atlas IP whitelist includes Render IPs     |
| `Redis connection failed` | Check REDIS_URL, verify Redis service running            |
| `Port already in use`     | Render assigns PORT; ensure code uses `process.env.PORT` |

### Deployment Fails to Start

1. Check **Logs** tab for errors
2. Verify all required environment variables set
3. Ensure `npm start` works locally: `npm run build && npm start`
4. Check MongoDB Atlas accessibility
5. Verify Redis connection string

### Slow Initial Deployment

- First deployment builds everything (~3-5 minutes)
- Subsequent deployments faster if only code changed
- Cache dependencies between builds

---

## Production Readiness Checklist

### Pre-Deployment

- [ ] MongoDB Atlas cluster created and accessible
- [ ] Redis service provisioned and running
- [ ] Email service configured (SMTP)
- [ ] Domain name obtained (for COOKIE_DOMAIN)
- [ ] Frontend domain known (for APP_ORIGIN)
- [ ] Git repository ready (code committed)

### Environment Variables

- [ ] NODE_ENV set to `production`
- [ ] MONGO_URI is MongoDB Atlas connection string
- [ ] REDIS_URL is managed Redis connection string
- [ ] JWT_ACCESS_SECRET is strong random string (32+ chars)
- [ ] JWT_REFRESH_SECRET is strong random string (32+ chars)
- [ ] COOKIE_SECURE set to `true`
- [ ] COOKIE_DOMAIN set to your domain
- [ ] APP_ORIGIN set to frontend domain
- [ ] PLATFORM_ADMIN_PASSWORD changed from default
- [ ] SMTP configured for email service

### Render Configuration

- [ ] Service plan selected (Standard recommended for prod)
- [ ] Build command: `npm run build`
- [ ] Start command: `npm start`
- [ ] All environment variables added
- [ ] GitHub branch configured
- [ ] Auto-deploy enabled/disabled as needed

### Testing

- [ ] Backend starts without errors
- [ ] Logs show "Database connection established"
- [ ] Health endpoint responds (200 OK)
- [ ] Authentication works
- [ ] Tenant creation works
- [ ] Data appears in MongoDB Atlas
- [ ] CORS works with frontend

### Monitoring

- [ ] Error tracking configured (Sentry, etc)
- [ ] Logs monitored for errors
- [ ] Alerts configured
- [ ] Database backups verified in MongoDB Atlas
- [ ] Redis backups/persistence configured

---

## Scaling on Render

### Horizontal Scaling

Render auto-scales but you can manually increase:

1. **Settings** → **Plan**
2. Choose higher tier
3. Save changes (redeploys)

### Performance Optimization

1. **Database:**
   - Add MongoDB Atlas indexes
   - Monitor slow queries

2. **Cache:**
   - Use Redis for frequently accessed data
   - Configure Redis eviction policy

3. **Code:**
   - Use `.lean()` in Mongoose queries
   - Implement pagination for large datasets
   - Add request timeout middleware

---

## Custom Domain Setup

### Add Custom Domain to Render Service

1. Go to **Settings** → **Custom Domain**
2. Enter your domain
3. Add DNS records as shown
4. Wait for DNS propagation (5-15 min)

### Update Environment Variables for Custom Domain

After domain is live, update Render environment:

```
COOKIE_DOMAIN=your-domain.com
COOKIE_SECURE=true
APP_ORIGIN=https://your-frontend-domain.com (if different)
```

---

## GitHub Integration

### Auto-Deployment

Render auto-deploys when you push to your connected branch:

1. Push to `main` branch
2. Render detects change
3. Pulls latest code
4. Builds and deploys

### Disable Auto-Deploy

**Settings** → **Auto-Deploy** → Toggle off

### Manual Deploy

**Dashboard** → Service → **Manual Deploy** → **Deploy Latest**

---

## Environment Variables Validation

Your backend validates all required environment variables at startup using Zod schema.

**If validation fails:**

1. Check logs for specific error
2. Verify environment variable is set
3. Check for typos or missing values
4. Ensure string values don't have quotes

Example error in logs:

```
ValidationError: [
  {
    code: 'too_small',
    minimum: 16,
    type: 'string',
    path: ['JWT_ACCESS_SECRET'],
    message: 'String must contain at least 16 character(s)'
  }
]
```

---

## Cost Considerations

### MongoDB Atlas

- Free tier: 512MB storage (good for development)
- M0 (free cluster): Limited performance
- M5 or higher: Recommended for production ($52+/month)

### Redis

- Redis Cloud: Free tier available, $15+/month for production
- AWS ElastiCache: Pay-per-use
- Render Redis: Not available; use external service

### Render Backend

- Standard plan: $7/month (recommended)
- Pro plan: $25+/month
- Estimated total: $22-100+/month depending on services

---

## Useful Render Commands

### View Service Details

```bash
# Via CLI (if installed)
render service [service-id]
```

### Manual Redeploy

```bash
# Via dashboard or CLI
render deploy [service-id]
```

### View Logs Locally

```bash
# Stream logs (requires Render CLI)
render logs [service-id] --tail
```

---

## Support & Resources

- [Render Documentation](https://render.com/docs)
- [Render Node.js Guide](https://render.com/docs/deploy-node)
- [MongoDB Atlas Docs](https://docs.atlas.mongodb.com/)
- [Redis Cloud Docs](https://redis.com/docs/)

---

## Summary

**Your AegisPlane backend is ready for Render deployment.**

1. Add all environment variables to Render
2. Connect GitHub repository
3. Configure build/start commands
4. Deploy
5. Monitor logs
6. Test endpoints

**Estimated deployment time:** 5-10 minutes

**Next steps:** Follow the "Quick Start (5 Steps)" section above.

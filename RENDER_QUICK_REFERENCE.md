# Render Deployment - Quick Reference Card

**Print this or bookmark it for easy access during deployment.**

---

## 5-Step Quick Deploy

### 1️⃣ Create Render Service

- Go to https://dashboard.render.com
- **New+** → **Web Service**
- Connect GitHub repo
- Select branch (main)

### 2️⃣ Configure Build

```
Build Command:  npm run build
Start Command:  npm start
Environment:    Node
Region:         Closest to users
```

### 3️⃣ Add Environment Variables

Copy these and fill in YOUR values:

```env
# === CRITICAL (Must have) ===
NODE_ENV=production
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/
REDIS_URL=redis://default:pass@host:6379
JWT_ACCESS_SECRET=generate-with-node-command
JWT_REFRESH_SECRET=generate-with-node-command

# === IMPORTANT ===
APP_ORIGIN=https://your-frontend-domain.com
COOKIE_SECURE=true
COOKIE_DOMAIN=your-domain.com
PLATFORM_ADMIN_PASSWORD=StrongPassword123!

# === RECOMMENDED ===
LOG_LEVEL=info
PORT=4000
BCRYPT_SALT_ROUNDS=12
QUEUE_PREFIX=aegisplane
SMTP_FROM=noreply@your-domain.com

# === IF USING EMAIL ===
SMTP_HOST=smtp.provider.com
SMTP_PORT=587
```

### 4️⃣ Select Plan

- **Free** - Testing only (sleeps after 15 min)
- **Standard** - $7/month ✅ **Recommended**
- **Pro** - $25+/month

### 5️⃣ Deploy

- Click **Deploy**
- Monitor logs
- Success: "Database connection established"

---

## Generate Secrets (Copy-Paste)

```bash
# Run in terminal to generate random secrets:

# JWT Access Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# JWT Refresh Secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Admin Password
node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"
```

Copy outputs into Render environment variables.

---

## Critical Environment Variables

| Variable                  | Example                                        | Min Length      |
| ------------------------- | ---------------------------------------------- | --------------- |
| `MONGO_URI`               | `mongodb+srv://user:pass@cluster.mongodb.net/` | ✓ Required      |
| `REDIS_URL`               | `redis://default:pass@host:6379`               | ✓ Required      |
| `JWT_ACCESS_SECRET`       | Random string                                  | 16+ chars       |
| `JWT_REFRESH_SECRET`      | Random string                                  | 16+ chars       |
| `PLATFORM_ADMIN_PASSWORD` | Strong password                                | 12+ chars       |
| `COOKIE_DOMAIN`           | your-domain.com                                | Domain matching |
| `APP_ORIGIN`              | https://your-domain.com                        | Must be HTTPS   |

---

## Success Log Messages

After deployment, look in **Logs** tab for:

```
✅ Database connection established
✅ MongoDB connected successfully
✅ AegisPlane backend listening on port 4000
```

If you see errors, check logs and references below.

---

## Common Errors & Fixes

### ❌ "MONGO_URI not found"

**Fix:** Add to Render environment variables

### ❌ "Connection timeout"

**Fix:** Check MongoDB Atlas IP whitelist, add Render IPs

### ❌ "String must be at least 16 chars"

**Fix:** Generate new JWT secret with node command above

### ❌ "Invalid email"

**Fix:** Verify PLATFORM_ADMIN_EMAIL format (user@domain.com)

### ❌ "Cannot connect to Redis"

**Fix:** Check REDIS_URL, verify Redis service running

---

## Test Endpoints

```bash
# Get your backend URL from Render dashboard
BACKEND_URL="https://aegisplane-backend-xxxxx.onrender.com"

# Test health
curl $BACKEND_URL/api/v1/health

# Test login
curl -X POST $BACKEND_URL/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email":"admin@aegisplane.dev",
    "password":"ChangeMeNow123!"
  }'
```

---

## Environment for Different Stages

### Development (Local)

```env
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/aegisplane
REDIS_URL=redis://localhost:6379
APP_ORIGIN=http://localhost:5173
COOKIE_SECURE=false
LOG_LEVEL=debug
```

### Production (Render)

```env
NODE_ENV=production
MONGO_URI=mongodb+srv://...
REDIS_URL=redis://...
APP_ORIGIN=https://your-domain.com
COOKIE_SECURE=true
LOG_LEVEL=info
```

---

## Important URLs

- **Render Dashboard:** https://dashboard.render.com
- **MongoDB Atlas:** https://cloud.mongodb.com
- **Documentation:** See docs/ folder
  - RENDER_DEPLOYMENT.md (full guide)
  - RENDER_ENV_REFERENCE.md (all variables)
  - RENDER_DEPLOYMENT_CHECKLIST.md (step-by-step)
  - ENV_VALIDATION_GUIDE.md (error troubleshooting)

---

## Post-Deploy Checklist

- [ ] Logs show success messages
- [ ] Health endpoint works (200 OK)
- [ ] Login works (get JWT tokens)
- [ ] MongoDB has data
- [ ] No errors in logs (5 min check)
- [ ] Frontend can connect

---

## Environment Variables Validation

Your backend validates ALL environment variables at startup.

**If invalid:** Backend exits immediately (won't start)

**Fix:**

1. Check error in logs
2. Find variable in Render Settings
3. Update value
4. Redeploy

**Format rules:**

- **Strings:** Min length met, no special formatting needed
- **Emails:** Must be valid format (user@domain.com)
- **URLs:** Must start with https://
- **Numbers:** Just digits (4000, not "4000")
- **Booleans:** Lowercase "true" or "false" (string)

---

## Cost Breakdown

| Service        | Cost           | Notes                |
| -------------- | -------------- | -------------------- |
| Render Backend | $7/month       | Standard plan        |
| MongoDB Atlas  | $57/month      | M5 cluster (minimum) |
| Redis Cloud    | $15/month      | Basic managed Redis  |
| **Total**      | **~$79/month** | Scales with usage    |

---

## Monitoring

**Where to check:**

1. Render Dashboard → Logs tab (real-time logs)
2. MongoDB Atlas → Monitoring (database metrics)
3. Redis service dashboard (cache metrics)

**Key alerts to set:**

- Backend crashes
- Database connection fails
- Error rate spike
- Memory/CPU high

---

## Team Information Template

After deployment, share:

```markdown
## Backend is Live!

**Backend URL:** https://aegisplane-backend-xxxxx.onrender.com
**API Prefix:** /api/v1

**Admin:**

- Email: admin@your-domain.com
- Password: [from PLATFORM_ADMIN_PASSWORD]

**Frontend Setup:**
Set APP_ORIGIN environment to backend URL

**Documentation:**

- Setup: docs/RENDER_SETUP_COMPLETE.md
- Reference: docs/RENDER_ENV_REFERENCE.md
- Errors: docs/ENV_VALIDATION_GUIDE.md
```

---

## Redeploy / Rollback

### Redeploy (Push Code Update)

```bash
git push origin main
# Render auto-deploys (2-3 minutes)
```

### Manual Redeploy

In Render Dashboard → Service → **Manual Deploy**

### Rollback

In Render Dashboard → **Deployments** tab → Find previous → **Revert**

---

## Timings

| Task              | Time          |
| ----------------- | ------------- |
| Generate secrets  | 2 min         |
| Add env variables | 5 min         |
| Initial deploy    | 5 min         |
| Build time        | 3-5 min       |
| Total deployment  | 15-20 min     |
| Testing           | 5-10 min      |
| **Total**         | **30-45 min** |

---

## Useful Commands

```bash
# Generate random secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Check env variable is set (local)
echo $MONGO_URI

# Build locally
npm run build

# Start locally (after build)
npm start

# Type check
npm run lint

# View git commits (for rollback reference)
git log --oneline -5
```

---

## Files You Have

**Documentation:**

- docs/RENDER_SETUP_COMPLETE.md (overview)
- docs/RENDER_DEPLOYMENT.md (detailed guide)
- docs/RENDER_ENV_REFERENCE.md (all variables)
- docs/RENDER_DEPLOYMENT_CHECKLIST.md (30-item checklist)
- docs/ENV_VALIDATION_GUIDE.md (error fixes)

**Configuration:**

- apps/backend/.env (template for local dev)
- apps/backend/src/config/env.ts (validation schema)
- apps/backend/src/config/database.ts (DB connection)
- apps/backend/src/server.ts (server config)

---

## Support

**Error in logs?**
Check docs/ENV_VALIDATION_GUIDE.md (20+ errors explained)

**Stuck on setup?**
Follow docs/RENDER_DEPLOYMENT_CHECKLIST.md (step-by-step)

**Need all variables?**
Refer docs/RENDER_ENV_REFERENCE.md (complete reference)

**General help?**
Start with docs/RENDER_DEPLOYMENT.md (big picture guide)

---

## Quick Troubleshooting

| Problem             | Check                                 |
| ------------------- | ------------------------------------- |
| Can't deploy        | Git connected? Branch correct?        |
| Build fails         | Check build command (npm run build)   |
| Start command wrong | Check: npm start (not npm run dev)    |
| Env var not found   | Add to Render Settings, not .env      |
| Connection timeout  | Check IP whitelist (MongoDB, Redis)   |
| Validation error    | Check variable format (see reference) |
| Login fails         | Check JWT secrets, MONGO_URI          |

---

## Key Takeaways

✅ **All code environment-based**  
✅ **No hardcoded secrets**  
✅ **Automatic validation**  
✅ **Production-safe**  
✅ **Ready for Render**

---

**Total Prep Time:** ~45 minutes  
**Total Deploy Time:** ~15-20 minutes  
**Total Verification:** 5-10 minutes

**You're ready! 🚀**

---

_Quick Reference v1.0 | April 8, 2026_

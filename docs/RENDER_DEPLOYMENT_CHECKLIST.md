# Render Deployment Checklist - AegisPlane Backend

**Purpose:** Complete checklist to deploy AegisPlane backend to Render with MongoDB Atlas.

**Estimated Time:** 30-60 minutes  
**Prerequisites:**

- GitHub account with repository
- MongoDB Atlas cluster created
- Redis service credentials
- Render account (https://render.com)
- Domain name (optional but recommended)

---

## Pre-Deployment (Day Before)

### [ ] 1. Code Preparation

- [ ] All code committed to Git
- [ ] No sensitive data in code (no hardcoded secrets)
- [ ] `.env` file is in `.gitignore`
- [ ] Backend builds locally: `npm run build`
- [ ] Backend starts locally: `npm run dev` or `npm start`

### [ ] 2. MongoDB Atlas

- [ ] Cluster created and running
- [ ] Database user created with strong password
- [ ] IP whitelist configured (add Render IPs: 0.0.0.0/0 or specific IPs)
- [ ] Connection string obtained and tested locally
- [ ] Format: `mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority`

### [ ] 3. Redis Service

- [ ] Redis service provisioned (Redis Cloud, AWS, DigitalOcean, etc)
- [ ] Connection string obtained
- [ ] Format: `redis://default:password@host:6379` or `redis://host:6379`
- [ ] Connection tested from local machine (if possible)

### [ ] 4. Secrets Generation

Generate strong secrets in terminal:

```bash
# JWT Access Secret
node -e "console.log('JWT_ACCESS_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
# Copy output

# JWT Refresh Secret
node -e "console.log('JWT_REFRESH_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
# Copy output

# Admin Password (optional - can change after)
node -e "console.log('ADMIN_PASSWORD=' + require('crypto').randomBytes(16).toString('hex'))"
# Copy output
```

- [ ] JWT_ACCESS_SECRET generated and saved securely
- [ ] JWT_REFRESH_SECRET generated and saved securely
- [ ] Strong admin password generated

### [ ] 5. Email Service (Optional)

- [ ] Email provider chosen (SendGrid, Gmail, Outlook, AWS SES, etc)
- [ ] SMTP credentials obtained
- [ ] SMTP_HOST noted
- [ ] SMTP_PORT noted
- [ ] Email address prepared for SMTP_FROM

---

## Render Setup (15 minutes)

### [ ] 6. Create Render Account

- [ ] Visit https://render.com
- [ ] Create account (or login if existing)
- [ ] Verify email
- [ ] GitHub connected (for easy deployment)

### [ ] 7. Create Web Service

- [ ] Go to Render Dashboard
- [ ] Click "New+" → "Web Service"
- [ ] Select "Build and deploy from Git repository"
- [ ] Authorize GitHub to Render
- [ ] Select your repository
- [ ] Select branch (`main`, `develop`, etc)
- [ ] Click "Create Web Service"

### [ ] 8. Configure Build Settings

**On the service configuration page:**

- [ ] Name updated (e.g., `aegisplane-backend`)
- [ ] Environment set to "Node"
- [ ] Region selected (closest to users)
- [ ] Build Command: `npm run build`
- [ ] Start Command: `npm start`

### [ ] 9. Select Plan

- [ ] Plan chosen:
  - [ ] Free plan (testing only - not production)
  - [ ] Standard ($7/month) ✅ Recommended
  - [ ] Pro ($25+/month)

---

## Environment Variables Configuration (10-15 minutes)

### [ ] 10. Add Environment Variables

In Render Dashboard → Settings → Environment:

**Core Database Variables:**

- [ ] MONGO_URI = `mongodb+srv://...`
- [ ] REDIS_URL = `redis://...`

**Security Secrets:**

- [ ] JWT_ACCESS_SECRET = (generated value)
- [ ] JWT_REFRESH_SECRET = (generated value)

**Server Configuration:**

- [ ] NODE_ENV = `production`
- [ ] PORT = `4000`

**CORS & Cookies:**

- [ ] APP_ORIGIN = `https://your-frontend-domain.com`
- [ ] COOKIE_SECURE = `true`
- [ ] COOKIE_DOMAIN = `your-domain.com`

**Admin:**

- [ ] PLATFORM_ADMIN_EMAIL = `admin@your-domain.com`
- [ ] PLATFORM_ADMIN_PASSWORD = (strong password)

**Logging & Operations:**

- [ ] LOG_LEVEL = `info`
- [ ] QUEUE_PREFIX = `aegisplane`
- [ ] API_PREFIX = `/api/v1`

**Email (if using):**

- [ ] SMTP_FROM = `noreply@your-domain.com`
- [ ] SMTP_HOST = `smtp.your-provider.com`
- [ ] SMTP_PORT = `587`

### [ ] 11. Verify All Variables Set

Count variables in Render:

Expected: 20-25 variables depending on email configuration

- [ ] All variables visible in Render dashboard
- [ ] No missing required variables
- [ ] No typos in variable names (case-sensitive)

---

## Deployment (5 minutes)

### [ ] 12. Deploy

- [ ] Click "Deploy" button in Render
- [ ] Watch deployment progress
- [ ] Monitor build logs for errors

### [ ] 13. Monitor Logs During Build

**Look for these successful messages:**

```
npm ci --production
npm run build
Successfully built
Starting web service
Database connection established
MongoDB connected successfully
AegisPlane backend listening on port 4000
```

**If you see errors:**

- [ ] Check **Logs** tab for error messages
- [ ] Verify environment variables are set correctly
- [ ] Check MongoDB Atlas IP whitelist
- [ ] Ensure Redis is accessible
- [ ] Verify connection strings have no typos

---

## Post-Deployment Testing (10 minutes)

### [ ] 14. Verify Backend Started

**In Render Logs, look for:**

```
Database connection established
MongoDB connected successfully
listening on port
```

- [ ] No error messages in logs
- [ ] Service shows as "running" in Render
- [ ] URL shown in Render dashboard accessible

### [ ] 15. Test Health Endpoint

```bash
curl https://aegisplane-backend-xxxxx.onrender.com/api/v1/health
```

Expected response: 200 OK

- [ ] Endpoint responds with 200 status
- [ ] Response received within 2 seconds

### [ ] 16. Test Authentication

```bash
curl -X POST https://aegisplane-backend-xxxxx.onrender.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@aegisplane.dev",
    "password": "ChangeMeNow123!"
  }'
```

Expected response: 200 with JWT tokens

- [ ] Login endpoint works
- [ ] Response includes `accessToken`
- [ ] Response includes `refreshToken`
- [ ] Response includes auth context with userId

### [ ] 17. Verify Database Connection

In MongoDB Atlas:

1. Go to https://cloud.mongodb.com
2. Select your cluster
3. Click **Collections** tab

- [ ] `aegisplane` database exists
- [ ] Collections visible (users, tenants, roles, sessions, etc)
- [ ] Collections list matches application models

### [ ] 18. Test Tenant Creation

As authenticated admin (using access token from login):

```bash
curl -X POST https://aegisplane-backend-xxxxx.onrender.com/api/v1/tenants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer [ACCESS_TOKEN]" \
  -d '{
    "name": "Test Tenant",
    "slug": "test-tenant",
    "plan": "free",
    "adminEmail": "admin@test.com",
    "adminName": "Admin"
  }'
```

- [ ] Request succeeds (200-201 status)
- [ ] Tenant created with returned tenantId
- [ ] Verify in MongoDB Atlas Collections

### [ ] 19. Frontend Integration Test

With frontend running locally:

- [ ] Frontend can reach backend API
- [ ] CORS not blocked (check browser console)
- [ ] Login works from frontend
- [ ] Authentication tokens stored in cookies
- [ ] No CORS errors in browser console

### [ ] 20. Error Scenarios

Test error handling:

- [ ] Invalid login credentials return 401
- [ ] Missing auth header returns 401
- [ ] Invalid JWT returns 401
- [ ] Non-existent endpoint returns 404
- [ ] Rate limiting triggers after threshold

---

## Production Verification (10 minutes)

### [ ] 21. Security Verification

- [ ] Logs don't contain sensitive data (secrets, passwords)
- [ ] COOKIE_SECURE = true (HTTPS only)
- [ ] JWT tokens in cookies (not localStorage)
- [ ] Password hashing working (use bcrypt)
- [ ] No console.log statements exposing data

### [ ] 22. Performance Check

- [ ] Login response < 1 second
- [ ] Tenant creation response < 2 seconds
- [ ] List operations paginated
- [ ] No N+1 query issues in logs

### [ ] 23. Database Verification

In MongoDB Atlas:

- [ ] Data being written correctly
- [ ] Indexes on commonly queried fields
- [ ] Backup enabled and working
- [ ] Retention policy set (e.g., 30 days)

### [ ] 24. Monitoring Setup

- [ ] Render logs accessible
- [ ] MongoDB Atlas monitoring dashboard accessed
- [ ] Critical errors would be visible
- [ ] (Optional) Error tracking service configured (Sentry, etc)

---

## Post-Deployment Configuration (5 minutes)

### [ ] 25. Admin Setup

- [ ] Login with admin account
- [ ] Change admin password (security best practice)
- [ ] Configure platform settings
- [ ] Create default roles if needed

### [ ] 26. Environment-Specific Tasks

If using custom domain:

- [ ] Domain DNS updated to point to Render
- [ ] Custom domain added in Render settings
- [ ] SSL certificate auto-generated by Render
- [ ] COOKIE_DOMAIN updated to custom domain
- [ ] APP_ORIGIN updated if frontend on custom domain

### [ ] 27. Documentation Updated

- [ ] Backend URL documented
- [ ] Environment variables documented for team
- [ ] Deployment process documented
- [ ] Troubleshooting guide created

### [ ] 28. Team Notification

- [ ] Team informed deployment is live
- [ ] Shared backend URL
- [ ] Shared admin credentials (securely)
- [ ] Shared API documentation

---

## Ongoing Monitoring

### [ ] 29. Set Up Alerts

- [ ] Error alerts configured
- [ ] Uptime monitoring enabled (Render's built-in or external)
- [ ] Database backup alerts enabled
- [ ] (Optional) Performance alerts configured

### [ ] 30. Regular Checks (Daily First Week)

- [ ] Backend running without errors
- [ ] No increase in error rate
- [ ] Response times stable
- [ ] Database size within limits
- [ ] Redis memory usage acceptable

---

## Troubleshooting During Deployment

### If deployment fails to build:

1. Check **Logs** tab for specific error
2. Common issues:
   - [ ] Missing `npm run build` script
   - [ ] TypeScript errors during build
   - [ ] Missing dependencies
   - [ ] Wrong Node version

**Solution:**

- [ ] Run locally: `npm ci && npm run build`
- [ ] Fix any errors shown
- [ ] Commit changes
- [ ] Trigger manual redeploy in Render

### If backend starts but can't connect to MongoDB:

1. Check MONGO_URI in Render environment
2. Verify MongoDB Atlas:
   - [ ] IP whitelist includes Render IPs
   - [ ] Connection string correct
   - [ ] Database user has correct permissions

**Solution:**

- [ ] Add Render IP to MongoDB Atlas whitelist
- [ ] Test connection string locally
- [ ] Verify format: `mongodb+srv://...`

### If backend starts but can't connect to Redis:

1. Check REDIS_URL in Render environment
2. Verify Redis service:
   - [ ] Service is running
   - [ ] Connection string correct
   - [ ] Firewall allows connections

**Solution:**

- [ ] Test Redis connection locally
- [ ] Verify Redis credentials
- [ ] Check service provider firewall settings

### If authentication fails:

1. Check JWT secrets in Render
2. Verify they're 16+ characters
3. Ensure they're different for access and refresh

**Solution:**

- [ ] Regenerate JWT secrets
- [ ] Update in Render
- [ ] Redeploy backend
- [ ] Test again

### If frontend can't access backend (CORS error):

1. Check APP_ORIGIN in Render
2. Verify frontend domain matches exactly
3. Ensure HTTPS protocol included

**Solution:**

- [ ] Verify APP_ORIGIN = frontend domain
- [ ] Include `https://` for production
- [ ] Exact match (no trailing slash)
- [ ] Redeploy backend

---

## Rollback Procedure

If something goes wrong:

### Quick Rollback (< 5 minutes)

1. In Render dashboard
2. Click service name
3. Choose **Deployment** history
4. Find previous working deployment
5. Click **Revert** on that deployment

### Manual Rollback

1. Revert last git commits
2. Push to repository
3. Render auto-redeploys from updated code

---

## Success Criteria - All Complete ✅

- [ ] Deployment successful
- [ ] Health endpoint responds
- [ ] Login works
- [ ] Tenant creation works
- [ ] Data persists in MongoDB
- [ ] No errors in logs
- [ ] Frontend can integrate
- [ ] No CORS issues
- [ ] Security verified
- [ ] Performance acceptable
- [ ] Monitoring set up
- [ ] Team informed

---

## Summary

**Your AegisPlane backend is now running on Render!**

### Key Information

- **Backend URL:** https://aegisplane-backend-xxxxx.onrender.com
- **API Prefix:** /api/v1
- **Admin Email:** (from PLATFORM_ADMIN_EMAIL)
- **Admin Password:** (from PLATFORM_ADMIN_PASSWORD)

### Next Steps

1. Configure frontend to connect to backend URL
2. Test end-to-end user flows
3. Set up monitoring and alerts
4. Plan for scaling if needed

### Support

- Render Dashboard: https://dashboard.render.com
- Render Docs: https://render.com/docs
- Service logs: Dashboard → Logs tab
- Environment variables: Dashboard → Settings → Environment

---

**Estimated Total Time:** 45-90 minutes  
**Difficulty:** Intermediate  
**Success Rate:** 95% (if checklist followed)

---

**Date Completed:** ********\_********

**Deployed By:** ********\_********

**Notes:** ************************\_************************

---

_Last updated: April 8, 2026_

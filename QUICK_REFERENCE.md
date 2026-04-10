# Quick Reference - MongoDB Atlas Deployment

**Print this or keep it open during deployment.**

---

## Essential URLs

- **MongoDB Atlas Dashboard:** https://cloud.mongodb.com
- **Your Cluster:** MongoDB Atlas → Databases → [Your Cluster Name]
- **Connection String:** Database → Connect → Drivers → Copy connection string

---

## Critical Environment Variables

```env
NODE_ENV=production
PORT=4000
MONGO_URI=mongodb+srv://username:password@cluster-name.mongodb.net/?retryWrites=true&w=majority
REDIS_URL=redis://host:port
JWT_ACCESS_SECRET=[strong random 32+ char secret]
JWT_REFRESH_SECRET=[strong random 32+ char secret]
APP_ORIGIN=https://your-frontend-domain.com
COOKIE_DOMAIN=your-frontend-domain.com
COOKIE_SECURE=true
```

---

## MongoDB Atlas Setup (5 Steps)

### 1. Create Cluster

```
MongoDB Cloud → Build Database → M0 Sandbox → Create
```

### 2. Create User

```
Database → Security → Database Access → Add User
Username: aegisplane_app
Password: [STRONG PASSWORD]
Permission: readWriteAnyDatabase
```

### 3. Whitelist IP

```
Database → Network Access → Add IP
For Production: Add your server IP(s)
For Development: Add your computer IP
```

### 4. Get Connection String

```
Database → Connect → Drivers → Copy Connection String
Format: mongodb+srv://username:password@cluster-name.mongodb.net/
```

### 5. URL Encode Password If Needed

```
If password has special chars (@, :, !, etc):
Use https://www.urlencoder.org/
Replace password in connection string
```

---

## Backend Configuration (3 Steps)

### 1. Set MONGO_URI

```bash
export MONGO_URI="mongodb+srv://..."
# OR in .env file:
MONGO_URI=mongodb+srv://...
```

### 2. Install & Build

```bash
npm ci --only=production
npm run build
```

### 3. Start Backend

```bash
npm start
# Should see: "Database connection established"
# Should see: "MongoDB connected successfully"
# Should see: "listening on port 4000"
```

---

## Test Commands

### Login Test

```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@aegisplane.dev",
    "password": "ChangeMeNow123!"
  }'
```

### Production Test

```bash
curl https://your-domain.com/api/v1/health
# Or test login endpoint
```

---

## Error Resolution

| Error              | Fix                                                        |
| ------------------ | ---------------------------------------------------------- |
| Connection timeout | Check IP in MongoDB Atlas Network Access                   |
| Auth failed        | Verify MONGO_URI credentials are correct                   |
| MONGO_URI not set  | Ensure .env file exists or env var is set                  |
| SSL/TLS error      | MongoDB Atlas requires TLS; check connection string format |
| Collections empty  | Normal; Mongoose creates collections on first insert       |

---

## MongoDB Atlas Check Locations

**View your data:**

```
MongoDB Cloud Dashboard
  → Databases
    → Select Cluster
      → Browse Collections
        → Select Database (aegisplane)
          → View Collections (users, tenants, roles, etc.)
```

---

## Verification Checklist

- [ ] Backend starts without errors
- [ ] Logs show "Database connection established"
- [ ] Login endpoint works (test with curl)
- [ ] Data appears in MongoDB Atlas Collections
- [ ] Multiple concurrent requests work
- [ ] No error logs in backend

---

## Rollback (If Needed)

```bash
# Switch back to local MongoDB
MONGO_URI=mongodb://localhost:27017/aegisplane
npm start
```

---

## Key Timeouts to Know

- Initial connection: 5 seconds
- Socket operations: 45 seconds
- Access token expiry: 15 minutes
- Refresh token expiry: 30 days

---

## Complete Environment Template

```env
# === ENVIRONMENT ===
NODE_ENV=production
PORT=4000

# === DATABASE ===
# Format: mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGO_URI=mongodb+srv://aegisplane_app:SecurePassword@cluster-prod.mongodb.net/?retryWrites=true&w=majority

# === CACHE & QUEUE ===
REDIS_URL=redis://default:RedisPassword@redis-host:6379

# === SECURITY ===
JWT_ACCESS_SECRET=GenerateSecureRandomString32CharsOrMore
JWT_REFRESH_SECRET=GenerateSecureRandomString32CharsOrMore
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=30d
COOKIE_SECURE=true
COOKIE_DOMAIN=your-domain.com
BCRYPT_SALT_ROUNDS=12

# === API ===
APP_ORIGIN=https://your-domain.com
API_PREFIX=/api/v1

# === DEFAULT ADMIN (CHANGE IMMEDIATELY AFTER FIRST LOGIN) ===
PLATFORM_ADMIN_EMAIL=admin@aegisplane.dev
PLATFORM_ADMIN_PASSWORD=ChangeMeNow123!

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

## Generated Secrets Example

```bash
# Generate JWT secrets (use this in terminal):
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Copy output to JWT_ACCESS_SECRET and JWT_REFRESH_SECRET
```

---

## Production Verification Flow

```
1. Code deployed
   ↓
2. Backend starts
   ↓
3. Logs "Database connection established"
   ↓
4. Test login endpoint
   ↓
5. Check MongoDB Atlas Collections
   ↓
6. Verify data exists
   ↓
7. Monitor for errors (none expected)
   ↓
✅ DEPLOYMENT SUCCESSFUL
```

---

## Important Files

This guide references:

- `docs/MONGODB_ATLAS_MIGRATION.md` - Detailed step-by-step
- `docs/deployment.md` - Full deployment guide
- `docs/PRODUCTION_READINESS.md` - Verification checklist
- `.env.example` - Template with all variables

---

## Support

1. **Connection Issues?** → See MongoDB Atlas Troubleshooting in full deployment guide
2. **Can't find something?** → Check docs/deployment.md
3. **Need verification steps?** → See docs/PRODUCTION_READINESS.md

---

**Last Updated:** April 8, 2026  
**Status:** Ready to Deploy ✅

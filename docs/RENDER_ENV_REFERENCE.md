# Render Environment Variables Reference

**Purpose:** Quick reference for all environment variables needed for AegisPlane backend on Render.

---

## Critical Variables (Must Set)

These variables **must** be configured in Render or backend will fail to start.

### 1. Database - MONGO_URI

**Type:** String  
**Required:** YES  
**Example:**

```
mongodb+srv://username:password@cluster-name.mongodb.net/?retryWrites=true&w=majority
```

**How to get:**

1. Go to MongoDB Atlas: https://cloud.mongodb.com
2. Database → Connect → Drivers → Copy connection string
3. Replace `<username>` and `<password>` with database user credentials
4. URL-encode password if it contains special characters

**Validation:**

- Minimum length: 1
- Must contain mongodb connection string
- Fails if cannot connect on startup

---

### 2. Database - REDIS_URL

**Type:** String  
**Required:** YES  
**Example:**

```
redis://default:password@redis-host:6379
redis://host:6379 (if no auth)
```

**How to get:**

1. Use managed Redis service:
   - Redis Cloud (free tier)
   - AWS ElastiCache
   - DigitalOcean Managed Redis
2. Copy connection string from service dashboard

**Validation:**

- Minimum length: 1
- Must be valid Redis connection
- Fails if cannot connect on startup

---

### 3. Security - JWT_ACCESS_SECRET

**Type:** String  
**Required:** YES  
**Minimum Length:** 16 characters  
**Recommended:** 32+ characters random string

**Generate:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Example:**

```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

**Validation:**

- Must be at least 16 characters
- Used to sign JWT access tokens
- Different from refresh secret

---

### 4. Security - JWT_REFRESH_SECRET

**Type:** String  
**Required:** YES  
**Minimum Length:** 16 characters  
**Recommended:** 32+ characters random string

**Generate:**

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Validation:**

- Must be at least 16 characters
- Used to sign JWT refresh tokens
- Must be different from access secret

---

## Production Variables (Recommended)

These variables should be set for production but have defaults for local development.

### 5. Environment - NODE_ENV

**Type:** enum: `development` | `test` | `production`  
**Required:** NO  
**Default:** `development`  
**Recommended for Render:** `production`

**Effect:**

```javascript
if (NODE_ENV === "production") {
  COOKIE_SECURE = true; // Enforce HTTPS
  LOG_LEVEL = info; // Less verbose logging
}
```

---

### 6. Server - PORT

**Type:** Number  
**Required:** NO  
**Default:** 4000  
**Recommended for Render:** 4000

**Note:** Render assigns a dynamic port via PORT environment variable. Backend must read this value (already configured).

---

### 7. Frontend - APP_ORIGIN

**Type:** URL string  
**Required:** NO  
**Default:** `http://localhost:5173`  
**Recommended for Render:** `https://your-frontend-domain.com`

**Effect:** Used for CORS (allow cross-origin requests from frontend)

**Important:** Must match your frontend domain exactly:

- Include protocol: `https://` (not `http://`)
- Include domain: `your-domain.com`
- Can include port: `https://your-domain.com:3000` (if frontend on custom port)

**CORS Error?** If frontend can't access backend, verify this matches frontend domain.

---

### 8. API - API_PREFIX

**Type:** String  
**Required:** NO  
**Default:** `/api/v1`  
**Recommended:** Leave as default

**Effect:** All API routes prefixed with this value. Changing requires updating frontend.

---

### 9. Security - COOKIE_SECURE

**Type:** Boolean (string: `true` or `false`)  
**Required:** NO  
**Default:** `false`  
**Recommended for Render:** `true`

**Effect:**

```
true  = Cookies only sent over HTTPS (production)
false = Cookies sent over HTTP (development)
```

**Important:** Must be `true` for production with HTTPS.

---

### 10. Security - COOKIE_DOMAIN

**Type:** String  
**Required:** NO (optional)  
**Default:** undefined  
**Recommended for Render:** `your-domain.com`

**Effect:** Domain for which cookies are valid.

**Examples:**

- `your-domain.com` - Works for subdomains
- `api.your-domain.com` - Only works for api subdomain
- Leave empty for localhost

**Important:** Required if frontend and backend on different subdomains.

---

### 11. Security - BCRYPT_SALT_ROUNDS

**Type:** Number  
**Required:** NO  
**Default:** 12  
**Valid Range:** 10-15  
**Recommended:** 12

**Effect:** Password hashing strength (higher = slower but more secure)

**Recommended:** Leave at 12 (good balance of security/performance)

---

## Admin & Platform Variables

### 12. Admin - PLATFORM_ADMIN_EMAIL

**Type:** Email string  
**Required:** NO  
**Default:** `admin@aegisplane.dev`  
**Recommended:** `admin@your-domain.com`

**Effect:** Email of default platform admin user. Created on first startup if doesn't exist.

**Important:** Change to your email in production.

---

### 13. Admin - PLATFORM_ADMIN_PASSWORD

**Type:** String  
**Required:** NO  
**Minimum Length:** 12 characters  
**Default:** `ChangeMeNow123!`  
**Recommended:** Strong random password

**Effect:** Password for default admin user. Created on first startup if doesn't exist.

**Important:**

- Change this immediately in production
- Must be at least 12 characters
- Use strong password with uppercase, lowercase, numbers, symbols

---

## Time Configuration Variables

### 14. JWT - JWT_ACCESS_TTL

**Type:** String (duration)  
**Required:** NO  
**Default:** `15m`  
**Examples:** `15m`, `30m`, `1h`, `24h`

**Effect:** How long access tokens are valid before requiring refresh.

**Recommended:** `15m` (15 minutes)

---

### 15. JWT - JWT_REFRESH_TTL

**Type:** String (duration)  
**Required:** NO  
**Default:** `30d`  
**Examples:** `7d`, `30d`, `60d`

**Effect:** How long refresh tokens are valid.

**Recommended:** `30d` (30 days)

---

## Logging & Operations

### 16. Logging - LOG_LEVEL

**Type:** enum: `fatal` | `error` | `warn` | `info` | `debug` | `trace`  
**Required:** NO  
**Default:** `info`  
**Recommended for Render:** `info` or `warn`

**Effect:** Verbosity of logs.

| Level   | Use Case                           |
| ------- | ---------------------------------- |
| `fatal` | Only critical errors (app crashes) |
| `error` | Error conditions                   |
| `warn`  | Warning conditions                 |
| `info`  | General information ✅ Recommended |
| `debug` | Detailed debugging (development)   |
| `trace` | Very detailed (rarely used)        |

---

### 17. Queue - QUEUE_PREFIX

**Type:** String  
**Required:** NO  
**Default:** `aegisplane`

**Effect:** Prefix for queue names in Redis.

**Recommended:** Leave as default or change to match environment (e.g., `aegisplane_prod`, `aegisplane_staging`).

---

## Email (SMTP) Variables

### 18. SMTP - SMTP_FROM

**Type:** Email string  
**Required:** NO  
**Default:** `noreply@aegisplane.dev`  
**Recommended:** `noreply@your-domain.com`

**Effect:** From address for sent emails.

**Important:** Use your domain email address.

---

### 19. SMTP - SMTP_HOST

**Type:** String (hostname)  
**Required:** NO  
**Default:** `mailhog`  
**Examples:** `smtp.sendgrid.net`, `smtp.gmail.com`, `smtp-mail.outlook.com`

**Effect:** SMTP server for sending emails.

**Common Providers:**

- SendGrid: `smtp.sendgrid.net`
- Gmail: `smtp.gmail.com`
- Outlook: `smtp-mail.outlook.com`
- AWS SES: `email-smtp.region.amazonaws.com`
- MailHog (testing): `mailhog` (local only)

---

### 20. SMTP - SMTP_PORT

**Type:** Number  
**Required:** NO  
**Default:** 1025  
**Examples:** 25, 587, 465, 2525

**Effect:** Port for SMTP connection.

**Common Ports:**

- 25: Standard SMTP
- 587: SMTP with TLS (recommended)
- 465: SMTP with SSL
- 2525: Alternative port (some providers)

---

## Complete Environment Variables Checklist

### Render Dashboard Entry

Copy and paste into Render environment variables:

```
NODE_ENV=production
PORT=4000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
REDIS_URL=redis://default:password@host:6379
JWT_ACCESS_SECRET=generate-random-32-char-string-here
JWT_REFRESH_SECRET=generate-random-32-char-string-here
JWT_ACCESS_TTL=15m
JWT_REFRESH_TTL=30d
APP_ORIGIN=https://your-frontend-domain.com
API_PREFIX=/api/v1
COOKIE_SECURE=true
COOKIE_DOMAIN=your-domain.com
BCRYPT_SALT_ROUNDS=12
PLATFORM_ADMIN_EMAIL=admin@your-domain.com
PLATFORM_ADMIN_PASSWORD=StrongPassword123!
LOG_LEVEL=info
QUEUE_PREFIX=aegisplane
SMTP_FROM=noreply@your-domain.com
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
```

---

## Validation Rules

Your backend validates all environment variables at startup using Zod schema.

### Validation Errors

If backend fails to start with validation error, check:

1. **Required variables missing:**
   - MONGO_URI
   - REDIS_URL
   - JWT_ACCESS_SECRET (min 16 chars)
   - JWT_REFRESH_SECRET (min 16 chars)

2. **Invalid values:**
   - PLATFORM_ADMIN_EMAIL: Must be valid email format
   - PLATFORM_ADMIN_PASSWORD: Must be minimum 12 characters
   - PORT: Must be valid number
   - BCRYPT_SALT_ROUNDS: Must be 10-15

3. **Format issues:**
   - COOKIE_SECURE: Must be string `true` or `false` (not boolean)
   - TTL values: Must be valid duration strings (15m, 1h, etc)

---

## Environment Variables for Different Environments

### Development (Local)

```env
NODE_ENV=development
PORT=4000
MONGO_URI=mongodb://localhost:27017/aegisplane
REDIS_URL=redis://localhost:6379
APP_ORIGIN=http://localhost:5173
COOKIE_SECURE=false
COOKIE_DOMAIN=localhost
JWT_ACCESS_SECRET=dev-secret-minimum-16-chars
JWT_REFRESH_SECRET=dev-secret-minimum-16-chars
PLATFORM_ADMIN_PASSWORD=DevPassword123!
SMTP_HOST=mailhog
LOG_LEVEL=debug
```

### Staging (Pre-production)

```env
NODE_ENV=production
MONGO_URI=mongodb+srv://user:pass@cluster-staging.mongodb.net/
REDIS_URL=redis://default:pass@host:6379
APP_ORIGIN=https://staging.your-domain.com
COOKIE_SECURE=true
COOKIE_DOMAIN=staging.your-domain.com
LOG_LEVEL=info
```

### Production (Render)

```env
NODE_ENV=production
MONGO_URI=mongodb+srv://user:pass@cluster-prod.mongodb.net/
REDIS_URL=redis://default:pass@host:6379
APP_ORIGIN=https://your-domain.com
COOKIE_SECURE=true
COOKIE_DOMAIN=your-domain.com
LOG_LEVEL=info
PLATFORM_ADMIN_PASSWORD=[strong random password]
```

---

## Security Best Practices

1. **Never commit .env files:** .env is in .gitignore
2. **Use strong secrets:** Generate with `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
3. **Different secrets per environment:** Dev secrets ≠ Staging ≠ Production
4. **Rotate secrets regularly:** Especially JWT_ACCESS_SECRET and JWT_REFRESH_SECRET
5. **Use managed services:** Don't use local MongoDB/Redis in production
6. **Monitor access logs:** Check Render and MongoDB Atlas logs for unauthorized access
7. **Keep backups:** Enable MongoDB Atlas backups and Redis persistence
8. **Use HTTPS:** Always use HTTPS in production (COOKIE_SECURE=true)

---

## Troubleshooting Environment Variables

### Variable Not Recognized

**Problem:** Backend starts but doesn't use your variable value

**Solutions:**

1. Verify spelling (case-sensitive)
2. Restart application (Render redeploy)
3. Clear browser cache (environment variables may be cached)
4. Check logs for validation errors

### Connection Errors

**Problem:** "Cannot connect to MongoDB/Redis" in logs

**Solutions:**

1. Verify connection string format
2. Check IP whitelist (MongoDB Atlas, Redis)
3. Ensure MongoDB/Redis service is running
4. Test locally with same connection string

### Validation Errors at Startup

**Problem:** Backend fails to start with "ValidationError"

**Solutions:**

1. Check error message for specific field
2. Verify value meets requirements (length, format)
3. Look for special characters needing URL encoding
4. Ensure boolean values are strings ("true" not true)

---

## Quick Variable Generation

### Generate JWT Secrets

```bash
# Access secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Refresh secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Generate Admin Password

```bash
# Strong random password (20 chars, mixed case, numbers, symbols)
node -e "console.log(require('crypto').randomBytes(20).toString('hex'))"
```

---

## Summary Table

| Variable                | Type    | Required | Default               | Min Length | Production Value          |
| ----------------------- | ------- | -------- | --------------------- | ---------- | ------------------------- |
| NODE_ENV                | enum    | NO       | dev                   | -          | `production`              |
| PORT                    | number  | NO       | 4000                  | -          | 4000                      |
| MONGO_URI               | string  | YES      | -                     | 1          | MongoDB Atlas URI         |
| REDIS_URL               | string  | YES      | -                     | 1          | Managed Redis URI         |
| JWT_ACCESS_SECRET       | string  | YES      | -                     | 16         | Random 32+ chars          |
| JWT_REFRESH_SECRET      | string  | YES      | -                     | 16         | Random 32+ chars          |
| APP_ORIGIN              | URL     | NO       | http://localhost:5173 | -          | `https://your-domain.com` |
| COOKIE_SECURE           | boolean | NO       | false                 | -          | `true`                    |
| COOKIE_DOMAIN           | string  | NO       | -                     | -          | your-domain.com           |
| PLATFORM_ADMIN_PASSWORD | string  | NO       | ChangeMeNow123!       | 12         | Strong password           |
| LOG_LEVEL               | enum    | NO       | info                  | -          | info                      |

---

This reference is for **AegisPlane Backend** running on **Render** with **MongoDB Atlas**.

Last updated: April 8, 2026

# Environment Variables - Validation & Error Guide

**Purpose:** Understand how environment variables are validated and how to fix validation errors.

---

## How Validation Works

When AegisPlane backend starts, it validates all environment variables using a Zod schema.

**Validation Flow:**

```
1. Read .env or process.env
2. Validate each variable against schema rules
3. All valid? → Start backend ✅
4. Any invalid? → Log errors & exit ❌
```

**Key Point:** If any variable fails validation, backend **exits with code 1** (fails to start).

---

## Common Validation Errors

### Error 1: Missing Required Variable

**Log Message:**

```
Required: ["MONGO_URI"]
```

**Meaning:** MONGO_URI environment variable not set

**Solution:**

1. Add to Render environment: `MONGO_URI=mongodb+srv://...`
2. Verify in `.env` file: `MONGO_URI` present
3. Restart backend: Manual deploy in Render dashboard
4. Check logs for "Database connection established"

**Verification:**

```bash
echo $MONGO_URI  # Should print connection string
```

---

### Error 2: String Too Short

**Log Message:**

```
{
  code: 'too_small',
  minimum: 16,
  type: 'string',
  path: ['JWT_ACCESS_SECRET'],
  message: 'String must contain at least 16 character(s)'
}
```

**Meaning:** JWT_ACCESS_SECRET is less than 16 characters

**Solution:**

1. Generate new secret:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
2. Update in Render: `JWT_ACCESS_SECRET=newvalue`
3. Redeploy

**Affected Variables:**

- `JWT_ACCESS_SECRET` (min 16)
- `JWT_REFRESH_SECRET` (min 16)
- `PLATFORM_ADMIN_PASSWORD` (min 12)

---

### Error 3: Invalid Email Format

**Log Message:**

```
{
  code: 'invalid_email',
  path: ['PLATFORM_ADMIN_EMAIL'],
  message: 'Invalid email'
}
```

**Meaning:** PLATFORM_ADMIN_EMAIL is not valid email format

**Solution:**

1. Verify email format: `user@domain.com`
2. Check for typos
3. Update in Render: `PLATFORM_ADMIN_EMAIL=admin@your-domain.com`
4. Redeploy

**Format Requirements:**

- Must contain @ symbol
- Must have domain after @
- Cannot start/end with special characters
- Valid: `admin@your-domain.com`
- Invalid: `admin@@your-domain.com`, `admin@`, `@domain.com`

---

### Error 4: Invalid URL Format

**Log Message:**

```
{
  code: 'invalid_url',
  path: ['APP_ORIGIN'],
  message: 'Invalid url'
}
```

**Meaning:** APP_ORIGIN is not valid URL format

**Solution:**

1. Include protocol: `https://yoursite.com` (not `yoursite.com`)
2. Check for typos
3. Update in Render: `APP_ORIGIN=https://your-domain.com`
4. Redeploy

**Format Requirements:**

- Must include `https://` or `http://`
- Must include domain
- Valid: `https://your-domain.com`, `http://localhost:3000`
- Invalid: `your-domain.com`, `https://`, `ftp://domain.com`

---

### Error 5: Invalid Enum Value

**Log Message:**

```
{
  code: 'invalid_enum_value',
  options: ['development', 'test', 'production'],
  path: ['NODE_ENV'],
  message: 'Invalid enum value'
}
```

**Meaning:** NODE_ENV has invalid value (must be one of allowed options)

**Solution:**

1. Set to allowed value:
   - `development` (for testing)
   - `production` (for Render)
   - `test` (for testing)
2. Update in Render: `NODE_ENV=production`
3. Redeploy

**Affected Variables:**

- `NODE_ENV` → must be `development|test|production`
- `LOG_LEVEL` → must be `fatal|error|warn|info|debug|trace`

---

### Error 6: Invalid Number Format

**Log Message:**

```
{
  code: 'invalid_type',
  expected: 'number',
  received: 'string',
  path: ['PORT'],
  message: 'Expected number, received string'
}
```

**Meaning:** PORT is not a valid number

**Solution:**

1. Ensure number without quotes or other characters
2. Update in Render: `PORT=4000` (not `"4000"` or `PORT 4000`)
3. Redeploy

**Affected Variables:**

- `PORT` → must be number (e.g., 4000, 5000, 8080)
- `BCRYPT_SALT_ROUNDS` → must be number (10-15)
- `SMTP_PORT` → must be number (25, 587, 465)

---

### Error 7: Number Out of Range

**Log Message:**

```
{
  code: 'too_small',
  minimum: 10,
  type: 'number',
  path: ['BCRYPT_SALT_ROUNDS'],
  message: 'Number must be greater than or equal to 10'
}
```

**Meaning:** BCRYPT_SALT_ROUNDS is less than 10

**Solution:**

1. Set to value 10-15: `BCRYPT_SALT_ROUNDS=12`
2. Higher = more secure but slower (12 recommended)
3. Update in Render
4. Redeploy

**Affected Variables:**

- `BCRYPT_SALT_ROUNDS` → must be 10-15 (default: 12)

---

### Error 8: Boolean Parsing Issue

**Log Message:**

```
Error parsing COOKIE_SECURE or LOG_LEVEL boolean value
```

**Meaning:** Boolean string value not parsing correctly

**Solution:**

1. Set as string `true` or `false` (lowercase)
2. Do NOT use: `True`, `TRUE`, `1`, `yes`, etc.
3. Update in Render: `COOKIE_SECURE=true` (not `True` or `1`)
4. Redeploy

**Correct Format:**

```
COOKIE_SECURE=true    ✅
COOKIE_SECURE=false   ✅
COOKIE_SECURE=True    ❌ (capital T)
COOKIE_SECURE=1       ❌ (number)
COOKIE_SECURE="true"  ❌ (quoted)
```

---

## Full Environment Variables Schema

### Complete Validation Rules

```typescript
{
  // Environment & Server
  NODE_ENV: enum('development'|'test'|'production'),
  PORT: number (coerced),

  // Frontend
  APP_ORIGIN: URL string,
  API_PREFIX: string,

  // Database
  MONGO_URI: string (min 1),
  REDIS_URL: string (min 1),

  // Security - JWT
  JWT_ACCESS_SECRET: string (min 16),
  JWT_REFRESH_SECRET: string (min 16),
  JWT_ACCESS_TTL: string ('15m'),
  JWT_REFRESH_TTL: string ('30d'),

  // Security - Cookies
  COOKIE_SECURE: boolean,
  COOKIE_DOMAIN: string (optional),
  BCRYPT_SALT_ROUNDS: number (10-15),

  // Admin
  PLATFORM_ADMIN_EMAIL: email string,
  PLATFORM_ADMIN_PASSWORD: string (min 12),

  // Logging
  LOG_LEVEL: enum('fatal'|'error'|'warn'|'info'|'debug'|'trace'),

  // Operations
  QUEUE_PREFIX: string,

  // SMTP
  SMTP_FROM: email string,
  SMTP_HOST: string,
  SMTP_PORT: number
}
```

---

## Variable Validation Checklist

Before deploying, verify:

### String Variables (min length)

```
✓ JWT_ACCESS_SECRET ≥ 16 chars
✓ JWT_REFRESH_SECRET ≥ 16 chars
✓ PLATFORM_ADMIN_PASSWORD ≥ 12 chars
✓ MONGO_URI ≥ 1 char (full connection string)
✓ REDIS_URL ≥ 1 char (full connection string)
```

### Email Variables (valid email format)

```
✓ PLATFORM_ADMIN_EMAIL = email@domain.com
✓ SMTP_FROM = noreply@domain.com
```

### URL Variables (valid URL format)

```
✓ APP_ORIGIN = https://your-domain.com
```

### Enum Variables (specific values only)

```
✓ NODE_ENV ∈ [development, test, production]
✓ LOG_LEVEL ∈ [fatal, error, warn, info, debug, trace]
```

### Number Variables (valid integers)

```
✓ PORT = 4000 (or valid port number)
✓ BCRYPT_SALT_ROUNDS = 12 (10-15 range)
✓ SMTP_PORT = 587 (25, 465, or 2525)
```

### Boolean Variables (string true/false)

```
✓ COOKIE_SECURE = true or false (lowercase string)
```

---

## Debugging Validation Errors

### Step 1: Check Backend Logs

In Render dashboard → Logs tab, look for validation error details.

### Step 2: Identify Failed Variable

From error message, find which variable failed:

```
path: ['MONGO_URI']  ← This variable failed
```

### Step 3: Check Current Value

In Render dashboard → Settings → Environment:

- Find the variable
- Check its current value
- Verify format against rules above

### Step 4: Fix and Redeploy

1. Update variable value
2. Click "Save Changes"
3. Render auto-redeploys
4. Monitor logs for success

---

## Common Fix Patterns

### Pattern 1: Variable Missing

**Error:** Required variable not found in environment

**Fix:**

```
In Render Settings → Environment:
- Click "Add Environment Variable"
- Key: VARIABLE_NAME
- Value: correct_value
- Click "Add"
```

### Pattern 2: Wrong Format

**Error:** String too short, not email, not URL, etc.

**Fix:**

```
Verify expected format:
- String vars: min length met
- Email vars: user@domain.com format
- URL vars: https://domain.com format
- Numbers: valid integers only
- Booleans: lowercase "true" or "false"
```

### Pattern 3: Typo in Value

**Error:** Invalid format or value doesn't work

**Fix:**

```
1. Copy error message path
2. Find that variable in Render Settings
3. Check for typos or special characters
4. Regenerate if needed (secrets)
5. Save and redeploy
```

### Pattern 4: Value Needs Regeneration

**Error:** JWT secrets too short or weak password

**Fix:**

```bash
# Regenerate JWT secrets
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Update in Render Settings with new value
# Redeploy

# All users will need to re-login after JWT secret change
```

---

## Environment Variable Priority

Render loads environment variables in this order:

1. **Render Environment Variables** (highest priority)
   - Set in Render dashboard
   - Used for production

2. **System Environment Variables** (if not overridden)
   - Set via shell environment

3. **.env file** (if running locally)
   - Never used on Render (only local dev)
   - .env must be in .gitignore

**Key Point:** Render dashboard variables override everything else.

---

## Testing Variable Validation Locally

### Test With .env File

```bash
# Create apps/backend/.env with test values
MONGO_URI=mongodb://localhost:27017/aegisplane
JWT_ACCESS_SECRET=testvalue_at_least_16_chars_long
JWT_REFRESH_SECRET=testvalue2_at_least_16_chars_long
...

# Start backend
cd apps/backend
npm run dev

# Should see "Database connection established" if validation passes
```

### Test With Environment Variables

```bash
# Set variables in shell
export NODE_ENV=production
export JWT_ACCESS_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
export JWT_REFRESH_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
export MONGO_URI=mongodb+srv://...
export REDIS_URL=redis://...

# Start backend
npm run dev
```

### Print Current Variables (Local Testing)

```bash
# See what environment variables are set
env | grep -E 'NODE_ENV|MONGO_URI|REDIS_URL|JWT'

# See specific variable
echo $MONGO_URI
```

---

## Production Validation Checklist

- [ ] NODE_ENV=production
- [ ] All required variables set
- [ ] All strings meet minimum length
- [ ] All emails valid format
- [ ] All URLs include https://
- [ ] All numbers are valid integers
- [ ] All booleans are lowercase "true"/"false"
- [ ] No typos or extra spaces
- [ ] No hardcoded secrets in code
- [ ] .env not committed to git

---

## Error Response Format

When validation fails, you'll see error object like:

```json
{
  "code": "too_small",
  "minimum": 16,
  "type": "string",
  "path": ["JWT_ACCESS_SECRET"],
  "message": "String must contain at least 16 character(s)"
}
```

**Fields:**

- `code` - Error type (too_small, invalid_email, invalid_url, etc)
- `path` - Variable name that failed
- `message` - Human-readable error description
- `minimum`/`maximum` - (for range errors) expected range

---

## Getting Help

### If Validation Fails:

1. **Read error message** - note variable name and error type
2. **Check variable format** - verify in section above
3. **Fix value** - update in Render Settings
4. **Redeploy** - manual or auto via git push
5. **Monitor logs** - watch for "Database connection established"

### Common Queries:

- **"Who validates variables?"** Zod schema in `apps/backend/src/config/env.ts`
- **"Can I skip validation?"** No, all variables validated at startup
- **"Does validation happen every time?"** Yes, at every startup
- **"Can I change validation rules?"** Yes, edit env.ts schema (requires rebuild)

---

## Summary

Your backend uses **Zod schema validation** to ensure all environment variables are correct before starting.

**If validation fails:**

1. Check error message for variable name
2. Find that variable in Render Settings
3. Verify it matches format in this guide
4. Fix and redeploy
5. Repeat until backend starts successfully

**When backend starts successfully, you'll see:**

```
Database connection established
MongoDB connected successfully
AegisPlane backend listening on port 4000
```

---

Last updated: April 8, 2026

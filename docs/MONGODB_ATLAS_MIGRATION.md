# MongoDB Atlas Migration Guide - AegisPlane

This guide provides step-by-step instructions to migrate from local MongoDB to MongoDB Atlas for production deployment.

## Table of Contents

1. [Pre-Migration Checklist](#pre-migration-checklist)
2. [MongoDB Atlas Setup](#mongodb-atlas-setup)
3. [Backend Configuration](#backend-configuration)
4. [Testing & Verification](#testing--verification)
5. [Troubleshooting](#troubleshooting)
6. [Rollback Procedure](#rollback-procedure)

## Pre-Migration Checklist

Before starting the migration, ensure you have:

- [ ] Active MongoDB Atlas account (free tier available)
- [ ] MongoDB Compass or MongoDB Shell installed locally
- [ ] Git access to update `.env`
- [ ] Administrator access to all environments (dev, staging, prod)
- [ ] Backup of current local MongoDB database
- [ ] All team members notified of migration window

## MongoDB Atlas Setup

### 1. Create MongoDB Atlas Account

1. Visit [MongoDB Cloud](https://cloud.mongodb.com)
2. Click "Try Free" or sign in with existing account
3. Complete account setup (email verification, organization setup)

### 2. Create MongoDB Project

1. In MongoDB Atlas, go to **Organizations** > **Projects**
2. Click **New Project**
3. Enter project name: `AegisPlane`
4. Click **Create Project**

### 3. Create MongoDB Cluster

1. Click **Build a Database**
2. Choose **M0 Sandbox** (free tier) or higher for production
3. Select **Cloud Provider & Region**:
   - Production: Choose region closest to your application servers
   - Development: Any region is fine, US preferred for examples
4. Click **Create Deployment**
5. Wait 5-10 minutes for cluster to initialize

**Cluster Name Example:** `aegisplane-prod` or `aegisplane-dev`

### 4. Create Database User

1. Go to **Database** > **Security** > **Database Access**
2. Click **Add New Database User**
3. Choose **Password** authentication
4. Enter credentials:
   - **Username:** `aegisplane_app` (or similar)
   - **Password:** Generate strong password (at least 16 characters, include numbers & special chars)
   - **Built-in Role:** `readWriteAnyDatabase` (for application user)
5. Click **Add User**

**Save credentials securely** - you'll need them in the connection string.

### 5. Configure Network Access

1. Go to **Database** > **Network Access**
2. Click **Add IP Address**

**Development Setup:**

- Click **Add Current IP Address** to whitelist your development machine
- Or manually add your IP: Click **Edit** and enter your public IP

**Production Setup:**

- Add specific IPs of your production servers
- For cloud platforms: Add their IP ranges or use VPC peering
- **DO NOT** use `0.0.0.0/0` (allows anyone to connect)

**Example IP Whitelisting:**

```
AWS EC2:  3.21.0.0/10
Heroku:   50.19.73.0/24
DigitalOcean: Region-specific IPs
```

### 6. Get Connection String

1. Go to **Database** > **Databases**
2. Click **Connect** on your cluster
3. Select **Drivers** tab
4. Choose **Node.js** and **4.x or later**
5. Copy the connection string

**Connection String Format:**

```
mongodb+srv://<username>:<password>@<cluster-name>.mongodb.net/?retryWrites=true&w=majority
```

**Example:**

```
mongodb+srv://aegisplane_app:MySecurePassword123!@aegisplane-prod.mongodb.net/?retryWrites=true&w=majority
```

**Important: URL Encode Password**

If your password contains special characters, URL-encode them:

| Character | Encoded |
| --------- | ------- |
| @         | %40     |
| :         | %3A     |
| #         | %23     |
| ?         | %3F     |
| &         | %26     |
| =         | %3D     |
| /         | %2F     |

Use [URL Encoder](https://www.urlencoder.org/) if unsure.

**Example with special chars:**

```
Original password: P@ss:word#123
URL Encoded: P%40ss%3Aword%23123

Connection String:
mongodb+srv://aegisplane_app:P%40ss%3Aword%23123@aegisplane-prod.mongodb.net/?retryWrites=true&w=majority
```

## Backend Configuration

### 1. Update Environment Variables

Update your `.env` file (or deployment secrets) with the MongoDB Atlas connection string:

```env
# Previous (local MongoDB)
MONGO_URI=mongodb://localhost:27017/aegisplane

# New (MongoDB Atlas)
MONGO_URI=mongodb+srv://aegisplane_app:MySecurePassword123!@aegisplane-prod.mongodb.net/?retryWrites=true&w=majority
```

### 2. Verify Database Connection Code

The backend already contains optimized MongoDB Atlas support in [apps/backend/src/config/database.ts](../apps/backend/src/config/database.ts):

```typescript
export const connectDatabase = async () => {
  try {
    mongoose.set("strictQuery", true);

    await mongoose.connect(env.MONGO_URI, {
      dbName: "aegisplane",
      // MongoDB Atlas connection options
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      retryWrites: true,
      w: "majority",
    });

    mongoose.connection.on("connected", () => {
      logger.info("MongoDB connected successfully");
    });

    // Error handling and logging...
  } catch (error) {
    logger.fatal({ err: error }, "Failed to connect to MongoDB.");
    throw error;
  }
};
```

**Key Features:**

- ✅ Proper error handling and logging
- ✅ MongoDB Atlas-optimized timeouts
- ✅ Retry writes enabled
- ✅ Connection event monitoring
- ✅ Server waits for DB connection before starting

### 3. No Code Changes Required

Your backend is already production-ready:

- ✅ Uses `env.MONGO_URI` from environment variables
- ✅ No hardcoded localhost URLs
- ✅ Proper CORS configuration with `env.APP_ORIGIN`
- ✅ Security best practices enabled

## Testing & Verification

### Local Development Testing

Before deploying to production:

```bash
# 1. Update your local .env with MongoDB Atlas connection string
echo "MONGO_URI=mongodb+srv://aegisplane_app:password@cluster-name.mongodb.net/?retryWrites=true&w=majority" >> .env

# 2. Restart backend
npm run dev

# 3. Check logs for successful connection
# Should see: "Database connection established"
# Should see: "MongoDB connected successfully"

# 4. Test authentication (admin login)
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@aegisplane.dev",
    "password": "ChangeMeNow123!"
  }'

# 5. Verify response contains auth tokens
# Should see: { "accessToken": "...", "refreshToken": "...", "auth": {...} }
```

### MongoDB Atlas Verification

Verify data is being stored in MongoDB Atlas:

1. Go to **Database** > **Databases** > **Browse Collections**
2. Look for `aegisplane` database
3. Verify collections exist:
   - `users`
   - `tenants`
   - `roles`
   - `permissions`
   - `audit-logs` (if audit enabled)
   - etc.

4. Click on a collection to view documents
5. Verify data structure matches your application schema

### Production Deployment Testing

After deploying to production:

```bash
# 1. Test backend health endpoint (if implemented)
curl https://your-domain.com/api/v1/health

# 2. Test login endpoint
curl -X POST https://your-domain.com/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@aegisplane.dev",
    "password": "YOUR_ADMIN_PASSWORD"
  }'

# 3. Test tenant creation (as authenticated admin)
curl -X POST https://your-domain.com/api/v1/tenants \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "name": "Test Tenant",
    "slug": "test-tenant"
  }'

# 4. Check backend logs for MongoDB connection success
# Should see: "Database connection established"

# 5. Verify data in MongoDB Atlas
# Go to Atlas > Browse Collections > Check new tenant exists
```

### Automated Verification Checklist

- [ ] Backend starts without errors
- [ ] `GET /api/v1/health` returns 200
- [ ] `POST /api/v1/auth/login` works
- [ ] New tenants can be created
- [ ] Users can be created/updated
- [ ] Roles and permissions work
- [ ] Audit logs are recorded
- [ ] Data persists after server restart
- [ ] Multiple concurrent users work
- [ ] Rate limiting works
- [ ] CORS allows frontend requests

## Troubleshooting

### Connection Issues

#### Problem: "connection timeout"

**Solutions:**

1. Check MongoDB Atlas cluster status (should be "RUNNING")
2. Verify IP whitelist includes your server's IP address
3. Increase timeout in connection options:
   ```typescript
   serverSelectionTimeoutMS: 10000,  // Increase to 10 seconds
   socketTimeoutMS: 60000,            // Increase to 60 seconds
   ```
4. Test connectivity:
   ```bash
   mongodb+srv://username:password@cluster.mongodb.net --eval "db.adminCommand('ping')"
   ```

#### Problem: "authentication failed"

**Solutions:**

1. Verify username and password are correct
2. Check if password contains special characters that need URL encoding
3. Regenerate database user password in MongoDB Atlas:
   - Go to **Database** > **Security** > **Database Access**
   - Click **Edit** on user
   - Set new password
   - Update `.env` with new password
4. Try with MongoDB Shell to verify credentials:
   ```bash
   mongosh "mongodb+srv://username:password@cluster.mongodb.net"
   ```

#### Problem: "SSL/TLS error"

**Solutions:**

1. Ensure `retryWrites=true` and `w=majority` in connection string
2. For Node.js, SSL is handled automatically
3. If using self-signed certs or internal MongoDB:
   ```typescript
   {
     ssl: true,
     sslValidate: false,  // Only for development/testing
     sslCA: fs.readFileSync('./ca.pem')  // For production with custom certs
   }
   ```

#### Problem: "MONGO_URI environment variable not set"

**Solutions:**

1. Verify `.env` file exists in project root:
   ```bash
   cat .env | grep MONGO_URI
   ```
2. For Docker, ensure environment variable is passed:
   ```bash
   docker run -e MONGO_URI="mongodb+srv://..." backend
   ```
3. For cloud deployment (Heroku, AWS, etc), verify secret is set:

   ```bash
   # Heroku
   heroku config:set MONGO_URI="mongodb+srv://..."

   # AWS
   aws secretsmanager create-secret --name AegisPlane/MONGO_URI ...
   ```

### Data Issues

#### Problem: "No collections found in MongoDB Atlas"

**Solution:** Collections are created automatically by Mongoose when data is first inserted. If no collections exist:

1. Ensure application ran successfully (check logs)
2. Try creating a tenant through the API
3. Collections should appear in MongoDB Atlas after operation

#### Problem: "Data not syncing" or "old data appearing"

**Solution:**

1. Verify you're connected to correct cluster (check connection string)
2. Check database name is correct: `aegisplane`
3. Verify multiple instances aren't using different databases
4. Clear browser cache and local storage
5. Restart backend to ensure clean connection

### Performance Issues

#### Problem: "Slow queries" or "database timeout"

**Solutions:**

1. Check connection pool settings:
   ```typescript
   {
     maxPoolSize: 10,
     minPoolSize: 2
   }
   ```
2. Review MongoDB Atlas metrics:
   - Go to **Database** > **Monitoring** > **Metrics**
   - Check CPU, Memory, Network usage
   - Look for slow queries in **Logs**
3. Add database indexes for frequently queried fields
4. Scale cluster to higher tier if needed

## Rollback Procedure

If issues occur and you need to rollback to local MongoDB:

### Quick Rollback (< 1 hour downtime)

```bash
# 1. Update .env to use local MongoDB
MONGO_URI=mongodb://localhost:27017/aegisplane

# 2. Restart backend
npm run dev

# 3. Verify local connection
# Should see: "Database connection established"
```

### Data Recovery with MongoDB Atlas Backup

If you need to recover data from MongoDB Atlas:

1. Go to **Database** > **Backup** in MongoDB Atlas
2. Select backup point you want to restore from
3. Click **Restore** next to backup
4. Choose **Restore to a new cluster** (safer option)
5. Wait for restore to complete (10-30 minutes)
6. Export data from restored cluster:
   ```bash
   mongoexport --uri "mongodb+srv://..." --db aegisplane --collection users --out users.json
   ```
7. Import to local MongoDB:
   ```bash
   mongoimport --uri "mongodb://localhost:27017/aegisplane" --collection users --file users.json
   ```

## Additional Resources

- [MongoDB Atlas Documentation](https://docs.atlas.mongodb.com/)
- [MongoDB Connection String Reference](https://docs.mongodb.com/manual/reference/connection-string/)
- [Mongoose Connection Options](<https://mongoosejs.com/docs/api/mongoose.html#Mongoose.prototype.connect()>)
- [MongoDB Atlas Best Practices](https://docs.atlas.mongodb.com/best-practices/)

## Support & Questions

If you encounter issues:

1. Check MongoDB Atlas status page: https://status.mongodb.com/
2. Review application logs for specific error messages
3. Test direct MongoDB connection using MongoDB Shell
4. Check IP whitelist in MongoDB Atlas UI
5. Verify environment variables are correctly set
6. Consult MongoDB documentation for specific error codes

---

**Migration Checklist Summary:**

- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] Network access configured (IP whitelist)
- [ ] Connection string obtained and URL-encoded if needed
- [ ] `.env` updated with new connection string
- [ ] Local testing passed (backend starts, auth works)
- [ ] MongoDB Atlas collections verify
- [ ] Production verification completed
- [ ] Team trained on new MongoDB Atlas dashboard
- [ ] Backup strategy verified
- [ ] Monitoring/alerts configured
- [ ] Rollback procedure documented and tested

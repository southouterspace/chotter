# Railway Environment Variables Reference

This document details all environment variables required for deploying the Chotter API to Railway.

## Environment Variable Categories

### 1. Required Variables (Always Needed)

#### Supabase Configuration

These must be obtained from your Supabase project dashboard.

```bash
# Supabase Project URL
# Get from: Supabase Dashboard > Project Settings > API > URL
SUPABASE_URL=https://your-project.supabase.co

# Supabase Anon Key (Public-safe, can be shared)
# Get from: Supabase Dashboard > Project Settings > API > Anon Key
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# Supabase Service Role Key (KEEP SECRET - Server-side only)
# Get from: Supabase Dashboard > Project Settings > API > Service Role Key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### Application Settings

```bash
# Application Port (should always be 3000 for Railway)
PORT=3000

# Node.js Environment Type
NODE_ENV=production

# Bun Runtime Environment
BUN_ENV=production
```

### 2. Conditional Variables (Environment-Specific)

#### Staging Environment

```bash
NODE_ENV=staging
SUPABASE_URL=https://staging-project.supabase.co
SUPABASE_ANON_KEY=staging-anon-key
SUPABASE_SERVICE_ROLE_KEY=staging-service-key
```

#### Production Environment

```bash
NODE_ENV=production
SUPABASE_URL=https://production-project.supabase.co
SUPABASE_ANON_KEY=production-anon-key
SUPABASE_SERVICE_ROLE_KEY=production-service-key
```

### 3. Optional Variables

```bash
# Logging Level (debug, info, warn, error)
LOG_LEVEL=info

# Enable Verbose Logging
DEBUG=chotter:*

# API Timeout (milliseconds)
API_TIMEOUT=30000

# Max Request Body Size
MAX_REQUEST_SIZE=1mb

# CORS Origins (comma-separated)
CORS_ORIGINS=https://admin.example.com,https://customer.example.com

# Rate Limiting
RATE_LIMIT_REQUESTS=100
RATE_LIMIT_WINDOW_MS=60000

# Feature Flags
FEATURE_AI_BOOKING=true
FEATURE_ROUTE_OPTIMIZATION=true
```

## How to Add Variables in Railway

### Via Railway Dashboard

1. Go to [railway.app](https://railway.app)
2. Select your project
3. Navigate to "Variables" tab
4. Click "New Variable"
5. Enter variable name and value
6. Click "Add"
7. Trigger a new deployment or restart the service

### Via Railway CLI

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Connect to your project
railway link

# Set a variable
railway variables set SUPABASE_URL=https://your-project.supabase.co

# View all variables
railway variables

# Deploy with updated variables
railway up
```

### Via GitHub Actions

Store secrets in GitHub, then pass to Railway:

```yaml
name: Deploy to Railway

on:
  push:
    branches: [main, develop]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Railway
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
          SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
          SUPABASE_SERVICE_ROLE_KEY: ${{ secrets.SUPABASE_SERVICE_ROLE_KEY }}
        run: |
          npm i -g @railway/cli
          railway up
```

## Obtaining Supabase Credentials

### From Local Development

If you're running Supabase locally:

```bash
# Start Supabase locally
supabase start

# Get credentials from status output
supabase status
```

Output will show:
```
API URL: http://localhost:54321
Anon Key: your-local-anon-key
Service Role Key: your-local-service-key
```

### From Supabase Cloud

1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your project
4. Go to "Settings" (gear icon)
5. Select "API" from the left sidebar
6. Copy the values:
   - **Project URL** -> `SUPABASE_URL`
   - **Anon Key** -> `SUPABASE_ANON_KEY`
   - **Service Role Key** -> `SUPABASE_SERVICE_ROLE_KEY`

**Important**: The Service Role Key is secret and should only be stored in Railway's secure variables.

## Security Best Practices

### Secrets Management

1. **Never commit secrets to Git**
   ```bash
   # Bad - do not do this
   git add .env
   git commit -m "add secrets"

   # Good - use Railway's variable system
   railway variables set SECRET_KEY=value
   ```

2. **Use Railway's Variable System**
   - All variables are encrypted at rest
   - Only visible to authorized team members
   - Never exposed in build logs or error messages

3. **Rotate Secrets Regularly**
   - Change Supabase keys quarterly
   - Use different keys for staging vs production
   - Revoke compromised keys immediately

4. **Limit Access**
   - Only developers who need access can view variables
   - Use Railway's role-based access control
   - Audit variable access in logs

### Different Variables for Different Environments

#### Staging (Less Sensitive)
- Use staging Supabase project
- Can share dashboard access with team
- Easier to rotate if needed

#### Production (Highly Sensitive)
- Use separate production Supabase project
- Restrict dashboard access to senior engineers
- Enable audit logging
- Backup credentials in secure manager

## Example Environment Files

### Local Development (.env)

```bash
# Local Supabase (from: supabase status)
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

PORT=3000
NODE_ENV=development
BUN_ENV=development
LOG_LEVEL=debug
```

### Staging Deployment (Railway)

```bash
SUPABASE_URL=https://staging-xyz.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

PORT=3000
NODE_ENV=staging
BUN_ENV=production
LOG_LEVEL=info
```

### Production Deployment (Railway)

```bash
SUPABASE_URL=https://production-xyz.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

PORT=3000
NODE_ENV=production
BUN_ENV=production
LOG_LEVEL=warn
```

## Validation Checklist

Before deploying, verify:

- [ ] `SUPABASE_URL` is set and points to correct instance
- [ ] `SUPABASE_ANON_KEY` is set and not empty
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set and not empty
- [ ] `PORT` is set to 3000
- [ ] `NODE_ENV` matches deployment target (staging/production)
- [ ] Variables are not exposed in logs
- [ ] Secrets are stored in Railway, not Git
- [ ] Health check endpoint responds after deployment
- [ ] Application logs appear in Railway dashboard

## Testing Variables After Deployment

```bash
# Test API is running
curl -s https://YOUR_RAILWAY_URL/health | jq .

# View logs with specific log level
railway logs --follow

# Check running environment
curl -s https://YOUR_RAILWAY_URL/api/config | jq .
```

## Troubleshooting

### "Connection refused" errors
- Check `SUPABASE_URL` is correct and accessible
- Verify network connectivity from Railway
- Ensure Supabase project is running

### "Invalid API key" errors
- Verify `SUPABASE_ANON_KEY` is correctly copied
- Check for extra whitespace in keys
- Regenerate keys in Supabase dashboard if needed

### Application won't start
- Check all required variables are set
- View logs in Railway dashboard
- Verify PORT is 3000

### Variables not updating after deployment
- Force rebuild: `railway down && railway up`
- Check variables are shown in Railway dashboard
- Restart the service in Railway UI

## References

- Railway Variables Documentation: https://docs.railway.app/guides/variables
- Supabase API Documentation: https://supabase.com/docs/reference/api
- Hono Environment Variables: https://hono.dev/docs/guides/best-practices#environment-variables
- Bun Environment: https://bun.sh/docs/runtime/env

---

**Last Updated**: October 2024
**Maintained by**: Deployment Engineer

# Phase 1 Deployment Guide

**Status:** Ready for Staging Deployment
**Date:** October 17, 2025
**Phase:** 1 - Foundation
**Completion:** 93% (13/14 tasks)

---

## 🎯 What We're Deploying

### Database Layer
- 28 tables across 8 migrations
- 123 RLS policies for security
- Auth triggers for automatic user creation
- Seed data for testing

### Application Layer
- `@chotter/database` - Type-safe database package
- `@chotter/ui` - UI component library
- `@chotter/utils` - Utility functions
- Hono API server with middleware

---

## 📋 Pre-Deployment Checklist

### ✅ Code Ready
- [x] All feature branches created
- [x] All code committed
- [x] Tests passing locally
- [x] Documentation complete

### ⏳ Cloud Services Needed
- [ ] Supabase cloud project created
- [ ] Railway account set up
- [ ] Vercel account set up
- [ ] Environment variables configured

---

## 🚀 Deployment Steps

## Step 1: Supabase Cloud Setup

### 1.1 Create Supabase Project

**You mentioned you already have a Supabase project:**
```
REACT_APP_SUPABASE_URL=https://zlrhcpjlpxzughojpujd.supabase.co
REACT_APP_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_C6z-6Kua9DAlJ0-2z65PWQ_pOILDtIx
```

### 1.2 Link Local Project to Cloud

```bash
cd /Users/justinalvarado/GitHub/chotter

# Link to your Supabase project
supabase link --project-ref zlrhcpjlpxzughojpujd

# You'll be prompted for your database password
```

### 1.3 Apply Database Migrations

```bash
# Push all 8 migrations to cloud
supabase db push

# This will apply:
# - 00000000000001_platform_tables.sql
# - 00000000000002_business_core_tables.sql
# - 00000000000003_supporting_tables.sql
# - 00000000000004_payment_tables.sql
# - 00000000000005_ai_tables.sql
# - 00000000000006_rls_platform.sql
# - 00000000000007_rls_business.sql
# - 00000000000008_auth_triggers.sql
```

### 1.4 Verify Migrations

```bash
# Check migration status
supabase db list migrations

# Expected output: 8 migrations applied
```

### 1.5 Load Seed Data (Optional for Staging)

```bash
# Apply seed data for testing
psql $DATABASE_URL -f supabase/seed.sql

# Or use Supabase SQL editor to paste seed.sql contents
```

### 1.6 Get Environment Variables

```bash
# Get your project's service role key
supabase status

# Copy these values for Railway/Vercel:
# - API URL
# - Anon key (public)
# - Service role key (secret - for API only)
```

---

## Step 2: Railway Deployment (Hono API)

### 2.1 Create Railway Project

1. Go to https://railway.app
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Connect your GitHub account
5. Select `chotter` repository

### 2.2 Configure Build Settings

**Root Directory:** `apps/api`
**Build Command:** `bun install && bun run build`
**Start Command:** `bun run start`

### 2.3 Set Environment Variables

In Railway dashboard, add these variables:

```bash
NODE_ENV=production
PORT=3000

# Supabase (from Step 1.6)
SUPABASE_URL=https://zlrhcpjlpxzughojpujd.supabase.co
SUPABASE_ANON_KEY=sb_publishable_C6z-6Kua9DAlJ0-2z65PWQ_pOILDtIx
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# CORS (update with your Vercel URLs later)
CORS_ORIGINS=https://admin-staging.chotter.com,https://customer-staging.chotter.com

# Stripe (test mode for staging)
STRIPE_SECRET_KEY=<your-stripe-test-key>
STRIPE_WEBHOOK_SECRET=<your-webhook-secret>
```

### 2.4 Deploy

1. Railway will auto-deploy from your `main` branch
2. Wait for build to complete (~2-3 minutes)
3. Get your Railway URL (e.g., `https://chotter-api-production.up.railway.app`)

### 2.5 Verify API

```bash
# Test health endpoint
curl https://your-railway-url.railway.app/health

# Expected response:
# {
#   "status": "ok",
#   "database": "connected",
#   "timestamp": "2025-10-17T..."
# }
```

---

## Step 3: Vercel Deployment (Web Apps - Future)

**Note:** Web apps (admin dashboard, customer portal) will be deployed in Phase 2.
For now, just create the Vercel project so it's ready:

### 3.1 Create Vercel Projects

1. Go to https://vercel.com
2. Import Git Repository
3. Create TWO projects:
   - `chotter-admin` (points to `apps/web-admin`)
   - `chotter-customer` (points to `apps/web-customer`)

### 3.2 Configure Environment Variables (for both projects)

```bash
# Supabase (use VITE_ prefix for Vite)
VITE_SUPABASE_URL=https://zlrhcpjlpxzughojpujd.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_C6z-6Kua9DAlJ0-2z65PWQ_pOILDtIx

# API URL (from Railway in Step 2.4)
VITE_API_URL=https://your-railway-url.railway.app
```

**Note:** Don't deploy yet - web apps will be built in Phase 2.

---

## Step 4: Merge Feature Branches

Now that deployment config is ready, merge all feature branches:

```bash
cd /Users/justinalvarado/GitHub/chotter

# Checkout phase-1-foundation
git checkout phase-1-foundation

# Merge all feature branches
git merge feature/platform-tables
git merge feature/business-core-tables
git merge feature/supporting-payment-ai-tables
git merge feature/rls-policies
git merge feature/database-types
git merge feature/auth-setup
git merge feature/ui-components
git merge feature/utils-package
git merge feature/seed-data
git merge feature/hono-api

# Push to remote
git push origin phase-1-foundation
```

### Create Pull Request

```bash
# Create PR: phase-1-foundation → develop
gh pr create --base develop --head phase-1-foundation \
  --title "Phase 1: Foundation Complete" \
  --body "$(cat <<'EOF'
## Phase 1: Foundation - Complete

### Summary
Complete foundation for Chotter SaaS platform including database schema, security policies, shared packages, and API server.

### What's Included
- ✅ 28 database tables with complete schema
- ✅ 123 RLS policies for multi-tenant security
- ✅ TypeScript types generated from database
- ✅ Supabase Auth with JWT claims
- ✅ UI component library (9 components)
- ✅ Utils package (97.5% test coverage)
- ✅ Seed data for development
- ✅ Hono API server with middleware
- ✅ 26 integration tests

### Database Migrations
- 00000000000001_platform_tables.sql
- 00000000000002_business_core_tables.sql
- 00000000000003_supporting_tables.sql
- 00000000000004_payment_tables.sql
- 00000000000005_ai_tables.sql
- 00000000000006_rls_platform.sql
- 00000000000007_rls_business.sql
- 00000000000008_auth_triggers.sql

### Packages
- @chotter/database - Type-safe database queries
- @chotter/ui - React component library
- @chotter/utils - Utility functions

### Test Plan
- [x] All migrations apply successfully
- [x] RLS policies enforce multi-tenant isolation
- [x] TypeScript compilation succeeds
- [x] API health check returns 200
- [x] Integration tests pass (26/26)

### Deployment Checklist
- [x] Supabase migrations ready
- [x] Railway config ready
- [x] Vercel config ready
- [x] Environment variables documented
- [ ] Deploy to staging (manual step)

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

---

## Step 5: Deploy to Staging

### 5.1 Apply Migrations to Supabase

```bash
# From Step 1.3 - if not done yet
supabase db push
```

### 5.2 Deploy API to Railway

Railway will auto-deploy when you merge to `develop` or `main`.

Or manually trigger:
1. Go to Railway dashboard
2. Click your project
3. Click "Deploy" on the latest commit

### 5.3 Verify Staging Deployment

```bash
# 1. Check Supabase tables exist
# Visit: https://supabase.com/dashboard/project/zlrhcpjlpxzughojpujd/editor

# 2. Check RLS is enabled
# Run in Supabase SQL editor:
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
# All tables should have rowsecurity = true

# 3. Check API health
curl https://your-railway-url.railway.app/health

# 4. Check API with auth
curl -H "Authorization: Bearer <your-jwt-token>" \
  https://your-railway-url.railway.app/health/detailed
```

---

## Step 6: Post-Deployment Testing

### Test Authentication

```bash
# 1. Sign up a test user via Supabase Studio
# Auth > Users > Add user

# 2. Verify Person record was created
# Tables > persons > Check for new record with matching supabase_user_id

# 3. Sign in and get JWT
# Use Supabase Auth API or client library
```

### Test RLS Policies

```bash
# 1. Create test business
# Tables > businesses > Insert row

# 2. Create test users with different roles
# - customer
# - technician
# - admin

# 3. Test each role can only access their data
# Use Supabase client with different JWT tokens
```

### Test API Endpoints

```bash
# Health check
curl https://your-api.railway.app/health

# Detailed health (requires auth)
curl -H "Authorization: Bearer $JWT_TOKEN" \
  https://your-api.railway.app/health/detailed
```

---

## 🔒 Security Checklist

- [ ] Service role key kept secret (never in frontend)
- [ ] RLS enabled on all 28 tables
- [ ] Auth triggers working correctly
- [ ] CORS configured for specific origins only
- [ ] Environment variables in Railway/Vercel (not git)
- [ ] Webhook secrets configured (Stripe)
- [ ] Test mode enabled for Stripe in staging

---

## 📊 Monitoring Setup (Optional)

### Railway Logs

```bash
# View logs in Railway dashboard
# Or use Railway CLI:
railway logs
```

### Supabase Logs

Visit: https://supabase.com/dashboard/project/zlrhcpjlpxzughojpujd/logs

Monitor:
- Query performance
- Auth events
- Edge function logs (if using)

---

## 🐛 Troubleshooting

### Migration Fails

```bash
# Check current migration status
supabase db list migrations

# Reset local database and retry
supabase db reset

# If still failing, check migration file syntax
```

### RLS Blocking Queries

```sql
-- Check which policies exist
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';

-- Test as specific role
SET request.jwt.claims = '{"role": "customer", "business_id": "uuid-here"}';
SELECT * FROM tickets;
```

### API Can't Connect to Database

1. Check `SUPABASE_URL` is correct
2. Check `SUPABASE_SERVICE_ROLE_KEY` is correct
3. Verify network connectivity (Railway → Supabase)
4. Check Railway logs for error details

### Auth Not Creating Person Records

```sql
-- Check trigger exists
SELECT tgname, tgtype, tgenabled
FROM pg_trigger
WHERE tgrelid = 'auth.users'::regclass;

-- Manually test trigger function
SELECT handle_new_user();
```

---

## ✅ Deployment Success Criteria

When deployment is successful, you should be able to:

1. ✅ View all 28 tables in Supabase Studio
2. ✅ RLS enabled on every table (100% coverage)
3. ✅ Sign up creates Person record automatically
4. ✅ JWT tokens contain custom claims (person_id, business_id, role)
5. ✅ API health endpoint returns 200
6. ✅ API detailed health shows database connected
7. ✅ Different user roles see different data (RLS working)
8. ✅ No data leakage between businesses

---

## 📝 Post-Deployment Tasks

After successful deployment:

1. **Document URLs**
   - Supabase: https://zlrhcpjlpxzughojpujd.supabase.co
   - API: https://your-app.railway.app
   - Admin (future): https://admin-staging.vercel.app
   - Customer (future): https://customer-staging.vercel.app

2. **Update Environment Configs**
   - Add Railway API URL to Vercel projects
   - Update CORS origins in Railway

3. **Create Test Accounts**
   - 1 super admin
   - 1 business admin
   - 1 technician
   - 1 customer

4. **Notify Team**
   - Share staging URLs
   - Share test account credentials
   - Share API documentation

---

## 🎯 What's Next

After Phase 1 deployment is complete:

**Phase 2: Admin Dashboard** (Weeks 3-4)
- Build React admin dashboard
- Business management
- Technician management
- Customer management
- Appointment scheduling UI
- Service catalog management

Estimated: 2 weeks
With parallel agents: ~3-5 days

---

## 📞 Support

If you encounter issues:

1. Check Railway logs
2. Check Supabase logs
3. Review this troubleshooting guide
4. Check Phase 1 documentation in `/docs`

---

**Phase 1 is ready for deployment!** 🚀

Follow the steps above to deploy to staging, then we can move on to Phase 2.

# Quick Deployment Guide

**Phase 1 is ready to deploy!** Follow these steps in order.

---

## Prerequisites

- [ ] Supabase account (you have: zlrhcpjlpxzughojpujd)
- [ ] Railway account
- [ ] Vercel account (for Phase 2)
- [ ] GitHub repository is up to date

---

## Step 1: Merge All Feature Branches (5 minutes)

```bash
cd /Users/justinalvarado/GitHub/chotter

# Checkout phase-1-foundation branch
git checkout phase-1-foundation

# Merge all 10 feature branches
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

---

## Step 2: Link Supabase (2 minutes)

```bash
# Link to your cloud project
supabase link --project-ref zlrhcpjlpxzughojpujd

# You'll be prompted for your database password
# Enter it when asked
```

---

## Step 3: Apply Migrations (3 minutes)

```bash
# Push all 8 migrations to cloud
supabase db push

# Verify migrations applied
supabase db list migrations
# Should show 8 migrations
```

---

## Step 4: Get Supabase Keys (1 minute)

```bash
# Get your service role key
supabase status

# Copy these values:
# - API URL (you have: https://zlrhcpjlpxzughojpujd.supabase.co)
# - Anon key (you have: sb_publishable_C6z-6Kua9DAlJ0-2z65PWQ_pOILDtIx)
# - Service role key (secret - copy this now)
```

---

## Step 5: Deploy to Railway (10 minutes)

### 5.1 Create Railway Project

1. Go to https://railway.app
2. Sign in with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your `chotter` repository
6. Select the `main` or `develop` branch

### 5.2 Configure Build

**Root Directory:** `apps/api`

**Build Command:** `bun install && bun run build`

**Start Command:** `bun run start`

**Watch Paths:** `apps/api/**`

### 5.3 Set Environment Variables

In Railway dashboard → Variables → Raw Editor, paste:

```bash
NODE_ENV=production
PORT=3000

# Supabase
SUPABASE_URL=https://zlrhcpjlpxzughojpujd.supabase.co
SUPABASE_ANON_KEY=sb_publishable_C6z-6Kua9DAlJ0-2z65PWQ_pOILDtIx
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-from-step-4

# CORS (update with your actual domains later)
CORS_ORIGINS=http://localhost:5173,http://localhost:5174

# Stripe (optional - for Phase 2+)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 5.4 Deploy

Railway will automatically deploy. Wait ~2-3 minutes.

Get your Railway URL from the dashboard (e.g., `https://chotter-api-production.up.railway.app`)

---

## Step 6: Verify Deployment (5 minutes)

### 6.1 Check Supabase Tables

1. Visit: https://supabase.com/dashboard/project/zlrhcpjlpxzughojpujd/editor
2. Verify you see 28 tables
3. Check that RLS is enabled on all tables

### 6.2 Check API Health

```bash
# Replace with your actual Railway URL
curl https://your-app.railway.app/health

# Expected response:
# {
#   "status": "ok",
#   "database": "connected",
#   "timestamp": "2025-10-17T..."
# }
```

### 6.3 Test Authentication (Optional)

1. In Supabase Dashboard → Authentication → Users
2. Click "Add user"
3. Create a test user
4. Go to Table Editor → persons
5. Verify a Person record was created automatically

---

## Step 7: Load Seed Data (Optional for Staging) (2 minutes)

### Option A: Using psql

```bash
# Get your database URL from Supabase dashboard
# Settings → Database → Connection string → URI

psql "postgresql://postgres:[password]@db.zlrhcpjlpxzughojpujd.supabase.co:5432/postgres" \
  -f supabase/seed.sql
```

### Option B: Using Supabase SQL Editor

1. Visit: https://supabase.com/dashboard/project/zlrhcpjlpxzughojpujd/sql
2. Click "New query"
3. Copy/paste contents of `supabase/seed.sql`
4. Click "Run"

This creates 3 test businesses with users and tickets.

---

## Step 8: Create Pull Request (2 minutes)

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
1. 00000000000001_platform_tables.sql (7 tables)
2. 00000000000002_business_core_tables.sql (6 tables)
3. 00000000000003_supporting_tables.sql (8 tables)
4. 00000000000004_payment_tables.sql (4 tables)
5. 00000000000005_ai_tables.sql (3 tables)
6. 00000000000006_rls_platform.sql (29 policies)
7. 00000000000007_rls_business.sql (94 policies)
8. 00000000000008_auth_triggers.sql (4 functions)

### Deployment Status
- ✅ Supabase migrations applied
- ✅ Railway API deployed
- ✅ Health checks passing
- ✅ RLS policies verified

### Staging URLs
- **Supabase:** https://zlrhcpjlpxzughojpujd.supabase.co
- **API:** [Your Railway URL]

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
EOF
)"
```

---

## ✅ Success Checklist

After deployment, verify:

- [ ] All 28 tables visible in Supabase Studio
- [ ] RLS enabled on every table
- [ ] API health check returns 200 OK
- [ ] Sign up creates Person record automatically
- [ ] JWT tokens contain custom claims
- [ ] Different user roles see different data

---

## 🐛 Troubleshooting

### Migration fails

```bash
# Check status
supabase db list migrations

# Reset and retry
supabase db reset
supabase db push
```

### API can't connect to database

1. Check `SUPABASE_URL` is correct
2. Check `SUPABASE_SERVICE_ROLE_KEY` is correct
3. Check Railway logs for errors

### RLS blocking queries

```sql
-- Check policies exist
SELECT tablename, policyname
FROM pg_policies
WHERE schemaname = 'public';
```

---

## 📚 Full Documentation

- **Complete guide:** `/docs/DEPLOYMENT_PHASE1.md`
- **Completion summary:** `/docs/PHASE1_COMPLETION_SUMMARY.md`
- **Auth setup:** `/docs/auth-setup.md`
- **Auth testing:** `/docs/auth-testing.md`

---

## 🎯 What's Next

After successful deployment:

**Phase 2: Admin Dashboard** (3-5 days with parallel agents)
- React admin web application
- Business management UI
- Technician management
- Customer management
- Appointment scheduling
- Service catalog

---

**Total deployment time:** ~30 minutes

**Questions?** Check `/docs/DEPLOYMENT_PHASE1.md` for detailed troubleshooting.

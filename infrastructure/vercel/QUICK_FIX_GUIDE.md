# Quick Fix Guide: "No Next.js version detected" Error

If you're seeing this error in your Vercel deployment:

```
Error: No Next.js version detected. Make sure your package.json has "next" in either "dependencies" or "devDependencies". Also check your Root Directory setting matches the directory of your package.json file.
```

This guide will fix it in 5 minutes.

## The Problem

Vercel is trying to build from the repository root (`/`) instead of your app directory (`apps/web-admin/` or `apps/web-customer/`).

When Vercel builds from the root:
- It finds `/package.json` (the monorepo root)
- It looks for Next.js (not found)
- It looks for other frameworks (finds nothing)
- It fails with "No Next.js version detected"

The real issue: **Vercel doesn't know which app to build**

## The Solution (5 Steps)

### Step 1: Go to Vercel Dashboard

1. Open https://vercel.com/dashboard
2. Find your project (e.g., `chotter-admin` or `chotter-customer`)
3. Click to open the project

### Step 2: Open Project Settings

1. Click the "Settings" tab (at top of page)
2. Look for "General" section in the left sidebar
3. Find "Root Directory" setting

### Step 3: Set Root Directory

**CRITICAL - Do NOT skip this step**

Change the Root Directory to:
- For admin app: `apps/web-admin`
- For customer app: `apps/web-customer`

**Important:** Do NOT use:
- `apps/` (this is wrong - too vague)
- `/apps/web-admin` (this is wrong - no leading slash)
- Just `web-admin` (this is wrong - missing `apps/`)

### Step 4: Save Changes

1. Scroll to bottom of page
2. Click "Save" button
3. Wait for confirmation message

### Step 5: Redeploy

1. Click "Deployments" tab
2. Find the latest deployment (should be failing)
3. Click the three-dot menu on the right
4. Select "Redeploy"
5. Watch the build logs

## Verify It Worked

**Success Signs:**

In the build logs, you should see:
```
Building in: /app/apps/web-admin
Found vercel.json. Using build settings from there.
```

The deployment should now:
- Install dependencies with Bun
- Run `tsc && vite build`
- Create `dist/` folder
- Upload static files
- Show "Ready" status

**Check the URL:**
- Visit the deployment URL (shown in dashboard)
- Application should load
- No errors in browser console

## If It Still Fails

### Build Fails After Setting Root Directory

**Check build logs:** Click the failed deployment and scroll through logs

**Common issues:**
- Missing dependencies: Run `bun install` locally
- TypeScript errors: Run `tsc` locally to check
- Vite config error: Check `vite.config.ts` syntax
- Missing environment variables: See next section

### Application Loads but Doesn't Work

**Issue:** Supabase URL/key undefined

**Fix:**
1. Go to "Settings" > "Environment Variables"
2. Add these variables:
   - `VITE_SUPABASE_URL` = (your Supabase URL)
   - `VITE_SUPABASE_ANON_KEY` = (your Supabase key)
3. Make sure both are enabled for Production
4. Go to "Deployments" and "Redeploy" latest deployment
5. Wait for new build to complete

**Verify in browser console:**
```javascript
console.log(import.meta.env.VITE_SUPABASE_URL)  // Should show URL
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY)  // Should show key
```

## Complete Checklist

If you need to start from scratch:

### Create Project

- [ ] Go to https://vercel.com/dashboard
- [ ] Click "Add New" > "Project"
- [ ] Select Chotter repository

### Configure Before Deploy

- [ ] Project Name: `chotter-admin` (or `chotter-customer`)
- [ ] **Root Directory: `apps/web-admin`** (this is the key!)
- [ ] Framework Preset: Vite (should auto-detect)
- [ ] Click "Deploy"

### After Deploy Completes

- [ ] Go to "Settings" > "Environment Variables"
- [ ] Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- [ ] Enable for Production, Preview, Development
- [ ] Go to "Deployments" > "Redeploy"
- [ ] Wait for build to complete
- [ ] Visit URL and verify it works

## Reference Files

For more detailed information, see:

- **README.md** - Complete deployment guide with step-by-step instructions
- **DEPLOYMENT_CHECKLIST.md** - Comprehensive verification checklist
- **CONFIGURATION_REFERENCE.md** - Technical explanation of how Vercel works

## One More Time: The Root Cause

**Why this happens:**

When you connect a GitHub repository to Vercel for the first time, Vercel doesn't know about your monorepo structure. It defaults to building from the repository root.

In a monorepo with Vite apps:
- Root directory has a workspace `package.json` (not a real app)
- Real apps are in `apps/web-admin/` and `apps/web-customer/`
- Each app has its own `package.json` and `vercel.json`

**You must tell Vercel which app to build by setting Root Directory.**

## Getting Help

If this doesn't work:

1. Check Vercel build logs (Dashboard > Deployments > click failed deploy > Logs)
2. Verify Root Directory is exactly `apps/web-admin` or `apps/web-customer`
3. Verify app has valid `vercel.json` file
4. Try clearing cache: Settings > Caching > Clear All, then Redeploy
5. Contact Vercel support with deployment URL

## Done!

Your Vercel deployment should now work. The key was telling Vercel where to find the app in your monorepo.

If you deploy a second app (admin or customer), repeat the same steps with the other app directory.

# Vercel Deployment Documentation Index

Welcome to the Chotter Vercel deployment documentation. Use this index to find the guide you need.

## Quick Navigation

### I'm Getting an Error Right Now

Start here if you're seeing deployment failures:

**Error:** "No Next.js version detected"
- Go to: **QUICK_FIX_GUIDE.md**
- Time to fix: ~5 minutes
- Fix: Set Root Directory to `apps/web-admin` or `apps/web-customer`

**Error:** "bun: command not found"
- Go to: **README.md** > Troubleshooting > Build Fails with "bun: command not found"
- Fix: Verify `vercel.json` has correct `installCommand`

**Error:** Application loads blank
- Go to: **README.md** > Troubleshooting > Build Succeeds but App Shows Blank Page
- Fix: Check environment variables and browser console

**Error:** Environment variables undefined
- Go to: **README.md** > Troubleshooting > Environment Variables Not Available
- Fix: Add variables to Vercel dashboard and redeploy

### I'm Setting Up Vercel for the First Time

Follow this path:

1. Read: **Quick Start** section in **README.md** (2 min)
2. Follow: **Deployment Steps** in **README.md** (20 min)
3. Use: **DEPLOYMENT_CHECKLIST.md** to verify (10 min)

### I Want to Understand How This Works

Technical deep dives:

- **CONFIGURATION_REFERENCE.md** - How Vercel finds and uses configuration
- **README.md** > Vercel Configuration Files - Detailed explanation of each config file
- **README.md** > Branch Strategy - How deployments work with Git

### I'm Troubleshooting a Specific Issue

Go to **README.md** > **Troubleshooting** section:

- Root Directory not set
- Build command issues
- Environment variable problems
- Deployment failures
- GitHub integration problems

### I Need a Complete Reference

- **README.md** - Complete guide with all sections
- **DEPLOYMENT_CHECKLIST.md** - Pre-deployment verification
- **CONFIGURATION_REFERENCE.md** - Technical reference for configuration

## File Guide

### QUICK_FIX_GUIDE.md

**Best for:** Fast troubleshooting when deployment is failing

**Sections:**
- The Problem (why error occurs)
- The Solution (5 step fix)
- Verify It Worked (success criteria)
- If It Still Fails (next steps)

**Time:** 5-10 minutes

### README.md

**Best for:** Complete deployment setup and reference

**Sections:**
- Quick Start - Get started in 2 minutes
- Overview - What's being deployed
- Environment Variables - Required config values
- Deployment Steps - Detailed setup instructions
- Vercel Configuration Files - Technical reference
- Branch Strategy - How Git branches deploy
- Troubleshooting - Solutions for common errors
- Custom Domains - Domain setup
- Monitoring - How to check deployment status
- Performance Optimization - Speed improvements
- Rollback Strategy - Fix bad deployments
- Security Considerations - Best practices
- Useful Commands - CLI reference

**Time:** 30+ minutes for complete reading

### DEPLOYMENT_CHECKLIST.md

**Best for:** Verification before and after deployment

**Sections:**
- Pre-Deployment Checklist
- Vercel Project Creation Checklist
- Post-Deployment Verification
- Troubleshooting Checklist
- Quick Fixes
- Support Commands
- Common Mistakes Summary

**Time:** 10-15 minutes to verify all items

### CONFIGURATION_REFERENCE.md

**Best for:** Understanding configuration layers and how Vercel works

**Sections:**
- Understanding Configuration Layers
- The Critical Root Directory Setting
- Configuration File Locations
- Vercel Configuration Files Explained
- How Build Process Works
- Environment Variables (Dashboard vs vercel.json)
- Vite Framework Integration
- Dependency Management
- Framework Auto-Detection
- Troubleshooting Configuration Issues
- Summary Checklist

**Time:** 20-30 minutes to read completely

### vercel.json (Root Level)

The global Vercel configuration file (minimal in this project):

```json
{
  "github": {
    "silent": true
  }
}
```

**Purpose:** Apply settings to all projects

### App Level vercel.json Files

Located in:
- `/apps/web-admin/vercel.json`
- `/apps/web-customer/vercel.json`

**Purpose:** Configure build settings for each app

## Common Scenarios

### Scenario 1: First-Time Setup

1. Read: **Quick Start** (README.md)
2. Follow: **Deployment Steps** > Step 1-3 (Create project)
3. Follow: **Deployment Steps** > Step 4 (Configure environment variables)
4. Verify: **DEPLOYMENT_CHECKLIST.md** > Post-Deployment Verification

**Time:** ~40 minutes for both projects

### Scenario 2: Deployment Failed

1. Note the error message
2. Check: **README.md** > **Troubleshooting**
3. If not found: Check **QUICK_FIX_GUIDE.md**
4. Apply fix from guide
5. Verify: **DEPLOYMENT_CHECKLIST.md** > Quick Fixes

**Time:** 5-15 minutes depending on issue

### Scenario 3: Setting Up Second Project

1. Review: **Deployment Steps** > Step 3 (Create Admin Dashboard)
2. Adapt for customer: **Deployment Steps** > Step 5 (Create Customer Portal)
3. Same environment variables as admin
4. Done!

**Time:** ~20 minutes

### Scenario 4: Verifying Environment Is Correct

1. Use: **DEPLOYMENT_CHECKLIST.md**
2. Work through each section
3. Fix any unchecked items
4. Re-run checklist when done

**Time:** 15-20 minutes

## Quick Reference: Key Settings

### Root Directory (Most Important)

- Admin: `apps/web-admin`
- Customer: `apps/web-customer`

**Why:** Tells Vercel where to find your app

### Build Command

- Value: `bun run build` (in app's vercel.json)
- Does: TypeScript check + Vite build

### Framework

- Value: `vite`
- Why: Enables Vite optimizations

### Install Command

- Value: `bun install`
- Why: Uses Bun package manager

### Output Directory

- Value: `dist`
- Why: Contains built static files

### Environment Variables (Dashboard)

- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

## Deployment Workflow

```
1. Connect GitHub Repository
   └─ Done once in Vercel dashboard

2. Create Vercel Project
   ├─ Set Root Directory (most important!)
   └─ Click Deploy

3. Initial Build
   ├─ Vercel clones repository
   ├─ Changes to app directory
   ├─ Installs dependencies
   ├─ Runs build command
   └─ Uploads static files

4. Add Environment Variables
   ├─ Go to Settings > Environment Variables
   ├─ Add Supabase credentials
   └─ Save

5. Redeploy
   ├─ Go to Deployments
   ├─ Click Redeploy on latest
   └─ Wait for build

6. Verify
   ├─ Visit deployed URL
   ├─ Check browser console
   └─ Test application

7. Done!
   └─ Your app is live on Vercel
```

## Support Resources

### In This Documentation

- **QUICK_FIX_GUIDE.md** - Fast solutions for common errors
- **DEPLOYMENT_CHECKLIST.md** - Verification checklist
- **CONFIGURATION_REFERENCE.md** - Technical explanations

### External Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Configuration Reference](https://vercel.com/docs/projects/project-configuration)
- [Vite Build Tool](https://vitejs.dev/)
- [Bun Package Manager](https://bun.sh/)
- [Supabase Documentation](https://supabase.com/docs)

### Getting Help

1. Check this documentation (start with QUICK_FIX_GUIDE.md)
2. Check Vercel build logs in dashboard
3. Check [Vercel Status Page](https://www.vercelstatus.com/)
4. Review [Supabase Status](https://status.supabase.com/)
5. Contact Vercel support with deployment URL

## Key Concepts

### Monorepo Structure

Chotter is a monorepo with multiple apps:
- Admin dashboard in `apps/web-admin/`
- Customer portal in `apps/web-customer/`

Each app needs its own Vercel project.

### Vite Framework

Both apps use Vite (not Next.js):
- Fast build times
- Small bundle sizes
- Built-in HMR (hot module reloading)
- SPA (single page app)

### Bun Package Manager

Uses Bun instead of npm:
- Faster installation
- Consistent monorepo dependencies
- Single lock file for entire project

### Root Directory Setting

THE most important Vercel configuration:
- Tells Vercel where your app is in the repo
- Monorepo apps are NOT in the root
- Must be set to `apps/web-admin` or `apps/web-customer`
- Wrong value causes "No Next.js version detected" error

## Deployment Environments

### Production

- Branch: `main`
- URL: `https://chotter-admin.vercel.app` (or custom domain)
- Auto-deploys on push to main

### Preview

- Branches: `develop`, feature branches, PRs
- URL: Auto-generated preview URL
- Auto-deploys on push or PR creation

### Development

- Local: `bun run dev`
- Vercel preview: `vercel dev`
- Test new features before production

## Version Compatibility

- Node.js: >= 20.0.0
- Bun: >= 1.0.0
- TypeScript: 5.3+
- Vite: Latest
- React: (check app package.json)

## Next Steps

1. **If you're just starting:** Read **QUICK_FIX_GUIDE.md** or **README.md** Quick Start
2. **If you have an error:** Go directly to the error name in **README.md** Troubleshooting
3. **If you want details:** Read **CONFIGURATION_REFERENCE.md**
4. **If you're setting up:** Follow **DEPLOYMENT_CHECKLIST.md**

## Documentation Version

Last Updated: October 17, 2025

**Related Files:**
- Root-level vercel.json: `/vercel.json`
- Admin app config: `/apps/web-admin/vercel.json`
- Customer app config: `/apps/web-customer/vercel.json`

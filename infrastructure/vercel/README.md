# Vercel Deployment Configuration

This directory contains configuration and documentation for deploying Chotter web applications to Vercel.

## Quick Start

If you're setting up Vercel for the first time or redeploying after a failure, follow these steps:

1. Go to [vercel.com](https://vercel.com) and log in with GitHub
2. Click "Add New Project" and select the Chotter repository
3. **CRITICAL:** Set "Root Directory" to `apps/web-admin` (NOT the repository root)
4. After project creation, add Environment Variables:
   - `VITE_SUPABASE_URL` = Your Supabase URL
   - `VITE_SUPABASE_ANON_KEY` = Your Supabase anonymous key
5. Click "Redeploy" to rebuild with environment variables
6. Repeat steps 2-5 for `apps/web-customer` project

**Common Error:** If you see "No Next.js version detected", your Root Directory is wrong. See [Troubleshooting](#troubleshooting).

## Overview

Chotter deploys two React web applications to Vercel:

1. **Admin Dashboard** (`apps/web-admin`) - Administrative interface for managing the platform
2. **Customer Portal** (`apps/web-customer`) - Customer-facing interface for field service management

Both applications are built with Vite and use Bun for package management.

## Projects

### Admin Dashboard (`chotter-admin`)

- **Repository Path:** `apps/web-admin`
- **Build Command:** `bun run build`
- **Output Directory:** `dist`
- **Framework:** Vite
- **Package Manager:** Bun

### Customer Portal (`chotter-customer`)

- **Repository Path:** `apps/web-customer`
- **Build Command:** `bun run build`
- **Output Directory:** `dist`
- **Framework:** Vite
- **Package Manager:** Bun

## Environment Variables

Both applications require the following environment variables for Supabase integration:

### Required Variables

| Variable | Value | Example |
|----------|-------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | `https://xxxxxxxxxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |

### Notes on Environment Variables

- All variables must be prefixed with `VITE_` for client-side accessibility in Vite applications
- Do **NOT** include sensitive backend secrets in these variables as they will be exposed to clients
- Use Supabase's anonymous (public) key, not the service role key
- Store sensitive values in Vercel project settings, not in version control

## Critical Configuration: Root Directory

IMPORTANT: The most common deployment failure is incorrect Root Directory configuration. Vercel will not automatically detect the correct directory in a monorepo. You MUST explicitly set this in the Vercel dashboard during project creation.

If you see the error: `No Next.js version detected. Make sure your package.json has "next" in either "dependencies" or "devDependencies"`, this is because Vercel is building from the repository root instead of the app directory.

## Deployment Steps

### Prerequisites

- Vercel account (free tier supported)
- GitHub repository connected to Vercel
- Supabase project with API credentials
- Bun installed locally (for development)

### Initial Setup (One Time)

#### 1. Create Vercel Account

1. Go to [vercel.com](https://vercel.com)
2. Sign up or log in with GitHub account
3. Authorize Vercel to access your GitHub repositories

#### 2. Connect GitHub Repository

1. In Vercel dashboard, click "Add New..."
2. Select "Project"
3. Select your Chotter GitHub repository
4. Authorize Vercel GitHub app if prompted

#### 3. Create Admin Dashboard Project

**STEP 1: Import Project**

1. Click "Import Project" or "Add New" > "Project"
2. Select the Chotter repository from the list

**STEP 2: Configure Project Settings** (THIS IS CRITICAL)

Before clicking "Deploy", you must configure these settings:

1. **Project Name:** `chotter-admin`
2. **Root Directory:** `apps/web-admin` (CRITICAL - this is NOT optional)
3. **Framework Preset:** Vite (should auto-detect after setting root directory)
4. **Build Command:** Leave empty (will use vercel.json in the app directory)
5. **Output Directory:** Leave empty or set to `dist` (will use vercel.json setting)

**Important Notes:**
- The "Root Directory" field is required for monorepo deployments
- After you set "Root Directory" to `apps/web-admin`, Vercel should automatically detect that it's a Vite project
- The "Framework Preset" might change to auto-detect or show as "Other" until you set the root directory
- Build and Output directories should use values from the app's vercel.json

**STEP 3: Deploy**

1. Click "Deploy" to create the project
2. Wait for the initial build to complete
3. Proceed to environment variable configuration (see next step)

#### 4. Configure Admin Dashboard Environment Variables

After the project is created and the first build completes:

1. Go to your project's "Settings" tab
2. Navigate to "Environment Variables" in the sidebar
3. Add the following variables (get values from Supabase dashboard):

   - Name: `VITE_SUPABASE_URL`
     Value: Your Supabase project URL (e.g., `https://xxxxxxxxxxxx.supabase.co`)

   - Name: `VITE_SUPABASE_ANON_KEY`
     Value: Your Supabase anonymous API key

4. For both variables:
   - Select all three environments: `Production`, `Preview`, `Development`
   - Click "Save"

5. **Important:** After adding/updating environment variables, you must **re-deploy** the project for changes to take effect:
   - Go to the "Deployments" tab
   - Find the most recent deployment
   - Click the three-dot menu and select "Redeploy"
   - Or simply push a new commit to trigger a redeploy

#### 5. Create Customer Portal Project

Repeat steps 3-4 with these modifications:

- **Project Name:** `chotter-customer`
- **Root Directory:** `apps/web-customer` (CRITICAL - use this path, not web-admin)
- All other settings remain the same
- Use the same environment variables as Admin Dashboard

### Continuous Deployment

Once projects are created and configured:

- **Main Branch** → Automatically deploys to Production
- **Develop Branch** → Automatically deploys to Preview
- **Pull Requests** → Creates temporary Preview deployments automatically
- **Feature Branches** → Preview deployments created on-demand

### Manual Deployment

To deploy using Vercel CLI:

```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Deploy to staging/preview
vercel --prod=false

# Deploy to production
vercel --prod
```

## Vercel Configuration Files

Chotter uses three levels of Vercel configuration:

1. **App-level:** Each app has its own `vercel.json` with build settings
2. **Root-level:** Global configuration applies to all projects
3. **Dashboard:** Project-specific settings in Vercel dashboard (especially Root Directory)

### How Vercel Finds Configuration

When Vercel builds your project:

1. It uses the "Root Directory" from the Vercel dashboard to determine where to start
2. It looks for `vercel.json` in that directory
3. It uses settings from `vercel.json`, or defaults if not present
4. Environment Variables are always configured in the Vercel dashboard

**CRITICAL:** The Root Directory setting in the Vercel dashboard MUST match the location of your `package.json` and `vercel.json` files. If set to the repository root instead of `apps/web-admin`, Vercel will not find the correct package.json and will fail.

### `/apps/web-admin/vercel.json`

Defines build configuration for the admin dashboard:

```json
{
  "buildCommand": "bun run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "bun install",
  "devCommand": "bun run dev",
  "env": {
    "VITE_SUPABASE_URL": "@supabase-url",
    "VITE_SUPABASE_ANON_KEY": "@supabase-anon-key"
  }
}
```

**Settings Explanation:**
- `buildCommand`: Runs TypeScript check + Vite build
- `outputDirectory`: Contains compiled static assets ready to deploy
- `framework`: Tells Vercel this is a Vite app (enables optimizations)
- `installCommand`: Uses Bun instead of npm
- `devCommand`: Used for local development preview
- `env`: Maps environment variable names (not values - values come from dashboard)

### `/apps/web-customer/vercel.json`

Identical to admin dashboard configuration:

```json
{
  "buildCommand": "bun run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "bun install",
  "devCommand": "bun run dev",
  "env": {
    "VITE_SUPABASE_URL": "@supabase-url",
    "VITE_SUPABASE_ANON_KEY": "@supabase-anon-key"
  }
}
```

### `/infrastructure/vercel/vercel.json` (Root-Level Configuration)

Provides minimal global settings (this is for reference only - each project uses its own app-level config):

```json
{
  "github": {
    "silent": true
  }
}
```

**Settings Explanation:**
- `"silent": true`: Prevents Vercel from posting detailed status comments on every GitHub commit

**Note:** The root `vercel.json` is not used when Root Directory is set to an app directory. Each project uses its app-level `vercel.json` instead.

## Branch Strategy

Vercel deployments are configured to follow this branch strategy:

| Branch | Environment | Deployment | Access |
|--------|-------------|------------|--------|
| `main` | Production | Automatic | Public/Custom Domain |
| `develop` | Preview | Automatic | Vercel URL |
| `feature/*` | Preview | On PR creation | Vercel URL (temporary) |
| Other | Preview | On-demand | Vercel URL (temporary) |

## Accessing Deployments

### Production Deployments

Admin Dashboard:
```
https://chotter-admin.vercel.app
# Or custom domain (configure in Vercel settings)
```

Customer Portal:
```
https://chotter-customer.vercel.app
# Or custom domain (configure in Vercel settings)
```

### Preview Deployments

Each commit and PR automatically gets a unique Preview URL shown in:
- GitHub commit status checks
- GitHub PR comments (Vercel bot)
- Vercel project dashboard

Format: `https://chotter-[project]-[git-hash].vercel.app`

## Troubleshooting

### "No Next.js version detected" - Build Error

**Issue:** Deployment fails with:
```
Error: No Next.js version detected. Make sure your package.json has "next" in either "dependencies" or "devDependencies". Also check your Root Directory setting matches the directory of your package.json file.
```

**Root Cause:** Vercel is attempting to build from the repository root instead of the app directory. This is the most common deployment failure for monorepo projects.

**Solution:**
1. Go to your Vercel project "Settings" tab
2. Find the "Root Directory" setting
3. Change it to either:
   - `apps/web-admin` (for admin project), OR
   - `apps/web-customer` (for customer project)
4. Save settings
5. Go to "Deployments" and click "Redeploy" on the latest deployment
6. Monitor build logs to verify it now builds from the correct directory

**Verification:** After fixing Root Directory, the build logs should show:
```
Building in: /app/apps/web-admin  # or web-customer
Found vercel.json. Using build settings from there.
```

### Build Fails with "bun: command not found"

**Issue:** Vercel build system doesn't have Bun installed

**Solution:** This should not occur as Vercel supports Bun. If it does:
1. Verify the app directory has a valid `package.json` with the correct build command
2. Check Vercel project settings for the Root Directory (see above solution)
3. Ensure `vercel.json` has `"installCommand": "bun install"`
4. Contact Vercel support if issue persists

### Environment Variables Not Available

**Issue:** Application shows undefined Supabase URL/key at runtime

**Solution:**
1. Verify environment variables are set in Vercel project Settings > Environment Variables
2. Ensure variables are named exactly:
   - `VITE_SUPABASE_URL` (not `SUPABASE_URL`)
   - `VITE_SUPABASE_ANON_KEY` (not `SUPABASE_ANON_KEY`)
3. Check that variables are enabled for all environments: `Production`, `Preview`, `Development`
4. CRITICAL: After adding/updating environment variables:
   - Go to "Deployments" tab
   - Click three-dot menu on latest deployment
   - Select "Redeploy" to rebuild with new variables
   - Or push a new commit to trigger redeploy
5. Verify values in browser console: `console.log(import.meta.env.VITE_SUPABASE_URL)`
6. Check that the app is running the newly deployed version (check build timestamp)

### Build Succeeds but App Shows Blank Page

**Issue:** No errors in console but application not rendering

**Solution:**
1. Check browser console (F12) for JavaScript errors
2. Verify Supabase credentials are correct in Environment Variables
3. Check Supabase project is accessible from Vercel (no CORS issues)
4. Review Network tab in browser DevTools for failed API calls to Supabase
5. Check Vercel deployment logs for build warnings
6. Verify the `index.html` file exists in the output directory (`dist/`)
7. Check that React/application mount point exists in HTML

### Preview Deployments Not Created for PRs

**Issue:** GitHub PR doesn't show Vercel deployment comments

**Solution:**
1. Verify Vercel GitHub app is installed on repository
2. Check Vercel project settings for GitHub configuration
3. Re-authorize Vercel GitHub app if needed:
   - Go to Vercel project settings > Git Integrations
   - Disconnect and reconnect GitHub
4. Check repository branch protection rules don't block deployments
5. Ensure PR source branch is not ignored in Vercel settings

## Custom Domains

To set up custom domains:

1. In Vercel project settings, go to "Domains"
2. Add your domain (e.g., `admin.chotter.com`, `portal.chotter.com`)
3. Update DNS records with provided CNAME or nameserver values
4. Verify domain completion in Vercel
5. Enable HTTPS (automatic with Let's Encrypt)

## Monitoring Deployments

### Vercel Dashboard

- **Activity:** Real-time build and deployment status
- **Analytics:** Page performance, Core Web Vitals metrics
- **Logs:** Build logs, server logs, function logs
- **Error Reports:** Deployment errors and failures

### GitHub Integration

- Each commit shows deployment status
- PR comments include preview URL
- Merge status checks prevent bad deploys to main

## Performance Optimization

Vercel automatically provides:

- Global CDN for fast content delivery
- Automatic image optimization
- Edge caching for static assets
- Analytics for performance monitoring

For additional optimization:

1. **Enable Serverless Functions** for API routes (optional future)
2. **Configure Cache Control** headers in vercel.json (if needed)
3. **Use Image Optimization** via Vercel Image Optimization API

## Rollback Strategy

If a production deployment has issues:

### Quick Rollback

1. Go to Vercel project dashboard
2. Click on "Deployments"
3. Find the previous good deployment
4. Click the three-dots menu
5. Select "Promote to Production"

### Alternative: Git Rollback

1. Revert the problematic commit in Git
2. Push to `main` branch
3. Vercel automatically redeploys

## Security Considerations

- Never commit secrets or API keys to the repository
- Use Vercel environment variables for all sensitive data
- Regularly rotate Supabase API keys
- Monitor Vercel activity logs for suspicious deployments
- Use GitHub branch protection on `main` branch
- Require PR reviews before merging to `main`
- Enable Vercel deployment protection for production

## References

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Configuration Reference](https://vercel.com/docs/projects/project-configuration)
- [Vite Build Tool](https://vitejs.dev/)
- [Bun Package Manager](https://bun.sh/)
- [Supabase Documentation](https://supabase.com/docs)

## Useful Commands

```bash
# List all Vercel projects
vercel list

# View project details
vercel projects inspect chotter-admin

# Get logs for a deployment
vercel logs

# Pull environment variables from Vercel
vercel env pull

# Inspect a specific deployment
vercel inspect <deployment-url>
```

## Support

For deployment issues:

1. Check Vercel deployment logs in dashboard
2. Review [Vercel Status Page](https://www.vercelstatus.com/)
3. Check GitHub repository for deployment settings
4. Review Supabase project for API key issues
5. Contact Vercel support if issues persist

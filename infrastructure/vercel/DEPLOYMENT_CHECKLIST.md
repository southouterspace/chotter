# Vercel Deployment Checklist

Use this checklist to verify your Vercel setup is correct and troubleshoot deployment issues.

## Pre-Deployment Checklist

Before deploying to Vercel, verify these items:

### Repository Setup

- [ ] Repository is on GitHub
- [ ] GitHub account is connected to Vercel
- [ ] Vercel GitHub app is installed and authorized
- [ ] You have push access to the repository

### Application Files

- [ ] `/apps/web-admin/package.json` exists with `"build": "tsc && vite build"` script
- [ ] `/apps/web-admin/vercel.json` exists with correct configuration
- [ ] `/apps/web-customer/package.json` exists with `"build": "tsc && vite build"` script
- [ ] `/apps/web-customer/vercel.json` exists with correct configuration
- [ ] Both app directories have `tsconfig.json` for TypeScript build
- [ ] Both app directories have Vite configuration (`vite.config.ts` or similar)

### Build Verification

- [ ] Local build works: `cd apps/web-admin && bun run build`
- [ ] Build output appears in `dist/` directory
- [ ] `dist/index.html` exists
- [ ] Static assets build successfully

### Supabase Configuration

- [ ] Supabase project created and accessible
- [ ] You have the Supabase project URL (looks like `https://xxxxxxxxxxxx.supabase.co`)
- [ ] You have the anonymous API key from Supabase dashboard
- [ ] Both URLs and keys are different from other projects (not copy-pasted)

## Vercel Project Creation Checklist

### Creating Admin Dashboard Project

1. **Project Import**
   - [ ] In Vercel dashboard, click "Add New" > "Project"
   - [ ] Select Chotter repository from the list
   - [ ] Project wizard opens with configuration screen

2. **Project Settings (CRITICAL)**
   - [ ] "Project Name" is set to `chotter-admin`
   - [ ] **"Root Directory" is set to `apps/web-admin`** (NOT repository root, NOT `apps/`)
   - [ ] Framework Preset shows as "Vite" or "Other" (will be auto-detected)
   - [ ] Build Command is empty or shows `bun run build`
   - [ ] Output Directory is empty or shows `dist`

3. **Deploy**
   - [ ] Click "Deploy" button
   - [ ] Wait for initial build to complete (5-10 minutes)
   - [ ] Build should complete successfully

4. **After Initial Deploy**
   - [ ] Go to project "Settings" tab
   - [ ] Click "Environment Variables" in sidebar
   - [ ] Add `VITE_SUPABASE_URL` variable
   - [ ] Add `VITE_SUPABASE_ANON_KEY` variable
   - [ ] Both variables enabled for Production, Preview, Development
   - [ ] Click "Save"

5. **Verify Deployment**
   - [ ] Go to "Deployments" tab
   - [ ] Click three-dot menu on latest deployment
   - [ ] Select "Redeploy" to rebuild with environment variables
   - [ ] Wait for redeploy to complete
   - [ ] Click "Visit" to view deployed application
   - [ ] Application loads without errors
   - [ ] Check browser console for JavaScript errors
   - [ ] Verify Supabase connection works

### Creating Customer Portal Project

Repeat all steps above with these changes:

- [ ] "Project Name" is set to `chotter-customer`
- [ ] **"Root Directory" is set to `apps/web-customer`**
- [ ] Use same environment variables as admin project

## Post-Deployment Verification

### Deployment Success Checks

- [ ] Vercel project shows green "Ready" status
- [ ] Build logs show no errors
- [ ] Build logs mention `vercel.json` configuration
- [ ] Preview deployment URL is accessible
- [ ] Application page loads (not blank page or 404)

### Application Functionality Checks

- [ ] Application renders with correct layout
- [ ] No JavaScript errors in browser console
- [ ] Supabase URL shows in `import.meta.env.VITE_SUPABASE_URL`
- [ ] Supabase key shows in `import.meta.env.VITE_SUPABASE_ANON_KEY`
- [ ] Application can connect to Supabase (check network requests)

### Environment Configuration Checks

Test in browser console:

```javascript
// Should show your actual Supabase URL
console.log(import.meta.env.VITE_SUPABASE_URL)

// Should show your actual Supabase key
console.log(import.meta.env.VITE_SUPABASE_ANON_KEY)
```

Both should return actual values, not `undefined`.

## Troubleshooting Checklist

If deployment fails, work through these items:

### "No Next.js version detected" Error

- [ ] Go to Vercel project Settings
- [ ] Find "Root Directory" setting
- [ ] Verify it's NOT the repository root
- [ ] Verify it IS `apps/web-admin` or `apps/web-customer`
- [ ] Save settings
- [ ] Go to Deployments and click "Redeploy"

### "bun: command not found" Error

- [ ] Verify app directory has valid `package.json`
- [ ] Verify `vercel.json` contains `"installCommand": "bun install"`
- [ ] Check that Root Directory is set correctly (see above)
- [ ] Verify `package-lock.json` or `yarn.lock` is NOT in the app directory (Bun uses `bun.lock`)

### Build Succeeds but App Doesn't Work

- [ ] Check browser console for errors
- [ ] Verify environment variables are set in Vercel dashboard
- [ ] Verify variable names are exactly `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- [ ] Verify variables are enabled for current environment (Production/Preview)
- [ ] Go to Deployments and manually "Redeploy" the project
- [ ] Wait for redeploy to complete
- [ ] Hard refresh browser (Ctrl+Shift+R or Cmd+Shift+R)
- [ ] Check build timestamp changed

### Environment Variables Show as "undefined"

- [ ] Go to Vercel project Settings > Environment Variables
- [ ] Verify all variables are present
- [ ] Verify variable names match exactly (case-sensitive):
   - [ ] `VITE_SUPABASE_URL` (not `VITE_SUPABASE_url`)
   - [ ] `VITE_SUPABASE_ANON_KEY` (not `VITE_SUPABASE_ANON_key`)
- [ ] Verify each variable is enabled for Production
- [ ] Verify values are not empty or just whitespace
- [ ] Go to Deployments and click "Redeploy"
- [ ] Check that new build timestamp appears in browser

### Blank Page with No Errors

- [ ] Verify `dist/index.html` exists in build output
- [ ] Verify React mount element exists in HTML (usually `<div id="root"></div>`)
- [ ] Check Network tab in DevTools for failed requests
- [ ] Verify Supabase connection isn't blocking app startup
- [ ] Check that all JavaScript files loaded successfully
- [ ] Try different browser or incognito mode (clear cache)

## Quick Fixes

### Fix Root Directory Issue (Most Common)

1. Go to Vercel project "Settings"
2. Find "Root Directory" setting
3. Change from repository root to `apps/web-admin` or `apps/web-customer`
4. Go to "Deployments" tab
5. Click three-dots on latest deployment
6. Select "Redeploy"
7. Wait for build to complete

### Force Rebuild with Environment Variables

1. Go to Vercel project "Settings" > "Environment Variables"
2. Add or update any variable (even just clicking Save counts)
3. Go to "Deployments" tab
4. Click three-dots on latest deployment
5. Select "Redeploy"
6. Monitor build logs for errors

### Clear Build Cache

If stuck, you can clear the Vercel build cache:

1. Go to Vercel project "Settings"
2. Find "Caching" section
3. Click "Clear All"
4. Go to "Deployments" tab
5. Click "Redeploy" on latest deployment

## Support Commands

Check deployment status via Vercel CLI:

```bash
# Install Vercel CLI
npm install -g vercel

# Connect to your project
vercel link

# View project information
vercel projects inspect chotter-admin

# View deployment logs
vercel logs

# Pull environment variables from Vercel
vercel env pull

# List all deployments
vercel deployments list
```

## Getting Help

If you're still having issues:

1. Check the [Troubleshooting](#troubleshooting) section in README.md
2. Review Vercel build logs (Dashboard > Deployments > Click deployment > Logs)
3. Check Vercel Status Page: https://www.vercelstatus.com/
4. Review repository configuration files
5. Try manual Vercel CLI deployment: `vercel --prod=false`
6. Contact Vercel support with deployment URL and build logs

## Common Mistakes Summary

These are the most common setup mistakes:

| Mistake | Fix |
|---------|-----|
| Root Directory set to repository root | Change to `apps/web-admin` or `apps/web-customer` |
| Environment variables not set | Add to Vercel project Settings > Environment Variables |
| Environment variables not redeployed | Go to Deployments > Redeploy |
| Environment variable names incorrect | Use exactly `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` |
| Build command overridden in settings | Leave Build Command empty to use `vercel.json` |
| One project for both apps | Create separate projects for admin and customer |
| Using npm instead of Bun | Ensure `vercel.json` has `"installCommand": "bun install"` |
| Forgot to enable all environments | Check Production, Preview, Development are all selected |

# Vercel Deployment Configuration

This directory contains configuration and documentation for deploying Chotter web applications to Vercel.

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

1. Click "Import Project" or "Add New" > "Project"
2. Select the Chotter repository
3. Configure as follows:
   - **Project Name:** `chotter-admin`
   - **Framework Preset:** Vite
   - **Root Directory:** `apps/web-admin`
   - **Build Command:** Leave empty (will use vercel.json)
   - **Output Directory:** `dist`

4. Click "Deploy" to proceed to environment variable configuration

#### 4. Configure Admin Dashboard Environment Variables

In the Vercel project settings page or after deployment:

1. Go to "Settings" > "Environment Variables"
2. Add the following variables (available in Supabase dashboard):

   - `VITE_SUPABASE_URL` = Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY` = Your Supabase anonymous API key

3. Select environments: Production, Preview, Development
4. Click "Save"

#### 5. Create Customer Portal Project

Repeat steps 3-4 with these modifications:

- **Project Name:** `chotter-customer`
- **Root Directory:** `apps/web-customer`
- Same environment variables as Admin Dashboard

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

### `/apps/web-admin/vercel.json`

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

### `/apps/web-customer/vercel.json`

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

### `/infrastructure/vercel/vercel.json` (Global Overrides)

```json
{
  "github": {
    "silent": true
  },
  "buildCommand": "bun run build",
  "installCommand": "bun install"
}
```

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

### Build Fails with "bun: command not found"

**Issue:** Vercel build system doesn't have Bun installed

**Solution:** This should not occur as Vercel supports Bun. If it does:
1. Check Vercel project settings
2. Ensure `buildCommand` is set correctly in vercel.json
3. Contact Vercel support

### Environment Variables Not Available

**Issue:** Application shows undefined Supabase URL/key

**Solution:**
1. Verify environment variables are set in Vercel project settings
2. Ensure variables are prefixed with `VITE_`
3. Check that variables are enabled for all environments (Production, Preview, Development)
4. Redeploy after updating environment variables
5. Check browser console for which specific variable is missing

### Build Succeeds but App Shows Blank Page

**Issue:** No errors in console but application not rendering

**Solution:**
1. Check browser console for JavaScript errors
2. Verify Supabase credentials are correct
3. Check Supabase project is accessible from Vercel
4. Review Network tab in browser DevTools for failed API calls
5. Check Vercel deployment logs for build warnings

### Preview Deployments Not Created for PRs

**Issue:** GitHub PR doesn't show Vercel deployment comments

**Solution:**
1. Verify Vercel GitHub app is installed on repository
2. Check Vercel project settings for GitHub configuration
3. Re-authorize Vercel GitHub app if needed
4. Check repository branch protection rules don't block deployments

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

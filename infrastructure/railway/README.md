# Railway Deployment Guide for Chotter API

This directory contains all configuration files needed to deploy the Chotter Hono API to Railway using Bun as the runtime.

## Overview

Railway is a modern platform for deploying applications with Git-based deployment workflows. This guide walks you through:

1. Creating a Railway project
2. Configuring environment variables
3. Deploying the Hono API
4. Setting up staging and production environments
5. Configuring auto-deployment triggers

## Prerequisites

- Railway account (free tier available): https://railway.app
- GitHub account with access to the Chotter repository
- Supabase project configured (see `/ref/chotter-dev-plan.md` P0.6)

## Files in This Directory

- **Dockerfile** - Multi-stage Docker build optimized for Bun runtime
- **railway.json** - Service configuration (optional, Railway can auto-detect)
- **railway.toml** - Deployment settings and environment variables
- **README.md** - This file

## Quick Start: Deploy to Railway

### Step 1: Create a Railway Project

1. Go to [railway.app](https://railway.app) and sign in
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Authorize Railway to access your GitHub account
5. Select the Chotter repository
6. Click "Deploy now"

### Step 2: Configure Environment Variables

Railway will automatically detect the Dockerfile and build the application. However, you need to add environment variables for the API to function.

In the Railway dashboard:

1. Go to your project settings
2. Navigate to the "Variables" tab
3. Add the following environment variables:

#### Required Environment Variables

```bash
# Supabase Configuration (get from your Supabase project dashboard)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Application Settings
PORT=3000
NODE_ENV=production
BUN_ENV=production
```

#### Optional Environment Variables

```bash
# Add any additional configuration as needed
LOG_LEVEL=info
```

### Step 3: Deploy

1. Railway will automatically start building when you connect the repository
2. Monitor the deployment in the Railway dashboard
3. Once the build completes, your API will be live at the Railway-provided URL

### Step 4: Verify Deployment

Test your deployment with:

```bash
# Replace YOUR_RAILWAY_URL with your actual Railway deployment URL
curl https://YOUR_RAILWAY_URL/health

# Expected response:
# {"status":"ok"}
```

## Setting Up Staging and Production

### Create Environments in Railway

1. **Staging Environment** (auto-deploy from `develop` branch):
   - Project name: `chotter-api-staging`
   - Auto-deploy from `develop` branch
   - Resource allocation: 256MB memory

2. **Production Environment** (manual/auto-deploy from `main` branch):
   - Project name: `chotter-api-production`
   - Manual approval for deployments
   - Resource allocation: 512MB memory
   - Enable auto-scaling if needed

### Configure Deployment Triggers

#### For Staging (Automatic):
```bash
# Environment variables should match staging Supabase instance
NODE_ENV=staging
```

#### For Production (Recommended: Manual Approval):
```bash
# Environment variables should match production Supabase instance
NODE_ENV=production
# Enable manual deployments for safety
```

## Dockerfile Overview

The included Dockerfile uses a multi-stage build to optimize the final image:

### Build Stage
- Uses `oven/bun:1` as the base image
- Installs dependencies using Bun's lock file
- Builds the application with Bun's build command
- Produces optimized JavaScript output

### Runtime Stage
- Uses lightweight `oven/bun:1` runtime image
- Copies only necessary build artifacts
- Includes health check configuration
- Exposes port 3000

### Key Features
- Reproducible builds with frozen lockfile
- Minimal final image size
- Built-in health check support
- Proper signal handling for graceful shutdown

## Environment Configuration

### Build Configuration

```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "infrastructure/railway/Dockerfile"
buildContext = "."
```

### Deploy Configuration

```toml
[deploy]
startCommand = "bun run dist/index.js"
port = 3000
memoryRequest = "256Mi"
memoryLimit = "512Mi"
cpuRequest = "100m"
cpuLimit = "500m"
```

Resource limits can be adjusted in the Railway dashboard based on traffic patterns.

### Health Check Configuration

The application includes a health check endpoint at `/health`. Railway will use this to:

- Verify the application started successfully
- Monitor application health
- Restart unhealthy instances
- Coordinate rolling deployments

## API Health Check Endpoint

The Hono API should implement a health check endpoint:

```typescript
// src/index.ts - Example health check
import { Hono } from 'hono'

const app = new Hono()

app.get('/health', (c) => {
  return c.json({ status: 'ok' }, 200)
})

export default app
```

## Deployment Workflow

### Local Testing Before Deployment

Test the Docker build locally:

```bash
# From repository root
docker build -f infrastructure/railway/Dockerfile -t chotter-api:latest .

# Run locally
docker run -p 3000:3000 \
  -e SUPABASE_URL=http://localhost:54321 \
  -e SUPABASE_ANON_KEY=your-key \
  -e SUPABASE_SERVICE_ROLE_KEY=your-key \
  chotter-api:latest

# Test health endpoint
curl http://localhost:3000/health
```

### Railway Deployment Process

1. **Trigger**: Push to `develop` (staging) or `main` (production)
2. **Build**: Railway clones repo, runs Docker build
3. **Test**: Health checks verify application is healthy
4. **Deploy**: Application starts receiving traffic
5. **Monitor**: Railway monitors application metrics

## Monitoring and Logs

### View Application Logs

In the Railway dashboard:

1. Select your project
2. Click on the "Logs" tab
3. View real-time logs as the application runs

### Monitor Deployments

1. Select your project
2. Click "Deployments" tab
3. View:
   - Build duration
   - Deployment status
   - Build logs
   - Runtime logs

## Scaling and Performance

### Vertical Scaling (More Resources)

Adjust in `railway.toml` or Railway dashboard:

```toml
[deploy]
memoryLimit = "1024Mi"  # Increase from 512Mi
cpuLimit = "1000m"      # Increase from 500m
```

### Horizontal Scaling (Multiple Replicas)

For production deployments, increase replicas:

```toml
[deploy]
numReplicas = 3  # Instead of 1
```

## Troubleshooting

### Build Fails with Missing Dependencies

Ensure `bun.lockb` is committed to Git:

```bash
git status | grep bun.lockb
# If not in Git:
git add bun.lockb
git commit -m "chore: add bun lockfile for Railway"
git push
```

### Application Starts but Health Check Fails

1. Verify the health endpoint is implemented in `apps/api/src/index.ts`
2. Check that PORT matches configured port (default 3000)
3. View logs in Railway dashboard for error messages

### Out of Memory Errors

Increase memory limit in `railway.toml`:

```toml
[deploy]
memoryLimit = "1024Mi"
```

### Build Takes Too Long

- Bun dependencies are likely large
- Consider caching strategies or splitting workload
- Check if all imports are necessary

### Port Conflicts

Railway automatically assigns ports. If your app listens on the wrong port:

```bash
# Add to Railway environment variables
PORT=3000
```

## Best Practices

1. **Use Environment Variables**: Never hardcode secrets or configuration
2. **Health Checks**: Implement `/health` endpoint for reliability
3. **Gradual Rollout**: Use staging environment before production
4. **Monitor Performance**: Check Railway metrics regularly
5. **Backup Database**: Supabase handles backups, but verify settings
6. **Log Aggregation**: Monitor logs for errors and performance issues
7. **Auto-Deployment**: Use for staging, require approval for production

## Advanced: GitHub Actions Integration

For more control over deployments, you can use GitHub Actions:

```yaml
# .github/workflows/deploy-railway.yml
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
        run: |
          npm i -g @railway/cli
          railway up --service chotter-api
```

## Documentation References

- Railway Docs: https://docs.railway.app
- Bun Documentation: https://bun.sh/docs
- Hono Framework: https://hono.dev
- Supabase Docs: https://supabase.com/docs

## Support

For issues or questions:

1. Check Railway documentation: https://docs.railway.app
2. Review application logs in Railway dashboard
3. Verify environment variables are correctly set
4. Ensure `bun.lockb` is committed to Git
5. Test Docker build locally before pushing

## Next Steps

After successful deployment:

1. **Set up custom domain**: Configure your domain in Railway settings
2. **Enable HTTPS**: Railway provides free SSL certificates
3. **Configure database**: Link Supabase project
4. **Set up monitoring**: Enable Railway metrics and logging
5. **Create CI/CD pipeline**: Automate deployments with GitHub Actions
6. **Deploy web apps**: Follow `/infrastructure/vercel/README.md` for Vercel

---

**Last Updated**: October 2024
**Maintainer**: Deployment Engineer
**Status**: Ready for Production

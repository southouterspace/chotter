# Railway Deployment Checklist

Complete this checklist before deploying the Chotter API to Railway.

## Pre-Deployment Phase

### Repository Setup
- [ ] Project is in a Git repository with GitHub
- [ ] `.gitignore` excludes sensitive files (.env, secrets, etc.)
- [ ] `bun.lockb` is committed to repository (run `git add bun.lockb && git commit -m "add bun lockfile"`)
- [ ] No hardcoded secrets in code or configuration
- [ ] All source code is pushed to GitHub

### Application Code
- [ ] API implemented in `/apps/api/src/index.ts` with Hono framework
- [ ] Health check endpoint is implemented at `/health` endpoint
- [ ] Package.json build script works: `bun build src/index.ts --outdir dist --target bun`
- [ ] All dependencies are declared in `package.json`
- [ ] Application starts with: `bun run dist/index.js`

### Environment Configuration
- [ ] `.env.example` exists and documents all required variables
- [ ] All environment variables are read from process.env
- [ ] PORT environment variable is respected
- [ ] Application handles missing environment variables gracefully

### Infrastructure Files
- [ ] `infrastructure/railway/Dockerfile` exists and is valid
- [ ] `infrastructure/railway/railway.json` exists
- [ ] `infrastructure/railway/railway.toml` exists
- [ ] `infrastructure/railway/README.md` exists with deployment instructions
- [ ] `infrastructure/railway/ENVIRONMENT_VARIABLES.md` exists

### Supabase Configuration
- [ ] Supabase project is created in cloud (https://supabase.com)
- [ ] Supabase project URL obtained from project settings
- [ ] Supabase Anon Key obtained from project settings
- [ ] Supabase Service Role Key obtained from project settings
- [ ] Supabase project is accessible from Railway
- [ ] Database migrations are up to date

### Local Testing
- [ ] Application builds locally: `bun build src/index.ts --outdir dist --target bun`
- [ ] Application runs locally: `bun run dist/index.js`
- [ ] Health check endpoint responds: `curl http://localhost:3000/health`
- [ ] API endpoints work correctly with local Supabase (if applicable)

### Docker Validation
- [ ] Docker is installed: `docker --version`
- [ ] Dockerfile builds locally: `docker build -f infrastructure/railway/Dockerfile -t chotter-api:latest .`
- [ ] Docker image has reasonable size (< 200MB for Bun runtime)
- [ ] Dockerfile follows Docker best practices (multi-stage, minimal layers)

## Railway Setup Phase

### Account & Project Creation
- [ ] Railway account created at https://railway.app
- [ ] GitHub account authorized with Railway
- [ ] Railway project created in dashboard
- [ ] GitHub repository connected to Railway project

### Service Configuration
- [ ] Service is set to use Dockerfile from `infrastructure/railway/Dockerfile`
- [ ] Build context is set to repository root
- [ ] Port is correctly configured (3000)
- [ ] Memory limit is set appropriately (256MB-512MB for staging)
- [ ] CPU limit is set appropriately (100m-500m)

### Environment Variables in Railway
- [ ] `SUPABASE_URL` is set in Railway variables
- [ ] `SUPABASE_ANON_KEY` is set in Railway variables
- [ ] `SUPABASE_SERVICE_ROLE_KEY` is set in Railway variables (stored securely)
- [ ] `PORT` is set to `3000`
- [ ] `NODE_ENV` is set to `production`
- [ ] `BUN_ENV` is set to `production`
- [ ] All variables are correct for target environment (staging/production)

### Build Configuration
- [ ] Build command is: (leave empty - use Dockerfile)
- [ ] Dockerfile is at: `infrastructure/railway/Dockerfile`
- [ ] Bun version is 1.x (from oven/bun:1 image)

## Deployment Phase

### Initial Deployment
- [ ] Push changes to Git repository
- [ ] Railway automatically detects changes
- [ ] Build starts in Railway dashboard
- [ ] Build completes successfully
- [ ] Build logs show no errors
- [ ] Application starts successfully
- [ ] Application is accessible at Railway-provided URL

### Health Verification
- [ ] Health check endpoint responds: `curl https://<railway-url>/health`
- [ ] API returns expected response format
- [ ] Application logs appear in Railway dashboard
- [ ] No errors in application logs
- [ ] Memory usage is within limits
- [ ] CPU usage is reasonable

### API Testing
- [ ] Make test requests to API endpoints
- [ ] Database connections work correctly
- [ ] Response times are acceptable
- [ ] Error handling works as expected
- [ ] API authentication works if applicable

## Post-Deployment Phase

### Monitoring & Observability
- [ ] Application metrics visible in Railway dashboard
- [ ] Logs are being captured and searchable
- [ ] Deployment history shows successful deployment
- [ ] Health checks are passing continuously
- [ ] No memory leaks or resource issues

### Custom Domain Setup (Optional)
- [ ] Custom domain is configured in Railway
- [ ] SSL/TLS certificate is issued by Railway
- [ ] Domain DNS is pointing to Railway
- [ ] HTTPS requests work correctly
- [ ] HTTP redirects to HTTPS

### Database Verification
- [ ] Supabase connection string is correct
- [ ] Database queries execute successfully
- [ ] Data integrity is verified
- [ ] Backup is configured in Supabase
- [ ] Migration history is complete

### Staging Environment
- [ ] Staging deployment created (optional)
- [ ] Auto-deploy from `develop` branch configured
- [ ] Environment variables match staging Supabase project
- [ ] Staging health checks passing
- [ ] Can test new features in staging first

### Production Environment
- [ ] Production deployment created
- [ ] Auto-deploy from `main` branch configured (or manual approval)
- [ ] Environment variables match production Supabase project
- [ ] Production health checks passing
- [ ] Traffic is properly routed to production

## Troubleshooting Checklist

### Build Failures
- [ ] Check Dockerfile syntax: `docker build ...`
- [ ] Verify bun.lockb is committed to Git
- [ ] Check for missing files referenced in COPY commands
- [ ] Review build logs in Railway dashboard
- [ ] Ensure all dependencies are properly declared

### Application Won't Start
- [ ] Check application logs in Railway dashboard
- [ ] Verify all environment variables are set
- [ ] Ensure PORT is 3000
- [ ] Test locally first: `bun run dist/index.js`
- [ ] Check Supabase credentials are correct

### Health Check Failures
- [ ] Verify `/health` endpoint is implemented
- [ ] Check endpoint returns 200 OK status
- [ ] Verify application actually starts
- [ ] Review health check configuration in railway.toml
- [ ] Test manually: `curl http://localhost:3000/health`

### Database Connection Issues
- [ ] Verify SUPABASE_URL is accessible from Railway
- [ ] Check SUPABASE_ANON_KEY is correct
- [ ] Ensure Supabase project is not paused
- [ ] Check Supabase project status on dashboard
- [ ] Verify database migrations are applied

### Performance Issues
- [ ] Increase memory limit in Railway
- [ ] Check for N+1 query problems
- [ ] Review application logs for slow operations
- [ ] Monitor CPU and memory in Railway dashboard
- [ ] Consider horizontal scaling (more replicas)

## Security Verification Checklist

### Secrets & Credentials
- [ ] No secrets in Git repository
- [ ] All secrets stored in Railway variables
- [ ] SUPABASE_SERVICE_ROLE_KEY is restricted
- [ ] Staging and production use separate credentials
- [ ] Regular credential rotation scheduled

### Network Security
- [ ] HTTPS is enabled (Railway default)
- [ ] API endpoints validate input
- [ ] Rate limiting is configured if needed
- [ ] CORS is properly configured
- [ ] No open debug endpoints in production

### Data Protection
- [ ] Supabase RLS (Row Level Security) is enabled
- [ ] Database backups are configured
- [ ] Data retention policies are in place
- [ ] Sensitive data is not logged
- [ ] Audit logs are enabled

### Access Control
- [ ] Railway project access is restricted to team members
- [ ] GitHub repository has appropriate branch protections
- [ ] Production deployments require approval
- [ ] Audit trail is maintained for all deployments
- [ ] Team members have principle of least privilege

## Sign-Off

### Staging Deployment
- [ ] All staging items checked
- [ ] Staging deployment successful
- [ ] Ready for feature testing
- [ ] Approved by: ________________
- [ ] Date: ________________

### Production Deployment
- [ ] All production items checked
- [ ] Production deployment successful
- [ ] Monitoring is active
- [ ] Rollback plan documented
- [ ] Approved by: ________________
- [ ] Date: ________________

## Next Steps After Deployment

1. **Monitor for 24 hours**
   - Watch metrics and logs
   - Look for any errors or anomalies
   - Verify SLA/performance targets

2. **Set up alerting**
   - Configure notifications for failures
   - Set up uptime monitoring
   - Enable performance alerts

3. **Document deployment**
   - Record successful deployment details
   - Document any issues and resolutions
   - Update runbooks with deployment steps

4. **Plan scaling**
   - Monitor resource usage
   - Plan for growth
   - Set up auto-scaling if needed

5. **Deploy web apps**
   - Follow Vercel deployment guide
   - Connect frontend to Railway API
   - Test end-to-end integration

---

**Last Updated**: October 2024
**Maintained by**: Deployment Engineer
**Contact**: [Your deployment team email]

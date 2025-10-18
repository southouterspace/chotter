# Railway Deployment Guide

This project uses modern Railway deployment with Railpack and Bun runtime.

## 🚀 Quick Deploy

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template)

## 📋 Prerequisites

- Railway account connected to GitHub
- Supabase project (database migrations applied)
- Environment variables ready

## 🔧 Configuration Files

This project includes:

- **`railway.json`** - Railway service configuration
- **`railpack.json`** - Railpack build configuration for Bun
- **`.env.example`** - Environment variable template

## 📦 Monorepo Structure

Railway automatically detects and builds only the API service:

```
chotter/
├── apps/
│   └── api/              ← Deployed to Railway
├── packages/
│   ├── database/         ← Auto-included as dependency
│   └── utils/            ← Auto-included as dependency
└── railway.json          ← Railway configuration
```

## 🛠️ Environment Variables

Set these in Railway Dashboard → Variables:

```bash
# Required
NODE_ENV=production
PORT=3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
CORS_ORIGINS=https://your-admin-domain.com,https://your-customer-domain.com

# Optional (Phase 2+)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## 🎯 Deployment Steps

### 1. Connect GitHub Repository

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose **`southouterspace/chotter`**
5. Select branch: **`main`** or **`develop`**

### 2. Configure Service

Railway will auto-detect the configuration from `railway.json` and `railpack.json`:

- ✅ **Builder**: Railpack (with Bun)
- ✅ **Build Command**: `bun install && bun run --filter @chotter/api build`
- ✅ **Start Command**: `bun run --filter @chotter/api start`
- ✅ **Watch Paths**: `apps/api/**`, `packages/**`

### 3. Set Environment Variables

Click **Variables** → **Raw Editor** and paste:

```bash
NODE_ENV=production
PORT=3000
SUPABASE_URL=https://zlrhcpjlpxzughojpujd.supabase.co
SUPABASE_ANON_KEY=sb_publishable_C6z-6Kua9DAlJ0-2z65PWQ_pOILDtIx
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
CORS_ORIGINS=http://localhost:5173,http://localhost:5174
```

### 4. Deploy

Railway will automatically deploy. Monitor the build logs.

## ✅ Verify Deployment

Once deployed, get your Railway URL (e.g., `https://chotter-api-production.up.railway.app`):

```bash
# Test health check
curl https://your-app.railway.app/health

# Expected response:
{
  "status": "ok",
  "database": "connected",
  "timestamp": "2025-10-18T..."
}
```

## 🔄 Automatic Deployments

Railway will automatically redeploy when you push to the configured branch:

- Changes to `apps/api/**` → Triggers deployment
- Changes to `packages/database/**` → Triggers deployment
- Changes to `packages/utils/**` → Triggers deployment
- Changes to other apps → No deployment

## 🐛 Troubleshooting

### Build fails with "command not found: bun"

- Ensure `railpack.json` is in the repository root
- Check that Railpack is selected (not Dockerfile)
- Verify Bun runtime is specified in railpack.json

### "Cannot find module '@chotter/database'"

- Verify `bun install` runs from monorepo root
- Check `package.json` workspace configuration

### Environment variables not working

- Ensure all variables are set in Railway dashboard
- Restart the service after adding variables
- Check logs for "undefined" environment errors

### Database connection timeout

- Verify `SUPABASE_URL` is correct
- Check `SUPABASE_SERVICE_ROLE_KEY` is valid
- Ensure Supabase project is active

## 📊 Monitoring

Railway provides:

- **Logs**: Real-time application logs
- **Metrics**: CPU, memory, network usage
- **Deployments**: History and rollback options

## 🔐 Security Notes

- Never commit `.env` files
- Use Railway's environment variables for secrets
- Rotate `SUPABASE_SERVICE_ROLE_KEY` regularly
- Enable Railway's private networking for production

## 📚 Additional Resources

- [Railway Docs](https://docs.railway.app)
- [Railpack Docs](https://railpack.com)
- [Bun Runtime](https://bun.sh)
- [Hono Framework](https://hono.dev)

---

**Need help?** Check the main [DEPLOY.md](./DEPLOY.md) or [DEPLOYMENT_PHASE1.md](./docs/DEPLOYMENT_PHASE1.md)

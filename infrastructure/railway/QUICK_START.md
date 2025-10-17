# Railway Deployment Quick Start

**TL;DR**: Deploy Chotter API to Railway in 5 minutes.

---

## 1. Prepare Repository

```bash
cd /Users/justinalvarado/GitHub/chotter

# Ensure bun.lockb is committed
git add bun.lockb
git commit -m "add bun lockfile for Railway deployment"
git push
```

---

## 2. Create Railway Project

1. Go to https://railway.app
2. Sign up/Login
3. Click **"New Project"**
4. Select **"Deploy from GitHub repo"**
5. Authorize Railway to access GitHub
6. Select **"chotter"** repository
7. Click **"Deploy now"**

**Railway automatically detects the Dockerfile and starts building!**

---

## 3. Get Supabase Credentials

Go to your Supabase dashboard (https://supabase.com):

1. Select your project
2. Go to **Settings** → **API**
3. Copy:
   - `Project URL` → `SUPABASE_URL`
   - `Anon Key` → `SUPABASE_ANON_KEY`
   - `Service Role Key` → `SUPABASE_SERVICE_ROLE_KEY`

---

## 4. Set Environment Variables in Railway

In Railway dashboard:

1. Select your **service**
2. Go to **Variables** tab
3. Click **"Add Variable"**
4. Add these variables:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
PORT=3000
NODE_ENV=production
BUN_ENV=production
```

---

## 5. Deploy & Verify

1. Railway automatically builds and deploys
2. Wait for green checkmark in dashboard
3. Get your Railway URL from the dashboard
4. Test deployment:

```bash
# Replace URL with your Railway URL
curl https://YOUR_RAILWAY_URL/health

# Should return: {"status":"ok"}
```

---

## Done! 🎉

Your API is now live on Railway!

---

## Common Commands

### View Logs
```bash
# In Railway dashboard: Deployments → Logs
# Or via CLI:
railway logs --follow
```

### Update Environment Variable
```bash
# Via Railway CLI
railway variables set PORT=3000

# Then redeploy:
railway down && railway up
```

### Trigger Redeploy
```bash
git commit --allow-empty -m "trigger redeploy"
git push
```

---

## Troubleshooting

### Build Fails
- [ ] Is `bun.lockb` committed to Git?
- [ ] Are all files in repository?
- [ ] Check build logs in Railway

### App Won't Start
- [ ] All environment variables set?
- [ ] Health endpoint implemented?
- [ ] Check logs in Railway dashboard

### Health Check Fails
- [ ] Is health endpoint at `/health`?
- [ ] Does it return 200 status?
- [ ] Is app actually running?

---

## Next Steps

1. **Connect API to Web Apps**
   - See `/infrastructure/vercel/README.md`

2. **Set Up Monitoring**
   - Enable alerts in Railway
   - Monitor logs daily first week

3. **Set Up Staging**
   - Create another Railway project
   - Configure auto-deploy from `develop`

4. **Production Checklist**
   - Use `/infrastructure/railway/DEPLOYMENT_CHECKLIST.md`

---

## Full Documentation

- **README.md** - Complete deployment guide
- **ENVIRONMENT_VARIABLES.md** - All variables reference
- **DEPLOYMENT_CHECKLIST.md** - Pre/post deployment
- **IMPLEMENTATION_SUMMARY.md** - Technical summary

---

**Status**: Ready to Deploy ✓
**Estimated Time**: 5 minutes
**Support**: Check README.md for troubleshooting

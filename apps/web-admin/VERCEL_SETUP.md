# Vercel Deployment Setup for Web Admin

## Environment Variables Required

The web-admin app requires the following environment variables to be set in your Vercel project:

### Required Variables

1. **VITE_SUPABASE_URL**
   - Your Supabase project URL
   - Example: `https://your-project.supabase.co`
   - Get this from: Supabase Dashboard → Project Settings → API

2. **VITE_SUPABASE_ANON_KEY**
   - Your Supabase anonymous/public API key
   - Example: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - Get this from: Supabase Dashboard → Project Settings → API

### Optional Variables

3. **VITE_GOOGLE_MAPS_API_KEY**
   - Google Maps API key for map features
   - Required if you use the map functionality

## How to Set Environment Variables in Vercel

### Method 1: Vercel Dashboard (Recommended)

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add each variable:
   - **Key**: `VITE_SUPABASE_URL`
   - **Value**: Your Supabase URL
   - **Environments**: Select Production, Preview, and Development
4. Click **Save**
5. Repeat for `VITE_SUPABASE_ANON_KEY` and `VITE_GOOGLE_MAPS_API_KEY`

### Method 2: Vercel CLI

```bash
cd apps/web-admin

# Add production environment variables
vercel env add VITE_SUPABASE_URL production
vercel env add VITE_SUPABASE_ANON_KEY production

# Add preview environment variables
vercel env add VITE_SUPABASE_URL preview
vercel env add VITE_SUPABASE_ANON_KEY preview

# Add development environment variables
vercel env add VITE_SUPABASE_URL development
vercel env add VITE_SUPABASE_ANON_KEY development
```

## Triggering a Redeploy

After adding environment variables, you need to redeploy:

### Option 1: Git Push
```bash
git commit --allow-empty -m "chore: trigger redeploy"
git push
```

### Option 2: Vercel Dashboard
1. Go to your deployment
2. Click the **...** menu
3. Select **Redeploy**

### Option 3: Vercel CLI
```bash
vercel --prod
```

## Troubleshooting

### Blank White Screen
- **Cause**: Missing environment variables
- **Solution**: Set the required environment variables in Vercel
- **Check**: Open browser console (F12) to see error messages

### Authentication Not Working
- **Cause**: Wrong Supabase URL or API key
- **Solution**: Double-check the values from your Supabase dashboard
- **Note**: Make sure you're using the **production** Supabase URL, not `http://127.0.0.1:54321`

### Build Failures
- **Check**: Vercel deployment logs
- **Common Issue**: TypeScript errors - run `bun run build` locally first

## Getting Your Supabase Credentials

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project
3. Click **Project Settings** (gear icon in sidebar)
4. Go to **API** section
5. Copy:
   - **Project URL** → Use as `VITE_SUPABASE_URL`
   - **anon public** key → Use as `VITE_SUPABASE_ANON_KEY`

## Different Environments

You may want different Supabase instances for different environments:

- **Production**: Your main Supabase project
- **Preview**: A staging/preview Supabase project
- **Development**: Local Supabase (`http://127.0.0.1:54321`)

Set environment variables accordingly in Vercel for each environment.

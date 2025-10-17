# Vercel Configuration Reference Guide

This guide explains how Vercel finds and uses configuration for Chotter applications.

## Understanding Vercel's Configuration Layers

Vercel uses configuration from multiple sources, applied in this order:

```
1. Vercel Dashboard Project Settings (highest priority)
   ├─ Root Directory
   ├─ Environment Variables
   └─ Build Settings
       │
       └─ 2. vercel.json in Root Directory (or app directory if set)
           ├─ buildCommand
           ├─ outputDirectory
           ├─ installCommand
           └─ framework detection
               │
               └─ 3. Default Vercel behavior (lowest priority)
                   ├─ Auto-detect framework
                   └─ Use framework defaults
```

## The Critical Root Directory Setting

The "Root Directory" setting in Vercel dashboard is the most important configuration. Here's why:

### What Root Directory Does

When you set Root Directory to `apps/web-admin`:

1. Vercel changes working directory to `apps/web-admin/`
2. Vercel looks for `package.json` in that directory
3. Vercel looks for `vercel.json` in that directory
4. Vercel installs dependencies from that directory
5. Vercel runs build command from that directory
6. Vercel uploads static files from `outputDirectory` (relative to Root Directory)

### Consequences of Wrong Root Directory

If Root Directory is set to repository root or wrong path:

```
Root Directory: /  (repository root)
  ├─ Vercel looks for: package.json (finds monorepo's package.json)
  ├─ Vercel looks for: vercel.json (finds root vercel.json if exists)
  ├─ Vercel runs: bun run build (fails - root has no apps to build)
  └─ Error: "No Next.js version detected"
       └─ Reason: Root package.json doesn't have "next" (it's a workspace)
```

## Configuration File Locations

### Monorepo Structure

```
/Users/justinalvarado/GitHub/chotter/
├── package.json                          ← Workspace root (DO NOT use)
├── vercel.json                          ← Not used if Root Directory is app dir
├── apps/
│   ├── web-admin/
│   │   ├── package.json                 ← Used when Root Directory is set
│   │   ├── vercel.json                  ← Used when Root Directory is set
│   │   ├── tsconfig.json
│   │   ├── vite.config.ts
│   │   └── dist/                        ← Output (created by build)
│   │
│   └── web-customer/
│       ├── package.json                 ← Used when Root Directory is set
│       ├── vercel.json                  ← Used when Root Directory is set
│       ├── tsconfig.json
│       ├── vite.config.ts
│       └── dist/                        ← Output (created by build)
│
└── infrastructure/
    └── vercel/
        ├── README.md                    ← You are here
        ├── vercel.json                  ← Reference only
        └── DEPLOYMENT_CHECKLIST.md
```

## Vercel Configuration Files Explained

### Root Level: `/vercel.json`

```json
{
  "github": {
    "silent": true
  }
}
```

**Purpose:** Apply settings to all projects in the organization

**Settings:**
- `"silent": true` - Don't post verbose status on GitHub commits

**Note:** This is overridden by project-specific settings. Each Vercel project uses its own Root Directory, so this root-level config may not be used.

### App Level: `/apps/web-admin/vercel.json`

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

**Purpose:** Configure build process for each app

**Settings:**
- `buildCommand` - Command to build the application
  - Executes: `bun run build` in app directory
  - This runs the script from `package.json`: `"build": "tsc && vite build"`

- `outputDirectory` - Where to find static files after build
  - Value: `dist` (relative to app Root Directory)
  - Vercel uploads all files from `apps/web-admin/dist/` to CDN

- `framework` - Tells Vercel which framework to optimize for
  - Value: `vite` enables Vite-specific optimizations
  - Helps Vercel understand how to serve the app

- `installCommand` - How to install dependencies
  - Value: `bun install`
  - Uses Bun package manager instead of npm
  - Bun is specified in root `package.json` engines field

- `devCommand` - Command for local development preview
  - Value: `bun run dev`
  - Used by `vercel dev` command locally

- `env` - Maps environment variables
  - `@supabase-url` references a secret named "supabase-url"
  - `@supabase-anon-key` references a secret named "supabase-anon-key"
  - Can also use regular variable names (without @) to reference dashboard vars

## How Build Process Works

When you trigger a deployment to Vercel:

```
1. GitHub Webhook
   └─ User pushes to main or creates PR

2. Vercel Receives Event
   └─ Reads Root Directory setting (e.g., apps/web-admin)

3. Vercel Clones Repository
   └─ Full repo cloned to Vercel build machine

4. Vercel Changes Directory
   └─ cd /app/apps/web-admin

5. Vercel Reads Configuration
   ├─ Finds /app/apps/web-admin/vercel.json
   └─ Reads: buildCommand, outputDirectory, framework, etc.

6. Vercel Installs Dependencies
   ├─ Executes: bun install
   ├─ Reads: apps/web-admin/package.json
   ├─ Installs to: apps/web-admin/node_modules
   └─ Uses lock file: bun.lock in root

7. Vercel Builds Application
   ├─ Executes: bun run build
   ├─ Runs TypeScript check: tsc
   ├─ Runs Vite build: vite build
   └─ Creates: apps/web-admin/dist/

8. Vercel Uploads Static Files
   ├─ Reads outputDirectory: dist
   ├─ Takes files from: apps/web-admin/dist/
   ├─ Uploads to: Vercel CDN
   └─ Deploys to: URL like chotter-admin.vercel.app

9. Vercel Updates GitHub
   ├─ Posts deployment URL as comment on PR (if PR deploy)
   ├─ Sets deployment status on commit (Success/Failed)
   └─ Triggers CI/CD checks if configured
```

## Environment Variables: Dashboard vs vercel.json

### Environment Variables in Dashboard

Go to Project Settings > Environment Variables in Vercel dashboard:

```
Name: VITE_SUPABASE_URL
Value: https://xxxxxxxxxxxx.supabase.co
Environments: Production, Preview, Development

Name: VITE_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Environments: Production, Preview, Development
```

**Purpose:** Actual secret values and sensitive data

**Security:** Values are encrypted by Vercel and never exposed

### Environment Variables in vercel.json

In `apps/web-admin/vercel.json`:

```json
"env": {
  "VITE_SUPABASE_URL": "@supabase-url",
  "VITE_SUPABASE_ANON_KEY": "@supabase-anon-key"
}
```

**Purpose:** Map variable names and reference secrets

**Two Syntaxes:**
1. `"@secret-name"` - Reference a Vercel secret (NOT used here, not recommended)
2. `"ENV_VAR_NAME"` - Reference dashboard environment variable directly

**Actually Used Here:**
This `env` field in vercel.json is just documentation - the actual values come from the dashboard. The important part is that the variable names start with `VITE_` so they're available to the client-side Vite app.

## Vite Framework Integration

### Why Vite Matters

```json
{
  "framework": "vite"
}
```

Setting `framework: vite` tells Vercel:

1. **Build Process**
   - App is built with Vite build tool
   - Output is optimized static files
   - No server-side rendering needed

2. **Static File Serving**
   - Serve files as-is from CDN
   - Use appropriate cache headers
   - Serve index.html for SPA routing

3. **Performance Optimizations**
   - Enable edge caching
   - Optimize asset delivery
   - Apply Vite-specific best practices

### Vite Build Process (What `bun run build` Does)

```
bun run build
├─ Runs: tsc (TypeScript compiler)
│  └─ Checks for TypeScript errors (doesn't generate JS)
│
└─ Runs: vite build
   ├─ Reads: vite.config.ts
   ├─ Compiles TypeScript to JavaScript
   ├─ Bundles code (tree-shaking)
   ├─ Optimizes assets
   ├─ Generates: dist/index.html
   ├─ Generates: dist/assets/main-[hash].js
   ├─ Generates: dist/assets/style-[hash].css
   └─ Creates: dist/**/*  (static files ready to serve)
```

## Dependency Management

### How Bun Works in Vercel

```
Vercel build machine:
├─ Clone repository (full monorepo)
├─ Change to Root Directory (apps/web-admin)
├─ Read installCommand: "bun install"
├─ Execute: bun install
│  ├─ Read: apps/web-admin/package.json
│  ├─ Read: /bun.lock (root workspace lock file)
│  └─ Install: apps/web-admin/node_modules/
└─ Continue build...
```

### Why bun.lock is in Root

```
/bun.lock  ← Master lock file for entire monorepo
├─ Lock file contains ALL dependencies from ALL apps
├─ Generated by: bun install (run from root)
├─ Used by: bun install (run from any app directory)
└─ Ensures: Consistent versions across entire monorepo
```

When `bun install` runs in `apps/web-admin/`:
1. Looks for `package.json` (finds `apps/web-admin/package.json`)
2. Looks for `bun.lock` (finds `/bun.lock` in root)
3. Installs dependencies for web-admin using locked versions
4. All dependencies are consistent with entire monorepo

## Framework Auto-Detection

When Vercel doesn't have explicit framework setting:

```
Vercel looks for indicators:
├─ package.json dependencies
│  ├─ "next" → Next.js
│  ├─ "react" → React (might be Vite or Create React App)
│  ├─ "vue" → Vue
│  └─ "svelte" → Svelte
│
├─ Config files
│  ├─ next.config.js → Next.js
│  ├─ vite.config.ts → Vite
│  ├─ nuxt.config.ts → Nuxt
│  └─ remix.config.js → Remix
│
└─ Root Directory
   └─ Must be set before detection (monorepo requirement)
```

For Chotter Vite apps:
- Auto-detection reads `apps/web-admin/package.json`
- Sees Vite as dev dependency
- Finds `vite.config.ts`
- Auto-detects as Vite framework

## Troubleshooting Configuration Issues

### Issue: Can't Find package.json

**Root Cause:** Root Directory not set correctly

**Fix:**
```
Check: Root Directory setting in Vercel Dashboard
Change from: /  (repository root)
Change to:   apps/web-admin
```

### Issue: Build Command Not Found

**Root Cause:** Wrong working directory when running command

**Fix:**
```
Verify Root Directory is set to app directory
Build command runs relative to Root Directory
So: bun run build  ← Looks for package.json in apps/web-admin/
```

### Issue: Environment Variables Undefined in Build

**Root Cause:** Variables not in dashboard, or not enabled for environment

**Fix:**
```
Dashboard > Settings > Environment Variables
Verify VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY exist
Check that they're enabled for Production/Preview/Development
```

### Issue: Build Succeeds but App Doesn't Load

**Root Cause:** Static files not in outputDirectory

**Fix:**
```
Verify: outputDirectory in vercel.json matches Vite output
Check: dist/ folder exists after local build
Verify: dist/index.html file exists
```

## Summary Checklist

For each Vercel project, verify:

- [ ] Root Directory set to app directory (not root)
- [ ] package.json exists in app directory
- [ ] vercel.json exists in app directory
- [ ] Build command runs successfully locally
- [ ] Output directory contains static files
- [ ] Environment variables set in dashboard
- [ ] Environment variables enabled for all needed environments
- [ ] Framework is detected as Vite
- [ ] First deployment triggers redeploy with env vars
- [ ] Application loads and shows no console errors

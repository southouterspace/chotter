# Git Branching Strategy - Chotter Project

## Overview
This document defines the git workflow and branching strategy for the Chotter project.

## Branch Structure

### Primary Branches

#### `main`
- **Purpose**: Production-ready code
- **Deployment**: Vercel Production (chotter-admin.vercel.app)
- **Protection**: Protected branch, requires PR reviews
- **Merge Strategy**: Only merge from `develop` via pull request
- **Commits**: Should only contain merge commits from `develop`

#### `develop`
- **Purpose**: Integration branch for completed features
- **Deployment**: Vercel Preview (automatic preview deployments)
- **Protection**: Protected branch
- **Merge Strategy**: Merge feature branches via PR or direct merge for small fixes
- **Stability**: Should always be in a deployable state

### Supporting Branches

#### Feature Branches: `feature/*` or `phase-*/p*`
- **Purpose**: Development of new features or tasks
- **Naming**:
  - `feature/description` (e.g., `feature/user-authentication`)
  - `phase-X/pX.Y-description` (e.g., `phase-3/p3.6-checkin`)
- **Base**: Created from `develop`
- **Merge**: Back to `develop` via PR or direct merge
- **Lifecycle**: Deleted after merge

#### Bugfix Branches: `bugfix/*` or `fix/*`
- **Purpose**: Bug fixes
- **Naming**: `bugfix/description` or `fix/description`
- **Base**: Created from `develop` (or `main` for hotfixes)
- **Merge**: Back to source branch
- **Lifecycle**: Deleted after merge

#### Debug Branches: `debug/*`
- **Purpose**: Debugging and investigation
- **Naming**: `debug/description` (e.g., `debug/auth-logging`)
- **Lifecycle**: Temporary, can be deleted after resolution

## Workflow

### Standard Feature Development

```bash
# 1. Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/my-feature

# 2. Develop and commit
git add .
git commit -m "feat: Add my feature"

# 3. Push to remote
git push origin feature/my-feature

# 4. Merge to develop (via PR or direct)
git checkout develop
git merge feature/my-feature
git push origin develop

# 5. Clean up
git branch -d feature/my-feature
git push origin --delete feature/my-feature
```

### Release to Production

```bash
# 1. Ensure develop is stable
git checkout develop
# Run tests, verify everything works

# 2. Create PR from develop to main
# OR merge directly:
git checkout main
git pull origin main
git merge develop -m "Release: [description]"

# 3. Push to production
git push origin main
# This triggers Vercel production deployment
```

### Hotfix (Critical Production Bug)

```bash
# 1. Create hotfix from main
git checkout main
git checkout -b hotfix/critical-fix

# 2. Fix and commit
git add .
git commit -m "fix: Critical production issue"

# 3. Merge to main
git checkout main
git merge hotfix/critical-fix
git push origin main

# 4. Merge back to develop
git checkout develop
git merge hotfix/critical-fix
git push origin develop

# 5. Clean up
git branch -d hotfix/critical-fix
```

## Deployment Strategy

### Vercel Configuration

**Production Deployment**
- **Branch**: `main` (should be configured in Vercel dashboard)
- **URL**: https://chotter-admin.vercel.app
- **Trigger**: Automatic on push to `main`
- **Environment**: Production environment variables

**Preview Deployments**
- **Branches**: All branches except `main`
- **URL**: Auto-generated preview URLs
- **Trigger**: Automatic on push to any branch
- **Environment**: Preview environment variables

### Supabase Migrations

**Production Database**
- Applied from `main` branch deployments
- Use `supabase db push --linked` after merging to main

**Development Database**
- Test migrations on branches before merging
- Use local Supabase or development project

## Current Status

### Active Branches
- ✅ `main` - Production (commit: 94baa97)
- ✅ `develop` - Development (commit: fa2d3f0)
- 🧹 Cleaned up: All phase-3 feature branches deleted

### Recent Cleanup (2025-10-21)
- Merged all Phase 3 features to `develop`
- Merged `develop` to `main`
- Deleted feature branches:
  - phase-3/p3.1-expo-init
  - phase-3/p3.2-p3.3-ui-screens
  - phase-3/p3.4-p3.5-location
  - phase-3/p3.6-checkin
  - phase-3/p3.7-p3.8-infrastructure
  - phase-3/p3.9-profile
  - phase-3/p3.10-e2e-tests
  - phase-3/p3.11-deployment

## Best Practices

### Commit Messages
Follow conventional commits:
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `chore:` - Maintenance tasks
- `refactor:` - Code refactoring
- `test:` - Test additions/changes
- `perf:` - Performance improvements

### Pull Requests
- Create PRs for significant features
- Include description of changes
- Reference related issues/tickets
- Ensure CI/CD passes before merging

### Branch Hygiene
- Delete branches after merging
- Keep `develop` and `main` clean
- Rebase feature branches if needed to keep history clean
- Don't push directly to `main` (except for hotfixes in emergencies)

## Vercel Dashboard Setup

### Required Settings

**Project Settings → Git**
1. **Production Branch**: `main`
2. **Preview Branches**: All other branches
3. **Automatic Deployments**: Enabled

**Project Settings → Git → Ignored Build Step**
1. **Command**: Leave empty or use proper logic
2. **Behavior**: Automatic (not custom command that blocks)

### How to Update Production Branch
1. Go to: https://vercel.com/south-outer-spaces-projects/chotter-admin/settings/git
2. Under "Production Branch", select `main`
3. Click Save

## Troubleshooting

### Vercel deploying from wrong branch
**Solution**: Update Production Branch setting in Vercel dashboard to `main`

### Vercel not deploying
**Solution**:
1. Check Ignored Build Step setting
2. Clear any Production Overrides
3. Set Behavior to "Automatic"

### Need to force a deployment
**Solution**: Use `vercel --prod --force` from CLI

## Migration History
- **2025-10-21**: Cleaned up all phase-3 branches, aligned main/develop
- **2025-10-21**: Fixed persons.is_active database migration
- **2025-10-21**: Removed problematic ignoreCommand from vercel.json

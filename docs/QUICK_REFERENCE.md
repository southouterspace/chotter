# Quick Reference: Syncing Supabase Preview Branches

## Problem
Your staging preview branch doesn't have the security fixes that were applied to production (main branch).

## Quick Fix (Right Now)

**Option 1: Close and Reopen PR** ⚡ Recommended
1. Go to your PR on GitHub
2. Click "Close pull request"
3. Click "Reopen pull request"
4. ✅ Supabase automatically recreates preview branch with all latest migrations

**Option 2: Push Empty Commit**
```bash
git commit --allow-empty -m "Sync preview branch"
git push
```

**Option 3: Delete Branch in Supabase Dashboard**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/_/branches)
2. Find your staging/preview branch
3. Delete it
4. Close and reopen PR (or push a commit)

## What We Set Up

✅ **GitHub Action** (`.github/workflows/supabase-preview-sync.yml`)
   - Automatically detects when migrations merge to main
   - Posts comments on open PRs notifying them to sync
   - Prevents future sync issues

✅ **Documentation** (`docs/SUPABASE_BRANCHING.md`)
   - Complete guide to Supabase branching workflow
   - Troubleshooting tips
   - Best practices

## Common Commands

```bash
# Create a new migration
supabase migration new feature_name

# Test migrations locally
supabase db reset

# Check migration status
supabase migration list --linked

# Push migrations to remote (production)
supabase db push --linked
```

## How It Works Going Forward

1. **You merge migrations to main** → Production updated ✅
2. **GitHub Action runs** → Posts comment on your PR 💬
3. **You see notification** → Close/reopen PR to sync 🔄
4. **Preview branch syncs** → Staging matches production ✅

## Need Help?

- Full documentation: `docs/SUPABASE_BRANCHING.md`
- Supabase docs: https://supabase.com/docs/guides/deployment/branching
- Issues: Check Supabase dashboard for branch status

# Supabase Branching & Environment Sync

This document explains how Chotter uses Supabase branches and how to keep staging/preview environments in sync with production.

## Branch Structure

- **Main Branch (Production)**: The production database schema
- **Preview Branches (Staging)**: Created automatically from pull requests
  - Each PR gets its own isolated Supabase preview branch
  - Preview branches are isolated - changes don't affect production
  - Used for testing features before merging to production

## How Syncing Works

### The Problem
Supabase preview branches work like Git branches - they don't automatically receive updates from main. This means:

1. ✅ Create a PR → Supabase creates preview branch with current schema
2. ✅ Merge migrations to main → Production gets updated
3. ❌ Preview branch still has old schema → **Out of sync!**

### The Solution: Automated Sync Workflow

We use GitHub Actions (`.github/workflows/supabase-preview-sync.yml`) to automatically notify when preview branches need syncing.

**What happens automatically:**
1. When migrations are merged to `main`
2. GitHub Action posts comments on all open PRs
3. Comments notify that preview branch is out of sync
4. Developers can easily trigger a sync

## Manual Sync Methods

### Method 1: Close and Reopen PR (Recommended)
This is the simplest way to sync a preview branch:

1. Close your pull request
2. Reopen the pull request
3. Supabase automatically recreates the preview branch with latest migrations from main

**Pros:** Simple, guaranteed to work
**Cons:** Loses any test data in the preview branch

### Method 2: Push a New Commit
Alternatively, push any commit to your PR branch:

```bash
git commit --allow-empty -m "Trigger preview branch sync"
git push
```

This triggers Supabase to refresh the preview branch.

### Method 3: Manual CLI Sync (Advanced)
If you need to keep test data:

```bash
# Link to your preview branch
supabase link --project-ref <preview-branch-ref>

# Apply pending migrations
supabase db push

# Verify sync
supabase migration list --linked
```

## Migration Workflow

### Creating New Migrations

1. **Develop locally:**
   ```bash
   # Start local Supabase
   supabase start

   # Make schema changes in Studio (localhost:54323)
   # OR write SQL directly

   # Generate migration from changes
   supabase db diff -f my_feature_name
   ```

2. **Test locally:**
   ```bash
   # Reset and apply all migrations
   supabase db reset

   # Verify everything works
   ```

3. **Create PR:**
   ```bash
   git add supabase/migrations/
   git commit -m "feat: add my feature schema"
   git push origin feature-branch
   ```

4. **Preview branch created automatically**
   - Supabase detects the PR
   - Creates isolated preview branch
   - Applies all migrations from main + your new migration
   - You get unique credentials for testing

5. **Merge to main:**
   - When PR is merged, migration applies to production
   - GitHub Action notifies other open PRs to sync
   - Other developers update their preview branches

## Environment Variables

Each environment has its own Supabase credentials:

### Production (Main Branch)
```bash
VITE_SUPABASE_URL=https://zlrhcpjlpxzughojpujd.supabase.co
VITE_SUPABASE_ANON_KEY=<production-key>
```

### Preview Branches (Per PR)
Each preview branch gets unique credentials:
```bash
VITE_SUPABASE_URL=https://<branch-specific-id>.supabase.co
VITE_SUPABASE_ANON_KEY=<branch-specific-key>
```

These are automatically injected by Vercel integration.

## Troubleshooting

### Preview branch has missing tables/functions
**Cause:** Preview branch created before migration was merged to main
**Solution:** Close and reopen the PR to recreate preview branch with latest schema

### Migration fails in preview branch
**Cause:** Migration has syntax error or depends on missing objects
**Solution:**
1. Test migration locally first with `supabase db reset`
2. Fix the migration file
3. Push the fix to your PR branch

### Preview branch won't sync
**Cause:** Supabase may be paused or having issues
**Solution:**
1. Check Supabase dashboard for branch status
2. Try deleting the preview branch manually in dashboard
3. Close/reopen PR to trigger recreation

### Production and preview have different behavior
**Cause:** Different data or configuration between environments
**Solution:**
1. Check that preview branch is synced (all migrations applied)
2. Verify environment variables are correct
3. Check for any hardcoded values that differ between environments

## Best Practices

1. **Always test locally first**
   ```bash
   supabase db reset  # Apply all migrations from scratch
   ```

2. **Keep migrations small and focused**
   - One migration per feature/fix
   - Easier to debug and rollback if needed

3. **Use descriptive migration names**
   ```bash
   supabase migration new add_customer_preferences_table
   # Better than: supabase migration new update_schema
   ```

4. **Don't edit old migrations**
   - Once merged to main, migrations are immutable
   - Create a new migration to fix issues

5. **Sync preview branches regularly**
   - Check for sync notifications from GitHub Actions
   - Sync before major testing to ensure latest schema

6. **Use seed data for testing**
   - Add test data to `supabase/seed.sql`
   - Automatically applied when preview branch is created

## CI/CD Integration

Our GitHub Actions workflows:

### Migration Push (Manual)
```yaml
# .github/workflows/supabase-preview-sync.yml
# - Runs when migrations merge to main
# - Notifies open PRs to sync
# - Verifies migration files
```

### Future: Automated Testing
Consider adding:
- Schema validation tests
- Migration rollback tests
- Data integrity checks

## Additional Resources

- [Supabase Branching Docs](https://supabase.com/docs/guides/deployment/branching)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Managing Environments](https://supabase.com/docs/guides/deployment/managing-environments)

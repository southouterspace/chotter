# GitHub Secrets Setup for Supabase Workflows

This guide explains how to set up the required GitHub secrets for Supabase preview branch syncing.

## Required Secret

### `SUPABASE_ACCESS_TOKEN`

This token allows GitHub Actions to interact with your Supabase project.

#### How to Create the Token

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard/account/tokens

2. **Generate New Token**
   - Click "Generate new token"
   - Give it a descriptive name: `GitHub Actions - Chotter`
   - Copy the token (you won't be able to see it again!)

3. **Add to GitHub Secrets**
   - Go to your GitHub repository: https://github.com/YOUR_USERNAME/chotter
   - Navigate to: Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `SUPABASE_ACCESS_TOKEN`
   - Value: Paste the token you copied
   - Click "Add secret"

## Verifying the Setup

After adding the secret, you can verify it's working by:

1. **Trigger the workflow manually:**
   - Go to Actions tab in GitHub
   - Select "Sync Supabase Preview Branches" workflow
   - Click "Run workflow"
   - Select `main` branch
   - Click "Run workflow"

2. **Check the workflow logs:**
   - The workflow should complete successfully
   - Look for ✅ checkmarks in the workflow steps

## Workflow Usage

The `SUPABASE_ACCESS_TOKEN` is used by:

- `.github/workflows/supabase-preview-sync.yml` - Auto-sync preview branches when migrations merge

## Security Notes

- ✅ The token is encrypted by GitHub
- ✅ Only accessible in GitHub Actions workflows
- ✅ Not visible in logs or to other users
- ⚠️ Has access to your entire Supabase organization
- 🔄 Rotate the token periodically (every 90 days recommended)

## Token Permissions

The Supabase access token can:
- List preview branches
- Access branch information
- Trigger branch operations

It **cannot**:
- Delete production databases
- Modify billing settings
- Access sensitive data directly

## Troubleshooting

### "Invalid credentials" error in workflow
**Cause:** Token is missing or incorrect
**Solution:**
1. Verify secret name is exactly `SUPABASE_ACCESS_TOKEN`
2. Generate a new token and update the secret
3. Check token hasn't expired

### Workflow doesn't trigger
**Cause:** No changes in `supabase/migrations/` directory
**Solution:** The workflow only triggers when migration files change in main branch

### "Permission denied" errors
**Cause:** Token doesn't have required permissions
**Solution:**
1. Generate a new token from your Supabase account settings
2. Ensure you're using a personal access token, not a project token
3. Update the GitHub secret with the new token

## Alternative: Project-Specific Tokens

For additional security, you can use project-specific tokens (when Supabase adds support):

1. Navigate to Project Settings → API
2. Generate a service role key (more restricted)
3. Use this instead of personal access token

**Note:** This feature may not be available yet. Check Supabase documentation for updates.

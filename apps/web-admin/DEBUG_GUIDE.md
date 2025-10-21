# Debug Guide: Account Creation Error

You're seeing: **"Database error saving new user. This may be a temporary issue - please try again or contact support."**

This error means the Supabase `auth.signUp` succeeded, but the database trigger `handle_new_user()` failed when trying to create the person record.

## Step 1: Check Browser Console Logs

1. Open **DevTools Console** (F12)
2. Look for detailed error logs (should be color-coded)
3. Find the **ERROR** log from `AuthContext.signUp`

### What to Look For:

```javascript
[ERROR] - AuthContext.signUp: Supabase auth.signUp failed
  Error: {
    name: "...",
    message: "Database error saving new user",
    code: "...",        // ← Important
    status: ...         // ← Important
  }
```

## Step 2: Export Detailed Logs

In the browser console, run:

```javascript
window.__logger.exportLogs()
```

Copy the output and save it.

## Step 3: Check Error History

```javascript
window.__logger.getErrorHistory()
```

This shows the last 10 errors stored in localStorage.

## Step 4: Check Supabase Logs

Since you mentioned you can't manage users in the Supabase dashboard, this might be a Supabase outage. Let's verify:

### Option A: Via Supabase CLI

```bash
# From project root
cd ../..
supabase functions logs --linked
```

### Option B: Check Supabase Status

Visit: https://status.supabase.com/

## Common Causes & Solutions

### 1. **Supabase Service Outage** (Most Likely)
**Symptoms**:
- Can't manage users in dashboard
- "Database error" on signup
- Error code: 500 or 503

**Solution**: Wait for Supabase service to recover. Check https://status.supabase.com/

### 2. **Database Trigger Error**
**Symptoms**:
- Error mentions "person record"
- Error in trigger execution

**Debug**:
```sql
-- Check if persons table exists and has correct structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'persons';

-- Check if trigger exists
SELECT trigger_name, event_manipulation, event_object_table
FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';
```

### 3. **RLS Policy Blocking Trigger**
**Symptoms**:
- "permission denied" in logs
- Trigger can't insert into persons table

**Debug**:
```sql
-- Check RLS policies on persons table
SELECT * FROM pg_policies WHERE tablename = 'persons';
```

**Fix**: The trigger uses `SECURITY DEFINER` so it should bypass RLS, but verify.

### 4. **Missing Required Fields**
**Symptoms**:
- "NOT NULL constraint" in error
- Missing first_name or last_name

**Debug**: Check console logs for the metadata being sent:
```javascript
[DEBUG] - SignUpPage: Validation passed, calling signUp
  Data: {
    email: "...",
    metadata: {
      first_name: "...",  // ← Should be present
      last_name: "..."    // ← Should be present
    }
  }
```

## Step 5: Try Again After Fixes

If it's not a Supabase outage, and you've identified the issue:

1. Make any necessary fixes
2. Clear error history: `window.__logger.clearErrors()`
3. Try signup again
4. Check new logs

## Need to Share Logs?

Export and share:
```javascript
// Copy this output
console.log(window.__logger.exportLogs())
```

## Temporary Workaround

If the database trigger is the issue, you could temporarily:

1. Disable email confirmation in Supabase Auth settings
2. Manually create person records after signup
3. Or fix the trigger to handle edge cases

But first, **check if it's a Supabase outage** since you mentioned dashboard issues.

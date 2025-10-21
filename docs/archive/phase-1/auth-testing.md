# Supabase Auth Testing Guide

## Overview

This guide provides comprehensive testing procedures for the Chotter authentication system. It covers local testing, role-based access testing, JWT claims verification, and RLS policy validation.

## Prerequisites

Before testing authentication, ensure:

1. Supabase CLI is installed and initialized
2. Local Supabase instance is running
3. Auth triggers migration has been applied
4. Database schema is up to date

```bash
# Start local Supabase
supabase start

# Check services are running
supabase status
```

## Testing Environment Setup

### Local Development

```bash
# Start Supabase local development
supabase start

# Apply migrations (including auth triggers)
supabase db reset

# Access Supabase Studio
open http://localhost:54323
```

### Environment Variables

Create a `.env.local` file for testing:

```env
# Local Supabase
VITE_SUPABASE_URL=http://localhost:54321
VITE_SUPABASE_ANON_KEY=<your-local-anon-key>

# Get keys from: supabase status
```

## Manual Testing via Supabase Studio

### Test 1: Basic Sign Up and Person Creation

**Objective:** Verify that signing up creates both auth.users and persons records.

**Steps:**

1. Open Supabase Studio: `http://localhost:54323`
2. Navigate to **Authentication > Users**
3. Click **Add User** or use API:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'http://localhost:54321',
  'your-anon-key'
);

const { data, error } = await supabase.auth.signUp({
  email: 'test.customer@example.com',
  password: 'Test123!@#',
  options: {
    data: {
      first_name: 'Test',
      last_name: 'Customer',
      business_id: null,
      role: 'customer'
    }
  }
});

console.log('Sign up result:', data, error);
```

4. Navigate to **Table Editor > persons**
5. Verify a new Person record was created with:
   - `supabase_user_id` matching the auth.users id
   - `email` = 'test.customer@example.com'
   - `first_name` = 'Test'
   - `last_name` = 'Customer'
   - `role` = 'customer'
   - `is_active` = true

**Expected Result:** Person record auto-created via trigger.

**Troubleshooting:**
- If Person not created, check trigger is installed: `SELECT * FROM information_schema.triggers WHERE trigger_name = 'on_auth_user_created';`
- Check function exists: `\df handle_new_user` in psql

### Test 2: Sign Up with Different Roles

**Objective:** Verify role assignment works for all user types.

**Test Cases:**

#### Customer (No Business)

```typescript
await supabase.auth.signUp({
  email: 'customer@example.com',
  password: 'Pass123!@#',
  options: {
    data: {
      first_name: 'John',
      last_name: 'Customer',
      business_id: null,
      role: 'customer'
    }
  }
});
```

**Verify:**
- Person created with `role = 'customer'`
- `business_id = NULL`

#### Technician (With Business)

```typescript
// First, get a business_id from businesses table
const { data: businesses } = await supabase
  .from('businesses')
  .select('id')
  .limit(1);

await supabase.auth.signUp({
  email: 'tech@example.com',
  password: 'Pass123!@#',
  options: {
    data: {
      first_name: 'Bob',
      last_name: 'Technician',
      business_id: businesses[0].id,
      role: 'technician'
    }
  }
});
```

**Verify:**
- Person created with `role = 'technician'`
- `business_id` matches provided UUID

#### Admin

```typescript
await supabase.auth.signUp({
  email: 'admin@example.com',
  password: 'Pass123!@#',
  options: {
    data: {
      first_name: 'Alice',
      last_name: 'Admin',
      business_id: businesses[0].id,
      role: 'admin'
    }
  }
});
```

**Verify:**
- Person created with `role = 'admin'`
- Has access to business data

### Test 3: JWT Claims Verification

**Objective:** Verify JWT tokens contain custom claims.

**Steps:**

1. Sign in as a user:

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'tech@example.com',
  password: 'Pass123!@#'
});

console.log('Session:', data.session);
console.log('User metadata:', data.user.user_metadata);
```

2. Decode the JWT (use https://jwt.io or code):

```typescript
import { getJWTClaims } from '@chotter/database';

const claims = await getJWTClaims(supabase);
console.log('Claims:', claims);

// Should contain:
// {
//   person_id: '...',
//   business_id: '...',
//   role: 'technician',
//   first_name: 'Bob',
//   last_name: 'Technician',
//   is_active: true
// }
```

**Expected Result:** JWT contains all custom claims.

### Test 4: Magic Link Authentication

**Objective:** Verify passwordless authentication works.

**Steps:**

1. Request magic link:

```typescript
await supabase.auth.signInWithOtp({
  email: 'customer@example.com',
  options: {
    data: {
      first_name: 'Jane',
      last_name: 'Doe',
      business_id: null,
      role: 'customer'
    }
  }
});
```

2. Check **Supabase Studio > Authentication > Logs** for the email event
3. In local development, check Inbucket at `http://localhost:54324`
4. Click the magic link from the email
5. Verify user is authenticated

**Expected Result:** User authenticated without password.

### Test 5: Phone OTP Authentication

**Objective:** Verify SMS-based authentication (if enabled).

**Note:** Phone auth requires Twilio setup in production. For local testing:

```typescript
// Send OTP
await supabase.auth.signInWithOtp({
  phone: '+15555551234',
  options: {
    data: {
      first_name: 'Mike',
      last_name: 'Tech',
      business_id: 'business-uuid',
      role: 'technician'
    }
  }
});

// In local dev, check Supabase logs for OTP
// In Studio: Authentication > Logs

// Verify OTP
const { data, error } = await supabase.auth.verifyOtp({
  phone: '+15555551234',
  token: '123456', // From logs
  type: 'sms'
});
```

**Expected Result:** User authenticated via phone OTP.

## Testing with Database Package

Create a test file: `packages/database/__tests__/auth.test.ts`

```typescript
import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { createClient, signUp, signIn, getJWTClaims, hasRole } from '../src';

describe('Authentication', () => {
  let client: ReturnType<typeof createClient>;
  const testEmail = 'test@example.com';
  const testPassword = 'Test123!@#';

  beforeAll(() => {
    client = createClient(
      'http://localhost:54321',
      process.env.SUPABASE_ANON_KEY!
    );
  });

  afterAll(async () => {
    // Clean up test user
    // Note: requires admin privileges
  });

  it('should sign up a new customer', async () => {
    const { user, session } = await signUp(client, testEmail, testPassword, {
      firstName: 'Test',
      lastName: 'User',
      businessId: null,
      role: 'customer'
    });

    expect(user).toBeDefined();
    expect(user.email).toBe(testEmail);
  });

  it('should sign in existing user', async () => {
    const { user, session } = await signIn(client, testEmail, testPassword);

    expect(session).toBeDefined();
    expect(user.email).toBe(testEmail);
  });

  it('should have JWT claims', async () => {
    await signIn(client, testEmail, testPassword);

    const claims = await getJWTClaims(client);

    expect(claims).toBeDefined();
    expect(claims?.role).toBe('customer');
    expect(claims?.first_name).toBe('Test');
    expect(claims?.last_name).toBe('User');
    expect(claims?.is_active).toBe(true);
  });

  it('should check user role', async () => {
    await signIn(client, testEmail, testPassword);

    const isCustomer = await hasRole(client, 'customer');
    const isAdmin = await hasRole(client, 'admin');

    expect(isCustomer).toBe(true);
    expect(isAdmin).toBe(false);
  });
});
```

Run tests:

```bash
cd packages/database
npm test
```

## Testing RLS Policies with Different Roles

### Test 6: Customer Access

**Objective:** Verify customers can only see their own data.

**Steps:**

1. Sign in as customer:

```typescript
await supabase.auth.signInWithPassword({
  email: 'customer@example.com',
  password: 'Pass123!@#'
});
```

2. Try to access data:

```typescript
// Should succeed - own data
const { data: ownBookings } = await supabase
  .from('bookings')
  .select('*')
  .eq('customer_id', claims.person_id);

console.log('Own bookings:', ownBookings);

// Should fail or return empty - other customer's data
const { data: otherBookings } = await supabase
  .from('bookings')
  .select('*')
  .neq('customer_id', claims.person_id);

console.log('Other bookings:', otherBookings); // Should be empty
```

**Expected Result:**
- Can view own bookings
- Cannot view other customers' bookings

### Test 7: Technician Access

**Objective:** Verify technicians can view assigned jobs.

**Steps:**

1. Sign in as technician:

```typescript
await supabase.auth.signInWithPassword({
  email: 'tech@example.com',
  password: 'Pass123!@#'
});
```

2. Access jobs:

```typescript
// Should succeed - assigned jobs
const { data: myJobs } = await supabase
  .from('jobs')
  .select('*')
  .eq('assigned_technician_id', claims.person_id);

console.log('My jobs:', myJobs);

// Should succeed - business jobs (if RLS allows)
const { data: businessJobs } = await supabase
  .from('jobs')
  .select('*')
  .eq('business_id', claims.business_id);

console.log('Business jobs:', businessJobs);
```

**Expected Result:**
- Can view assigned jobs
- Can view business jobs (if policy allows)

### Test 8: Admin Access

**Objective:** Verify admins can manage business data.

**Steps:**

1. Sign in as admin:

```typescript
await supabase.auth.signInWithPassword({
  email: 'admin@example.com',
  password: 'Pass123!@#'
});
```

2. Access business data:

```typescript
// Should succeed - full business access
const { data: allJobs } = await supabase
  .from('jobs')
  .select('*')
  .eq('business_id', claims.business_id);

const { data: allCustomers } = await supabase
  .from('persons')
  .select('*')
  .eq('business_id', claims.business_id)
  .eq('role', 'customer');

console.log('All business jobs:', allJobs);
console.log('All customers:', allCustomers);
```

**Expected Result:** Full access to business data.

## Testing User Lifecycle

### Test 9: User Update Sync

**Objective:** Verify auth.users updates sync to persons table.

**Steps:**

1. Update user email:

```typescript
const { data, error } = await supabase.auth.updateUser({
  email: 'newemail@example.com'
});
```

2. Check persons table:

```sql
SELECT email FROM persons WHERE supabase_user_id = '<user-id>';
```

**Expected Result:** Person email updated to match.

### Test 10: User Deletion (Soft Delete)

**Objective:** Verify user deletion soft-deletes Person record.

**Steps:**

1. Delete user from Supabase Studio or:

```typescript
// Requires service role key
const adminClient = createClient(
  'http://localhost:54321',
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

await adminClient.auth.admin.deleteUser('<user-id>');
```

2. Check persons table:

```sql
SELECT is_active FROM persons WHERE supabase_user_id = '<user-id>';
```

**Expected Result:** `is_active = false` (not deleted).

## Testing Password Reset Flow

### Test 11: Password Reset

**Objective:** Verify password reset flow works.

**Steps:**

1. Request password reset:

```typescript
await supabase.auth.resetPasswordForEmail('user@example.com', {
  redirectTo: 'http://localhost:5173/auth/reset-password'
});
```

2. Check Inbucket (`http://localhost:54324`) for reset email
3. Click reset link
4. Update password:

```typescript
await supabase.auth.updateUser({
  password: 'NewPassword123!@#'
});
```

5. Sign in with new password:

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'NewPassword123!@#'
});
```

**Expected Result:** Can sign in with new password.

## Testing Session Refresh

### Test 12: JWT Refresh

**Objective:** Verify session refresh updates JWT claims.

**Steps:**

1. Sign in and get initial claims:

```typescript
await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'Pass123!@#'
});

const initialClaims = await getJWTClaims(supabase);
console.log('Initial claims:', initialClaims);
```

2. Update person record directly:

```sql
UPDATE persons
SET first_name = 'Updated'
WHERE email = 'user@example.com';
```

3. Refresh session:

```typescript
const { data } = await supabase.auth.refreshSession();
const updatedClaims = await getJWTClaims(supabase);
console.log('Updated claims:', updatedClaims);
```

**Expected Result:** JWT claims reflect updated data.

## Common Issues and Debugging

### Issue: Person Record Not Created

**Symptoms:** User in auth.users but not in persons table.

**Debug Steps:**

```sql
-- Check if trigger exists
SELECT * FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Check if function exists
\df handle_new_user

-- Manually call function to see error
SELECT handle_new_user();
```

**Solutions:**
- Re-run migration: `supabase db reset`
- Check for FK constraint violations (invalid business_id)
- Verify enum values are valid

### Issue: JWT Missing Claims

**Symptoms:** JWT doesn't contain custom claims.

**Debug Steps:**

```typescript
const { data: { session } } = await supabase.auth.getSession();
console.log('Raw user metadata:', session?.user.user_metadata);
```

**Solutions:**
- Refresh session: `await supabase.auth.refreshSession()`
- Verify `get_user_claims()` function exists
- Check Person record has correct data

### Issue: RLS Blocking Access

**Symptoms:** Queries return empty even though data exists.

**Debug Steps:**

```sql
-- Test as specific user
SET LOCAL role = authenticated;
SET LOCAL request.jwt.claims TO '{"person_id": "...", "business_id": "...", "role": "customer"}';

SELECT * FROM jobs;
```

**Solutions:**
- Review RLS policies for the table
- Verify JWT claims are correct
- Check `auth.jwt()` function in policies

## Automated Test Script

Create `scripts/test-auth.ts`:

```typescript
import { createClient } from '@chotter/database';

async function testAuth() {
  const client = createClient(
    'http://localhost:54321',
    process.env.SUPABASE_ANON_KEY!
  );

  console.log('Testing authentication flows...\n');

  // Test 1: Sign up
  console.log('1. Testing sign up...');
  const { user } = await client.auth.signUp({
    email: 'test@example.com',
    password: 'Test123!@#',
    options: {
      data: {
        first_name: 'Test',
        last_name: 'User',
        business_id: null,
        role: 'customer'
      }
    }
  });
  console.log('✓ User created:', user.id);

  // Test 2: Verify Person created
  console.log('\n2. Verifying Person record...');
  const { data: person } = await client
    .from('persons')
    .select('*')
    .eq('supabase_user_id', user.id)
    .single();
  console.log('✓ Person record:', person);

  // Test 3: Sign in
  console.log('\n3. Testing sign in...');
  const { session } = await client.auth.signInWithPassword({
    email: 'test@example.com',
    password: 'Test123!@#'
  });
  console.log('✓ Signed in, session:', session.access_token.substring(0, 20) + '...');

  // Test 4: JWT Claims
  console.log('\n4. Checking JWT claims...');
  const claims = session.user.user_metadata;
  console.log('✓ Claims:', claims);

  console.log('\n✅ All tests passed!');
}

testAuth().catch(console.error);
```

Run:

```bash
tsx scripts/test-auth.ts
```

## Continuous Testing

Add to CI/CD pipeline:

```yaml
# .github/workflows/test.yml
name: Test Authentication

on: [push, pull_request]

jobs:
  test-auth:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Setup Supabase CLI
        uses: supabase/setup-cli@v1

      - name: Start Supabase
        run: supabase start

      - name: Run auth tests
        run: npm test -- auth.test.ts
```

## Summary

This testing guide covers:
- Manual testing via Supabase Studio
- Automated testing with Vitest
- RLS policy validation
- JWT claims verification
- User lifecycle testing
- Common troubleshooting steps

Follow these tests to ensure your authentication system is working correctly before deploying to production.

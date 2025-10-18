# Supabase Auth Setup for Chotter

## Overview

Chotter uses Supabase Auth with custom JWT claims for multi-tenant, role-based access control. The authentication system supports multiple user types with automatic Person record creation and comprehensive JWT claims for authorization.

## Architecture

```mermaid
graph TB
    A[User Sign Up] --> B[Supabase Auth]
    B --> C[auth.users INSERT]
    C --> D[on_auth_user_created Trigger]
    D --> E[handle_new_user Function]
    E --> F[Create Person Record]
    F --> G[Return JWT with Claims]
    G --> H[Client Receives Session]

    I[User Sign In] --> B
    B --> J[get_user_claims Function]
    J --> K[Fetch Person Data]
    K --> G
```

## User Roles

The system supports four distinct user roles:

| Role | Description | Permissions |
|------|-------------|-------------|
| **customer** | End customers booking services | View/create bookings, view invoices, manage own profile |
| **technician** | Field service technicians | View assigned jobs, update job status, clock in/out |
| **admin** | Business administrators | Manage business, employees, customers, full CRUD |
| **super_admin** | Platform administrators | Manage all businesses, platform-wide access |

## JWT Custom Claims

Each authenticated user's JWT contains the following custom claims:

```typescript
interface JWTClaims {
  person_id: string;        // UUID of persons table record
  business_id: string | null; // UUID of business (null for customers without business)
  role: 'customer' | 'technician' | 'admin' | 'super_admin';
  first_name: string | null;
  last_name: string | null;
  is_active: boolean;       // Account active status
}
```

### Accessing JWT Claims

```typescript
import { createClient } from '@chotter/database';

const client = createClient(supabaseUrl, supabaseKey);

// After authentication
const { data: { session } } = await client.auth.getSession();

if (session) {
  // Claims are available in the access token
  const claims = session.user.user_metadata;

  console.log('Person ID:', claims.person_id);
  console.log('Business ID:', claims.business_id);
  console.log('Role:', claims.role);
}
```

## Sign Up Flow

### Flow Diagram

```mermaid
sequenceDiagram
    participant Client
    participant Supabase Auth
    participant Trigger
    participant Database

    Client->>Supabase Auth: signUp(email, password, metadata)
    Supabase Auth->>Database: INSERT INTO auth.users
    Database->>Trigger: on_auth_user_created fires
    Trigger->>Database: INSERT INTO persons
    Database-->>Supabase Auth: Person created
    Supabase Auth->>Trigger: get_user_claims(user_id)
    Trigger-->>Supabase Auth: Return claims
    Supabase Auth-->>Client: Session with JWT
```

### Implementation Details

1. User signs up via Supabase Auth (email/password, magic link, or OAuth)
2. Trigger `on_auth_user_created` fires automatically
3. `handle_new_user()` function extracts metadata and creates Person record
4. JWT claims are populated via `get_user_claims()` function
5. Client receives session with custom claims in JWT

## Database Triggers

### handle_new_user()

Automatically creates a Person record when a new user signs up.

**Trigger:** AFTER INSERT on `auth.users`
**Security:** SECURITY DEFINER (runs with elevated privileges)

**Metadata Requirements:**
- `first_name` (string, optional)
- `last_name` (string, optional)
- `business_id` (UUID, optional - required for non-customers)
- `role` (string, defaults to 'customer')

### handle_user_update()

Syncs email and phone updates from `auth.users` to `persons` table.

**Trigger:** AFTER UPDATE on `auth.users`
**Syncs:** email, phone changes

### handle_user_delete()

Soft-deletes Person record when user account is deleted.

**Trigger:** AFTER DELETE on `auth.users`
**Action:** Sets `is_active = false` on Person record

### get_user_claims()

Retrieves custom JWT claims for authenticated users.

**Returns:** JSONB with person_id, business_id, role, name, is_active

## Authentication Methods

### Email/Password Authentication

Standard email and password authentication for all user types.

```typescript
import { signUp, signIn } from '@chotter/database';

// Sign Up
const { user, session } = await signUp(client, 'user@example.com', 'SecurePassword123!', {
  firstName: 'John',
  lastName: 'Doe',
  businessId: 'business-uuid-here', // optional for customers
  role: 'technician'
});

// Sign In
const { user, session } = await signIn(client, 'user@example.com', 'SecurePassword123!');
```

### Magic Link (Passwordless)

Recommended for customers - provides frictionless authentication via email.

```typescript
import { signInWithMagicLink } from '@chotter/database';

await signInWithMagicLink(client, 'customer@example.com', {
  firstName: 'Jane',
  lastName: 'Smith',
  businessId: null, // customers typically don't have business_id
  role: 'customer'
});
```

User receives an email with a magic link. Clicking the link signs them in automatically.

### Phone Authentication

Ideal for technicians in the field who may prefer SMS authentication.

```typescript
import { signInWithPhone } from '@chotter/database';

// Send OTP
await signInWithPhone(client, '+15555551234', {
  firstName: 'Bob',
  lastName: 'Technician',
  businessId: 'business-uuid-here',
  role: 'technician'
});

// Verify OTP
await verifyPhoneOtp(client, '+15555551234', '123456');
```

### OAuth Providers

Support for third-party OAuth providers (Google, GitHub, etc.).

```typescript
// Sign in with Google
await client.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: `${window.location.origin}/auth/callback`,
    data: {
      first_name: 'Auto',
      last_name: 'Filled',
      role: 'customer'
    }
  }
});
```

## Email Configuration

Configure email templates in **Supabase Dashboard > Authentication > Email Templates**:

### 1. Confirmation Email

Sent when a user signs up with email/password.

**Subject:** Confirm your email for Chotter
**Includes:** Confirmation link

### 2. Password Reset Email

Sent when a user requests a password reset.

**Subject:** Reset your password for Chotter
**Includes:** Password reset link with token

### 3. Magic Link Email

Sent for passwordless login.

**Subject:** Your magic link for Chotter
**Includes:** One-time sign-in link

### 4. Email Change Confirmation

Sent when a user changes their email address.

**Subject:** Confirm your new email
**Includes:** Confirmation link for new email

## Environment Variables

### Client-Side (Public)

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Server-Side (Private)

```env
# Service Role (Admin Operations Only)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Database Connection (if needed for migrations)
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres
```

**Security Notes:**
- Never expose `SUPABASE_SERVICE_ROLE_KEY` to client-side code
- Use `VITE_SUPABASE_ANON_KEY` for client applications
- Service role key bypasses RLS - use with extreme caution

## Usage Examples

### Complete Sign-Up Flow

```typescript
import { createClient, signUp } from '@chotter/database';

const client = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

async function registerTechnician() {
  try {
    const { user, session } = await signUp(
      client,
      'tech@example.com',
      'SecurePass123!',
      {
        firstName: 'Mike',
        lastName: 'Technician',
        businessId: 'abc-123-business-uuid',
        role: 'technician'
      }
    );

    // Check email for confirmation
    console.log('Check email to confirm account:', user.email);

    // Session available after email confirmation
    if (session) {
      console.log('Signed in as:', session.user.email);
      console.log('JWT claims:', session.user.user_metadata);
    }
  } catch (error) {
    console.error('Sign up failed:', error.message);
  }
}
```

### Sign In and Access Claims

```typescript
import { createClient, signIn } from '@chotter/database';

const client = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

async function login() {
  try {
    const { user, session } = await signIn(
      client,
      'tech@example.com',
      'SecurePass123!'
    );

    // Access custom claims from JWT
    const claims = session.user.user_metadata;

    console.log('Person ID:', claims.person_id);
    console.log('Business ID:', claims.business_id);
    console.log('Role:', claims.role);
    console.log('Name:', `${claims.first_name} ${claims.last_name}`);

    // Use role for authorization
    if (claims.role === 'technician') {
      // Show technician dashboard
    } else if (claims.role === 'admin') {
      // Show admin dashboard
    }
  } catch (error) {
    console.error('Sign in failed:', error.message);
  }
}
```

### Magic Link Authentication

```typescript
import { createClient, signInWithMagicLink } from '@chotter/database';

const client = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

async function requestMagicLink() {
  try {
    await signInWithMagicLink(
      client,
      'customer@example.com',
      {
        firstName: 'Sarah',
        lastName: 'Customer',
        businessId: null,
        role: 'customer'
      }
    );

    console.log('Check your email for the magic link!');
  } catch (error) {
    console.error('Magic link request failed:', error.message);
  }
}

// Handle magic link callback (in route handler)
async function handleMagicLinkCallback() {
  const { data: { session }, error } = await client.auth.getSession();

  if (session) {
    console.log('Signed in via magic link!');
    console.log('User:', session.user.email);
  }
}
```

### Password Reset Flow

```typescript
import { resetPassword, updatePassword } from '@chotter/database';

// Step 1: Request password reset
async function requestPasswordReset() {
  try {
    await resetPassword(client, 'user@example.com');
    console.log('Password reset email sent!');
  } catch (error) {
    console.error('Reset request failed:', error.message);
  }
}

// Step 2: Update password (after clicking reset link)
async function updateUserPassword(newPassword: string) {
  try {
    await updatePassword(client, newPassword);
    console.log('Password updated successfully!');
  } catch (error) {
    console.error('Password update failed:', error.message);
  }
}
```

### Session Management

```typescript
import { getSession, getCurrentUser, signOut } from '@chotter/database';

// Get current session
async function checkSession() {
  const session = await getSession(client);

  if (session) {
    console.log('Session active:', session.access_token);
    console.log('Expires:', new Date(session.expires_at * 1000));
  } else {
    console.log('No active session');
  }
}

// Get current user
async function getCurrentUserInfo() {
  const user = await getCurrentUser(client);

  if (user) {
    console.log('Logged in as:', user.email);
    console.log('Claims:', user.user_metadata);
  }
}

// Sign out
async function logout() {
  await signOut(client);
  console.log('Signed out successfully');
}
```

## Multi-Tenant Isolation

Each authenticated user's JWT contains their `business_id`, which is used by RLS policies to enforce multi-tenant data isolation.

```sql
-- Example RLS Policy using business_id from JWT
CREATE POLICY "Users can view their business's jobs"
ON jobs
FOR SELECT
TO authenticated
USING (
  business_id = (auth.jwt() ->> 'business_id')::uuid
);
```

## Security Considerations

### Password Requirements

Configure in Supabase Dashboard:
- Minimum length: 8 characters
- Require uppercase and lowercase
- Require numbers
- Require special characters

### Rate Limiting

Supabase provides built-in rate limiting:
- Sign-up: 10 attempts per hour per IP
- Sign-in: 30 attempts per hour per IP
- Password reset: 5 attempts per hour per email

### Email Verification

**Recommended:** Require email verification before account activation.

Configure in Supabase Dashboard:
- Authentication > Settings > Enable email confirmation
- Users must verify email before gaining access

### Account Lockout

Implement account lockout after failed login attempts:
- Track failed attempts in application
- Lock account after N failures
- Require password reset to unlock

## Migration Application

Apply the auth triggers migration:

```bash
# Using Supabase CLI
supabase db push

# Or apply manually in Supabase Dashboard > SQL Editor
# Copy contents of supabase/migrations/00000000000008_auth_triggers.sql
```

## Troubleshooting

### Person Record Not Created

**Symptom:** User can sign in but no Person record exists

**Causes:**
1. Trigger not applied - check migration status
2. Invalid business_id - FK constraint violation
3. Invalid role - enum constraint violation

**Solution:**
```sql
-- Check if trigger exists
SELECT * FROM information_schema.triggers
WHERE trigger_name = 'on_auth_user_created';

-- Manually create Person record if needed
INSERT INTO persons (id, supabase_user_id, email, role)
SELECT gen_random_uuid(), id, email, 'customer'
FROM auth.users
WHERE id NOT IN (SELECT supabase_user_id FROM persons);
```

### JWT Claims Missing

**Symptom:** JWT does not contain custom claims

**Causes:**
1. `get_user_claims()` function not applied
2. Person record doesn't exist
3. JWT not refreshed after Person creation

**Solution:**
```typescript
// Force session refresh
await client.auth.refreshSession();
const { data: { session } } = await client.auth.getSession();
console.log('Claims:', session.user.user_metadata);
```

### Email Not Sending

**Symptom:** Confirmation/reset emails not received

**Causes:**
1. Email templates not configured
2. SMTP settings incorrect
3. Email in spam folder
4. Rate limit exceeded

**Solution:**
- Check Supabase Dashboard > Authentication > Email Templates
- Verify SMTP configuration (or use Supabase's default)
- Check spam folder
- Wait and retry if rate limited

## Next Steps

1. Review [auth-testing.md](./auth-testing.md) for testing procedures
2. Configure email templates in Supabase Dashboard
3. Set up OAuth providers if needed
4. Implement role-based UI routing
5. Add session persistence and refresh logic

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [JWT Custom Claims](https://supabase.com/docs/guides/auth/auth-helpers/auth-ui)
- [Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Email Templates](https://supabase.com/docs/guides/auth/auth-email-templates)

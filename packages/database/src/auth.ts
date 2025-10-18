/**
 * Authentication helper functions
 */

import type { SupabaseClient } from './client';
import type { PersonRole } from './types/database';

/**
 * User metadata for sign up
 */
export interface SignUpMetadata {
  firstName: string;
  lastName: string;
  businessId: string | null;
  role: PersonRole;
}

/**
 * JWT claims interface matching database function
 */
export interface JWTClaims {
  person_id: string;
  business_id: string | null;
  role: PersonRole;
  first_name: string | null;
  last_name: string | null;
  is_active: boolean;
}

/**
 * Sign up a new user with metadata
 *
 * @param client - Supabase client instance
 * @param email - User email address
 * @param password - User password
 * @param metadata - Additional user metadata
 * @returns User data and session
 *
 * @example
 * ```typescript
 * const { data, error } = await signUp(client, 'user@example.com', 'password123', {
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   businessId: 'business-uuid',
 *   role: 'technician'
 * });
 * ```
 */
export async function signUp(
  client: SupabaseClient,
  email: string,
  password: string,
  metadata: SignUpMetadata
) {
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: metadata.firstName,
        last_name: metadata.lastName,
        business_id: metadata.businessId,
        role: metadata.role,
      },
    },
  });

  if (error) throw error;
  return data;
}

/**
 * Sign in an existing user
 *
 * @param client - Supabase client instance
 * @param email - User email address
 * @param password - User password
 * @returns User data and session
 *
 * @example
 * ```typescript
 * const { data, error } = await signIn(client, 'user@example.com', 'password123');
 * ```
 */
export async function signIn(
  client: SupabaseClient,
  email: string,
  password: string
) {
  const { data, error } = await client.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

/**
 * Sign out the current user
 *
 * @param client - Supabase client instance
 *
 * @example
 * ```typescript
 * await signOut(client);
 * ```
 */
export async function signOut(client: SupabaseClient): Promise<void> {
  const { error } = await client.auth.signOut();
  if (error) throw error;
}

/**
 * Get the current authenticated user
 *
 * @param client - Supabase client instance
 * @returns Current user or null if not authenticated
 *
 * @example
 * ```typescript
 * const user = await getCurrentUser(client);
 * if (user) {
 *   console.log('Logged in as:', user.email);
 * }
 * ```
 */
export async function getCurrentUser(client: SupabaseClient) {
  const {
    data: { user },
    error,
  } = await client.auth.getUser();

  if (error) throw error;
  return user;
}

/**
 * Get the current session
 *
 * @param client - Supabase client instance
 * @returns Current session or null if not authenticated
 *
 * @example
 * ```typescript
 * const session = await getSession(client);
 * if (session) {
 *   console.log('Access token:', session.access_token);
 * }
 * ```
 */
export async function getSession(client: SupabaseClient) {
  const {
    data: { session },
    error,
  } = await client.auth.getSession();

  if (error) throw error;
  return session;
}

/**
 * Reset password for a user
 *
 * @param client - Supabase client instance
 * @param email - User email address
 * @param redirectTo - Optional redirect URL after password reset
 * @returns Void
 *
 * @example
 * ```typescript
 * await resetPassword(client, 'user@example.com', 'https://app.example.com/auth/reset-password');
 * ```
 */
export async function resetPassword(
  client: SupabaseClient,
  email: string,
  redirectTo?: string
): Promise<void> {
  const { error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo: redirectTo || `${window.location.origin}/auth/reset-password`,
  });

  if (error) throw error;
}

/**
 * Update user password
 *
 * @param client - Supabase client instance
 * @param newPassword - New password
 * @returns User data
 *
 * @example
 * ```typescript
 * await updatePassword(client, 'newPassword123');
 * ```
 */
export async function updatePassword(
  client: SupabaseClient,
  newPassword: string
) {
  const { data, error } = await client.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;
  return data;
}

/**
 * Update user metadata
 *
 * @param client - Supabase client instance
 * @param metadata - Updated metadata
 * @returns User data
 *
 * @example
 * ```typescript
 * await updateUserMetadata(client, { firstName: 'Jane' });
 * ```
 */
export async function updateUserMetadata(
  client: SupabaseClient,
  metadata: Partial<SignUpMetadata>
) {
  const { data, error } = await client.auth.updateUser({
    data: {
      first_name: metadata.firstName,
      last_name: metadata.lastName,
      business_id: metadata.businessId,
      role: metadata.role,
    },
  });

  if (error) throw error;
  return data;
}

/**
 * Sign in with magic link (passwordless authentication)
 *
 * @param client - Supabase client instance
 * @param email - User email address
 * @param metadata - User metadata for new users
 * @returns Void
 *
 * @example
 * ```typescript
 * await signInWithMagicLink(client, 'customer@example.com', {
 *   firstName: 'Jane',
 *   lastName: 'Smith',
 *   businessId: null,
 *   role: 'customer'
 * });
 * ```
 */
export async function signInWithMagicLink(
  client: SupabaseClient,
  email: string,
  metadata?: SignUpMetadata
): Promise<void> {
  const { error } = await client.auth.signInWithOtp({
    email,
    options: {
      data: metadata
        ? {
            first_name: metadata.firstName,
            last_name: metadata.lastName,
            business_id: metadata.businessId,
            role: metadata.role,
          }
        : undefined,
    },
  });

  if (error) throw error;
}

/**
 * Sign in with phone number (OTP authentication)
 *
 * @param client - Supabase client instance
 * @param phone - User phone number (E.164 format)
 * @param metadata - User metadata for new users
 * @returns Void
 *
 * @example
 * ```typescript
 * await signInWithPhone(client, '+15555551234', {
 *   firstName: 'Bob',
 *   lastName: 'Technician',
 *   businessId: 'business-uuid',
 *   role: 'technician'
 * });
 * ```
 */
export async function signInWithPhone(
  client: SupabaseClient,
  phone: string,
  metadata?: SignUpMetadata
): Promise<void> {
  const { error } = await client.auth.signInWithOtp({
    phone,
    options: {
      data: metadata
        ? {
            first_name: metadata.firstName,
            last_name: metadata.lastName,
            business_id: metadata.businessId,
            role: metadata.role,
          }
        : undefined,
    },
  });

  if (error) throw error;
}

/**
 * Verify phone OTP code
 *
 * @param client - Supabase client instance
 * @param phone - User phone number (E.164 format)
 * @param token - OTP code received via SMS
 * @returns User data and session
 *
 * @example
 * ```typescript
 * const { data } = await verifyPhoneOtp(client, '+15555551234', '123456');
 * ```
 */
export async function verifyPhoneOtp(
  client: SupabaseClient,
  phone: string,
  token: string
) {
  const { data, error } = await client.auth.verifyOtp({
    phone,
    token,
    type: 'sms',
  });

  if (error) throw error;
  return data;
}

/**
 * Verify email OTP code (magic link)
 *
 * @param client - Supabase client instance
 * @param email - User email address
 * @param token - OTP code from magic link
 * @returns User data and session
 *
 * @example
 * ```typescript
 * const { data } = await verifyEmailOtp(client, 'user@example.com', 'abc123');
 * ```
 */
export async function verifyEmailOtp(
  client: SupabaseClient,
  email: string,
  token: string
) {
  const { data, error } = await client.auth.verifyOtp({
    email,
    token,
    type: 'email',
  });

  if (error) throw error;
  return data;
}

/**
 * Refresh the current session
 *
 * @param client - Supabase client instance
 * @returns Refreshed session data
 *
 * @example
 * ```typescript
 * const { session } = await refreshSession(client);
 * console.log('New access token:', session.access_token);
 * ```
 */
export async function refreshSession(client: SupabaseClient) {
  const { data, error } = await client.auth.refreshSession();

  if (error) throw error;
  return data;
}

/**
 * Extract JWT claims from current session
 *
 * @param client - Supabase client instance
 * @returns JWT claims or null if not authenticated
 *
 * @example
 * ```typescript
 * const claims = await getJWTClaims(client);
 * if (claims) {
 *   console.log('Person ID:', claims.person_id);
 *   console.log('Role:', claims.role);
 * }
 * ```
 */
export async function getJWTClaims(
  client: SupabaseClient
): Promise<JWTClaims | null> {
  const {
    data: { session },
    error,
  } = await client.auth.getSession();

  if (error || !session) return null;

  // Claims are stored in user metadata
  const metadata = session.user.user_metadata;

  return {
    person_id: metadata.person_id,
    business_id: metadata.business_id ?? null,
    role: metadata.role,
    first_name: metadata.first_name ?? null,
    last_name: metadata.last_name ?? null,
    is_active: metadata.is_active ?? true,
  };
}

/**
 * Check if user has a specific role
 *
 * @param client - Supabase client instance
 * @param role - Role to check for
 * @returns True if user has the role
 *
 * @example
 * ```typescript
 * const isAdmin = await hasRole(client, 'admin');
 * if (isAdmin) {
 *   // Show admin features
 * }
 * ```
 */
export async function hasRole(
  client: SupabaseClient,
  role: PersonRole
): Promise<boolean> {
  const claims = await getJWTClaims(client);
  return claims?.role === role;
}

/**
 * Check if user has any of the specified roles
 *
 * @param client - Supabase client instance
 * @param roles - Array of roles to check for
 * @returns True if user has any of the roles
 *
 * @example
 * ```typescript
 * const canManage = await hasAnyRole(client, ['admin', 'super_admin']);
 * ```
 */
export async function hasAnyRole(
  client: SupabaseClient,
  roles: PersonRole[]
): Promise<boolean> {
  const claims = await getJWTClaims(client);
  return claims ? roles.includes(claims.role) : false;
}

/**
 * Get business ID from current user's JWT claims
 *
 * @param client - Supabase client instance
 * @returns Business ID or null
 *
 * @example
 * ```typescript
 * const businessId = await getBusinessId(client);
 * if (businessId) {
 *   // Fetch business data
 * }
 * ```
 */
export async function getBusinessId(
  client: SupabaseClient
): Promise<string | null> {
  const claims = await getJWTClaims(client);
  return claims?.business_id ?? null;
}

/**
 * Get person ID from current user's JWT claims
 *
 * @param client - Supabase client instance
 * @returns Person ID or null
 *
 * @example
 * ```typescript
 * const personId = await getPersonId(client);
 * if (personId) {
 *   // Fetch person data
 * }
 * ```
 */
export async function getPersonId(
  client: SupabaseClient
): Promise<string | null> {
  const claims = await getJWTClaims(client);
  return claims?.person_id ?? null;
}

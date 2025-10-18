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
  businessId: string;
  role: PersonRole;
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
      data: metadata,
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
 * @returns Void
 *
 * @example
 * ```typescript
 * await resetPassword(client, 'user@example.com');
 * ```
 */
export async function resetPassword(
  client: SupabaseClient,
  email: string
): Promise<void> {
  const { error } = await client.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/auth/reset-password`,
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
    data: metadata,
  });

  if (error) throw error;
  return data;
}

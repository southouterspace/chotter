/**
 * Type-safe Supabase client factory
 */

import { createClient, SupabaseClient as BaseSupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types/database';

/**
 * Type-safe Supabase client
 */
export type SupabaseClient = BaseSupabaseClient<Database>;

/**
 * Create a type-safe Supabase client for browser/client-side usage
 *
 * @param supabaseUrl - Your Supabase project URL
 * @param supabaseKey - Your Supabase anon/public key
 * @returns Type-safe Supabase client instance
 *
 * @example
 * ```typescript
 * const client = createSupabaseClient(
 *   process.env.NEXT_PUBLIC_SUPABASE_URL!,
 *   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
 * );
 *
 * // Type-safe queries
 * const { data, error } = await client
 *   .from('tickets')
 *   .select('*')
 *   .eq('status', 'pending');
 * ```
 */
export function createSupabaseClient(
  supabaseUrl: string,
  supabaseKey: string
): SupabaseClient {
  return createClient<Database>(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

/**
 * Create a type-safe Supabase server client with service role key
 *
 * WARNING: This client bypasses Row Level Security (RLS) policies.
 * Only use this on the server-side with the service role key.
 * Never expose this client or the service role key to the browser.
 *
 * @param supabaseUrl - Your Supabase project URL
 * @param serviceRoleKey - Your Supabase service_role key (NEVER expose to client)
 * @returns Type-safe Supabase client instance with admin privileges
 *
 * @example
 * ```typescript
 * // Server-side only!
 * const adminClient = createSupabaseServerClient(
 *   process.env.SUPABASE_URL!,
 *   process.env.SUPABASE_SERVICE_ROLE_KEY!  // NEVER expose to client
 * );
 *
 * // Bypasses RLS - use with caution
 * const { data, error } = await adminClient
 *   .from('businesses')
 *   .select('*');
 * ```
 */
export function createSupabaseServerClient(
  supabaseUrl: string,
  serviceRoleKey: string
): SupabaseClient {
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

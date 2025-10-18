import { createClient } from '@supabase/supabase-js';
import type { Database } from '@chotter/database';
import { env } from './env';

/**
 * Create a Supabase client with service role key for server-side operations
 * Use this for operations that bypass RLS (admin operations)
 */
export function createSupabaseServerClient() {
  return createClient<Database>(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Create a Supabase client with anon key for user-scoped operations
 * Use this when you have a user's JWT token and want RLS to apply
 */
export function createSupabaseClient(accessToken?: string) {
  const client = createClient<Database>(env.SUPABASE_URL, env.SUPABASE_ANON_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  if (accessToken) {
    // Set the auth token for this client instance
    client.auth.setSession({
      access_token: accessToken,
      refresh_token: '',
    });
  }

  return client;
}

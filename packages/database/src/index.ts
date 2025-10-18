/**
 * @chotter/database
 * Type-safe Supabase client, types, and query utilities
 *
 * @example
 * ```typescript
 * import { createSupabaseClient, getTicketById } from '@chotter/database';
 *
 * const client = createSupabaseClient(
 *   process.env.NEXT_PUBLIC_SUPABASE_URL!,
 *   process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
 * );
 *
 * const ticket = await getTicketById(client, 'ticket-uuid');
 * ```
 */

// Types
export type { Database, Json } from './types/database';
export type * from './types/database';

// Client
export { createSupabaseClient, createSupabaseServerClient } from './client';
export type { SupabaseClient } from './client';

// Auth
export * from './auth';

// Queries
export * from './queries';

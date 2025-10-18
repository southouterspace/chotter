/**
 * Type-safe query helpers for technicians (persons with technician role)
 */

import type { SupabaseClient } from '../client';
import type { Database } from '../types/database';

type Person = Database['public']['Tables']['persons']['Row'];
type PersonInsert = Database['public']['Tables']['persons']['Insert'];
type PersonUpdate = Database['public']['Tables']['persons']['Update'];
type PersonRole = Database['public']['Enums']['person_role'];

/**
 * Get a person by ID
 *
 * @param client - Supabase client instance
 * @param personId - Person UUID
 * @returns Person data or null if not found
 */
export async function getPersonById(
  client: SupabaseClient,
  personId: string
): Promise<Person | null> {
  const { data, error } = await client
    .from('persons')
    .select('*')
    .eq('id', personId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get all persons for a business
 *
 * @param client - Supabase client instance
 * @param businessId - Business UUID
 * @returns Array of persons
 */
export async function getPersonsByBusiness(
  client: SupabaseClient,
  businessId: string
): Promise<Person[]> {
  const { data, error } = await client
    .from('persons')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get persons by role
 *
 * @param client - Supabase client instance
 * @param businessId - Business UUID
 * @param role - Person role
 * @returns Array of persons
 */
export async function getPersonsByRole(
  client: SupabaseClient,
  businessId: string,
  role: PersonRole
): Promise<Person[]> {
  const { data, error } = await client
    .from('persons')
    .select('*')
    .eq('business_id', businessId)
    .eq('role', role)
    .order('first_name', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Get all technicians for a business
 *
 * @param client - Supabase client instance
 * @param businessId - Business UUID
 * @returns Array of technicians
 */
export async function getTechnicians(
  client: SupabaseClient,
  businessId: string
): Promise<Person[]> {
  return getPersonsByRole(client, businessId, 'technician');
}

/**
 * Get active technicians for a business
 *
 * @param client - Supabase client instance
 * @param businessId - Business UUID
 * @returns Array of active technicians
 */
export async function getActiveTechnicians(
  client: SupabaseClient,
  businessId: string
): Promise<Person[]> {
  const { data, error } = await client
    .from('persons')
    .select('*')
    .eq('business_id', businessId)
    .eq('role', 'technician')
    .eq('is_active', true)
    .order('first_name', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Get person by auth user ID
 *
 * @param client - Supabase client instance
 * @param authUserId - Auth user UUID
 * @returns Person data or null if not found
 */
export async function getPersonByAuthUserId(
  client: SupabaseClient,
  authUserId: string
): Promise<Person | null> {
  const { data, error } = await client
    .from('persons')
    .select('*')
    .eq('auth_user_id', authUserId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Create a new person
 *
 * @param client - Supabase client instance
 * @param person - Person data to insert
 * @returns Created person
 */
export async function createPerson(
  client: SupabaseClient,
  person: PersonInsert
): Promise<Person> {
  const { data, error } = await client
    .from('persons')
    .insert(person)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update a person
 *
 * @param client - Supabase client instance
 * @param personId - Person UUID
 * @param updates - Partial person data to update
 * @returns Updated person
 */
export async function updatePerson(
  client: SupabaseClient,
  personId: string,
  updates: PersonUpdate
): Promise<Person> {
  const { data, error } = await client
    .from('persons')
    .update(updates)
    .eq('id', personId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Deactivate a person
 *
 * @param client - Supabase client instance
 * @param personId - Person UUID
 * @returns Updated person
 */
export async function deactivatePerson(
  client: SupabaseClient,
  personId: string
): Promise<Person> {
  return updatePerson(client, personId, { is_active: false });
}

/**
 * Activate a person
 *
 * @param client - Supabase client instance
 * @param personId - Person UUID
 * @returns Updated person
 */
export async function activatePerson(
  client: SupabaseClient,
  personId: string
): Promise<Person> {
  return updatePerson(client, personId, { is_active: true });
}

/**
 * Delete a person
 *
 * @param client - Supabase client instance
 * @param personId - Person UUID
 * @returns Void
 */
export async function deletePerson(
  client: SupabaseClient,
  personId: string
): Promise<void> {
  const { error } = await client.from('persons').delete().eq('id', personId);

  if (error) throw error;
}

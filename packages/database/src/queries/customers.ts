/**
 * Type-safe query helpers for customers
 */

import type { SupabaseClient } from '../client';
import type { Database } from '../types/database';

type Customer = Database['public']['Tables']['customers']['Row'];
type CustomerInsert = Database['public']['Tables']['customers']['Insert'];
type CustomerUpdate = Database['public']['Tables']['customers']['Update'];
type CustomerStatus = Database['public']['Enums']['customer_status'];

/**
 * Get a customer by ID
 *
 * @param client - Supabase client instance
 * @param customerId - Customer UUID
 * @returns Customer data or null if not found
 */
export async function getCustomerById(
  client: SupabaseClient,
  customerId: string
): Promise<Customer | null> {
  const { data, error } = await client
    .from('customers')
    .select('*')
    .eq('id', customerId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get all customers for a business
 *
 * @param client - Supabase client instance
 * @param businessId - Business UUID
 * @returns Array of customers
 */
export async function getCustomersByBusiness(
  client: SupabaseClient,
  businessId: string
): Promise<Customer[]> {
  const { data, error } = await client
    .from('customers')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get customers by status
 *
 * @param client - Supabase client instance
 * @param businessId - Business UUID
 * @param status - Customer status
 * @returns Array of customers
 */
export async function getCustomersByStatus(
  client: SupabaseClient,
  businessId: string,
  status: CustomerStatus
): Promise<Customer[]> {
  const { data, error } = await client
    .from('customers')
    .select('*')
    .eq('business_id', businessId)
    .eq('status', status)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Search customers by name, email, or phone
 *
 * @param client - Supabase client instance
 * @param businessId - Business UUID
 * @param searchTerm - Search term
 * @returns Array of matching customers
 */
export async function searchCustomers(
  client: SupabaseClient,
  businessId: string,
  searchTerm: string
): Promise<Customer[]> {
  const { data, error } = await client
    .from('customers')
    .select('*')
    .eq('business_id', businessId)
    .or(
      `first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`
    )
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get customers by tag
 *
 * @param client - Supabase client instance
 * @param businessId - Business UUID
 * @param tag - Tag to filter by
 * @returns Array of customers
 */
export async function getCustomersByTag(
  client: SupabaseClient,
  businessId: string,
  tag: string
): Promise<Customer[]> {
  const { data, error } = await client
    .from('customers')
    .select('*')
    .eq('business_id', businessId)
    .contains('tags', [tag])
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Create a new customer
 *
 * @param client - Supabase client instance
 * @param customer - Customer data to insert
 * @returns Created customer
 */
export async function createCustomer(
  client: SupabaseClient,
  customer: CustomerInsert
): Promise<Customer> {
  const { data, error } = await client
    .from('customers')
    .insert(customer)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update a customer
 *
 * @param client - Supabase client instance
 * @param customerId - Customer UUID
 * @param updates - Partial customer data to update
 * @returns Updated customer
 */
export async function updateCustomer(
  client: SupabaseClient,
  customerId: string,
  updates: CustomerUpdate
): Promise<Customer> {
  const { data, error } = await client
    .from('customers')
    .update(updates)
    .eq('id', customerId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Add tags to a customer
 *
 * @param client - Supabase client instance
 * @param customerId - Customer UUID
 * @param tags - Tags to add
 * @returns Updated customer
 */
export async function addCustomerTags(
  client: SupabaseClient,
  customerId: string,
  tags: string[]
): Promise<Customer> {
  const customer = await getCustomerById(client, customerId);
  if (!customer) throw new Error('Customer not found');

  const existingTags = customer.tags || [];
  const newTags = [...new Set([...existingTags, ...tags])];

  return updateCustomer(client, customerId, { tags: newTags });
}

/**
 * Remove tags from a customer
 *
 * @param client - Supabase client instance
 * @param customerId - Customer UUID
 * @param tags - Tags to remove
 * @returns Updated customer
 */
export async function removeCustomerTags(
  client: SupabaseClient,
  customerId: string,
  tags: string[]
): Promise<Customer> {
  const customer = await getCustomerById(client, customerId);
  if (!customer) throw new Error('Customer not found');

  const existingTags = customer.tags || [];
  const newTags = existingTags.filter((tag) => !tags.includes(tag));

  return updateCustomer(client, customerId, { tags: newTags });
}

/**
 * Delete a customer
 *
 * @param client - Supabase client instance
 * @param customerId - Customer UUID
 * @returns Void
 */
export async function deleteCustomer(
  client: SupabaseClient,
  customerId: string
): Promise<void> {
  const { error } = await client.from('customers').delete().eq('id', customerId);

  if (error) throw error;
}

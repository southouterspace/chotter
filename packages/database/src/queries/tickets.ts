/**
 * Type-safe query helpers for tickets
 */

import type { SupabaseClient } from '../client';
import type { Database } from '../types/database';

type Ticket = Database['public']['Tables']['tickets']['Row'];
type TicketInsert = Database['public']['Tables']['tickets']['Insert'];
type TicketUpdate = Database['public']['Tables']['tickets']['Update'];
type TicketStatus = Database['public']['Enums']['ticket_status'];
type TicketPriority = Database['public']['Enums']['ticket_priority'];

/**
 * Get a ticket by ID
 *
 * @param client - Supabase client instance
 * @param ticketId - Ticket UUID
 * @returns Ticket data or null if not found
 */
export async function getTicketById(
  client: SupabaseClient,
  ticketId: string
): Promise<Ticket | null> {
  const { data, error } = await client
    .from('tickets')
    .select('*')
    .eq('id', ticketId)
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get all tickets for a business
 *
 * @param client - Supabase client instance
 * @param businessId - Business UUID
 * @returns Array of tickets
 */
export async function getTicketsByBusiness(
  client: SupabaseClient,
  businessId: string
): Promise<Ticket[]> {
  const { data, error } = await client
    .from('tickets')
    .select('*')
    .eq('business_id', businessId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get tickets by status for a business
 *
 * @param client - Supabase client instance
 * @param businessId - Business UUID
 * @param status - Ticket status
 * @returns Array of tickets
 */
export async function getTicketsByStatus(
  client: SupabaseClient,
  businessId: string,
  status: TicketStatus
): Promise<Ticket[]> {
  const { data, error } = await client
    .from('tickets')
    .select('*')
    .eq('business_id', businessId)
    .eq('status', status)
    .order('scheduled_for', { ascending: true, nullsFirst: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get tickets assigned to a technician
 *
 * @param client - Supabase client instance
 * @param businessId - Business UUID
 * @param technicianId - Technician (person) UUID
 * @returns Array of tickets
 */
export async function getTicketsByTechnician(
  client: SupabaseClient,
  businessId: string,
  technicianId: string
): Promise<Ticket[]> {
  const { data, error } = await client
    .from('tickets')
    .select('*')
    .eq('business_id', businessId)
    .eq('assigned_to', technicianId)
    .order('scheduled_for', { ascending: true, nullsFirst: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get tickets for a customer
 *
 * @param client - Supabase client instance
 * @param businessId - Business UUID
 * @param customerId - Customer UUID
 * @returns Array of tickets
 */
export async function getTicketsByCustomer(
  client: SupabaseClient,
  businessId: string,
  customerId: string
): Promise<Ticket[]> {
  const { data, error } = await client
    .from('tickets')
    .select('*')
    .eq('business_id', businessId)
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get tickets by priority
 *
 * @param client - Supabase client instance
 * @param businessId - Business UUID
 * @param priority - Ticket priority
 * @returns Array of tickets
 */
export async function getTicketsByPriority(
  client: SupabaseClient,
  businessId: string,
  priority: TicketPriority
): Promise<Ticket[]> {
  const { data, error } = await client
    .from('tickets')
    .select('*')
    .eq('business_id', businessId)
    .eq('priority', priority)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get tickets scheduled for a specific date range
 *
 * @param client - Supabase client instance
 * @param businessId - Business UUID
 * @param startDate - Start date (ISO string)
 * @param endDate - End date (ISO string)
 * @returns Array of tickets
 */
export async function getTicketsScheduledBetween(
  client: SupabaseClient,
  businessId: string,
  startDate: string,
  endDate: string
): Promise<Ticket[]> {
  const { data, error } = await client
    .from('tickets')
    .select('*')
    .eq('business_id', businessId)
    .gte('scheduled_for', startDate)
    .lte('scheduled_for', endDate)
    .order('scheduled_for', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Create a new ticket
 *
 * @param client - Supabase client instance
 * @param ticket - Ticket data to insert
 * @returns Created ticket
 */
export async function createTicket(
  client: SupabaseClient,
  ticket: TicketInsert
): Promise<Ticket> {
  const { data, error } = await client
    .from('tickets')
    .insert(ticket)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update a ticket
 *
 * @param client - Supabase client instance
 * @param ticketId - Ticket UUID
 * @param updates - Partial ticket data to update
 * @returns Updated ticket
 */
export async function updateTicket(
  client: SupabaseClient,
  ticketId: string,
  updates: TicketUpdate
): Promise<Ticket> {
  const { data, error } = await client
    .from('tickets')
    .update(updates)
    .eq('id', ticketId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Update ticket status
 *
 * @param client - Supabase client instance
 * @param ticketId - Ticket UUID
 * @param status - New status
 * @returns Updated ticket
 */
export async function updateTicketStatus(
  client: SupabaseClient,
  ticketId: string,
  status: TicketStatus
): Promise<Ticket> {
  return updateTicket(client, ticketId, { status });
}

/**
 * Assign ticket to a technician
 *
 * @param client - Supabase client instance
 * @param ticketId - Ticket UUID
 * @param technicianId - Technician (person) UUID
 * @returns Updated ticket
 */
export async function assignTicket(
  client: SupabaseClient,
  ticketId: string,
  technicianId: string
): Promise<Ticket> {
  return updateTicket(client, ticketId, { assigned_to: technicianId });
}

/**
 * Delete a ticket
 *
 * @param client - Supabase client instance
 * @param ticketId - Ticket UUID
 * @returns Void
 */
export async function deleteTicket(
  client: SupabaseClient,
  ticketId: string
): Promise<void> {
  const { error } = await client.from('tickets').delete().eq('id', ticketId);

  if (error) throw error;
}

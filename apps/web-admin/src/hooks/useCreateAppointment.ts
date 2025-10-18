import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { formatDate, type AppointmentFormData } from '@/lib/validation/appointment'

const BUSINESS_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' // Acme HVAC

/**
 * Hook to create a new appointment (ticket)
 * Inserts into tickets table with scheduled_date and time window
 */
export function useCreateAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: AppointmentFormData) => {
      // Convert form data to ticket insert format
      const ticketData = {
        business_id: BUSINESS_ID,
        customer_id: data.customer_id,
        service_id: data.service_id,
        assigned_technician_id: data.assigned_technician_id || null,
        status: 'scheduled' as const,
        priority: data.priority,
        scheduled_date: formatDate(data.scheduled_date),
        time_window_start: data.time_window_start,
        time_window_end: data.time_window_end,
        notes: data.customer_notes || null,
      }

      const { data: ticket, error } = await supabase
        .from('tickets')
        .insert(ticketData)
        .select()
        .single()

      if (error) throw error

      return ticket
    },
    onSuccess: () => {
      // Invalidate appointments queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: ['appointments'] })
    },
  })
}

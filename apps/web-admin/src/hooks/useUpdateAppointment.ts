import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { formatDate, type AppointmentFormData } from '@/lib/validation/appointment'

/**
 * Hook to update an existing appointment (ticket)
 * Updates fields in tickets table
 */
export function useUpdateAppointment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: AppointmentFormData }) => {
      // Convert form data to ticket update format
      const ticketData = {
        customer_id: data.customer_id,
        service_id: data.service_id,
        assigned_technician_id: data.assigned_technician_id || null,
        priority: data.priority,
        scheduled_date: formatDate(data.scheduled_date),
        time_window_start: data.time_window_start,
        time_window_end: data.time_window_end,
        notes: data.customer_notes || null,
      }

      const { data: ticket, error } = await supabase
        .from('tickets')
        .update(ticketData)
        .eq('id', id)
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

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@chotter/database/types/database'

const BUSINESS_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' // Acme HVAC

type Customer = Database['public']['Tables']['customers']['Row']
type Ticket = Database['public']['Tables']['tickets']['Row']

export interface CustomerWithAppointments extends Customer {
  appointments: Array<
    Ticket & {
      service_name?: string
      technician_name?: string
    }
  >
}

export function useCustomer(customerId: string | null) {
  return useQuery({
    queryKey: ['customer', customerId],
    queryFn: async () => {
      if (!customerId) return null

      // Fetch customer
      const { data: customer, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .eq('business_id', BUSINESS_ID)
        .single()

      if (customerError) throw customerError

      // Fetch appointments (tickets) for this customer
      const { data: tickets, error: ticketsError } = await supabase
        .from('tickets')
        .select(`
          *,
          services (name),
          technicians (
            persons (first_name, last_name)
          )
        `)
        .eq('customer_id', customerId)
        .eq('business_id', BUSINESS_ID)
        .order('scheduled_for', { ascending: false, nullsFirst: false })

      if (ticketsError) throw ticketsError

      // Transform the appointments data
      const appointments = (tickets || []).map((ticket) => {
        const service = Array.isArray(ticket.services) ? ticket.services[0] : ticket.services
        const technician = ticket.technicians
        const technicianData = technician && Array.isArray(technician) ? technician[0] : technician
        const person = technicianData?.persons
        const personData = person && Array.isArray(person) ? person[0] : person

        return {
          ...ticket,
          service_name: service?.name || 'Unknown Service',
          technician_name:
            personData && typeof personData === 'object' && 'first_name' in personData && 'last_name' in personData
              ? `${personData.first_name} ${personData.last_name}`
              : null,
        }
      })

      return {
        ...customer,
        appointments,
      } as CustomerWithAppointments
    },
    enabled: !!customerId,
  })
}

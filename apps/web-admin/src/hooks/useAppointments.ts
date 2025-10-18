import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { EventInput } from '@fullcalendar/core'

const BUSINESS_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' // Acme HVAC

export interface AppointmentFilters {
  technicianIds?: string[]
  serviceTypes?: string[]
  statuses?: string[]
  startDate?: string
  endDate?: string
}

export interface AppointmentData {
  id: string
  customerId: string
  customerName: string
  customerPhone: string
  customerAddress: string
  customerCity: string
  serviceId: string
  serviceName: string
  serviceCategory: string
  technicianId: string | null
  technicianName: string | null
  status: string
  priority: string
  scheduledDate: string
  timeWindowStart: string
  timeWindowEnd: string
  notes: string | null
}

interface UseAppointmentsReturn {
  appointments: AppointmentData[]
  events: EventInput[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

const STATUS_COLORS: Record<string, { bg: string; border: string }> = {
  pending: { bg: '#6b7280', border: '#6b7280' },
  scheduled: { bg: '#3b82f6', border: '#3b82f6' },
  en_route: { bg: '#a855f7', border: '#a855f7' },
  in_progress: { bg: '#f59e0b', border: '#f59e0b' },
  completed: { bg: '#10b981', border: '#10b981' },
  cancelled: { bg: '#ef4444', border: '#ef4444' },
}

export function useAppointments(filters?: AppointmentFilters): UseAppointmentsReturn {
  const [appointments, setAppointments] = useState<AppointmentData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('tickets')
        .select(`
          id,
          customer_id,
          service_id,
          assigned_technician_id,
          status,
          priority,
          scheduled_date,
          time_window_start,
          time_window_end,
          notes,
          customers!inner (
            address_line1,
            city,
            persons!inner (
              first_name,
              last_name,
              phone
            )
          ),
          services!inner (
            name,
            category
          ),
          technicians (
            persons (
              first_name,
              last_name
            )
          )
        `)
        .eq('business_id', BUSINESS_ID)
        .not('scheduled_date', 'is', null)
        .order('scheduled_date', { ascending: true })
        .order('time_window_start', { ascending: true })

      // Apply filters
      if (filters?.startDate) {
        query = query.gte('scheduled_date', filters.startDate)
      }
      if (filters?.endDate) {
        query = query.lte('scheduled_date', filters.endDate)
      }
      if (filters?.statuses && filters.statuses.length > 0) {
        query = query.in('status', filters.statuses)
      }
      if (filters?.technicianIds && filters.technicianIds.length > 0) {
        query = query.in('assigned_technician_id', filters.technicianIds)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      const appointmentData: AppointmentData[] = (data || []).map((ticket) => {
        const customer = Array.isArray(ticket.customers) ? ticket.customers[0] : ticket.customers
        const personData = customer?.persons
        const person = personData && Array.isArray(personData) ? personData[0] : personData
        const service = Array.isArray(ticket.services) ? ticket.services[0] : ticket.services

        const technicianData = ticket.technicians
        const technician = technicianData && Array.isArray(technicianData) ? technicianData[0] : technicianData
        const techPerson = technician?.persons
        const techPersonData = techPerson && Array.isArray(techPerson) ? techPerson[0] : techPerson

        const customerName = person && typeof person === 'object' && 'first_name' in person && 'last_name' in person
          ? `${person.first_name} ${person.last_name}`
          : 'Unknown Customer'

        const technicianName = techPersonData && typeof techPersonData === 'object' && 'first_name' in techPersonData && 'last_name' in techPersonData
          ? `${techPersonData.first_name} ${techPersonData.last_name}`
          : null

        return {
          id: ticket.id,
          customerId: ticket.customer_id,
          customerName,
          customerPhone: person && typeof person === 'object' && 'phone' in person ? person.phone || '' : '',
          customerAddress: customer?.address_line1 || '',
          customerCity: customer?.city || '',
          serviceId: ticket.service_id,
          serviceName: service?.name || 'Unknown Service',
          serviceCategory: service?.category || 'general',
          technicianId: ticket.assigned_technician_id,
          technicianName,
          status: ticket.status,
          priority: ticket.priority,
          scheduledDate: ticket.scheduled_date,
          timeWindowStart: ticket.time_window_start,
          timeWindowEnd: ticket.time_window_end,
          notes: ticket.notes,
        }
      })

      // Apply service type filter (category)
      let filteredAppointments = appointmentData
      if (filters?.serviceTypes && filters.serviceTypes.length > 0) {
        filteredAppointments = appointmentData.filter(apt =>
          filters.serviceTypes?.includes(apt.serviceCategory)
        )
      }

      setAppointments(filteredAppointments)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch appointments'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAppointments()

    // Subscribe to real-time updates
    const channel = supabase
      .channel('calendar_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tickets',
        filter: `business_id=eq.${BUSINESS_ID}`
      }, () => {
        fetchAppointments()
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [
    filters?.startDate,
    filters?.endDate,
    filters?.technicianIds?.join(','),
    filters?.serviceTypes?.join(','),
    filters?.statuses?.join(',')
  ])

  // Convert appointments to FullCalendar events
  const events: EventInput[] = appointments.map(apt => {
    const colors = STATUS_COLORS[apt.status] || STATUS_COLORS.pending
    const title = apt.technicianName
      ? `${apt.customerName} - ${apt.serviceName} (${apt.technicianName})`
      : `${apt.customerName} - ${apt.serviceName}`

    return {
      id: apt.id,
      title,
      start: `${apt.scheduledDate}T${apt.timeWindowStart}`,
      end: `${apt.scheduledDate}T${apt.timeWindowEnd}`,
      backgroundColor: colors.bg,
      borderColor: colors.border,
      extendedProps: {
        customerId: apt.customerId,
        customerName: apt.customerName,
        customerPhone: apt.customerPhone,
        customerAddress: apt.customerAddress,
        customerCity: apt.customerCity,
        serviceId: apt.serviceId,
        serviceName: apt.serviceName,
        serviceCategory: apt.serviceCategory,
        technicianId: apt.technicianId,
        technicianName: apt.technicianName,
        status: apt.status,
        priority: apt.priority,
        notes: apt.notes,
      }
    }
  })

  return {
    appointments,
    events,
    loading,
    error,
    refetch: fetchAppointments
  }
}

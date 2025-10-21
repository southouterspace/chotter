import { useEffect, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { useRealtimeSubscription } from '@/hooks/useRealtimeSubscription'

const BUSINESS_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' // Acme HVAC

export interface Appointment {
  id: string
  status: string
  scheduled_time: string
  customer_name: string
  service_address: any
}

export interface Route {
  id: string
  appointments: Appointment[]
}

export interface TechnicianLocationEnhanced {
  id: string
  name: string
  email: string
  photo_url?: string
  phone?: string
  location: {
    lat: number
    lng: number
  } | null
  status: 'available' | 'on_route' | 'busy' | 'off_duty'
  active_route?: Route
  current_appointment?: Appointment
  next_appointment?: Appointment
}

interface UseTechnicianLocationsEnhancedReturn {
  technicians: TechnicianLocationEnhanced[]
  loading: boolean
  error: Error | null
  refresh: () => Promise<void>
}

export function useTechnicianLocationsEnhanced(): UseTechnicianLocationsEnhancedReturn {
  const [technicians, setTechnicians] = useState<TechnicianLocationEnhanced[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchTechnicians = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('technicians')
        .select(`
          id,
          current_location,
          status,
          persons!inner (
            first_name,
            last_name,
            email,
            phone,
            photo_url
          )
        `)
        .eq('business_id', BUSINESS_ID)
        .eq('active', true)

      if (fetchError) throw fetchError

      // Fetch routes and appointments for each technician
      const technicianIds = (data || []).map((tech) => tech.id)

      // Get active routes for all technicians
      const { data: routesData } = await supabase
        .from('routes')
        .select(`
          id,
          technician_id,
          status
        `)
        .in('technician_id', technicianIds)
        .eq('status', 'active')

      // Get appointments for active routes
      const routeIds = (routesData || []).map((route) => route.id)
      const { data: appointmentsData } = await supabase
        .from('tickets')
        .select(`
          id,
          route_id,
          status,
          scheduled_time,
          customers!inner (
            persons!inner (
              first_name,
              last_name
            ),
            service_address
          )
        `)
        .in('route_id', routeIds)
        .order('scheduled_time', { ascending: true })

      // Map data to technicians
      const techLocations: TechnicianLocationEnhanced[] = (data || []).map((tech) => {
        const person = Array.isArray(tech.persons) ? tech.persons[0] : tech.persons

        // Find active route for this technician
        const activeRoute = routesData?.find((route) => route.technician_id === tech.id)

        // Find appointments for this route
        const routeAppointments = appointmentsData
          ?.filter((apt) => apt.route_id === activeRoute?.id)
          .map((apt) => {
            const customer = Array.isArray(apt.customers) ? apt.customers[0] : apt.customers
            const customerPerson = customer?.persons
            const personData = Array.isArray(customerPerson) ? customerPerson[0] : customerPerson

            return {
              id: apt.id,
              status: apt.status,
              scheduled_time: apt.scheduled_time,
              customer_name: personData
                ? `${personData.first_name} ${personData.last_name}`
                : 'Unknown Customer',
              service_address: customer?.service_address
            }
          }) || []

        // Determine current and next appointments
        const inProgressApt = routeAppointments.find((apt) => apt.status === 'in_progress')
        const scheduledApts = routeAppointments.filter((apt) => apt.status === 'scheduled')
        const nextApt = scheduledApts[0]

        return {
          id: tech.id,
          name: person ? `${person.first_name} ${person.last_name}` : 'Unknown',
          email: person?.email || '',
          phone: person?.phone,
          photo_url: person?.photo_url,
          location: tech.current_location
            ? {
                lat: tech.current_location.coordinates[1],
                lng: tech.current_location.coordinates[0],
              }
            : null,
          status: tech.status || 'off_duty',
          active_route: activeRoute
            ? {
                id: activeRoute.id,
                appointments: routeAppointments,
              }
            : undefined,
          current_appointment: inProgressApt,
          next_appointment: nextApt,
        }
      })

      setTechnicians(techLocations)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch technicians'))
    } finally {
      setLoading(false)
    }
  }, [])

  // Initial fetch
  useEffect(() => {
    fetchTechnicians()
  }, [fetchTechnicians])

  // Subscribe to technician updates
  useRealtimeSubscription(
    'technician_locations_enhanced',
    {
      table: 'technicians',
      filter: `business_id=eq.${BUSINESS_ID}`,
      onChange: () => {
        // Refresh all data when any technician changes
        fetchTechnicians()
      },
    },
    true
  )

  // Subscribe to ticket updates (for appointment status changes)
  useRealtimeSubscription(
    'ticket_updates',
    {
      table: 'tickets',
      onChange: () => {
        // Refresh when tickets change
        fetchTechnicians()
      },
    },
    true
  )

  return { technicians, loading, error, refresh: fetchTechnicians }
}

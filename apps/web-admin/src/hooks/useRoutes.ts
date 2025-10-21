import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

// TODO: Update @chotter/database types after running migrations
// For now, using any types for routes, technicians, and services tables
export interface RouteWithDetails {
  id: string
  business_id: string
  route_number: string
  route_date: string
  assigned_technician_id: string
  waypoints: any[]
  total_distance_meters: number | null
  total_duration_minutes: number | null
  optimization_status: string
  optimized_at: string | null
  optimized_by: string | null
  started_at: string | null
  completed_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
  technician: {
    id: string
    person_id: string
    person: {
      id: string
      first_name: string
      last_name: string
      email: string | null
      phone: string | null
      avatar_url: string | null
    }
  }
  tickets: Array<{
    id: string
    business_id: string
    ticket_number: string
    customer_id: string
    service_id: string
    assigned_technician_id: string | null
    route_id: string | null
    status: string
    priority: string
    scheduled_date: string | null
    time_window_start: string | null
    time_window_end: string | null
    window_type: string | null
    estimated_duration_minutes: number
    customer_notes: string | null
    technician_notes: string | null
    customer: {
      id: string
      person_id: string
      business_id: string
      address_line1: string | null
      address_line2: string | null
      city: string | null
      state: string | null
      postal_code: string | null
      country: string | null
      location: any
      person: {
        id: string
        first_name: string
        last_name: string
        email: string | null
        phone: string | null
      }
    }
    service: {
      id: string
      name: string
      description: string | null
      default_duration_minutes: number
    }
  }>
}

interface UseRoutesReturn {
  routes: RouteWithDetails[]
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useRoutes(date?: Date): UseRoutesReturn {
  const [routes, setRoutes] = useState<RouteWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchRoutes = async () => {
    try {
      setLoading(true)
      setError(null)

      // Get the current user's business_id
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Not authenticated')
      }

      const { data: person } = await supabase
        .from('persons')
        .select('business_id')
        .eq('supabase_user_id', user.id)
        .single()

      if (!person?.business_id) {
        throw new Error('No business associated with user')
      }

      // Use today's date if not provided
      const queryDate = date || new Date()
      const dateStr = queryDate.toISOString().split('T')[0]

      // Fetch routes with all related data
      const { data: routesData, error: routesError } = await supabase
        .from('routes')
        .select(`
          *,
          technician:technicians!routes_assigned_technician_id_fkey (
            *,
            person:persons!technicians_person_id_fkey (*)
          )
        `)
        .eq('business_id', person.business_id)
        .eq('route_date', dateStr)
        .order('route_number', { ascending: true })

      if (routesError) throw routesError

      // For each route, fetch associated tickets
      const routesWithTickets: RouteWithDetails[] = []

      for (const route of routesData || []) {
        const { data: ticketsData, error: ticketsError } = await supabase
          .from('tickets')
          .select(`
            *,
            customer:customers!tickets_customer_id_fkey (
              *,
              person:persons!customers_person_id_fkey (*)
            ),
            service:services!tickets_service_id_fkey (*)
          `)
          .eq('route_id', route.id)
          .order('created_at', { ascending: true })

        if (ticketsError) {
          console.error('Error fetching tickets for route:', ticketsError)
          continue
        }

        // Sort tickets based on waypoints order if available
        let sortedTickets = ticketsData || []
        if (route.waypoints && Array.isArray(route.waypoints)) {
          const waypoints = route.waypoints as Array<{ ticket_id: string; order: number }>
          sortedTickets = ticketsData?.sort((a, b) => {
            const aWaypoint = waypoints.find(w => w.ticket_id === a.id)
            const bWaypoint = waypoints.find(w => w.ticket_id === b.id)
            const aOrder = aWaypoint?.order ?? 999
            const bOrder = bWaypoint?.order ?? 999
            return aOrder - bOrder
          }) || []
        }

        routesWithTickets.push({
          ...route,
          technician: route.technician,
          tickets: sortedTickets
        } as RouteWithDetails)
      }

      setRoutes(routesWithTickets)
    } catch (err) {
      console.error('Error fetching routes:', err)
      setError(err instanceof Error ? err : new Error('Failed to fetch routes'))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRoutes()
  }, [date?.toISOString()])

  return {
    routes,
    loading,
    error,
    refetch: fetchRoutes
  }
}

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const BUSINESS_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' // Acme HVAC

export interface TechnicianLocation {
  id: string
  name: string
  email: string
  location: {
    lat: number
    lng: number
  } | null
  status: 'available' | 'on_route' | 'busy' | 'off_duty'
}

interface UseTechnicianLocationsReturn {
  technicians: TechnicianLocation[]
  loading: boolean
  error: Error | null
}

export function useTechnicianLocations(): UseTechnicianLocationsReturn {
  const [technicians, setTechnicians] = useState<TechnicianLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchTechnicians() {
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
              email
            )
          `)
          .eq('business_id', BUSINESS_ID)
          .eq('active', true)

        if (fetchError) throw fetchError

        const techLocations: TechnicianLocation[] = (data || []).map((tech) => {
          const person = Array.isArray(tech.persons) ? tech.persons[0] : tech.persons
          return {
            id: tech.id,
            name: person ? `${person.first_name} ${person.last_name}` : 'Unknown',
            email: person?.email || '',
            location: tech.current_location ? {
              lat: tech.current_location.coordinates[1],
              lng: tech.current_location.coordinates[0]
            } : null,
            status: tech.status || 'off_duty'
          }
        })

        setTechnicians(techLocations)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch technicians'))
      } finally {
        setLoading(false)
      }
    }

    fetchTechnicians()

    // Subscribe to real-time location updates
    const channel = supabase
      .channel('technician_locations')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'technicians',
        filter: `business_id=eq.${BUSINESS_ID}`
      }, () => {
        fetchTechnicians()
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  return { technicians, loading, error }
}

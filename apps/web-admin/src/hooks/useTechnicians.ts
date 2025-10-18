import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const BUSINESS_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' // Acme HVAC

export interface Technician {
  id: string
  firstName: string
  lastName: string
  name: string
  status: string
}

interface UseTechniciansReturn {
  technicians: Technician[]
  loading: boolean
  error: Error | null
}

export function useTechnicians(): UseTechniciansReturn {
  const [technicians, setTechnicians] = useState<Technician[]>([])
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
            status,
            persons!inner (
              first_name,
              last_name
            )
          `)
          .eq('business_id', BUSINESS_ID)
          .order('persons(last_name)', { ascending: true })

        if (fetchError) throw fetchError

        const technicianList: Technician[] = (data || []).map((tech) => {
          const personData = tech.persons
          const person = personData && Array.isArray(personData) ? personData[0] : personData

          const firstName = person && typeof person === 'object' && 'first_name' in person
            ? person.first_name
            : 'Unknown'
          const lastName = person && typeof person === 'object' && 'last_name' in person
            ? person.last_name
            : 'Technician'

          return {
            id: tech.id,
            firstName,
            lastName,
            name: `${firstName} ${lastName}`,
            status: tech.status,
          }
        })

        setTechnicians(technicianList)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch technicians'))
      } finally {
        setLoading(false)
      }
    }

    fetchTechnicians()
  }, [])

  return { technicians, loading, error }
}

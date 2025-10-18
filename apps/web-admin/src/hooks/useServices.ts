import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const BUSINESS_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' // Acme HVAC

export interface Service {
  id: string
  name: string
  category: string
}

export interface ServiceCategory {
  value: string
  label: string
  count: number
}

interface UseServicesReturn {
  services: Service[]
  categories: ServiceCategory[]
  loading: boolean
  error: Error | null
}

const CATEGORY_LABELS: Record<string, string> = {
  installation: 'Installation',
  repair: 'Repair',
  maintenance: 'Maintenance',
  inspection: 'Inspection',
  general: 'General',
}

export function useServices(): UseServicesReturn {
  const [services, setServices] = useState<Service[]>([])
  const [categories, setCategories] = useState<ServiceCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchServices() {
      try {
        setLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from('services')
          .select('id, name, category')
          .eq('business_id', BUSINESS_ID)
          .eq('is_active', true)
          .order('name', { ascending: true })

        if (fetchError) throw fetchError

        setServices(data || [])

        // Calculate categories with counts
        const categoryCounts = (data || []).reduce((acc, service) => {
          acc[service.category] = (acc[service.category] || 0) + 1
          return acc
        }, {} as Record<string, number>)

        const categoryList: ServiceCategory[] = Object.entries(categoryCounts).map(([value, count]) => ({
          value,
          label: CATEGORY_LABELS[value] || value,
          count,
        }))

        setCategories(categoryList)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch services'))
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  return { services, categories, loading, error }
}

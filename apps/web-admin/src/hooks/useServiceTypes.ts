import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@chotter/database'

type ServiceType = Database['public']['Tables']['service_types']['Row']

// Hardcoded business ID (will be replaced with context later)
const BUSINESS_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' // Acme HVAC

export interface ServiceTypeWithFormatted extends ServiceType {
  priceFormatted: string
  durationFormatted: string
}

/**
 * Fetch all service types for the current business
 */
export function useServiceTypes() {
  return useQuery({
    queryKey: ['service-types', BUSINESS_ID],
    queryFn: async (): Promise<ServiceTypeWithFormatted[]> => {
      const { data, error } = await supabase
        .from('service_types')
        .select('*')
        .eq('business_id', BUSINESS_ID)
        .order('display_order', { ascending: true })
        .order('name', { ascending: true })

      if (error) {
        throw new Error(`Failed to fetch service types: ${error.message}`)
      }

      // Add formatted fields for display
      return (data || []).map(service => ({
        ...service,
        priceFormatted: `$${(service.base_price / 100).toFixed(2)}`,
        durationFormatted: service.estimated_duration,
      }))
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Fetch active service types only
 */
export function useActiveServiceTypes() {
  return useQuery({
    queryKey: ['service-types', 'active', BUSINESS_ID],
    queryFn: async (): Promise<ServiceTypeWithFormatted[]> => {
      const { data, error } = await supabase
        .from('service_types')
        .select('*')
        .eq('business_id', BUSINESS_ID)
        .eq('is_active', true)
        .order('display_order', { ascending: true })
        .order('name', { ascending: true })

      if (error) {
        throw new Error(`Failed to fetch active service types: ${error.message}`)
      }

      return (data || []).map(service => ({
        ...service,
        priceFormatted: `$${(service.base_price / 100).toFixed(2)}`,
        durationFormatted: service.estimated_duration,
      }))
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

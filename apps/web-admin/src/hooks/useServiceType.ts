import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@chotter/database'

type ServiceType = Database['public']['Tables']['service_types']['Row']

// Hardcoded business ID (will be replaced with context later)
const BUSINESS_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' // Acme HVAC

/**
 * Fetch a single service type by ID
 */
export function useServiceType(serviceTypeId: string | null | undefined) {
  return useQuery({
    queryKey: ['service-type', serviceTypeId],
    queryFn: async (): Promise<ServiceType> => {
      if (!serviceTypeId) {
        throw new Error('Service type ID is required')
      }

      const { data, error } = await supabase
        .from('service_types')
        .select('*')
        .eq('id', serviceTypeId)
        .eq('business_id', BUSINESS_ID)
        .single()

      if (error) {
        throw new Error(`Failed to fetch service type: ${error.message}`)
      }

      if (!data) {
        throw new Error('Service type not found')
      }

      return data
    },
    enabled: !!serviceTypeId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

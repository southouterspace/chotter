import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@chotter/database'

type ServiceTypeUpdate = Database['public']['Tables']['service_types']['Update']

// Hardcoded business ID (will be replaced with context later)
const BUSINESS_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' // Acme HVAC

interface UpdateServiceTypeParams {
  id: string
  updates: {
    name?: string
    description?: string | null
    base_price?: number // in cents
    estimated_duration?: string // PostgreSQL interval
    required_skills?: string[]
    is_active?: boolean
    display_order?: number
  }
}

/**
 * Hook for updating an existing service type
 */
export function useUpdateServiceType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: UpdateServiceTypeParams) => {
      const serviceTypeUpdate: ServiceTypeUpdate = {
        ...updates,
      }

      const { data, error } = await supabase
        .from('service_types')
        .update(serviceTypeUpdate)
        .eq('id', id)
        .eq('business_id', BUSINESS_ID)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to update service type: ${error.message}`)
      }

      if (!data) {
        throw new Error('Service type not found')
      }

      return data
    },
    onSuccess: (data) => {
      // Invalidate and refetch service types
      queryClient.invalidateQueries({ queryKey: ['service-types'] })
      queryClient.invalidateQueries({ queryKey: ['service-type', data.id] })
    },
  })
}

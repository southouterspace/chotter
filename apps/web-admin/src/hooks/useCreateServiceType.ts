import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@chotter/database'

type ServiceTypeInsert = Database['public']['Tables']['service_types']['Insert']

// Hardcoded business ID (will be replaced with context later)
const BUSINESS_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' // Acme HVAC

interface CreateServiceTypeParams {
  name: string
  description?: string | null
  base_price: number // in cents
  estimated_duration: string // PostgreSQL interval
  required_skills?: string[]
  is_active?: boolean
  display_order?: number
}

/**
 * Hook for creating a new service type
 */
export function useCreateServiceType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: CreateServiceTypeParams) => {
      const serviceType: ServiceTypeInsert = {
        business_id: BUSINESS_ID,
        name: params.name,
        description: params.description,
        base_price: params.base_price,
        estimated_duration: params.estimated_duration,
        required_skills: params.required_skills || [],
        is_active: params.is_active ?? true,
        display_order: params.display_order ?? 0,
      }

      const { data, error } = await supabase
        .from('service_types')
        .insert(serviceType)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create service type: ${error.message}`)
      }

      return data
    },
    onSuccess: () => {
      // Invalidate and refetch service types
      queryClient.invalidateQueries({ queryKey: ['service-types'] })
    },
  })
}

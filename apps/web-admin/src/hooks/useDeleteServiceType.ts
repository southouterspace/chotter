import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

// Hardcoded business ID (will be replaced with context later)
const BUSINESS_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' // Acme HVAC

/**
 * Hook for deleting a service type
 */
export function useDeleteServiceType() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (serviceTypeId: string) => {
      const { error } = await supabase
        .from('service_types')
        .delete()
        .eq('id', serviceTypeId)
        .eq('business_id', BUSINESS_ID)

      if (error) {
        throw new Error(`Failed to delete service type: ${error.message}`)
      }

      return serviceTypeId
    },
    onSuccess: (serviceTypeId) => {
      // Invalidate and refetch service types
      queryClient.invalidateQueries({ queryKey: ['service-types'] })
      queryClient.removeQueries({ queryKey: ['service-type', serviceTypeId] })
    },
  })
}

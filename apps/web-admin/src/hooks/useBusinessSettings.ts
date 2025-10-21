import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@chotter/database/types/database'
import type { BusinessInfoFormData, OperatingHoursFormData } from '@/lib/validation/business'

const BUSINESS_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' // Acme HVAC

type Business = Database['public']['Tables']['businesses']['Row']

export interface BusinessSettings extends Business {
  operating_hours: OperatingHoursFormData | null
}

// Fetch business settings
export function useBusinessSettings() {
  return useQuery({
    queryKey: ['business-settings', BUSINESS_ID],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('businesses')
        .select('*')
        .eq('id', BUSINESS_ID)
        .single()

      if (error) throw error

      return data as BusinessSettings
    },
  })
}

// Update business information
export function useUpdateBusinessInfo() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: BusinessInfoFormData) => {
      const { data: business, error } = await supabase
        .from('businesses')
        .update({
          name: data.name,
          phone: data.phone,
          email: data.email,
          website: data.website || null,
          logo_url: data.logo_url || null,
          address: data.address,
          updated_at: new Date().toISOString(),
        })
        .eq('id', BUSINESS_ID)
        .select()
        .single()

      if (error) throw error

      return business
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-settings', BUSINESS_ID] })
    },
  })
}

// Update operating hours
export function useUpdateOperatingHours() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (operatingHours: OperatingHoursFormData) => {
      const { data: business, error } = await supabase
        .from('businesses')
        .update({
          business_hours: operatingHours as any,
          updated_at: new Date().toISOString(),
        })
        .eq('id', BUSINESS_ID)
        .select()
        .single()

      if (error) throw error

      return business
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['business-settings', BUSINESS_ID] })
    },
  })
}

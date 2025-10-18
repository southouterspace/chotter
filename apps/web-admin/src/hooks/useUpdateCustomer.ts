import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@chotter/database/types/database'
import type { CustomerFormData } from '@/lib/validation/customer'

type CustomerUpdate = Database['public']['Tables']['customers']['Update']

export function useUpdateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: string
      data: CustomerFormData
    }) => {
      // Prepare the update data
      const updateData: CustomerUpdate = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email || null,
        phone: data.phone,
        company_name: data.company_name || null,
        status: data.status,
        source: data.source || null,
        notes: data.notes || null,
        service_address: {
          street: data.service_address.street,
          city: data.service_address.city,
          state: data.service_address.state,
          zip: data.service_address.zip,
        },
        billing_address: data.billing_address || null,
      }

      const { data: customer, error } = await supabase
        .from('customers')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return customer
    },
    onSuccess: (data) => {
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ['customers'] })
      queryClient.invalidateQueries({ queryKey: ['customer', data.id] })
    },
  })
}

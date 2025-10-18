import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@chotter/database/types/database'
import type { CustomerFormData } from '@/lib/validation/customer'

const BUSINESS_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' // Acme HVAC

type CustomerInsert = Database['public']['Tables']['customers']['Insert']

export function useCreateCustomer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CustomerFormData) => {
      // Prepare the customer data
      const customerData: CustomerInsert = {
        business_id: BUSINESS_ID,
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
        .insert(customerData)
        .select()
        .single()

      if (error) throw error

      return customer
    },
    onSuccess: () => {
      // Invalidate the customers list query to refetch
      queryClient.invalidateQueries({ queryKey: ['customers'] })
    },
  })
}

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@chotter/database/types/database'

const BUSINESS_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' // Acme HVAC

type Customer = Database['public']['Tables']['customers']['Row']

export interface CustomerFilters {
  search?: string
  status?: 'active' | 'inactive'
  page?: number
  pageSize?: number
}

export interface CustomerListItem extends Customer {
  appointment_count?: number
}

export interface CustomersResponse {
  data: CustomerListItem[]
  count: number
  page: number
  pageSize: number
  totalPages: number
}

export function useCustomers(filters?: CustomerFilters) {
  return useQuery({
    queryKey: ['customers', filters],
    queryFn: async () => {
      const page = filters?.page || 1
      const pageSize = filters?.pageSize || 20
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      let query = supabase
        .from('customers')
        .select('*', { count: 'exact' })
        .eq('business_id', BUSINESS_ID)
        .order('created_at', { ascending: false })

      // Apply status filter
      if (filters?.status) {
        query = query.eq('status', filters.status)
      }

      // Apply search filter
      if (filters?.search && filters.search.trim()) {
        const searchTerm = filters.search.trim()
        query = query.or(
          `first_name.ilike.%${searchTerm}%,last_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`
        )
      }

      // Apply pagination
      query = query.range(from, to)

      const { data, error, count } = await query

      if (error) throw error

      return {
        data: data as CustomerListItem[],
        count: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      } as CustomersResponse
    },
  })
}

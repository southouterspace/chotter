import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const BUSINESS_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' // Acme HVAC

export interface ActivityItem {
  id: string
  customerName: string
  serviceName: string
  serviceCategory: string
  status: string
  address: string
  city: string
  updatedAt: string
  scheduledDate: string
}

interface UseRecentActivityReturn {
  activities: ActivityItem[]
  loading: boolean
  error: Error | null
}

export function useRecentActivity(): UseRecentActivityReturn {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchActivities() {
      try {
        setLoading(true)
        setError(null)

        const { data, error: fetchError } = await supabase
          .from('tickets')
          .select(`
            id,
            status,
            updated_at,
            scheduled_date,
            customers!inner (
              address_line1,
              city,
              persons!inner (
                first_name,
                last_name
              )
            ),
            services!inner (
              name,
              category
            )
          `)
          .eq('business_id', BUSINESS_ID)
          .order('updated_at', { ascending: false })
          .limit(10)

        if (fetchError) throw fetchError

        const activityItems: ActivityItem[] = (data || []).map((ticket) => {
          const customer = Array.isArray(ticket.customers) ? ticket.customers[0] : ticket.customers
          const personData = customer?.persons
          const person = personData && Array.isArray(personData) ? personData[0] : personData
          const service = Array.isArray(ticket.services) ? ticket.services[0] : ticket.services

          return {
            id: ticket.id,
            customerName: person && typeof person === 'object' && 'first_name' in person && 'last_name' in person
              ? `${person.first_name} ${person.last_name}`
              : 'Unknown Customer',
            serviceName: service?.name || 'Unknown Service',
            serviceCategory: service?.category || 'general',
            status: ticket.status,
            address: customer?.address_line1 || '',
            city: customer?.city || '',
            updatedAt: ticket.updated_at,
            scheduledDate: ticket.scheduled_date
          }
        })

        setActivities(activityItems)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch activities'))
      } finally {
        setLoading(false)
      }
    }

    fetchActivities()

    // Subscribe to real-time updates
    const channel = supabase
      .channel('activity_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tickets',
        filter: `business_id=eq.${BUSINESS_ID}`
      }, () => {
        fetchActivities()
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  return { activities, loading, error }
}

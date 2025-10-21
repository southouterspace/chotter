import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

const BUSINESS_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' // Acme HVAC

interface TodayStats {
  totalAppointments: number
  activeTechnicians: number
  completionRate: number
  pendingAppointments: number
}

interface UseTodayStatsReturn {
  stats: TodayStats | null
  loading: boolean
  error: Error | null
}

export function useTodayStats(): UseTodayStatsReturn {
  const [stats, setStats] = useState<TodayStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true)
        setError(null)

        const today = new Date().toISOString().split('T')[0]

        // Get today's appointments
        const { data: todayTickets, error: todayError } = await supabase
          .from('tickets')
          .select('status')
          .eq('business_id', BUSINESS_ID)
          .eq('scheduled_date', today)

        if (todayError) throw todayError

        // Get active technicians count
        const { count: techCount, error: techError } = await supabase
          .from('technicians')
          .select('*', { count: 'exact', head: true })
          .eq('business_id', BUSINESS_ID)
          .eq('active', true)

        if (techError) throw techError

        // Get all tickets for completion rate
        const { data: allTickets, error: allError } = await supabase
          .from('tickets')
          .select('status')
          .eq('business_id', BUSINESS_ID)

        if (allError) throw allError

        // Calculate stats
        const totalAppointments = todayTickets?.length || 0
        const activeTechnicians = techCount || 0
        const pendingAppointments = todayTickets?.filter(t => t.status === 'pending').length || 0

        const completedTickets = allTickets?.filter(t => t.status === 'completed').length || 0
        const totalTickets = allTickets?.length || 1 // Avoid division by zero
        const completionRate = Math.round((completedTickets / totalTickets) * 100)

        setStats({
          totalAppointments,
          activeTechnicians,
          completionRate,
          pendingAppointments
        })
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch stats'))
      } finally {
        setLoading(false)
      }
    }

    fetchStats()

    // Subscribe to real-time updates
    const channel = supabase
      .channel('stats_updates')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'tickets',
        filter: `business_id=eq.${BUSINESS_ID}`
      }, () => {
        fetchStats()
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'technicians',
        filter: `business_id=eq.${BUSINESS_ID}`
      }, () => {
        fetchStats()
      })
      .subscribe()

    return () => {
      channel.unsubscribe()
    }
  }, [])

  return { stats, loading, error }
}

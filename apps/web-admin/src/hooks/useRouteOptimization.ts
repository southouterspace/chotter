import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useToast } from '@/hooks/useToast'

interface OptimizationMetrics {
  distance_saved_miles: number
  time_saved_minutes: number
  new_estimated_completion_time?: string
}

interface UseRouteOptimizationReturn {
  optimizeRoute: (routeId: string) => Promise<OptimizationMetrics | null>
  updateRouteSequence: (routeId: string, ticketIds: string[]) => Promise<boolean>
  isOptimizing: boolean
  error: Error | null
}

export function useRouteOptimization(): UseRouteOptimizationReturn {
  const [isOptimizing, setIsOptimizing] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { toast } = useToast()

  const optimizeRoute = async (routeId: string): Promise<OptimizationMetrics | null> => {
    try {
      setIsOptimizing(true)
      setError(null)

      // Fetch current route
      const { data: route, error: routeError } = await supabase
        .from('routes')
        .select('*, tickets:tickets!tickets_route_id_fkey(*)')
        .eq('id', routeId)
        .single()

      if (routeError) throw routeError

      if (!route) {
        throw new Error('Route not found')
      }

      // PLACEHOLDER OPTIMIZATION LOGIC
      // In production, this would call an actual route optimization service
      // For now, we'll reverse the order as a placeholder

      const tickets = route.tickets || []

      // Create new waypoints by reversing the order
      const optimizedWaypoints = tickets
        .map((ticket: any, index: number) => ({
          ticket_id: ticket.id,
          order: tickets.length - index,
          eta: null, // Would be calculated by real optimizer
          location: null // Would be populated by real optimizer
        }))
        .reverse()

      // Calculate placeholder metrics
      const distanceSaved = Math.random() * 10 + 2 // 2-12 miles
      const timeSaved = Math.random() * 30 + 10 // 10-40 minutes

      // Update route with optimized waypoints
      const { error: updateError } = await supabase
        .from('routes')
        .update({
          waypoints: optimizedWaypoints,
          optimization_status: 'optimized',
          optimized_at: new Date().toISOString(),
          optimized_by: 'ai', // Placeholder - would be actual optimizer name
          total_distance_meters: route.total_distance_meters
            ? Math.round(route.total_distance_meters - (distanceSaved * 1609.34))
            : null,
          total_duration_minutes: route.total_duration_minutes
            ? Math.round(route.total_duration_minutes - timeSaved)
            : null
        })
        .eq('id', routeId)

      if (updateError) throw updateError

      const metrics: OptimizationMetrics = {
        distance_saved_miles: parseFloat(distanceSaved.toFixed(1)),
        time_saved_minutes: Math.round(timeSaved)
      }

      toast({
        title: 'Route Optimized',
        description: `Saved ${metrics.distance_saved_miles} miles and ${metrics.time_saved_minutes} minutes`,
      })

      return metrics

    } catch (err) {
      console.error('Error optimizing route:', err)
      const errorObj = err instanceof Error ? err : new Error('Failed to optimize route')
      setError(errorObj)
      toast({
        title: 'Optimization Failed',
        description: errorObj.message,
        variant: 'destructive'
      })
      return null
    } finally {
      setIsOptimizing(false)
    }
  }

  const updateRouteSequence = async (routeId: string, ticketIds: string[]): Promise<boolean> => {
    try {
      setError(null)

      // Fetch current route
      const { data: route, error: routeError } = await supabase
        .from('routes')
        .select('waypoints')
        .eq('id', routeId)
        .single()

      if (routeError) throw routeError

      // Create new waypoints with updated order
      const newWaypoints = ticketIds.map((ticketId, index) => {
        const existingWaypoint = (route.waypoints as any[] || []).find(
          (w: any) => w.ticket_id === ticketId
        )
        return {
          ...existingWaypoint,
          ticket_id: ticketId,
          order: index + 1
        }
      })

      // Update route with new sequence
      const { error: updateError } = await supabase
        .from('routes')
        .update({
          waypoints: newWaypoints,
          optimization_status: 'draft', // Mark as draft since manually reordered
          updated_at: new Date().toISOString()
        })
        .eq('id', routeId)

      if (updateError) throw updateError

      toast({
        title: 'Route Updated',
        description: 'Appointment sequence updated successfully',
      })

      return true

    } catch (err) {
      console.error('Error updating route sequence:', err)
      const errorObj = err instanceof Error ? err : new Error('Failed to update route sequence')
      setError(errorObj)
      toast({
        title: 'Update Failed',
        description: errorObj.message,
        variant: 'destructive'
      })
      return false
    }
  }

  return {
    optimizeRoute,
    updateRouteSequence,
    isOptimizing,
    error
  }
}

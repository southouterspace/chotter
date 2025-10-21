import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { RouteReorderableList } from '@/components/RouteReorderableList'
import { useRouteOptimization } from '@/hooks/useRouteOptimization'
import type { RouteWithDetails } from '@/hooks/useRoutes'
import {
  Sparkles,
  MapPin,
  Clock,
  TrendingDown,
  Timer,
  CheckCircle2,
  RefreshCw
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface RouteDetailProps {
  route: RouteWithDetails
  onUpdate: () => void
}

interface OptimizationResult {
  distance_saved_miles: number
  time_saved_minutes: number
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function RouteDetail({ route, onUpdate }: RouteDetailProps) {
  const { optimizeRoute, updateRouteSequence, isOptimizing } = useRouteOptimization()
  const [optimizationResult, setOptimizationResult] = useState<OptimizationResult | null>(null)
  const [showMetrics, setShowMetrics] = useState(false)

  const technicianName = `${route.technician.person.first_name} ${route.technician.person.last_name}`
  const completedStops = route.tickets.filter(t => t.status === 'completed').length
  const totalStops = route.tickets.length

  const handleOptimize = async () => {
    setShowMetrics(false)
    const result = await optimizeRoute(route.id)
    if (result) {
      setOptimizationResult(result)
      setShowMetrics(true)
      onUpdate()
    }
  }

  const handleReorder = async (ticketIds: string[]) => {
    const success = await updateRouteSequence(route.id, ticketIds)
    if (success) {
      setShowMetrics(false)
      setOptimizationResult(null)
      onUpdate()
    }
  }

  return (
    <div className="space-y-4">
      {/* Route Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={route.technician.person.avatar_url || undefined} />
                <AvatarFallback className="text-lg">
                  {getInitials(
                    route.technician.person.first_name,
                    route.technician.person.last_name
                  )}
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-2xl mb-1">{technicianName}</CardTitle>
                <p className="text-sm text-muted-foreground mb-2">{route.route_number}</p>
                <div className="flex items-center gap-2">
                  <Badge variant={route.optimization_status === 'optimized' ? 'default' : 'secondary'}>
                    {route.optimization_status === 'optimized' ? (
                      <>
                        <Sparkles className="h-3 w-3 mr-1" />
                        Optimized
                      </>
                    ) : (
                      'Draft'
                    )}
                  </Badge>
                  {route.optimized_at && (
                    <span className="text-xs text-muted-foreground">
                      Last optimized: {new Date(route.optimized_at).toLocaleTimeString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <Button
              onClick={handleOptimize}
              disabled={isOptimizing || totalStops < 2}
              className="ml-4"
            >
              {isOptimizing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Optimizing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Optimize Route
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Route Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <MapPin className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalStops}</p>
                <p className="text-sm text-muted-foreground">Total Stops</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              </div>
              <div>
                <p className="text-2xl font-bold">{completedStops}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>

            {route.total_distance_meters && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <MapPin className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {(route.total_distance_meters / 1609.34).toFixed(1)}
                  </p>
                  <p className="text-sm text-muted-foreground">Miles</p>
                </div>
              </div>
            )}

            {route.total_duration_minutes && (
              <div className="flex items-start gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Clock className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {Math.floor(route.total_duration_minutes / 60)}h {route.total_duration_minutes % 60}m
                  </p>
                  <p className="text-sm text-muted-foreground">Duration</p>
                </div>
              </div>
            )}
          </div>

          {/* Optimization Metrics */}
          {showMetrics && optimizationResult && (
            <>
              <Separator className="my-4" />
              <div className="bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="h-5 w-5 text-green-600 dark:text-green-400" />
                  <h4 className="font-semibold text-green-900 dark:text-green-100">
                    Route Optimized Successfully!
                  </h4>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="font-semibold text-green-900 dark:text-green-100">
                        {optimizationResult.distance_saved_miles} miles saved
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-300">Distance reduction</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Timer className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <div>
                      <p className="font-semibold text-green-900 dark:text-green-100">
                        {optimizationResult.time_saved_minutes} minutes saved
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-300">Time reduction</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Route Sequence */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Route Sequence</span>
            <span className="text-sm font-normal text-muted-foreground">
              Drag to reorder appointments
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RouteReorderableList
            tickets={route.tickets}
            onReorder={handleReorder}
            disabled={isOptimizing}
          />
        </CardContent>
      </Card>

      {route.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{route.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

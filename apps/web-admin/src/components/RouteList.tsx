import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { RouteWithDetails } from '@/hooks/useRoutes'
import { MapPin, Clock, CheckCircle2, Circle } from 'lucide-react'

interface RouteListProps {
  routes: RouteWithDetails[]
  selectedRouteId: string | null
  onRouteSelect: (routeId: string) => void
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

function getRouteStatusColor(status: string): string {
  switch (status) {
    case 'optimized':
      return 'bg-green-500'
    case 'in_progress':
      return 'bg-blue-500'
    case 'completed':
      return 'bg-gray-500'
    case 'draft':
      return 'bg-yellow-500'
    default:
      return 'bg-gray-400'
  }
}

function getRouteStatusLabel(status: string): string {
  switch (status) {
    case 'optimized':
      return 'Optimized'
    case 'in_progress':
      return 'In Progress'
    case 'completed':
      return 'Completed'
    case 'draft':
      return 'Draft'
    case 'cancelled':
      return 'Cancelled'
    default:
      return status
  }
}

export function RouteList({ routes, selectedRouteId, onRouteSelect }: RouteListProps) {
  if (routes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Today's Routes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MapPin className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Routes Scheduled</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              There are no routes scheduled for today. Routes will appear here once appointments are assigned to technicians.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl font-bold">Today's Routes</h2>
        <Badge variant="outline">{routes.length} {routes.length === 1 ? 'Route' : 'Routes'}</Badge>
      </div>

      <div className="space-y-3">
        {routes.map((route) => {
          const isSelected = selectedRouteId === route.id
          const completedStops = route.tickets.filter(t => t.status === 'completed').length
          const totalStops = route.tickets.length
          const technicianName = `${route.technician.person.first_name} ${route.technician.person.last_name}`

          return (
            <Card
              key={route.id}
              className={`cursor-pointer transition-all hover:shadow-md ${
                isSelected ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => onRouteSelect(route.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Technician Avatar */}
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={route.technician.person.avatar_url || undefined} />
                    <AvatarFallback>
                      {getInitials(
                        route.technician.person.first_name,
                        route.technician.person.last_name
                      )}
                    </AvatarFallback>
                  </Avatar>

                  {/* Route Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="font-semibold text-base mb-1">{technicianName}</h3>
                        <p className="text-xs text-muted-foreground">{route.route_number}</p>
                      </div>
                      <Badge
                        variant={route.optimization_status === 'optimized' ? 'default' : 'secondary'}
                        className="ml-2"
                      >
                        {getRouteStatusLabel(route.optimization_status)}
                      </Badge>
                    </div>

                    {/* Progress */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${getRouteStatusColor(route.optimization_status)}`}
                          style={{ width: `${totalStops > 0 ? (completedStops / totalStops) * 100 : 0}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {completedStops}/{totalStops}
                      </span>
                    </div>

                    {/* Stats */}
                    <div className="flex flex-wrap gap-4 text-sm">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {totalStops} {totalStops === 1 ? 'stop' : 'stops'}
                        </span>
                      </div>

                      {route.total_distance_meters && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>{(route.total_distance_meters / 1609.34).toFixed(1)} mi</span>
                        </div>
                      )}

                      {route.total_duration_minutes && (
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>
                            {Math.floor(route.total_duration_minutes / 60)}h {route.total_duration_minutes % 60}m
                          </span>
                        </div>
                      )}

                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        {completedStops === totalStops ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Circle className="h-4 w-4" />
                        )}
                        <span>
                          {completedStops === totalStops ? 'Complete' : 'In Progress'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

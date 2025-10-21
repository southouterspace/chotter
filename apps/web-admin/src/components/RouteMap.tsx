import { useState, useCallback, useMemo } from 'react'
import { APIProvider, Map, AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import type { RouteWithDetails } from '@/hooks/useRoutes'
import { MapPin, Navigation } from 'lucide-react'

const MAP_CENTER = { lat: 32.7157, lng: -117.1611 } // San Diego
const MAP_ZOOM = 11

const MARKER_COLORS = {
  pending: '#9ca3af', // gray
  scheduled: '#8b5cf6', // purple
  confirmed: '#3b82f6', // blue
  en_route: '#f59e0b', // amber
  in_progress: '#eab308', // yellow
  completed: '#22c55e', // green
  cancelled: '#ef4444', // red
} as const

interface RouteMapProps {
  route: RouteWithDetails | null
  loading?: boolean
}

interface TicketMarker {
  id: string
  position: { lat: number; lng: number }
  customerName: string
  address: string
  serviceName: string
  status: string
  order: number
}

function getMarkerColor(status: string): string {
  return MARKER_COLORS[status as keyof typeof MARKER_COLORS] || MARKER_COLORS.pending
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'pending':
      return 'Pending'
    case 'scheduled':
      return 'Scheduled'
    case 'confirmed':
      return 'Confirmed'
    case 'en_route':
      return 'En Route'
    case 'in_progress':
      return 'In Progress'
    case 'completed':
      return 'Completed'
    case 'cancelled':
      return 'Cancelled'
    default:
      return status
  }
}

export function RouteMap({ route, loading = false }: RouteMapProps) {
  const [selectedMarker, setSelectedMarker] = useState<TicketMarker | null>(null)
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  const markers = useMemo(() => {
    if (!route) return []

    const ticketMarkers: TicketMarker[] = []

    route.tickets.forEach((ticket, index) => {
      // Extract location from customer's PostGIS geography field
      // Geography is stored as GeoJSON in the format: {"type": "Point", "coordinates": [lng, lat]}
      let position: { lat: number; lng: number } | null = null

      if (ticket.customer.location) {
        try {
          // Parse the geography JSON if it's a string
          const locationData = typeof ticket.customer.location === 'string'
            ? JSON.parse(ticket.customer.location)
            : ticket.customer.location

          if (locationData && locationData.coordinates) {
            const [lng, lat] = locationData.coordinates
            position = { lat, lng }
          }
        } catch (e) {
          console.error('Failed to parse location:', e)
        }
      }

      // Fallback to using address geocoding (if location is available)
      // For now, we'll skip markers without valid coordinates
      if (!position) {
        return
      }

      const customerName = `${ticket.customer.person.first_name} ${ticket.customer.person.last_name}`
      const address = `${ticket.customer.address_line1 || ''}, ${ticket.customer.city || ''}, ${ticket.customer.state || ''}`

      ticketMarkers.push({
        id: ticket.id,
        position,
        customerName,
        address,
        serviceName: ticket.service.name,
        status: ticket.status,
        order: index + 1
      })
    })

    return ticketMarkers
  }, [route])

  const mapCenter = useMemo(() => {
    if (markers.length === 0) return MAP_CENTER

    // Calculate center of all markers
    const avgLat = markers.reduce((sum, m) => sum + m.position.lat, 0) / markers.length
    const avgLng = markers.reduce((sum, m) => sum + m.position.lng, 0) / markers.length

    return { lat: avgLat, lng: avgLng }
  }, [markers])

  const handleMarkerClick = useCallback((marker: TicketMarker) => {
    setSelectedMarker(marker)
  }, [])

  const handleCloseInfoWindow = useCallback(() => {
    setSelectedMarker(null)
  }, [])

  if (!apiKey) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Route Map</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">
            Google Maps API key not configured. Please set VITE_GOOGLE_MAPS_API_KEY in your environment.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Route Map</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[600px] w-full flex items-center justify-center bg-muted">
            <Skeleton className="h-full w-full" />
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!route) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle>Route Map</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[600px] flex items-center justify-center text-center">
            <div>
              <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Select a route to view on map</p>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Navigation className="h-5 w-5" />
            <span>Route Map</span>
          </div>
          <Badge variant="outline">
            {markers.length} {markers.length === 1 ? 'stop' : 'stops'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <APIProvider apiKey={apiKey}>
          <div className="h-[600px] w-full">
            <Map
              defaultCenter={mapCenter}
              defaultZoom={MAP_ZOOM}
              mapId="route-map"
              gestureHandling="greedy"
              disableDefaultUI={false}
            >
              {markers.map((marker) => (
                <AdvancedMarker
                  key={marker.id}
                  position={marker.position}
                  onClick={() => handleMarkerClick(marker)}
                >
                  <div className="relative">
                    {/* Order number badge */}
                    <div className="absolute -top-2 -right-2 z-10 w-5 h-5 bg-white rounded-full flex items-center justify-center text-xs font-bold shadow-md border-2 border-primary">
                      {marker.order}
                    </div>
                    {/* Status marker */}
                    <div
                      className="w-10 h-10 rounded-full border-4 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform flex items-center justify-center"
                      style={{ backgroundColor: getMarkerColor(marker.status) }}
                    >
                      <MapPin className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </AdvancedMarker>
              ))}

              {selectedMarker && (
                <InfoWindow
                  position={selectedMarker.position}
                  onCloseClick={handleCloseInfoWindow}
                >
                  <div className="p-2 min-w-[220px]">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-muted-foreground">
                        Stop #{selectedMarker.order}
                      </span>
                      <Badge variant="outline" className="text-xs">
                        {getStatusLabel(selectedMarker.status)}
                      </Badge>
                    </div>
                    <h3 className="font-semibold text-sm mb-1">{selectedMarker.customerName}</h3>
                    <p className="text-xs text-muted-foreground mb-2">{selectedMarker.address}</p>
                    <div className="flex items-center gap-1 text-xs">
                      <span className="font-medium">Service:</span>
                      <span className="text-muted-foreground">{selectedMarker.serviceName}</span>
                    </div>
                  </div>
                </InfoWindow>
              )}
            </Map>
          </div>
        </APIProvider>
      </CardContent>

      {markers.length === 0 && (
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No stops with valid locations found in this route.
          </p>
        </CardContent>
      )}
    </Card>
  )
}

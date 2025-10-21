import { useState, useCallback } from 'react'
import { APIProvider, Map, AdvancedMarker, InfoWindow } from '@vis.gl/react-google-maps'
import { useTechnicianLocations, type TechnicianLocation } from '@/hooks/useTechnicianLocations'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

const MAP_CENTER = { lat: 32.7157, lng: -117.1611 } // San Diego
const MAP_ZOOM = 11

const STATUS_COLORS = {
  available: '#22c55e', // green
  on_route: '#3b82f6', // blue
  busy: '#f59e0b', // amber
  off_duty: '#6b7280' // gray
} as const

const STATUS_LABELS = {
  available: 'Available',
  on_route: 'On Route',
  busy: 'Busy',
  off_duty: 'Off Duty'
} as const

function getMarkerColor(status: TechnicianLocation['status']): string {
  return STATUS_COLORS[status] || STATUS_COLORS.off_duty
}

function getStatusVariant(status: TechnicianLocation['status']): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'available':
      return 'default'
    case 'on_route':
      return 'secondary'
    case 'busy':
      return 'outline'
    default:
      return 'secondary'
  }
}

export function LiveMap() {
  const { technicians, loading, error } = useTechnicianLocations()
  const [selectedTech, setSelectedTech] = useState<TechnicianLocation | null>(null)
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  const handleMarkerClick = useCallback((tech: TechnicianLocation) => {
    setSelectedTech(tech)
  }, [])

  const handleCloseInfoWindow = useCallback(() => {
    setSelectedTech(null)
  }, [])

  if (!apiKey) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Live Technician Map</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">
            Google Maps API key not configured. Please set VITE_GOOGLE_MAPS_API_KEY in your environment.
          </p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Live Technician Map</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-destructive">
            Failed to load technician locations: {error.message}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Live Technician Map</span>
          {loading && <Skeleton className="h-5 w-20" />}
          {!loading && (
            <span className="text-sm font-normal text-muted-foreground">
              {technicians.filter(t => t.location).length} technicians online
            </span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {loading ? (
          <div className="h-[500px] w-full flex items-center justify-center bg-muted">
            <Skeleton className="h-full w-full" />
          </div>
        ) : (
          <APIProvider apiKey={apiKey}>
            <div className="h-[500px] w-full">
              <Map
                defaultCenter={MAP_CENTER}
                defaultZoom={MAP_ZOOM}
                mapId="technician-map"
                gestureHandling="greedy"
                disableDefaultUI={false}
              >
                {technicians
                  .filter(tech => tech.location)
                  .map(tech => (
                    <AdvancedMarker
                      key={tech.id}
                      position={tech.location!}
                      onClick={() => handleMarkerClick(tech)}
                    >
                      <div
                        className="w-8 h-8 rounded-full border-4 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform"
                        style={{ backgroundColor: getMarkerColor(tech.status) }}
                      />
                    </AdvancedMarker>
                  ))}

                {selectedTech && selectedTech.location && (
                  <InfoWindow
                    position={selectedTech.location}
                    onCloseClick={handleCloseInfoWindow}
                  >
                    <div className="p-2 min-w-[200px]">
                      <h3 className="font-semibold text-sm mb-1">{selectedTech.name}</h3>
                      <p className="text-xs text-muted-foreground mb-2">{selectedTech.email}</p>
                      <Badge variant={getStatusVariant(selectedTech.status)}>
                        {STATUS_LABELS[selectedTech.status]}
                      </Badge>
                    </div>
                  </InfoWindow>
                )}
              </Map>
            </div>
          </APIProvider>
        )}
      </CardContent>

      {!loading && technicians.length === 0 && (
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No active technicians found.
          </p>
        </CardContent>
      )}
    </Card>
  )
}

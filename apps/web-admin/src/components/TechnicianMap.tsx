import { useState, useCallback, useMemo } from 'react'
import {
  APIProvider,
  Map,
  AdvancedMarker,
  InfoWindow,
  useMap,
} from '@vis.gl/react-google-maps'
import { MapPin, Navigation } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TechnicianMarker } from '@/components/TechnicianMarker'
import { TechnicianInfoWindow } from '@/components/TechnicianInfoWindow'
import type { TechnicianLocationEnhanced } from '@/hooks/useTechnicianLocationsEnhanced'

const DEFAULT_CENTER = { lat: 32.7157, lng: -117.1611 } // San Diego
const DEFAULT_ZOOM = 11

interface TechnicianMapProps {
  technicians: TechnicianLocationEnhanced[]
  showRoutes?: boolean
  center?: { lat: number; lng: number }
  zoom?: number
  className?: string
}

function MapControls({ technicians }: { technicians: TechnicianLocationEnhanced[] }) {
  const map = useMap()

  const handleCenterOnTechnicians = useCallback(() => {
    if (!map) return

    const bounds = new google.maps.LatLngBounds()
    let hasLocations = false

    technicians.forEach((tech) => {
      if (tech.location) {
        bounds.extend(tech.location)
        hasLocations = true
      }
    })

    if (hasLocations) {
      map.fitBounds(bounds, 50)
    }
  }, [map, technicians])

  const handleRecenter = useCallback(() => {
    if (!map) return
    map.panTo(DEFAULT_CENTER)
    map.setZoom(DEFAULT_ZOOM)
  }, [map])

  return (
    <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
      <Button
        size="sm"
        variant="secondary"
        className="shadow-lg"
        onClick={handleCenterOnTechnicians}
        title="Fit all technicians"
      >
        <Navigation className="w-4 h-4" />
      </Button>
      <Button
        size="sm"
        variant="secondary"
        className="shadow-lg"
        onClick={handleRecenter}
        title="Reset view"
      >
        <MapPin className="w-4 h-4" />
      </Button>
    </div>
  )
}

function RoutePolyline({
  technician,
}: {
  technician: TechnicianLocationEnhanced
}) {
  const map = useMap()

  useMemo(() => {
    if (!map || !technician.location || !technician.active_route) {
      return null
    }

    const route = technician.active_route
    const appointments = route.appointments.filter((apt) => apt.service_address)

    if (appointments.length === 0) {
      return null
    }

    // Create path: current location -> all appointment locations
    const path: google.maps.LatLngLiteral[] = [technician.location]

    appointments.forEach((apt) => {
      const address = apt.service_address
      // Try to extract coordinates from service_address
      // This assumes service_address might be a PostGIS point or has lat/lng
      if (address && typeof address === 'object') {
        if (address.coordinates) {
          // PostGIS point format
          path.push({
            lat: address.coordinates[1],
            lng: address.coordinates[0],
          })
        } else if (address.lat && address.lng) {
          // Direct lat/lng format
          path.push({
            lat: address.lat,
            lng: address.lng,
          })
        }
      }
    })

    if (path.length < 2) {
      return null
    }

    // Create polyline
    const polyline = new google.maps.Polyline({
      path,
      geodesic: true,
      strokeColor: '#3b82f6', // blue
      strokeOpacity: 0.8,
      strokeWeight: 3,
      map,
    })

    return () => {
      polyline.setMap(null)
    }
  }, [map, technician])

  return null
}

export function TechnicianMap({
  technicians,
  showRoutes = true,
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
  className = 'h-full w-full',
}: TechnicianMapProps) {
  const [selectedTech, setSelectedTech] = useState<TechnicianLocationEnhanced | null>(null)
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  const handleMarkerClick = useCallback((tech: TechnicianLocationEnhanced) => {
    setSelectedTech(tech)
  }, [])

  const handleCloseInfoWindow = useCallback(() => {
    setSelectedTech(null)
  }, [])

  if (!apiKey) {
    return (
      <div className={`flex items-center justify-center bg-muted ${className}`}>
        <div className="text-center p-6">
          <p className="text-sm text-destructive font-medium mb-2">
            Google Maps API Key Missing
          </p>
          <p className="text-xs text-muted-foreground">
            Please set VITE_GOOGLE_MAPS_API_KEY in your environment
          </p>
        </div>
      </div>
    )
  }

  const techniciansWithLocation = technicians.filter((tech) => tech.location)

  return (
    <APIProvider apiKey={apiKey}>
      <div className={`relative ${className}`}>
        <Map
          defaultCenter={center}
          defaultZoom={zoom}
          mapId="technician-tracking-map"
          gestureHandling="greedy"
          disableDefaultUI={false}
          zoomControl={true}
          mapTypeControl={false}
          streetViewControl={false}
          fullscreenControl={false}
        >
          {/* Technician markers */}
          {techniciansWithLocation.map((tech) => (
            <AdvancedMarker
              key={tech.id}
              position={tech.location!}
              onClick={() => handleMarkerClick(tech)}
            >
              <TechnicianMarker technician={tech} />
            </AdvancedMarker>
          ))}

          {/* Info window for selected technician */}
          {selectedTech && selectedTech.location && (
            <InfoWindow
              position={selectedTech.location}
              onCloseClick={handleCloseInfoWindow}
              headerDisabled
            >
              <TechnicianInfoWindow technician={selectedTech} />
            </InfoWindow>
          )}

          {/* Route polylines */}
          {showRoutes &&
            techniciansWithLocation.map((tech) =>
              tech.active_route ? (
                <RoutePolyline key={`route-${tech.id}`} technician={tech} />
              ) : null
            )}

          <MapControls technicians={techniciansWithLocation} />
        </Map>
      </div>
    </APIProvider>
  )
}

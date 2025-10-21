import { useState, useCallback, useMemo } from 'react'
import { APIProvider, Map } from '@vis.gl/react-google-maps'
import { LiveTechnicianMarker } from './LiveTechnicianMarker'
import { LiveTechnicianInfoWindow } from './LiveTechnicianInfoWindow'
import type { TechnicianWithLocation } from '@/hooks/useTechnicianLocationsMock'

interface LiveTechnicianMapProps {
  technicians: TechnicianWithLocation[]
  selectedTechId?: string | null
  onTechnicianSelect?: (id: string) => void
}

const DEFAULT_CENTER = { lat: 37.7749, lng: -122.4194 } // San Francisco
const DEFAULT_ZOOM = 12

export function LiveTechnicianMap({
  technicians,
  selectedTechId,
  onTechnicianSelect
}: LiveTechnicianMapProps) {
  const [selectedTech, setSelectedTech] = useState<TechnicianWithLocation | null>(null)
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  // Calculate map center based on technicians
  const mapCenter = useMemo(() => {
    if (technicians.length === 0) return DEFAULT_CENTER

    // Center on first technician
    const firstTech = technicians[0]
    return {
      lat: firstTech.current_location.coordinates[1],
      lng: firstTech.current_location.coordinates[0]
    }
  }, [technicians])

  const handleMarkerClick = useCallback((tech: TechnicianWithLocation) => {
    setSelectedTech(tech)
    onTechnicianSelect?.(tech.id)
  }, [onTechnicianSelect])

  const handleCloseInfoWindow = useCallback(() => {
    setSelectedTech(null)
  }, [])

  // Update selected tech if selectedTechId changes externally
  useMemo(() => {
    if (selectedTechId) {
      const tech = technicians.find(t => t.id === selectedTechId)
      if (tech) {
        setSelectedTech(tech)
      }
    }
  }, [selectedTechId, technicians])

  if (!apiKey) {
    return (
      <div className="h-full w-full flex items-center justify-center bg-muted rounded-lg">
        <div className="text-center p-6">
          <p className="text-sm text-destructive">
            Google Maps API key not configured.
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Please set VITE_GOOGLE_MAPS_API_KEY in your environment.
          </p>
        </div>
      </div>
    )
  }

  return (
    <APIProvider apiKey={apiKey}>
      <div className="h-full w-full">
        <Map
          defaultCenter={mapCenter}
          defaultZoom={DEFAULT_ZOOM}
          mapId="technician-tracking-map"
          gestureHandling="greedy"
          disableDefaultUI={false}
          fullscreenControl={false}
        >
          {technicians.map(tech => (
            <LiveTechnicianMarker
              key={tech.id}
              technician={tech}
              onClick={() => handleMarkerClick(tech)}
            />
          ))}

          {selectedTech && (
            <LiveTechnicianInfoWindow
              technician={selectedTech}
              onClose={handleCloseInfoWindow}
            />
          )}
        </Map>
      </div>
    </APIProvider>
  )
}

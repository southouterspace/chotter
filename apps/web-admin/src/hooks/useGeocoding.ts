import { useState } from 'react'

export interface Address {
  street: string
  city: string
  state: string
  zip: string
}

export interface GeocodedAddress extends Address {
  latitude: number
  longitude: number
}

export interface UseGeocodingReturn {
  geocode: (address: Address) => Promise<GeocodedAddress>
  isLoading: boolean
  error: string | null
}

/**
 * Hook for geocoding addresses using Google Maps Geocoding API
 * Converts street addresses into geographic coordinates (latitude/longitude)
 */
export function useGeocoding(): UseGeocodingReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const geocode = async (address: Address): Promise<GeocodedAddress> => {
    setIsLoading(true)
    setError(null)

    try {
      const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

      if (!apiKey) {
        throw new Error('Google Maps API key not configured')
      }

      // Format address for geocoding
      const formattedAddress = `${address.street}, ${address.city}, ${address.state} ${address.zip}, USA`

      // Call Google Maps Geocoding API
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
          formattedAddress
        )}&key=${apiKey}`
      )

      if (!response.ok) {
        throw new Error('Failed to geocode address')
      }

      const data = await response.json()

      if (data.status !== 'OK' || !data.results || data.results.length === 0) {
        throw new Error(`Geocoding failed: ${data.status}`)
      }

      const result = data.results[0]
      const { lat, lng } = result.geometry.location

      return {
        ...address,
        latitude: lat,
        longitude: lng,
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to geocode address'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  return {
    geocode,
    isLoading,
    error,
  }
}

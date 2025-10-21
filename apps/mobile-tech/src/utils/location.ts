/**
 * Location utility functions for distance calculations and formatting
 * Used by P3.6 Check-In / Check-Out Flow
 */

/**
 * Calculate distance between two coordinates using Haversine formula
 * @param coord1 - First coordinate with latitude and longitude
 * @param coord2 - Second coordinate as [longitude, latitude] from PostGIS
 * @returns Distance in meters
 */
export function calculateDistance(
  coord1: { latitude: number; longitude: number },
  coord2: [number, number] // [longitude, latitude] from PostGIS
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (coord1.latitude * Math.PI) / 180;
  const φ2 = (coord2[1] * Math.PI) / 180;
  const Δφ = ((coord2[1] - coord1.latitude) * Math.PI) / 180;
  const Δλ = ((coord2[0] - coord1.longitude) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Format distance for display
 * @param meters - Distance in meters
 * @returns Formatted distance string (e.g., "150m" or "2.5km")
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}

/**
 * Check if coordinates are within a specified radius
 * @param coord1 - First coordinate
 * @param coord2 - Second coordinate as [longitude, latitude]
 * @param radiusMeters - Maximum allowed distance in meters
 * @returns true if within radius, false otherwise
 */
export function isWithinRadius(
  coord1: { latitude: number; longitude: number },
  coord2: [number, number],
  radiusMeters: number
): boolean {
  const distance = calculateDistance(coord1, coord2);
  return distance <= radiusMeters;
}

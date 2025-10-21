// P2.8 Live Tracking - Mock Data
// Using mock data due to database connectivity issues
// TODO: Replace with real Supabase queries when database is available

export interface TechnicianWithLocation {
  id: string
  person_id: string
  first_name: string
  last_name: string
  status: 'available' | 'en_route' | 'busy' | 'off_duty'
  current_location: {
    type: 'Point'
    coordinates: [number, number] // [lng, lat] GeoJSON format
  }
  last_location_update: string
  current_appointment?: {
    id: string
    customer_name: string
    address: string
    eta_minutes: number
  }
}

export function useTechnicianLocationsMock() {
  // Mock data - return 5 technicians with SF Bay Area coordinates
  const data: TechnicianWithLocation[] = [
    {
      id: 't1',
      person_id: 'p1',
      first_name: 'John',
      last_name: 'Smith',
      status: 'en_route',
      current_location: {
        type: 'Point',
        coordinates: [-122.4194, 37.7749] // Downtown SF
      },
      last_location_update: new Date().toISOString(),
      current_appointment: {
        id: 'a1',
        customer_name: 'Acme Corp',
        address: '123 Market St, San Francisco, CA',
        eta_minutes: 15
      }
    },
    {
      id: 't2',
      person_id: 'p2',
      first_name: 'Sarah',
      last_name: 'Johnson',
      status: 'busy',
      current_location: {
        type: 'Point',
        coordinates: [-122.4389, 37.7621] // Mission District
      },
      last_location_update: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
      current_appointment: {
        id: 'a2',
        customer_name: 'TechStart Inc',
        address: '456 Valencia St, San Francisco, CA',
        eta_minutes: 0 // On site
      }
    },
    {
      id: 't3',
      person_id: 'p3',
      first_name: 'Mike',
      last_name: 'Chen',
      status: 'available',
      current_location: {
        type: 'Point',
        coordinates: [-122.4683, 37.8044] // Marina District
      },
      last_location_update: new Date(Date.now() - 600000).toISOString() // 10 minutes ago
    },
    {
      id: 't4',
      person_id: 'p4',
      first_name: 'Emily',
      last_name: 'Rodriguez',
      status: 'en_route',
      current_location: {
        type: 'Point',
        coordinates: [-122.4030, 37.7909] // Financial District
      },
      last_location_update: new Date().toISOString(),
      current_appointment: {
        id: 'a3',
        customer_name: 'Global Finance Ltd',
        address: '789 Montgomery St, San Francisco, CA',
        eta_minutes: 8
      }
    },
    {
      id: 't5',
      person_id: 'p5',
      first_name: 'David',
      last_name: 'Williams',
      status: 'off_duty',
      current_location: {
        type: 'Point',
        coordinates: [-122.4297, 37.7694] // SoMa
      },
      last_location_update: new Date(Date.now() - 1800000).toISOString() // 30 minutes ago
    }
  ]

  return {
    data,
    isLoading: false
  }
}

// For real-time updates (not implemented yet, just structure)
export function useTechnicianLocationsRealtime() {
  // Later: use Supabase Realtime
  // For now: just return useTechnicianLocationsMock()
  return useTechnicianLocationsMock()
}

// Re-export for convenience
export type { TechnicianWithLocation as TechnicianWithLocationMock }

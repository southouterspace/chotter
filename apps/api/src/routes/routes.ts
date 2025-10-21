import { Hono } from 'hono';
import { supabase } from '../lib/supabase';
import type { Database } from '@chotter/database/types';

type Ticket = Database['public']['Tables']['tickets']['Row'];

interface Coordinates {
  lat: number;
  lng: number;
}

interface OptimizationMetrics {
  distance_saved_miles: number;
  time_saved_minutes: number;
  original_distance_miles: number;
  optimized_distance_miles: number;
}

export const routesRouter = new Hono();

// Calculate distance between two coordinates using Haversine formula
function calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
  const R = 3959; // Earth's radius in miles
  const dLat = toRadians(coord2.lat - coord1.lat);
  const dLng = toRadians(coord2.lng - coord1.lng);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.lat)) *
      Math.cos(toRadians(coord2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

// Simple nearest neighbor algorithm for route optimization
function optimizeRouteSequence(
  tickets: Ticket[],
  startLocation?: Coordinates
): { optimizedTickets: Ticket[]; totalDistance: number } {
  if (tickets.length === 0) {
    return { optimizedTickets: [], totalDistance: 0 };
  }

  const unvisited = [...tickets];
  const optimized: Ticket[] = [];
  let currentLocation = startLocation;
  let totalDistance = 0;

  // If no start location, use first ticket's location
  if (!currentLocation && tickets[0]?.location) {
    const firstTicket = unvisited.shift()!;
    optimized.push(firstTicket);
    currentLocation = firstTicket.location as Coordinates;
  }

  // Nearest neighbor algorithm
  while (unvisited.length > 0) {
    if (!currentLocation) break;

    let nearestIndex = 0;
    let nearestDistance = Infinity;

    // Find nearest unvisited location
    for (let i = 0; i < unvisited.length; i++) {
      const ticket = unvisited[i];
      if (ticket.location) {
        const distance = calculateDistance(
          currentLocation,
          ticket.location as Coordinates
        );
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestIndex = i;
        }
      }
    }

    // Visit nearest location
    const nearest = unvisited.splice(nearestIndex, 1)[0];
    optimized.push(nearest);
    totalDistance += nearestDistance;
    currentLocation = nearest.location as Coordinates;
  }

  return { optimizedTickets: optimized, totalDistance };
}

// Calculate total distance for a route sequence
function calculateTotalDistance(tickets: Ticket[]): number {
  let total = 0;
  for (let i = 0; i < tickets.length - 1; i++) {
    const current = tickets[i]?.location as Coordinates | null;
    const next = tickets[i + 1]?.location as Coordinates | null;
    if (current && next) {
      total += calculateDistance(current, next);
    }
  }
  return total;
}

// POST /routes/:routeId/optimize
routesRouter.post('/:routeId/optimize', async (c) => {
  try {
    const routeId = c.req.param('routeId');

    // Fetch the route with tickets
    const { data: route, error: routeError } = await supabase
      .from('routes')
      .select(`
        *,
        tickets:tickets!tickets_route_id_fkey(*)
      `)
      .eq('id', routeId)
      .single();

    if (routeError) {
      return c.json({ error: 'Failed to fetch route', details: routeError.message }, 500);
    }

    if (!route) {
      return c.json({ error: 'Route not found' }, 404);
    }

    const tickets = route.tickets || [];

    if (tickets.length === 0) {
      return c.json({ error: 'No tickets in route' }, 400);
    }

    // Calculate original distance
    const originalDistance = calculateTotalDistance(tickets);

    // Optimize the route
    const { optimizedTickets, totalDistance: optimizedDistance } =
      optimizeRouteSequence(tickets);

    // Create optimized waypoints
    const optimizedWaypoints = optimizedTickets.map((ticket, index) => ({
      ticket_id: ticket.id,
      order: index + 1,
      eta: null,
      location: ticket.location,
    }));

    // Calculate metrics
    const distanceSaved = Math.max(0, originalDistance - optimizedDistance);
    const timeSaved = distanceSaved * 2; // Rough estimate: 2 minutes per mile saved

    // Update the route
    const { error: updateError } = await supabase
      .from('routes')
      .update({
        waypoints: optimizedWaypoints,
        optimization_status: 'optimized',
        optimized_at: new Date().toISOString(),
        optimized_by: 'nearest-neighbor-algorithm',
        total_distance_meters: Math.round(optimizedDistance * 1609.34),
        total_duration_minutes: route.total_duration_minutes
          ? Math.max(0, Math.round(route.total_duration_minutes - timeSaved))
          : null,
      })
      .eq('id', routeId);

    if (updateError) {
      return c.json({ error: 'Failed to update route', details: updateError.message }, 500);
    }

    const metrics: OptimizationMetrics = {
      distance_saved_miles: parseFloat(distanceSaved.toFixed(1)),
      time_saved_minutes: Math.round(timeSaved),
      original_distance_miles: parseFloat(originalDistance.toFixed(1)),
      optimized_distance_miles: parseFloat(optimizedDistance.toFixed(1)),
    };

    return c.json({
      success: true,
      message: 'Route optimized successfully',
      metrics,
      optimized_waypoints: optimizedWaypoints,
    });
  } catch (error) {
    console.error('Route optimization error:', error);
    return c.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      500
    );
  }
});

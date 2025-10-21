/**
 * Check-In / Check-Out Hook
 * Manages location-verified check-in and job completion functionality
 * P3.6: Check-In / Check-Out Flow
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { supabase } from '../lib/supabase';

export interface CheckInLocation {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: number;
}

export interface CheckInResult {
  id: string;
  status: string;
  checked_in_at: string;
  check_in_location: any;
}

export interface CompleteJobResult {
  id: string;
  status: string;
  completed_at: string;
  check_out_location: any;
}

export interface UseCheckInResult {
  checkIn: (location: Location.LocationObject) => void;
  completeJob: (location: Location.LocationObject) => void;
  isCheckingIn: boolean;
  isCompleting: boolean;
  checkInError: Error | null;
  completeError: Error | null;
}

/**
 * Hook for managing check-in and check-out for appointments
 * @param ticketId - The ID of the ticket/appointment
 * @returns Check-in and complete job mutation functions with loading states
 */
export function useCheckIn(ticketId: string): UseCheckInResult {
  const queryClient = useQueryClient();

  // Check-in mutation
  const checkInMutation = useMutation({
    mutationFn: async (location: Location.LocationObject) => {
      // Create PostGIS POINT from location
      const point = `POINT(${location.coords.longitude} ${location.coords.latitude})`;

      const { data, error } = await supabase
        .from('tickets')
        .update({
          status: 'in_progress',
          checked_in_at: new Date().toISOString(),
          check_in_location: point,
          actual_start_time: new Date().toISOString(),
        })
        .eq('id', ticketId)
        .select()
        .single();

      if (error) {
        console.error('Check-in error:', error);
        throw new Error(`Failed to check in: ${error.message}`);
      }

      return data as CheckInResult;
    },
    onSuccess: (data) => {
      console.log('Check-in successful:', data);
      // Invalidate relevant queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['appointment', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['todayRoute'] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
    onError: (error) => {
      console.error('Check-in mutation error:', error);
    },
  });

  // Complete job mutation
  const completeJobMutation = useMutation({
    mutationFn: async (location: Location.LocationObject) => {
      // Create PostGIS POINT from location
      const point = `POINT(${location.coords.longitude} ${location.coords.latitude})`;

      const { data, error } = await supabase
        .from('tickets')
        .update({
          status: 'completed',
          completed_at: new Date().toISOString(),
          check_out_location: point,
          actual_end_time: new Date().toISOString(),
        })
        .eq('id', ticketId)
        .select()
        .single();

      if (error) {
        console.error('Complete job error:', error);
        throw new Error(`Failed to complete job: ${error.message}`);
      }

      return data as CompleteJobResult;
    },
    onSuccess: (data) => {
      console.log('Job completion successful:', data);
      // Invalidate relevant queries to refetch updated data
      queryClient.invalidateQueries({ queryKey: ['appointment', ticketId] });
      queryClient.invalidateQueries({ queryKey: ['todayRoute'] });
      queryClient.invalidateQueries({ queryKey: ['tickets'] });
    },
    onError: (error) => {
      console.error('Complete job mutation error:', error);
    },
  });

  return {
    checkIn: checkInMutation.mutate,
    completeJob: completeJobMutation.mutate,
    isCheckingIn: checkInMutation.isPending,
    isCompleting: completeJobMutation.isPending,
    checkInError: checkInMutation.error,
    completeError: completeJobMutation.error,
  };
}

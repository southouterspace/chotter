/**
 * Check-In Button Component
 * Location-verified check-in button with proximity validation
 * P3.6: Check-In / Check-Out Flow
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';
import { calculateDistance, formatDistance } from '../utils/location';

const CHECK_IN_RADIUS_METERS = 500; // 500 meter radius requirement

export interface CheckInButtonProps {
  jobSiteLocation: [number, number]; // [longitude, latitude] from PostGIS
  onCheckIn: (location: Location.LocationObject) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function CheckInButton({
  jobSiteLocation,
  onCheckIn,
  disabled = false,
  isLoading = false,
}: CheckInButtonProps) {
  const [isChecking, setIsChecking] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const handleCheckIn = async () => {
    setIsChecking(true);
    setLocationError(null);

    try {
      // Request location permissions
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationError('Location permission denied. Please enable location services.');
        Alert.alert(
          'Permission Required',
          'Location access is required to check in at job sites. Please enable location permissions in your device settings.',
          [{ text: 'OK' }]
        );
        return;
      }

      // Get current location with high accuracy
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      // Verify proximity to job site
      const distance = calculateDistance(location.coords, jobSiteLocation);

      if (distance > CHECK_IN_RADIUS_METERS) {
        const formattedDistance = formatDistance(distance);
        const formattedRequired = formatDistance(CHECK_IN_RADIUS_METERS);

        setLocationError(
          `You must be within ${formattedRequired} to check in. Currently ${formattedDistance} away.`
        );

        Alert.alert(
          'Too Far From Job Site',
          `You must be within ${formattedRequired} of the job site to check in.\n\nCurrent distance: ${formattedDistance}`,
          [{ text: 'OK' }]
        );
        return;
      }

      // Location verified - proceed with check-in
      onCheckIn(location);
    } catch (error) {
      console.error('Check-in location error:', error);
      setLocationError('Failed to get location. Please ensure location services are enabled.');

      Alert.alert(
        'Location Error',
        'Unable to verify your location. Please ensure location services are enabled and try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsChecking(false);
    }
  };

  const isButtonDisabled = disabled || isLoading || isChecking;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          styles.checkInButton,
          isButtonDisabled && styles.disabledButton,
        ]}
        onPress={handleCheckIn}
        disabled={isButtonDisabled}
      >
        {(isLoading || isChecking) ? (
          <>
            <ActivityIndicator size="small" color="#fff" style={styles.loader} />
            <Text style={styles.buttonText}>
              {isChecking ? 'Verifying Location...' : 'Checking In...'}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.buttonIcon}>📍</Text>
            <Text style={styles.buttonText}>Check In</Text>
          </>
        )}
      </TouchableOpacity>

      {locationError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{locationError}</Text>
        </View>
      )}

      <Text style={styles.helpText}>
        You must be within {formatDistance(CHECK_IN_RADIUS_METERS)} of the job site
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  checkInButton: {
    backgroundColor: '#FF9800',
  },
  disabledButton: {
    backgroundColor: '#E0E0E0',
    opacity: 0.6,
  },
  buttonIcon: {
    fontSize: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loader: {
    marginRight: 4,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginTop: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#F44336',
  },
  errorIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  errorText: {
    flex: 1,
    color: '#C62828',
    fontSize: 14,
    lineHeight: 20,
  },
  helpText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
  },
});

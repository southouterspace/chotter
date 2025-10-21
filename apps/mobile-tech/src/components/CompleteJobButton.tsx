/**
 * Complete Job Button Component
 * Location-verified job completion button
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

export interface CompleteJobButtonProps {
  onComplete: (location: Location.LocationObject) => void;
  disabled?: boolean;
  isLoading?: boolean;
}

export function CompleteJobButton({
  onComplete,
  disabled = false,
  isLoading = false,
}: CompleteJobButtonProps) {
  const [isCompleting, setIsCompleting] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const handleComplete = async () => {
    // Confirm completion with user
    Alert.alert(
      'Complete Job',
      'Are you sure you want to mark this job as completed?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Complete',
          style: 'default',
          onPress: async () => {
            setIsCompleting(true);
            setLocationError(null);

            try {
              // Request location permissions
              const { status } = await Location.requestForegroundPermissionsAsync();
              if (status !== 'granted') {
                setLocationError('Location permission denied.');
                Alert.alert(
                  'Permission Required',
                  'Location access is required to complete jobs. Please enable location permissions in your device settings.',
                  [{ text: 'OK' }]
                );
                return;
              }

              // Get current location
              const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High,
              });

              // Proceed with completion
              onComplete(location);
            } catch (error) {
              console.error('Complete job location error:', error);
              setLocationError('Failed to get location.');

              Alert.alert(
                'Location Error',
                'Unable to get your current location. Please ensure location services are enabled and try again.',
                [{ text: 'OK' }]
              );
            } finally {
              setIsCompleting(false);
            }
          },
        },
      ]
    );
  };

  const isButtonDisabled = disabled || isLoading || isCompleting;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[
          styles.button,
          styles.completeButton,
          isButtonDisabled && styles.disabledButton,
        ]}
        onPress={handleComplete}
        disabled={isButtonDisabled}
      >
        {(isLoading || isCompleting) ? (
          <>
            <ActivityIndicator size="small" color="#fff" style={styles.loader} />
            <Text style={styles.buttonText}>
              {isCompleting ? 'Getting Location...' : 'Completing...'}
            </Text>
          </>
        ) : (
          <>
            <Text style={styles.buttonIcon}>✅</Text>
            <Text style={styles.buttonText}>Complete Job</Text>
          </>
        )}
      </TouchableOpacity>

      {locationError && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorIcon}>⚠️</Text>
          <Text style={styles.errorText}>{locationError}</Text>
        </View>
      )}
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
  completeButton: {
    backgroundColor: '#4CAF50',
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
});

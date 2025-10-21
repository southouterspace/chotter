/**
 * Action Buttons Component
 * Integrated check-in/check-out functionality with location verification
 * P3.6: Check-In / Check-Out Flow
 *
 * NOTE: This component integrates with AppointmentDetailScreen from P3.3
 * It replaces the placeholder implementation with real check-in/complete functionality
 */

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  Linking,
  Alert,
} from 'react-native';
import * as Location from 'expo-location';
import { CheckInButton } from './CheckInButton';
import { CompleteJobButton } from './CompleteJobButton';
import { useCheckIn } from '../hooks/useCheckIn';

export interface Address {
  street: string;
  city: string;
  state: string;
  zip: string;
  coordinates?: [number, number]; // [longitude, latitude]
}

export interface ActionButtonsProps {
  ticketId: string;
  status: 'pending' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  customerPhone: string;
  serviceAddress?: Address | null;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  ticketId,
  status,
  customerPhone,
  serviceAddress,
}) => {
  const { checkIn, completeJob, isCheckingIn, isCompleting } = useCheckIn(ticketId);

  const handleCall = () => {
    const phoneNumber = customerPhone.replace(/\D/g, '');
    const url = `tel:${phoneNumber}`;

    Linking.canOpenURL(url).then((supported) => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Alert.alert('Error', 'Unable to make phone call');
      }
    });
  };

  const handleNavigate = () => {
    if (!serviceAddress) {
      Alert.alert('Error', 'No address available for navigation');
      return;
    }

    const addressString = `${serviceAddress.street}, ${serviceAddress.city}, ${serviceAddress.state} ${serviceAddress.zip}`;
    const url = Platform.select({
      ios: `maps://app?daddr=${encodeURIComponent(addressString)}`,
      android: `google.navigation:q=${encodeURIComponent(addressString)}`,
    });

    if (url) {
      Linking.canOpenURL(url).then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('Error', 'Unable to open maps application');
        }
      });
    }
  };

  const handleCheckIn = (location: Location.LocationObject) => {
    checkIn(location);
  };

  const handleCompleteJob = (location: Location.LocationObject) => {
    completeJob(location);
  };

  const canCheckIn = status === 'scheduled' || status === 'pending';
  const canCompleteJob = status === 'in_progress';
  const isCompleted = status === 'completed';
  const isCancelled = status === 'cancelled';

  // Get job site coordinates for proximity check
  const jobSiteLocation = serviceAddress?.coordinates;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Actions</Text>

      {/* Primary Actions: Call and Navigate */}
      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={handleCall}
        >
          <Text style={styles.buttonIcon}>📞</Text>
          <Text style={styles.primaryButtonText}>Call Customer</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.successButton]}
          onPress={handleNavigate}
          disabled={!serviceAddress}
        >
          <Text style={styles.buttonIcon}>🗺️</Text>
          <Text style={styles.successButtonText}>Navigate</Text>
        </TouchableOpacity>
      </View>

      {/* Job Status Actions: Check In and Complete */}
      <View style={styles.buttonRow}>
        {/* Check In Button - Only show if can check in */}
        {canCheckIn && jobSiteLocation && (
          <View style={styles.fullWidthButton}>
            <CheckInButton
              jobSiteLocation={jobSiteLocation}
              onCheckIn={handleCheckIn}
              disabled={isCompleted || isCancelled}
              isLoading={isCheckingIn}
            />
          </View>
        )}

        {/* Complete Job Button - Only show if job is in progress */}
        {canCompleteJob && (
          <View style={styles.fullWidthButton}>
            <CompleteJobButton
              onComplete={handleCompleteJob}
              disabled={isCompleted || isCancelled}
              isLoading={isCompleting}
            />
          </View>
        )}
      </View>

      {/* Status Banners */}
      {isCompleted && (
        <View style={styles.statusBanner}>
          <Text style={styles.statusBannerIcon}>✅</Text>
          <Text style={styles.statusBannerText}>Job Completed</Text>
        </View>
      )}

      {isCancelled && (
        <View style={[styles.statusBanner, styles.cancelledBanner]}>
          <Text style={styles.statusBannerIcon}>❌</Text>
          <Text style={styles.statusBannerText}>Job Cancelled</Text>
        </View>
      )}

      {status === 'in_progress' && (
        <View style={[styles.statusBanner, styles.inProgressBanner]}>
          <Text style={styles.statusBannerIcon}>🔄</Text>
          <Text style={styles.statusBannerText}>Job In Progress</Text>
        </View>
      )}

      {!jobSiteLocation && canCheckIn && (
        <View style={[styles.statusBanner, styles.warningBanner]}>
          <Text style={styles.statusBannerIcon}>⚠️</Text>
          <Text style={styles.statusBannerText}>
            No location data available for this job site
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 16,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  fullWidthButton: {
    flex: 1,
  },
  buttonIcon: {
    fontSize: 20,
  },
  primaryButton: {
    backgroundColor: '#2196F3',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  successButton: {
    backgroundColor: '#4CAF50',
  },
  successButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginTop: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#4CAF50',
  },
  cancelledBanner: {
    backgroundColor: '#FFEBEE',
    borderLeftColor: '#F44336',
  },
  inProgressBanner: {
    backgroundColor: '#E3F2FD',
    borderLeftColor: '#2196F3',
  },
  warningBanner: {
    backgroundColor: '#FFF3E0',
    borderLeftColor: '#FF9800',
  },
  statusBannerIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  statusBannerText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
});

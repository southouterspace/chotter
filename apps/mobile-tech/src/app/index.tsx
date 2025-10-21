/**
 * Home/Index Screen
 * Placeholder for main app screen
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { OfflineIndicator } from '../components/OfflineIndicator';
import { useNotifications } from '../hooks/useNotifications';
import { useOfflineSync } from '../hooks/useOfflineSync';

export default function HomeScreen() {
  // Initialize notifications (example - replace with actual technician ID from auth)
  const { isRegistered, pushToken, badgeCount } = useNotifications({
    technicianId: 'example-tech-id',
    autoRegister: true,
  });

  // Initialize offline sync
  const { queueStatus } = useOfflineSync();

  return (
    <View style={styles.container}>
      <OfflineIndicator />

      <View style={styles.content}>
        <Text style={styles.title}>Chotter Tech App</Text>

        <View style={styles.statusCard}>
          <Text style={styles.cardTitle}>Notifications</Text>
          <Text style={styles.statusText}>
            Status: {isRegistered ? '✓ Registered' : '✗ Not Registered'}
          </Text>
          {pushToken && (
            <Text style={styles.tokenText} numberOfLines={1}>
              Token: {pushToken.substring(0, 30)}...
            </Text>
          )}
          <Text style={styles.statusText}>Badge Count: {badgeCount}</Text>
        </View>

        <View style={styles.statusCard}>
          <Text style={styles.cardTitle}>Offline Sync</Text>
          <Text style={styles.statusText}>
            Pending Updates: {queueStatus.pending}
          </Text>
          <Text style={styles.statusText}>
            Status: {queueStatus.syncing ? 'Syncing...' : 'Idle'}
          </Text>
          {queueStatus.lastSuccessfulSync && (
            <Text style={styles.statusText}>
              Last Sync: {new Date(queueStatus.lastSuccessfulSync).toLocaleTimeString()}
            </Text>
          )}
        </View>

        <Text style={styles.helperText}>
          This is a placeholder screen. P3.7 (Push Notifications) and P3.8 (Offline Support)
          infrastructure is now ready.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
  },
  statusCard: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  statusText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  tokenText: {
    fontSize: 12,
    color: '#9ca3af',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  helperText: {
    fontSize: 14,
    color: '#9ca3af',
    lineHeight: 20,
    marginTop: 20,
  },
});

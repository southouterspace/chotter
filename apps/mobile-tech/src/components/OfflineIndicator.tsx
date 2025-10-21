/**
 * OfflineIndicator Component
 * Displays offline status and pending sync information
 */

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useOfflineSync } from '../hooks/useOfflineSync';

export interface OfflineIndicatorProps {
  showWhenOnline?: boolean;
  compact?: boolean;
}

export function OfflineIndicator({ showWhenOnline = false, compact = false }: OfflineIndicatorProps) {
  const { isOnline, connectionType } = useNetworkStatus();
  const { queueStatus, sync, hasPendingUpdates } = useOfflineSync();

  // Don't show if online and showWhenOnline is false
  if (isOnline && !showWhenOnline && !hasPendingUpdates) {
    return null;
  }

  const handleSync = () => {
    if (isOnline && !queueStatus.syncing) {
      sync();
    }
  };

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        {!isOnline && (
          <View style={styles.compactOffline}>
            <View style={styles.offlineDot} />
            <Text style={styles.compactText}>Offline</Text>
          </View>
        )}
        {hasPendingUpdates && (
          <View style={styles.compactPending}>
            <Text style={styles.compactText}>{queueStatus.pending} pending</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={[styles.container, !isOnline && styles.containerOffline]}>
      <View style={styles.content}>
        <View style={styles.statusRow}>
          <View style={[styles.statusDot, isOnline ? styles.onlineDot : styles.offlineDot]} />
          <Text style={styles.statusText}>
            {isOnline ? `Online (${connectionType})` : 'Offline'}
          </Text>
        </View>

        {hasPendingUpdates && (
          <View style={styles.pendingRow}>
            <Text style={styles.pendingText}>
              {queueStatus.pending} update{queueStatus.pending !== 1 ? 's' : ''} pending sync
            </Text>

            {isOnline && (
              <TouchableOpacity
                style={styles.syncButton}
                onPress={handleSync}
                disabled={queueStatus.syncing}
              >
                {queueStatus.syncing ? (
                  <ActivityIndicator size="small" color="#0066cc" />
                ) : (
                  <Text style={styles.syncButtonText}>Sync Now</Text>
                )}
              </TouchableOpacity>
            )}
          </View>
        )}

        {!isOnline && (
          <Text style={styles.helperText}>
            Your changes will sync automatically when connection is restored
          </Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#f0f9ff',
    borderBottomWidth: 1,
    borderBottomColor: '#bfdbfe',
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  containerOffline: {
    backgroundColor: '#fef3c7',
    borderBottomColor: '#fde68a',
  },
  content: {
    gap: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  onlineDot: {
    backgroundColor: '#10b981',
  },
  offlineDot: {
    backgroundColor: '#f59e0b',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  pendingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  pendingText: {
    fontSize: 13,
    color: '#6b7280',
  },
  syncButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: '#dbeafe',
    borderRadius: 4,
    minWidth: 80,
    alignItems: 'center',
  },
  syncButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#0066cc',
  },
  helperText: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  compactOffline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#fef3c7',
    borderRadius: 4,
  },
  compactPending: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#dbeafe',
    borderRadius: 4,
  },
  compactText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1f2937',
  },
});

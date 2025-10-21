/**
 * useOfflineSync Hook
 * Manages offline queue and automatic synchronization
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useNetworkStatus } from './useNetworkStatus';
import {
  syncQueue,
  getQueueStatus,
  queueUpdate as addToQueue,
  clearQueue,
  getFailedUpdates,
} from '../services/offlineQueue';
import { OfflineQueueStatus, PendingUpdate } from '../types/offline';

export interface UseOfflineSyncOptions {
  autoSync?: boolean;
  syncInterval?: number; // milliseconds
  syncOnReconnect?: boolean;
  syncOnAppForeground?: boolean;
}

export function useOfflineSync(options: UseOfflineSyncOptions = {}) {
  const {
    autoSync = true,
    syncInterval = 30000, // 30 seconds
    syncOnReconnect = true,
    syncOnAppForeground = true,
  } = options;

  const { isOnline } = useNetworkStatus();
  const [queueStatus, setQueueStatus] = useState<OfflineQueueStatus>({
    pending: 0,
    syncing: false,
  });
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [syncError, setSyncError] = useState<Error | null>(null);

  const syncIntervalRef = useRef<NodeJS.Timeout>();
  const previousOnlineStatus = useRef(isOnline);

  /**
   * Perform sync
   */
  const performSync = useCallback(async () => {
    if (!isOnline) {
      console.log('Skipping sync - offline');
      return;
    }

    if (queueStatus.syncing) {
      console.log('Sync already in progress');
      return;
    }

    setSyncError(null);

    try {
      console.log('Starting offline queue sync...');
      const result = await syncQueue();

      console.log(`Sync completed: ${result.success} succeeded, ${result.failed} failed`);

      setLastSync(new Date());

      // Update queue status
      const status = await getQueueStatus();
      setQueueStatus(status);
    } catch (error) {
      console.error('Sync error:', error);
      setSyncError(error as Error);

      // Update status even on error
      const status = await getQueueStatus();
      setQueueStatus(status);
    }
  }, [isOnline, queueStatus.syncing]);

  /**
   * Queue an update
   */
  const queueUpdate = useCallback(
    async (update: Omit<PendingUpdate, 'id' | 'timestamp' | 'retryCount'>) => {
      await addToQueue(update);

      // Update status
      const status = await getQueueStatus();
      setQueueStatus(status);

      // Try to sync immediately if online and auto-sync enabled
      if (isOnline && autoSync) {
        performSync();
      }
    },
    [isOnline, autoSync, performSync]
  );

  /**
   * Clear queue
   */
  const handleClearQueue = useCallback(async () => {
    await clearQueue();
    const status = await getQueueStatus();
    setQueueStatus(status);
  }, []);

  /**
   * Get failed updates
   */
  const getFailedUpdatesData = useCallback(async () => {
    return await getFailedUpdates();
  }, []);

  /**
   * Update queue status
   */
  const updateStatus = useCallback(async () => {
    const status = await getQueueStatus();
    setQueueStatus(status);
  }, []);

  /**
   * Set up automatic sync when connection is restored
   */
  useEffect(() => {
    if (syncOnReconnect && isOnline && !previousOnlineStatus.current) {
      console.log('Connection restored, triggering sync...');
      performSync();
    }

    previousOnlineStatus.current = isOnline;
  }, [isOnline, syncOnReconnect, performSync]);

  /**
   * Set up periodic sync
   */
  useEffect(() => {
    if (!autoSync || !isOnline) {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
        syncIntervalRef.current = undefined;
      }
      return;
    }

    // Initial status update
    updateStatus();

    // Set up interval
    syncIntervalRef.current = setInterval(() => {
      if (isOnline && !queueStatus.syncing) {
        performSync();
      }
    }, syncInterval);

    return () => {
      if (syncIntervalRef.current) {
        clearInterval(syncIntervalRef.current);
      }
    };
  }, [autoSync, isOnline, syncInterval, queueStatus.syncing, performSync, updateStatus]);

  /**
   * Sync on app foreground
   */
  useEffect(() => {
    if (!syncOnAppForeground) return;

    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && isOnline) {
        console.log('App foregrounded, triggering sync...');
        performSync();
        updateStatus();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [syncOnAppForeground, isOnline, performSync, updateStatus]);

  return {
    // Status
    queueStatus,
    lastSync,
    syncError,
    hasPendingUpdates: queueStatus.pending > 0,

    // Actions
    sync: performSync,
    queueUpdate,
    clearQueue: handleClearQueue,
    getFailedUpdates: getFailedUpdatesData,
    refreshStatus: updateStatus,
  };
}

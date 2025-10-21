/**
 * Offline Queue Service
 * Manages queuing and syncing of updates when offline
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { PendingUpdate, UpdateAction, OfflineQueueStatus } from '../types/offline';

const OFFLINE_QUEUE_KEY = 'offline_queue';
const MAX_RETRY_COUNT = 3;

/**
 * Add update to offline queue
 */
export async function queueUpdate(update: Omit<PendingUpdate, 'id' | 'timestamp' | 'retryCount'>): Promise<void> {
  try {
    const queue = await getQueue();

    const pendingUpdate: PendingUpdate = {
      ...update,
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
    };

    queue.push(pendingUpdate);
    await saveQueue(queue);

    console.log('Update queued:', pendingUpdate);
  } catch (error) {
    console.error('Error queuing update:', error);
    throw error;
  }
}

/**
 * Get current offline queue
 */
export async function getQueue(): Promise<PendingUpdate[]> {
  try {
    const queueJson = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    return queueJson ? JSON.parse(queueJson) : [];
  } catch (error) {
    console.error('Error getting queue:', error);
    return [];
  }
}

/**
 * Save queue to storage
 */
async function saveQueue(queue: PendingUpdate[]): Promise<void> {
  await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(queue));
}

/**
 * Get queue status
 */
export async function getQueueStatus(): Promise<OfflineQueueStatus> {
  const queue = await getQueue();
  const status = await AsyncStorage.getItem('offline_queue_status');
  const parsedStatus = status ? JSON.parse(status) : {};

  return {
    pending: queue.length,
    syncing: parsedStatus.syncing || false,
    lastSyncAttempt: parsedStatus.lastSyncAttempt,
    lastSuccessfulSync: parsedStatus.lastSuccessfulSync,
  };
}

/**
 * Update queue status
 */
async function updateQueueStatus(status: Partial<OfflineQueueStatus>): Promise<void> {
  const current = await getQueueStatus();
  const updated = { ...current, ...status };
  await AsyncStorage.setItem('offline_queue_status', JSON.stringify(updated));
}

/**
 * Sync all pending updates
 */
export async function syncQueue(): Promise<{ success: number; failed: number }> {
  const queue = await getQueue();

  if (queue.length === 0) {
    console.log('Queue is empty, nothing to sync');
    return { success: 0, failed: 0 };
  }

  console.log(`Syncing ${queue.length} pending updates...`);

  await updateQueueStatus({
    syncing: true,
    lastSyncAttempt: Date.now(),
  });

  let successCount = 0;
  let failedCount = 0;
  const remainingQueue: PendingUpdate[] = [];

  for (const update of queue) {
    try {
      await processUpdate(update);
      successCount++;
      console.log('Successfully synced update:', update.id);
    } catch (error) {
      console.error('Failed to sync update:', update.id, error);
      failedCount++;

      // Increment retry count
      const updatedUpdate = {
        ...update,
        retryCount: update.retryCount + 1,
        error: error instanceof Error ? error.message : 'Unknown error',
      };

      // Keep in queue if retry count not exceeded
      if (updatedUpdate.retryCount < MAX_RETRY_COUNT) {
        remainingQueue.push(updatedUpdate);
      } else {
        console.error('Max retry count exceeded for update:', update.id);
        // Optionally store failed updates separately for manual review
        await storeFailed Update(updatedUpdate);
      }
    }
  }

  // Update queue with remaining items
  await saveQueue(remainingQueue);

  await updateQueueStatus({
    syncing: false,
    lastSuccessfulSync: successCount > 0 ? Date.now() : undefined,
  });

  console.log(`Sync complete: ${successCount} successful, ${failedCount} failed, ${remainingQueue.length} remaining`);

  return { success: successCount, failed: failedCount };
}

/**
 * Process a single update
 */
async function processUpdate(update: PendingUpdate): Promise<void> {
  const { table, action, data, recordId } = update;

  switch (action) {
    case UpdateAction.INSERT:
      const { error: insertError } = await supabase
        .from(table)
        .insert(data);

      if (insertError) throw insertError;
      break;

    case UpdateAction.UPDATE:
      if (!recordId) {
        throw new Error('Record ID required for UPDATE action');
      }

      const { error: updateError } = await supabase
        .from(table)
        .update(data)
        .eq('id', recordId);

      if (updateError) throw updateError;
      break;

    case UpdateAction.DELETE:
      if (!recordId) {
        throw new Error('Record ID required for DELETE action');
      }

      const { error: deleteError } = await supabase
        .from(table)
        .delete()
        .eq('id', recordId);

      if (deleteError) throw deleteError;
      break;

    default:
      throw new Error(`Unknown action: ${action}`);
  }
}

/**
 * Store failed update for manual review
 */
async function storeFailedUpdate(update: PendingUpdate): Promise<void> {
  try {
    const failedUpdatesJson = await AsyncStorage.getItem('failed_updates');
    const failedUpdates = failedUpdatesJson ? JSON.parse(failedUpdatesJson) : [];

    failedUpdates.push({
      ...update,
      failedAt: Date.now(),
    });

    // Keep only last 100 failed updates
    const trimmed = failedUpdates.slice(-100);

    await AsyncStorage.setItem('failed_updates', JSON.stringify(trimmed));
  } catch (error) {
    console.error('Error storing failed update:', error);
  }
}

/**
 * Clear the offline queue
 */
export async function clearQueue(): Promise<void> {
  await AsyncStorage.removeItem(OFFLINE_QUEUE_KEY);
  await updateQueueStatus({
    pending: 0,
    syncing: false,
  });
}

/**
 * Get failed updates
 */
export async function getFailedUpdates(): Promise<PendingUpdate[]> {
  try {
    const failedUpdatesJson = await AsyncStorage.getItem('failed_updates');
    return failedUpdatesJson ? JSON.parse(failedUpdatesJson) : [];
  } catch (error) {
    console.error('Error getting failed updates:', error);
    return [];
  }
}

/**
 * Retry a specific failed update
 */
export async function retryFailedUpdate(updateId: string): Promise<boolean> {
  try {
    const failedUpdates = await getFailedUpdates();
    const update = failedUpdates.find((u) => u.id === updateId);

    if (!update) {
      throw new Error('Failed update not found');
    }

    // Reset retry count and add back to queue
    const resetUpdate = {
      ...update,
      retryCount: 0,
      error: undefined,
    };

    await queueUpdate(resetUpdate);

    // Remove from failed updates
    const remaining = failedUpdates.filter((u) => u.id !== updateId);
    await AsyncStorage.setItem('failed_updates', JSON.stringify(remaining));

    return true;
  } catch (error) {
    console.error('Error retrying failed update:', error);
    return false;
  }
}

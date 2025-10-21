/**
 * Types for offline queue and synchronization
 */

export enum UpdateAction {
  INSERT = 'insert',
  UPDATE = 'update',
  DELETE = 'delete',
}

export interface PendingUpdate {
  id: string;
  table: string;
  action: UpdateAction;
  data: Record<string, any>;
  recordId?: string;
  timestamp: number;
  retryCount: number;
  error?: string;
}

export interface OfflineQueueStatus {
  pending: number;
  syncing: boolean;
  lastSyncAttempt?: number;
  lastSuccessfulSync?: number;
}

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean;
  type?: string;
}

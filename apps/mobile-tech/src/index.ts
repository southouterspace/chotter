/**
 * Main exports for the mobile app
 */

// Components
export { OfflineIndicator } from './components/OfflineIndicator';
export { NotificationSettings } from './components/NotificationSettings';

// Hooks
export { useNetworkStatus } from './hooks/useNetworkStatus';
export { useNotifications } from './hooks/useNotifications';
export { useOfflineSync } from './hooks/useOfflineSync';

// Services
export * from './services/notifications';
export * from './services/offlineQueue';

// Lib
export { supabase, getCurrentUser, getTechnicianProfile } from './lib/supabase';
export { queryClient, asyncStoragePersister, clearQueryCache } from './lib/queryClient';

// Types
export * from './types/notifications';
export * from './types/offline';

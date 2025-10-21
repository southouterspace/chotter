/**
 * TanStack Query Client Configuration
 * Configured with AsyncStorage persistence for offline support
 */

import { QueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createAsyncStoragePersister } from '@tanstack/query-async-storage-persister';

/**
 * Create Query Client with optimized settings for mobile
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Cache time - how long to keep unused data in cache
      gcTime: 1000 * 60 * 60 * 24, // 24 hours (formerly cacheTime)

      // Stale time - how long before data is considered stale
      staleTime: 1000 * 60 * 5, // 5 minutes

      // Retry failed requests
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Network mode - continue to show cached data when offline
      networkMode: 'offlineFirst',

      // Refetch on window focus (when app comes to foreground)
      refetchOnWindowFocus: true,

      // Refetch on reconnect
      refetchOnReconnect: true,

      // Don't refetch on mount if data is not stale
      refetchOnMount: false,
    },
    mutations: {
      // Network mode for mutations
      networkMode: 'offlineFirst',

      // Retry mutations
      retry: 1,
    },
  },
});

/**
 * Create AsyncStorage persister for query cache
 */
export const asyncStoragePersister = createAsyncStoragePersister({
  storage: AsyncStorage,
  key: 'CHOTTER_QUERY_CACHE',
  throttleTime: 1000, // Throttle writes to storage
});

/**
 * Clear all cached data
 */
export async function clearQueryCache() {
  await queryClient.clear();
  await AsyncStorage.removeItem('CHOTTER_QUERY_CACHE');
}

/**
 * Invalidate specific queries
 */
export function invalidateQueries(queryKey: string[]) {
  return queryClient.invalidateQueries({ queryKey });
}

/**
 * Prefetch query data
 */
export function prefetchQuery<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options?: { staleTime?: number }
) {
  return queryClient.prefetchQuery({
    queryKey,
    queryFn,
    staleTime: options?.staleTime,
  });
}

/**
 * Get cached query data
 */
export function getQueryData<T>(queryKey: string[]): T | undefined {
  return queryClient.getQueryData(queryKey);
}

/**
 * Set query data manually
 */
export function setQueryData<T>(queryKey: string[], data: T) {
  return queryClient.setQueryData(queryKey, data);
}

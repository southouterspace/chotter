/**
 * useNetworkStatus Hook
 * Monitors network connectivity and triggers sync when connection is restored
 */

import { useEffect, useState } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { NetworkStatus } from '../types/offline';

export function useNetworkStatus() {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: true,
  });

  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    // Get initial network state
    NetInfo.fetch().then((state) => {
      updateNetworkStatus(state);
    });

    // Subscribe to network state changes
    const unsubscribe = NetInfo.addEventListener((state) => {
      updateNetworkStatus(state);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const updateNetworkStatus = (state: NetInfoState) => {
    const status: NetworkStatus = {
      isConnected: state.isConnected ?? false,
      isInternetReachable: state.isInternetReachable ?? false,
      type: state.type,
    };

    setNetworkStatus(status);

    // Consider online if connected and internet is reachable
    // or if we can't determine (give benefit of doubt)
    const online =
      (status.isConnected && status.isInternetReachable !== false) ||
      (status.isConnected && status.isInternetReachable === null);

    setIsOnline(online);
  };

  return {
    networkStatus,
    isOnline,
    isOffline: !isOnline,
    isConnected: networkStatus.isConnected,
    isInternetReachable: networkStatus.isInternetReachable,
    connectionType: networkStatus.type,
  };
}

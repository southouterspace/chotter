/**
 * Root Layout
 * Sets up providers and global configuration
 */

import React, { useEffect } from 'react';
import { Slot } from 'expo-router';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { queryClient, asyncStoragePersister } from '../lib/queryClient';
import { configureNotificationHandler } from '../services/notifications';

export default function RootLayout() {
  useEffect(() => {
    // Configure notification handler on app start
    configureNotificationHandler();
  }, []);

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister: asyncStoragePersister }}
    >
      <Slot />
    </PersistQueryClientProvider>
  );
}

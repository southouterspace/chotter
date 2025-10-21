# Chotter Mobile Tech App

React Native mobile application for field technicians using Expo and React Native.

## Features Implemented

### P3.7: Push Notifications ✅
- Expo Notifications integration
- Device token registration and storage
- Notification permissions handling
- Foreground, background, and closed app notification support
- Android notification channels (default, emergency, route_updates)
- Notification history storage
- Badge count management
- Navigation handling based on notification type

### P3.8: Offline Support ✅
- TanStack Query with AsyncStorage persistence
- Offline queue for pending updates
- Automatic sync when connection restored
- Network status monitoring
- Offline indicator UI
- Failed update retry mechanism
- App state-aware synchronization

## Project Structure

```
apps/mobile-tech/
├── src/
│   ├── app/              # Expo Router screens
│   │   ├── _layout.tsx   # Root layout with providers
│   │   └── index.tsx     # Home screen
│   ├── components/       # React components
│   │   ├── NotificationSettings.tsx
│   │   └── OfflineIndicator.tsx
│   ├── hooks/           # Custom React hooks
│   │   ├── useNetworkStatus.ts
│   │   ├── useNotifications.ts
│   │   └── useOfflineSync.ts
│   ├── lib/             # Libraries and configuration
│   │   ├── queryClient.ts
│   │   └── supabase.ts
│   ├── services/        # Business logic services
│   │   ├── notifications.ts
│   │   └── offlineQueue.ts
│   ├── types/           # TypeScript types
│   │   ├── notifications.ts
│   │   └── offline.ts
│   └── utils/           # Utility functions
├── assets/              # Images and static assets
├── app.json            # Expo configuration
├── package.json        # Dependencies
└── tsconfig.json       # TypeScript configuration
```

## Installation

```bash
cd apps/mobile-tech
npm install
```

## Running the App

### iOS Simulator
```bash
npm run ios
```

### Android Emulator
```bash
npm run android
```

### Web (for testing)
```bash
npm run web
```

### Development Server
```bash
npm start
```

## Environment Variables

Create a `.env` file in the mobile-tech directory:

```env
EXPO_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Database Migration

The push notification feature requires a database migration:

```bash
# Apply migration (from project root)
supabase db push

# Or apply specific migration
supabase db push --file supabase/migrations/20251020235900_add_push_token_to_technicians.sql
```

This migration adds:
- `push_token` column to store Expo push tokens
- `push_enabled` column for user notification preferences
- `last_token_update` timestamp
- Automatic trigger to update timestamp

## Push Notifications

### Registration

Push notifications are automatically registered when the app starts if a technician ID is provided:

```typescript
import { useNotifications } from './hooks/useNotifications';

function MyComponent() {
  const { isRegistered, pushToken } = useNotifications({
    technicianId: 'tech-id-123',
    autoRegister: true,
  });

  // ...
}
```

### Manual Registration

```typescript
import { registerForPushNotifications } from './services/notifications';

const token = await registerForPushNotifications('technician-id');
```

### Notification Types

The app supports these notification types:
- `ROUTE_UPDATED` - Route changes or updates
- `NEW_APPOINTMENT` - New appointment added
- `APPOINTMENT_CANCELLED` - Appointment cancelled
- `DELAY_ALERT` - Running behind schedule
- `EMERGENCY_REQUEST` - High-priority emergency
- `APPROACHING_JOB_SITE` - Near next appointment
- `CUSTOMER_MESSAGE` - Message from customer

### Sending Notifications

Use the Expo Push API to send notifications:

```bash
curl -H "Content-Type: application/json" -X POST "https://exp.host/--/api/v2/push/send" -d '{
  "to": "ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]",
  "title": "Route Updated",
  "body": "Your route has been updated with 2 new appointments",
  "data": {
    "type": "route_updated",
    "message": "Your route has been updated"
  }
}'
```

### Testing Notifications

1. **Physical Device Required**: Push notifications only work on physical devices
2. **Get Push Token**: Launch app and check console for token
3. **Send Test Notification**: Use Expo push tool or API
4. **Test Scenarios**:
   - App in foreground (notification should appear as alert)
   - App in background (notification in tray)
   - App closed (notification wakes app)
   - Tap notification (should navigate to correct screen)

## Offline Support

### Queuing Updates

Queue updates when offline:

```typescript
import { useOfflineSync } from './hooks/useOfflineSync';

function MyComponent() {
  const { queueUpdate } = useOfflineSync();

  const handleStatusUpdate = async () => {
    await queueUpdate({
      table: 'appointments',
      action: UpdateAction.UPDATE,
      data: { status: 'in_progress' },
      recordId: 'appointment-123',
    });
  };
}
```

### Automatic Sync

Sync happens automatically:
- When connection is restored
- Every 30 seconds (configurable)
- When app comes to foreground
- Manually via sync button

### Network Status

Monitor network status:

```typescript
import { useNetworkStatus } from './hooks/useNetworkStatus';

function MyComponent() {
  const { isOnline, isOffline, connectionType } = useNetworkStatus();

  return (
    <Text>{isOnline ? 'Online' : 'Offline'}</Text>
  );
}
```

### Offline Indicator

Display offline status to users:

```typescript
import { OfflineIndicator } from './components/OfflineIndicator';

function MyScreen() {
  return (
    <View>
      <OfflineIndicator />
      {/* Rest of screen */}
    </View>
  );
}
```

### Testing Offline Mode

1. **Turn off network**: Disable WiFi and cellular
2. **Make changes**: Update appointment status, check-in, etc.
3. **Verify queuing**: Check that updates are queued (shown in indicator)
4. **Restore connection**: Re-enable network
5. **Verify sync**: Updates should sync automatically

## Notification Settings

Add notification settings to your profile/settings screen:

```typescript
import { NotificationSettings } from './components/NotificationSettings';

function ProfileScreen() {
  return (
    <NotificationSettings
      technicianId="tech-id-123"
      onSettingsChange={(settings) => {
        console.log('Settings changed:', settings);
      }}
    />
  );
}
```

## Architecture

### Query Client (TanStack Query)

- **Cache Time**: 24 hours
- **Stale Time**: 5 minutes
- **Network Mode**: Offline-first
- **Persistence**: AsyncStorage
- **Retry Logic**: 2 retries with exponential backoff

### Offline Queue

- **Storage**: AsyncStorage
- **Max Retries**: 3 attempts per update
- **Sync Interval**: 30 seconds (when online)
- **Failed Updates**: Stored separately for manual review

### Notification Handler

- **Foreground**: Display alert with sound
- **Background**: Show in notification tray
- **Closed**: Wake app and show notification
- **Channels** (Android):
  - Default: General notifications
  - Emergency: High-priority alerts
  - Route Updates: Route and appointment changes

## Development

### Add New Notification Type

1. Add type to `src/types/notifications.ts`:
```typescript
export enum NotificationType {
  // ...existing types
  MY_NEW_TYPE = 'my_new_type',
}
```

2. Add navigation handler in `src/hooks/useNotifications.ts`:
```typescript
case NotificationType.MY_NEW_TYPE:
  router.push('/my-new-screen');
  break;
```

3. Add setting in `src/components/NotificationSettings.tsx` if needed

### Add Custom Query

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from './lib/supabase';

function useMyData() {
  return useQuery({
    queryKey: ['my-data'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('my_table')
        .select('*');

      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
```

## Troubleshooting

### Push Notifications Not Working

1. **Check device**: Must be physical device, not simulator
2. **Check permissions**: Settings > App > Notifications
3. **Check token**: Verify token saved to database
4. **Check network**: Ensure device has internet
5. **Check logs**: View Expo logs for errors

### Offline Sync Not Working

1. **Check queue**: Verify updates are being queued
2. **Check network status**: Ensure network detection working
3. **Check sync interval**: May need to wait for next sync cycle
4. **Manual sync**: Try manual sync button
5. **Check logs**: View AsyncStorage for queue status

### Build Issues

```bash
# Clear cache and reinstall
rm -rf node_modules
npm install

# Clear Expo cache
npx expo start -c
```

## Testing Checklist

### P3.7 Acceptance Criteria
- [ ] Notifications requested on first launch
- [ ] Device token saved to database
- [ ] Notifications received when app in background
- [ ] Notifications displayed when app in foreground
- [ ] Tapping notification opens relevant screen
- [ ] Settings toggle for notifications
- [ ] Android notification channels configured

### P3.8 Acceptance Criteria
- [ ] Can view appointments offline
- [ ] Status updates queued when offline
- [ ] Queued updates sync when online
- [ ] Offline indicator displays
- [ ] No crashes when offline
- [ ] Data persists between app restarts
- [ ] Network state changes handled gracefully

## Next Steps

After P3.7 and P3.8, implement:
- **P3.9**: Profile & Settings Screen (integrate NotificationSettings)
- **P3.10**: Map Integration (show route and job sites)
- **P3.11**: Camera & Photo Upload (job site photos)
- **P3.12**: Digital Signature Capture (customer signatures)

## Resources

- [Expo Documentation](https://docs.expo.dev/)
- [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [TanStack Query](https://tanstack.com/query/latest/docs/react/overview)
- [React Native](https://reactnative.dev/)
- [Supabase JS Client](https://supabase.com/docs/reference/javascript/introduction)

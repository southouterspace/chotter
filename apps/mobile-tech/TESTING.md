# Testing Guide: P3.7 & P3.8

This guide provides step-by-step instructions for testing Push Notifications and Offline Support.

## Prerequisites

- Physical iOS or Android device (push notifications don't work in simulator)
- Device connected to development machine
- Expo Go app installed OR development build
- Supabase local instance running

## Setup

1. **Start Supabase**:
```bash
cd /path/to/chotter
supabase start
```

2. **Apply Migration**:
```bash
supabase db reset
# or
supabase db push
```

3. **Start Expo Dev Server**:
```bash
cd apps/mobile-tech
npm start
```

4. **Launch on Device**:
   - Scan QR code with Expo Go
   - OR use development build

## P3.7: Push Notifications Testing

### Test 1: Permission Request
**Expected**: App requests notification permission on first launch

**Steps**:
1. Fresh install app or clear app data
2. Launch app
3. Should see iOS/Android permission dialog

**Pass Criteria**:
- [ ] Permission dialog appears
- [ ] Selecting "Allow" grants permissions
- [ ] Selecting "Don't Allow" is handled gracefully

### Test 2: Device Token Registration
**Expected**: Device token is obtained and saved to database

**Steps**:
1. Grant notification permissions
2. Check app logs for push token
3. Query database for token

```sql
SELECT id, push_token, push_enabled, last_token_update
FROM technicians
WHERE push_token IS NOT NULL;
```

**Pass Criteria**:
- [ ] Push token appears in logs
- [ ] Token saved to database
- [ ] `push_enabled` is true
- [ ] `last_token_update` is recent

### Test 3: Foreground Notifications
**Expected**: Notification displayed while app is open

**Steps**:
1. Keep app in foreground
2. Send test notification using Expo tool:

```bash
curl -H "Content-Type: application/json" -X POST https://exp.host/--/api/v2/push/send -d '{
  "to": "ExponentPushToken[YOUR_TOKEN_HERE]",
  "title": "Test Foreground",
  "body": "This is a test notification",
  "data": {
    "type": "route_updated",
    "message": "Test message"
  }
}'
```

**Pass Criteria**:
- [ ] Notification alert appears
- [ ] Sound plays
- [ ] Notification stored in app

### Test 4: Background Notifications
**Expected**: Notification appears in system tray when app is backgrounded

**Steps**:
1. Send app to background (home screen)
2. Send test notification
3. Check notification tray

**Pass Criteria**:
- [ ] Notification appears in tray
- [ ] Sound/vibration occurs
- [ ] Badge count increases

### Test 5: Notification Tap Navigation
**Expected**: Tapping notification opens relevant screen

**Steps**:
1. Send notification with appointment data:

```bash
curl -H "Content-Type: application/json" -X POST https://exp.host/--/api/v2/push/send -d '{
  "to": "ExponentPushToken[YOUR_TOKEN_HERE]",
  "title": "New Appointment",
  "body": "You have a new appointment",
  "data": {
    "type": "new_appointment",
    "appointmentId": "123",
    "message": "New appointment added"
  }
}'
```

2. Tap notification from tray

**Pass Criteria**:
- [ ] App opens
- [ ] Navigates to appointments screen
- [ ] Correct appointment shown (if screen exists)

### Test 6: Notification Settings
**Expected**: User can toggle notification preferences

**Steps**:
1. Open notification settings screen
2. Toggle master switch off
3. Toggle back on
4. Toggle individual notification types

**Pass Criteria**:
- [ ] Settings persist after app restart
- [ ] Master toggle disables all notifications
- [ ] Individual toggles work independently
- [ ] Reset to defaults works

### Test 7: Android Notification Channels
**Expected**: Different notification channels on Android

**Steps** (Android only):
1. Send emergency notification
2. Send route update notification
3. Check Settings > Apps > Chotter > Notifications

**Pass Criteria**:
- [ ] "Emergency Alerts" channel exists
- [ ] "Route Updates" channel exists
- [ ] "Default" channel exists
- [ ] Each has different importance levels

### Test 8: Notification History
**Expected**: App stores received notifications

**Steps**:
1. Send multiple test notifications
2. Check notification storage (via app UI or logs)
3. Restart app

**Pass Criteria**:
- [ ] Notifications stored locally
- [ ] History persists across app restarts
- [ ] Limited to 50 most recent
- [ ] Can mark notifications as read

## P3.8: Offline Support Testing

### Test 9: Query Cache Persistence
**Expected**: Data cached and available offline

**Steps**:
1. Load app with network connection
2. Navigate to screens with data
3. Force close app
4. Turn off WiFi and cellular
5. Relaunch app

**Pass Criteria**:
- [ ] Previously loaded data displays
- [ ] No network errors
- [ ] Offline indicator shows
- [ ] App remains functional

### Test 10: Offline Queue - Create Update
**Expected**: Updates queued when offline

**Steps**:
1. Turn off network
2. Make a change (e.g., update appointment status)
3. Check queue status

**Pass Criteria**:
- [ ] Update added to queue
- [ ] Pending count increases
- [ ] No error shown to user
- [ ] Offline indicator shows pending updates

### Test 11: Automatic Sync on Reconnect
**Expected**: Queue syncs when network restored

**Steps**:
1. Turn off network
2. Make 2-3 changes
3. Verify queue has 3 pending updates
4. Turn network back on
5. Wait for sync (or trigger manual sync)

**Pass Criteria**:
- [ ] Sync starts automatically
- [ ] Updates applied to database
- [ ] Queue cleared
- [ ] Success message/indicator

### Test 12: Failed Update Retry
**Expected**: Failed updates retry with exponential backoff

**Steps**:
1. Queue an update that will fail (e.g., invalid data)
2. Turn on network
3. Wait for sync attempt

**Pass Criteria**:
- [ ] Sync attempted
- [ ] Failure logged
- [ ] Update remains in queue
- [ ] Retry count incremented
- [ ] After 3 failures, moved to failed updates

### Test 13: Network Status Detection
**Expected**: App detects network changes

**Steps**:
1. Start with WiFi on
2. Turn WiFi off
3. Turn cellular off
4. Turn WiFi back on
5. Check network status display

**Pass Criteria**:
- [ ] Online status shown initially
- [ ] Offline status shown when disconnected
- [ ] Connection type displayed (WiFi/Cellular)
- [ ] Status updates immediately

### Test 14: Offline Indicator UI
**Expected**: Visual indicator shows offline status

**Steps**:
1. Turn off network
2. Check for offline indicator
3. Make some changes
4. Turn network back on

**Pass Criteria**:
- [ ] Orange/yellow offline indicator appears
- [ ] Pending count displayed
- [ ] "Sync Now" button appears when online
- [ ] Indicator dismisses after successful sync

### Test 15: Manual Sync
**Expected**: User can manually trigger sync

**Steps**:
1. Queue some updates offline
2. Turn network on
3. Tap "Sync Now" button

**Pass Criteria**:
- [ ] Sync starts immediately
- [ ] Loading indicator shown
- [ ] Updates applied
- [ ] Success feedback

### Test 16: App Foreground Sync
**Expected**: Sync when app comes to foreground

**Steps**:
1. Queue updates offline
2. Turn network on
3. Send app to background
4. Wait 5 seconds
5. Bring app to foreground

**Pass Criteria**:
- [ ] Sync triggered on foreground
- [ ] Updates applied
- [ ] Queue cleared

### Test 17: Periodic Sync
**Expected**: Queue syncs every 30 seconds when online

**Steps**:
1. Queue some updates
2. Go online
3. Wait 30 seconds (don't interact)

**Pass Criteria**:
- [ ] Automatic sync after ~30 seconds
- [ ] No user interaction needed
- [ ] Sync completes successfully

### Test 18: Multiple Queued Updates
**Expected**: Multiple updates sync in order

**Steps**:
1. Go offline
2. Create 5 different updates
3. Go online
4. Observe sync

**Pass Criteria**:
- [ ] All updates processed
- [ ] Order maintained
- [ ] All succeed
- [ ] Queue empty after sync

### Test 19: Failed Update Storage
**Expected**: Failed updates stored separately

**Steps**:
1. Queue update that will fail validation
2. Let it exceed retry count (3 attempts)
3. Check failed updates storage

**Pass Criteria**:
- [ ] Update moved to failed storage
- [ ] Removed from active queue
- [ ] Error message stored
- [ ] Can be retried manually

### Test 20: Clear Cache
**Expected**: User can clear all cached data

**Steps**:
1. Load data from server
2. Clear cache (via settings or dev menu)
3. Observe app state

**Pass Criteria**:
- [ ] Cache cleared
- [ ] Fresh data loaded
- [ ] No errors
- [ ] Query history reset

## Integration Testing

### Test 21: Offline + Notification
**Expected**: Receive notification while offline, sync when online

**Steps**:
1. Go offline
2. Send push notification
3. Queue some updates
4. Go online

**Pass Criteria**:
- [ ] Notification received offline
- [ ] Notification stored
- [ ] Updates queued
- [ ] Both work independently
- [ ] Sync happens when online

### Test 22: Background Notification + Sync
**Expected**: Notification can trigger while sync is running

**Steps**:
1. Queue many updates
2. Go online to start sync
3. Send push notification during sync

**Pass Criteria**:
- [ ] Notification received
- [ ] Sync continues
- [ ] No conflicts
- [ ] Both complete successfully

### Test 23: Settings Persistence Offline
**Expected**: Notification settings save while offline

**Steps**:
1. Go offline
2. Change notification settings
3. Restart app

**Pass Criteria**:
- [ ] Settings saved locally
- [ ] Settings persist offline
- [ ] Sync to server when online
- [ ] No data loss

## Performance Testing

### Test 24: Large Queue Performance
**Expected**: App handles large queue gracefully

**Steps**:
1. Queue 50+ updates offline
2. Go online
3. Observe sync performance

**Pass Criteria**:
- [ ] Sync completes successfully
- [ ] App remains responsive
- [ ] No crashes
- [ ] Progress visible to user

### Test 25: Cache Size Management
**Expected**: Cache doesn't grow indefinitely

**Steps**:
1. Load lots of data
2. Check AsyncStorage size
3. Restart app multiple times

**Pass Criteria**:
- [ ] Cache has reasonable size limit
- [ ] Old data evicted
- [ ] App performs well
- [ ] No storage warnings

## Error Scenarios

### Test 26: Network Interruption During Sync
**Expected**: Graceful handling of connection loss during sync

**Steps**:
1. Queue updates
2. Start sync
3. Turn off network mid-sync

**Pass Criteria**:
- [ ] Sync pauses/fails gracefully
- [ ] Partial updates handled
- [ ] Queue preserved
- [ ] Retry when online

### Test 27: Invalid Push Token
**Expected**: Handle expired/invalid tokens

**Steps**:
1. Manually set invalid token in DB
2. Try to send notification

**Pass Criteria**:
- [ ] Error logged
- [ ] Token refresh attempted
- [ ] User notified if needed
- [ ] No app crash

### Test 28: Database Offline Error
**Expected**: Handle database unavailable

**Steps**:
1. Simulate database connection error
2. Try to sync

**Pass Criteria**:
- [ ] Error caught
- [ ] User notified
- [ ] Queue preserved
- [ ] Retry scheduled

## Sign-Off Checklist

### P3.7: Push Notifications
- [ ] All notification tests pass (Tests 1-8)
- [ ] Works on iOS
- [ ] Works on Android
- [ ] Settings persist
- [ ] Navigation works
- [ ] No crashes

### P3.8: Offline Support
- [ ] All offline tests pass (Tests 9-20)
- [ ] Queue works correctly
- [ ] Sync is reliable
- [ ] Network detection accurate
- [ ] UI indicators work
- [ ] No data loss

### Integration
- [ ] Integration tests pass (Tests 21-23)
- [ ] Performance acceptable (Tests 24-25)
- [ ] Error handling works (Tests 26-28)
- [ ] Documentation complete
- [ ] Code reviewed

## Reporting Issues

When reporting test failures, include:
1. Test number and name
2. Device type and OS version
3. Network conditions
4. Steps to reproduce
5. Expected vs actual behavior
6. Screenshots/logs
7. Error messages

## Environment Details

For each test session, record:
- Date/Time:
- Tester:
- Device:
- OS Version:
- App Version:
- Network Type:
- Supabase Version:

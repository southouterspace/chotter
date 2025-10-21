/**
 * Push Notification Service
 * Handles registration, permissions, and notification handling for the mobile app
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { NotificationData, NotificationType, StoredNotification } from '../types/notifications';

const STORED_NOTIFICATIONS_KEY = 'stored_notifications';
const MAX_STORED_NOTIFICATIONS = 50;

/**
 * Configure notification handler
 * Controls how notifications are displayed when app is in foreground
 */
export function configureNotificationHandler() {
  Notifications.setNotificationHandler({
    handleNotification: async (notification) => {
      // Always show notification, even in foreground
      return {
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
      };
    },
  });
}

/**
 * Register device for push notifications
 * Requests permissions and obtains push token
 */
export async function registerForPushNotifications(
  technicianId: string
): Promise<string | null> {
  // Check if running on physical device
  if (!Device.isDevice) {
    console.warn('Push notifications only work on physical devices');
    return null;
  }

  try {
    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permissions if not already granted
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Failed to get push notification permissions');
      return null;
    }

    // Get the push token
    const projectId = Constants.expoConfig?.extra?.eas?.projectId || 'chotter-tech-mobile';

    const token = await Notifications.getExpoPushTokenAsync({
      projectId,
    });

    console.log('Push token obtained:', token.data);

    // Save token to technician record
    const { error } = await supabase
      .from('technicians')
      .update({
        push_token: token.data,
        push_enabled: true,
        last_token_update: new Date().toISOString(),
      })
      .eq('id', technicianId);

    if (error) {
      console.error('Error saving push token to database:', error);
      throw error;
    }

    // Configure Android notification channel
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });

      // Create channel for high-priority notifications
      await Notifications.setNotificationChannelAsync('emergency', {
        name: 'Emergency Alerts',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 250, 500],
        lightColor: '#FF0000',
        sound: 'default',
      });

      // Create channel for route updates
      await Notifications.setNotificationChannelAsync('route_updates', {
        name: 'Route Updates',
        importance: Notifications.AndroidImportance.HIGH,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#0000FF',
      });
    }

    return token.data;
  } catch (error) {
    console.error('Error registering for push notifications:', error);
    return null;
  }
}

/**
 * Update push notification settings for a technician
 */
export async function updatePushSettings(
  technicianId: string,
  enabled: boolean
): Promise<void> {
  const { error } = await supabase
    .from('technicians')
    .update({ push_enabled: enabled })
    .eq('id', technicianId);

  if (error) {
    console.error('Error updating push settings:', error);
    throw error;
  }
}

/**
 * Handle notification received while app is in foreground
 */
export function addNotificationReceivedListener(
  handler: (notification: Notifications.Notification) => void
): Notifications.Subscription {
  return Notifications.addNotificationReceivedListener(handler);
}

/**
 * Handle notification response (user tapped notification)
 */
export function addNotificationResponseReceivedListener(
  handler: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
  return Notifications.addNotificationResponseReceivedListener(handler);
}

/**
 * Store notification locally for history
 */
export async function storeNotification(notification: NotificationData): Promise<void> {
  try {
    const stored = await getStoredNotifications();

    const newNotification: StoredNotification = {
      id: `${Date.now()}-${Math.random()}`,
      data: notification,
      read: false,
      receivedAt: new Date().toISOString(),
    };

    // Add to beginning of array and limit to MAX_STORED_NOTIFICATIONS
    const updated = [newNotification, ...stored].slice(0, MAX_STORED_NOTIFICATIONS);

    await AsyncStorage.setItem(STORED_NOTIFICATIONS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error storing notification:', error);
  }
}

/**
 * Get stored notifications
 */
export async function getStoredNotifications(): Promise<StoredNotification[]> {
  try {
    const stored = await AsyncStorage.getItem(STORED_NOTIFICATIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error getting stored notifications:', error);
    return [];
  }
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(id: string): Promise<void> {
  try {
    const stored = await getStoredNotifications();
    const updated = stored.map((n) =>
      n.id === id ? { ...n, read: true } : n
    );
    await AsyncStorage.setItem(STORED_NOTIFICATIONS_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
}

/**
 * Clear all stored notifications
 */
export async function clearStoredNotifications(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORED_NOTIFICATIONS_KEY);
  } catch (error) {
    console.error('Error clearing stored notifications:', error);
  }
}

/**
 * Get notification badge count
 */
export async function getBadgeCount(): Promise<number> {
  try {
    const notifications = await getStoredNotifications();
    return notifications.filter((n) => !n.read).length;
  } catch (error) {
    console.error('Error getting badge count:', error);
    return 0;
  }
}

/**
 * Update app badge count
 */
export async function updateBadgeCount(): Promise<void> {
  try {
    const count = await getBadgeCount();
    await Notifications.setBadgeCountAsync(count);
  } catch (error) {
    console.error('Error updating badge count:', error);
  }
}

/**
 * Schedule a local notification
 */
export async function scheduleLocalNotification(
  title: string,
  body: string,
  data: NotificationData,
  trigger?: Notifications.NotificationTriggerInput
): Promise<string> {
  const channelId = getChannelIdForType(data.type);

  return await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
      data: data as any,
      sound: true,
      priority: Notifications.AndroidNotificationPriority.HIGH,
      ...(Platform.OS === 'android' && { channelId }),
    },
    trigger: trigger || null, // null means immediate
  });
}

/**
 * Get appropriate channel ID for notification type (Android)
 */
function getChannelIdForType(type: NotificationType): string {
  switch (type) {
    case NotificationType.EMERGENCY_REQUEST:
      return 'emergency';
    case NotificationType.ROUTE_UPDATED:
    case NotificationType.NEW_APPOINTMENT:
    case NotificationType.APPOINTMENT_CANCELLED:
      return 'route_updates';
    default:
      return 'default';
  }
}

/**
 * Cancel scheduled notification
 */
export async function cancelNotification(notificationId: string): Promise<void> {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
}

/**
 * Cancel all scheduled notifications
 */
export async function cancelAllNotifications(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}

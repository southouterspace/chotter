/**
 * useNotifications Hook
 * Manages push notification registration, handling, and navigation
 */

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import {
  configureNotificationHandler,
  registerForPushNotifications,
  addNotificationReceivedListener,
  addNotificationResponseReceivedListener,
  storeNotification,
  getBadgeCount,
} from '../services/notifications';
import { NotificationData, NotificationType } from '../types/notifications';

export interface UseNotificationsOptions {
  technicianId?: string;
  enabled?: boolean;
  autoRegister?: boolean;
}

export function useNotifications(options: UseNotificationsOptions = {}) {
  const { technicianId, enabled = true, autoRegister = true } = options;
  const router = useRouter();

  const [isRegistered, setIsRegistered] = useState(false);
  const [pushToken, setPushToken] = useState<string | null>(null);
  const [badgeCount, setBadgeCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const notificationListener = useRef<Notifications.Subscription>();
  const responseListener = useRef<Notifications.Subscription>();

  /**
   * Initialize notifications
   */
  useEffect(() => {
    if (!enabled) return;

    // Configure notification handler
    configureNotificationHandler();

    // Auto-register if technicianId provided
    if (autoRegister && technicianId && !isRegistered) {
      handleRegister();
    }

    // Update badge count on mount
    updateBadge();

    // Set up notification listeners
    setupListeners();

    // Cleanup
    return () => {
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [enabled, technicianId, autoRegister]);

  /**
   * Set up notification listeners
   */
  const setupListeners = () => {
    // Handle notification received while app is in foreground
    notificationListener.current = addNotificationReceivedListener(
      async (notification) => {
        console.log('Notification received in foreground:', notification);

        const data = notification.request.content.data as NotificationData;

        // Store notification
        if (data) {
          await storeNotification(data);
          await updateBadge();
        }
      }
    );

    // Handle notification tapped by user
    responseListener.current = addNotificationResponseReceivedListener(
      async (response) => {
        console.log('Notification tapped:', response);

        const data = response.notification.request.content.data as NotificationData;

        if (data) {
          // Navigate based on notification type
          handleNotificationNavigation(data);
        }
      }
    );
  };

  /**
   * Register for push notifications
   */
  const handleRegister = async () => {
    if (!technicianId) {
      setError(new Error('Technician ID is required for registration'));
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const token = await registerForPushNotifications(technicianId);

      if (token) {
        setPushToken(token);
        setIsRegistered(true);
      } else {
        setError(new Error('Failed to obtain push token'));
      }
    } catch (err) {
      setError(err as Error);
      console.error('Error registering for push notifications:', err);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handle notification navigation
   */
  const handleNotificationNavigation = (data: NotificationData) => {
    switch (data.type) {
      case NotificationType.NEW_APPOINTMENT:
      case NotificationType.APPOINTMENT_CANCELLED:
        if (data.appointmentId) {
          router.push(`/appointments/${data.appointmentId}`);
        } else {
          router.push('/appointments');
        }
        break;

      case NotificationType.ROUTE_UPDATED:
        router.push('/route');
        break;

      case NotificationType.DELAY_ALERT:
      case NotificationType.APPROACHING_JOB_SITE:
        if (data.appointmentId) {
          router.push(`/appointments/${data.appointmentId}`);
        }
        break;

      case NotificationType.EMERGENCY_REQUEST:
        router.push('/emergency');
        break;

      case NotificationType.CUSTOMER_MESSAGE:
        if (data.appointmentId) {
          router.push(`/appointments/${data.appointmentId}/messages`);
        }
        break;

      default:
        router.push('/notifications');
    }
  };

  /**
   * Update badge count
   */
  const updateBadge = async () => {
    const count = await getBadgeCount();
    setBadgeCount(count);
  };

  /**
   * Get last notification response (for handling deep links when app was closed)
   */
  const getLastNotificationResponse = async () => {
    return await Notifications.getLastNotificationResponseAsync();
  };

  return {
    // State
    isRegistered,
    pushToken,
    badgeCount,
    isLoading,
    error,

    // Actions
    register: handleRegister,
    updateBadgeCount: updateBadge,
    getLastNotificationResponse,
  };
}

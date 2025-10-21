/**
 * Notification types and interfaces for the mobile app
 */

export enum NotificationType {
  ROUTE_UPDATED = 'route_updated',
  NEW_APPOINTMENT = 'new_appointment',
  APPOINTMENT_CANCELLED = 'appointment_cancelled',
  DELAY_ALERT = 'delay_alert',
  EMERGENCY_REQUEST = 'emergency_request',
  APPROACHING_JOB_SITE = 'approaching_job_site',
  CUSTOMER_MESSAGE = 'customer_message',
}

export interface NotificationData {
  type: NotificationType;
  appointmentId?: string;
  routeId?: string;
  message: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface PushNotificationSettings {
  enabled: boolean;
  routeUpdates: boolean;
  newAppointments: boolean;
  cancellations: boolean;
  delays: boolean;
  emergencies: boolean;
  customerMessages: boolean;
}

export interface StoredNotification {
  id: string;
  data: NotificationData;
  read: boolean;
  receivedAt: string;
}

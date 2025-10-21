/**
 * NotificationSettings Component
 * UI for managing push notification preferences
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Switch,
  ScrollView,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PushNotificationSettings } from '../types/notifications';
import { updatePushSettings } from '../services/notifications';

const SETTINGS_KEY = 'notification_settings';

const DEFAULT_SETTINGS: PushNotificationSettings = {
  enabled: true,
  routeUpdates: true,
  newAppointments: true,
  cancellations: true,
  delays: true,
  emergencies: true,
  customerMessages: true,
};

export interface NotificationSettingsProps {
  technicianId: string;
  onSettingsChange?: (settings: PushNotificationSettings) => void;
}

export function NotificationSettings({ technicianId, onSettingsChange }: NotificationSettingsProps) {
  const [settings, setSettings] = useState<PushNotificationSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  /**
   * Load settings from storage
   */
  const loadSettings = async () => {
    try {
      const stored = await AsyncStorage.getItem(SETTINGS_KEY);
      if (stored) {
        setSettings(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Save settings to storage and update backend
   */
  const saveSettings = async (newSettings: PushNotificationSettings) => {
    setIsSaving(true);

    try {
      // Save to local storage
      await AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));

      // Update backend
      await updatePushSettings(technicianId, newSettings.enabled);

      setSettings(newSettings);
      onSettingsChange?.(newSettings);
    } catch (error) {
      console.error('Error saving notification settings:', error);
      Alert.alert('Error', 'Failed to save notification settings. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Toggle master notifications switch
   */
  const toggleEnabled = async (value: boolean) => {
    const newSettings = { ...settings, enabled: value };
    await saveSettings(newSettings);
  };

  /**
   * Toggle individual notification type
   */
  const toggleSetting = async (key: keyof PushNotificationSettings, value: boolean) => {
    const newSettings = { ...settings, [key]: value };
    await saveSettings(newSettings);
  };

  /**
   * Reset to defaults
   */
  const resetToDefaults = () => {
    Alert.alert(
      'Reset Settings',
      'Are you sure you want to reset all notification settings to defaults?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: () => saveSettings(DEFAULT_SETTINGS),
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <View style={styles.masterToggle}>
          <View style={styles.settingInfo}>
            <Text style={styles.masterLabel}>Push Notifications</Text>
            <Text style={styles.description}>
              Receive notifications about your route and appointments
            </Text>
          </View>
          <Switch
            value={settings.enabled}
            onValueChange={toggleEnabled}
            disabled={isSaving}
            trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
            thumbColor={settings.enabled ? '#0066cc' : '#f3f4f6'}
          />
        </View>
      </View>

      {settings.enabled && (
        <>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notification Types</Text>

            <SettingRow
              label="Route Updates"
              description="When your route changes or is updated"
              value={settings.routeUpdates}
              onToggle={(value) => toggleSetting('routeUpdates', value)}
              disabled={isSaving}
            />

            <SettingRow
              label="New Appointments"
              description="When new appointments are added to your route"
              value={settings.newAppointments}
              onToggle={(value) => toggleSetting('newAppointments', value)}
              disabled={isSaving}
            />

            <SettingRow
              label="Cancellations"
              description="When appointments are cancelled"
              value={settings.cancellations}
              onToggle={(value) => toggleSetting('cancellations', value)}
              disabled={isSaving}
            />

            <SettingRow
              label="Delay Alerts"
              description="Reminders when you're running behind schedule"
              value={settings.delays}
              onToggle={(value) => toggleSetting('delays', value)}
              disabled={isSaving}
            />

            <SettingRow
              label="Emergency Requests"
              description="High-priority emergency service requests"
              value={settings.emergencies}
              onToggle={(value) => toggleSetting('emergencies', value)}
              disabled={isSaving}
              important
            />

            <SettingRow
              label="Customer Messages"
              description="Messages from customers about their appointments"
              value={settings.customerMessages}
              onToggle={(value) => toggleSetting('customerMessages', value)}
              disabled={isSaving}
            />
          </View>

          <View style={styles.section}>
            <TouchableOpacity style={styles.resetButton} onPress={resetToDefaults}>
              <Text style={styles.resetButtonText}>Reset to Defaults</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </ScrollView>
  );
}

interface SettingRowProps {
  label: string;
  description: string;
  value: boolean;
  onToggle: (value: boolean) => void;
  disabled?: boolean;
  important?: boolean;
}

function SettingRow({ label, description, value, onToggle, disabled, important }: SettingRowProps) {
  return (
    <View style={styles.settingRow}>
      <View style={styles.settingInfo}>
        <Text style={[styles.settingLabel, important && styles.importantLabel]}>
          {label}
          {important && ' *'}
        </Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        disabled={disabled}
        trackColor={{ false: '#d1d5db', true: '#93c5fd' }}
        thumbColor={value ? '#0066cc' : '#f3f4f6'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    backgroundColor: '#ffffff',
    marginBottom: 16,
    paddingVertical: 8,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  masterToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  masterLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: '#111827',
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  importantLabel: {
    color: '#dc2626',
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  resetButton: {
    margin: 16,
    padding: 16,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#fecaca',
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#dc2626',
  },
});

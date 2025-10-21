import { z } from 'zod'

/**
 * Appointment form validation schema
 * Maps to tickets table in database with service relationship
 */
export const appointmentSchema = z.object({
  customer_id: z.string().uuid('Please select a customer'),
  service_id: z.string().uuid('Please select a service'),
  assigned_technician_id: z.string().uuid('Please select a technician').optional(),
  scheduled_date: z.date({ message: 'Scheduled date is required' }),
  time_window_start: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  time_window_end: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  priority: z.enum(['low', 'normal', 'high', 'urgent'], {
    message: 'Priority is required',
  }),
  customer_notes: z.string().max(1000).optional().or(z.literal('')),
}).refine(
  (data) => {
    // Validate that end time is after start time
    if (!data.time_window_start || !data.time_window_end) return true
    return data.time_window_end > data.time_window_start
  },
  {
    message: 'End time must be after start time',
    path: ['time_window_end'],
  }
)

export type AppointmentFormData = z.infer<typeof appointmentSchema>

/**
 * Helper to format date to YYYY-MM-DD
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}

/**
 * Helper to parse HH:MM time string to Date object
 */
export function parseTimeString(timeStr: string): { hours: number; minutes: number } {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return { hours, minutes }
}

/**
 * Helper to format hours and minutes to HH:MM
 */
export function formatTimeString(hours: number, minutes: number): string {
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`
}

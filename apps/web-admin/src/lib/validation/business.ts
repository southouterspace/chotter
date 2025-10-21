import { z } from 'zod'

// Address schema for business address
export const businessAddressSchema = z.object({
  street: z.string().min(1, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(2, 'State is required').max(2),
  zip: z.string().min(5, 'ZIP code must be at least 5 digits').max(10),
})

// Business information schema
export const businessInfoSchema = z.object({
  name: z.string().min(1, 'Business name is required').max(200),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(20),
  email: z.string().email('Invalid email address'),
  website: z.string().url('Invalid website URL').optional().or(z.literal('')),
  logo_url: z.string().url('Invalid logo URL').optional().or(z.literal('')),
  address: businessAddressSchema,
})

export type BusinessInfoFormData = z.infer<typeof businessInfoSchema>

// Break time schema for operating hours
export const breakTimeSchema = z.object({
  start: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format'),
  end: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format'),
})

// Day schedule schema
export const dayScheduleSchema = z.object({
  open: z.boolean(),
  start: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format'),
  end: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Invalid time format'),
  breaks: z.array(breakTimeSchema),
})

// Operating hours schema for all days of the week
export const operatingHoursSchema = z.object({
  monday: dayScheduleSchema,
  tuesday: dayScheduleSchema,
  wednesday: dayScheduleSchema,
  thursday: dayScheduleSchema,
  friday: dayScheduleSchema,
  saturday: dayScheduleSchema,
  sunday: dayScheduleSchema,
})

export type OperatingHoursFormData = z.infer<typeof operatingHoursSchema>
export type DaySchedule = z.infer<typeof dayScheduleSchema>
export type BreakTime = z.infer<typeof breakTimeSchema>

// Default operating hours (Monday-Friday 8 AM - 5 PM)
export const defaultOperatingHours: OperatingHoursFormData = {
  monday: { open: true, start: '08:00', end: '17:00', breaks: [] },
  tuesday: { open: true, start: '08:00', end: '17:00', breaks: [] },
  wednesday: { open: true, start: '08:00', end: '17:00', breaks: [] },
  thursday: { open: true, start: '08:00', end: '17:00', breaks: [] },
  friday: { open: true, start: '08:00', end: '17:00', breaks: [] },
  saturday: { open: false, start: '08:00', end: '17:00', breaks: [] },
  sunday: { open: false, start: '08:00', end: '17:00', breaks: [] },
}

// Invite admin schema
export const inviteAdminSchema = z.object({
  email: z.string().email('Invalid email address'),
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
})

export type InviteAdminFormData = z.infer<typeof inviteAdminSchema>

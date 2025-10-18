import { z } from 'zod'

const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const

export const workScheduleSchema = z.object({
  sunday: z.object({
    isAvailable: z.boolean(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
  }),
  monday: z.object({
    isAvailable: z.boolean(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
  }),
  tuesday: z.object({
    isAvailable: z.boolean(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
  }),
  wednesday: z.object({
    isAvailable: z.boolean(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
  }),
  thursday: z.object({
    isAvailable: z.boolean(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
  }),
  friday: z.object({
    isAvailable: z.boolean(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
  }),
  saturday: z.object({
    isAvailable: z.boolean(),
    startTime: z.string().optional(),
    endTime: z.string().optional(),
  }),
})

export const technicianFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string()
    .regex(/^\+[1-9]\d{1,14}$/, 'Phone must be in E.164 format (e.g., +12025551234)')
    .or(z.literal(''))
    .optional(),
  skills: z.array(z.string()).min(1, 'At least one skill is required'),
  hourlyRate: z.number().min(0, 'Hourly rate must be positive').optional(),
  notes: z.string().optional(),
  isActive: z.boolean(),
  workSchedule: workScheduleSchema.optional(),
})

export type TechnicianFormData = z.infer<typeof technicianFormSchema>

export const defaultWorkSchedule = {
  sunday: { isAvailable: false, startTime: '09:00', endTime: '17:00' },
  monday: { isAvailable: true, startTime: '09:00', endTime: '17:00' },
  tuesday: { isAvailable: true, startTime: '09:00', endTime: '17:00' },
  wednesday: { isAvailable: true, startTime: '09:00', endTime: '17:00' },
  thursday: { isAvailable: true, startTime: '09:00', endTime: '17:00' },
  friday: { isAvailable: true, startTime: '09:00', endTime: '17:00' },
  saturday: { isAvailable: false, startTime: '09:00', endTime: '17:00' },
}

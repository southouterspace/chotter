import { z } from 'zod'

/**
 * Validation schema for service type form
 * Handles price conversion (dollars to cents), duration validation, and required fields
 */
export const serviceFormSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be less than 100 characters'),

  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional()
    .nullable(),

  // Price in dollars (will be converted to cents for storage)
  price: z
    .number({ required_error: 'Price is required' })
    .min(0, 'Price must be 0 or greater')
    .max(100000, 'Price must be less than $100,000'),

  // Duration in minutes (will be converted to PostgreSQL interval)
  durationMinutes: z
    .number({ required_error: 'Duration is required' })
    .int('Duration must be a whole number')
    .min(1, 'Duration must be at least 1 minute')
    .max(1440, 'Duration must be less than 24 hours'),

  // Array of skill names required for this service
  requiredSkills: z
    .array(z.string())
    .default([]),

  // Active/inactive status
  isActive: z
    .boolean()
    .default(true),
})

export type ServiceFormData = z.infer<typeof serviceFormSchema>

/**
 * Helper to convert dollars to cents for database storage
 */
export function dollarsToCents(dollars: number): number {
  return Math.round(dollars * 100)
}

/**
 * Helper to convert cents to dollars for display
 */
export function centsToDollars(cents: number): number {
  return cents / 100
}

/**
 * Helper to convert minutes to PostgreSQL interval format
 * Examples: 30 -> '30 minutes', 60 -> '1 hour', 90 -> '1 hour 30 minutes'
 */
export function minutesToInterval(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} minutes`
  }

  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (remainingMinutes === 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`
  }

  return `${hours} hour${hours > 1 ? 's' : ''} ${remainingMinutes} minutes`
}

/**
 * Helper to parse PostgreSQL interval to minutes
 * Handles formats like: '30 minutes', '1 hour', '1 hour 30 minutes', '01:30:00', 'PT1H30M'
 */
export function intervalToMinutes(interval: string): number {
  // Handle null or empty
  if (!interval) return 0

  // Handle ISO 8601 duration format (PT1H30M)
  if (interval.startsWith('PT')) {
    const hoursMatch = interval.match(/(\d+)H/)
    const minutesMatch = interval.match(/(\d+)M/)
    const hours = hoursMatch ? parseInt(hoursMatch[1], 10) : 0
    const minutes = minutesMatch ? parseInt(minutesMatch[1], 10) : 0
    return hours * 60 + minutes
  }

  // Handle PostgreSQL time format (01:30:00)
  if (interval.includes(':')) {
    const parts = interval.split(':')
    const hours = parseInt(parts[0], 10)
    const minutes = parseInt(parts[1], 10)
    return hours * 60 + minutes
  }

  // Handle text format ('1 hour 30 minutes', '30 minutes', etc.)
  let totalMinutes = 0

  const hoursMatch = interval.match(/(\d+)\s*hours?/)
  if (hoursMatch) {
    totalMinutes += parseInt(hoursMatch[1], 10) * 60
  }

  const minutesMatch = interval.match(/(\d+)\s*minutes?/)
  if (minutesMatch) {
    totalMinutes += parseInt(minutesMatch[1], 10)
  }

  return totalMinutes
}

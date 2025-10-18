import { z } from 'zod'

export const customerSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  phone: z.string().min(10, 'Phone number must be at least 10 digits').max(20),
  company_name: z.string().max(200).optional().or(z.literal('')),
  status: z.enum(['active', 'inactive']),
  source: z.enum(['referral', 'google_ads', 'website', 'repeat', 'other']).optional(),
  notes: z.string().max(1000).optional().or(z.literal('')),
  service_address: z.object({
    street: z.string().min(1, 'Street address is required'),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(2, 'State is required').max(2),
    zip: z.string().min(5, 'ZIP code must be at least 5 digits').max(10),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
  }),
  billing_address: z.object({
    street: z.string().optional().or(z.literal('')),
    city: z.string().optional().or(z.literal('')),
    state: z.string().optional().or(z.literal('')),
    zip: z.string().optional().or(z.literal('')),
  }).optional(),
})

export type CustomerFormData = z.infer<typeof customerSchema>

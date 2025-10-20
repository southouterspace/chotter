import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { SkillsSelector } from '@/components/SkillsSelector'
import { technicianFormSchema, defaultWorkSchedule, type TechnicianFormData } from '@/lib/validation/technician'
import type { TechnicianData } from '@/hooks/useTechnicians'

interface TechnicianFormProps {
  technician?: TechnicianData | null
  onSubmit: (data: TechnicianFormData) => void
  onCancel: () => void
  isSubmitting?: boolean
}

const DAYS = [
  { key: 'sunday', label: 'Sunday' },
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
] as const

export function TechnicianForm({ technician, onSubmit, onCancel, isSubmitting }: TechnicianFormProps) {
  const form = useForm<TechnicianFormData>({
    resolver: zodResolver(technicianFormSchema as any) as any,
    defaultValues: {
      firstName: technician?.firstName || '',
      lastName: technician?.lastName || '',
      email: technician?.email || '',
      phone: technician?.phone || '',
      skills: technician?.skills || [],
      hourlyRate: technician?.hourlyRate || undefined,
      notes: technician?.notes || '',
      isActive: technician?.isActive ?? true,
      workSchedule: technician ? convertAvailabilityToSchedule(technician.availability) : defaultWorkSchedule,
    },
  })

  // Update form when technician changes
  useEffect(() => {
    if (technician) {
      form.reset({
        firstName: technician.firstName,
        lastName: technician.lastName,
        email: technician.email,
        phone: technician.phone || '',
        skills: technician.skills,
        hourlyRate: technician.hourlyRate || undefined,
        notes: technician.notes || '',
        isActive: technician.isActive,
        workSchedule: convertAvailabilityToSchedule(technician.availability),
      })
    }
  }, [technician, form])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Personal Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Personal Information</h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="(555) 123-4567" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="hourlyRate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Hourly Rate (optional)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...field}
                    onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormDescription>Hourly rate in dollars</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Skills */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Skills</h3>
          <FormField
            control={form.control}
            name="skills"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <SkillsSelector value={field.value} onChange={field.onChange} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Work Schedule */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Work Schedule</h3>
          <div className="space-y-3">
            {DAYS.map(({ key, label }) => (
              <div key={key} className="flex items-center gap-4 rounded-lg border p-3">
                <FormField
                  control={form.control}
                  name={`workSchedule.${key}.isAvailable`}
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <FormLabel className="w-24 cursor-pointer font-medium">
                        {label}
                      </FormLabel>
                    </FormItem>
                  )}
                />

                <div className="flex flex-1 items-center gap-2">
                  <FormField
                    control={form.control}
                    name={`workSchedule.${key}.startTime`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            type="time"
                            {...field}
                            disabled={!form.watch(`workSchedule.${key}.isAvailable`)}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <span className="text-muted-foreground">to</span>
                  <FormField
                    control={form.control}
                    name={`workSchedule.${key}.endTime`}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormControl>
                          <Input
                            type="time"
                            {...field}
                            disabled={!form.watch(`workSchedule.${key}.isAvailable`)}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes (optional)</FormLabel>
              <FormControl>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="Additional notes about this technician..."
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status */}
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
              <FormControl>
                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>Active</FormLabel>
                <FormDescription>
                  Inactive technicians will not appear in scheduling
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : technician ? 'Update Technician' : 'Create Technician'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

// Helper function to convert availability array to work schedule object
function convertAvailabilityToSchedule(availability: TechnicianData['availability']) {
  const schedule = { ...defaultWorkSchedule }
  const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const

  availability.forEach(avail => {
    const dayKey = dayNames[avail.dayOfWeek]
    if (dayKey) {
      schedule[dayKey] = {
        isAvailable: avail.isAvailable,
        startTime: avail.startTime,
        endTime: avail.endTime,
      }
    }
  })

  return schedule
}

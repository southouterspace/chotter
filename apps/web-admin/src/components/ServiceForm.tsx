import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  serviceFormSchema,
  type ServiceFormData,
  centsToDollars,
  intervalToMinutes,
} from '@/lib/validation/service'
import type { Database } from '@chotter/database'

type ServiceType = Database['public']['Tables']['service_types']['Row']

interface ServiceFormProps {
  service?: ServiceType | null
  onSubmit: (data: ServiceFormData) => void | Promise<void>
  onCancel: () => void
  isSubmitting?: boolean
}

export function ServiceForm({ service, onSubmit, onCancel, isSubmitting }: ServiceFormProps) {
  const [skillInput, setSkillInput] = useState('')

  const form = useForm<ServiceFormData>({
    resolver: zodResolver(serviceFormSchema),
    defaultValues: {
      name: service?.name || '',
      description: service?.description || '',
      price: service ? centsToDollars(service.base_price) : 0,
      durationMinutes: service ? intervalToMinutes(service.estimated_duration) : 60,
      requiredSkills: service?.required_skills,
      isActive: service?.is_active,
    },
  })

  // Reset form when service changes
  useEffect(() => {
    if (service) {
      form.reset({
        name: service.name,
        description: service.description || '',
        price: centsToDollars(service.base_price),
        durationMinutes: intervalToMinutes(service.estimated_duration),
        requiredSkills: service.required_skills,
        isActive: service.is_active,
      })
    }
  }, [service, form])

  const handleAddSkill = () => {
    const trimmedSkill = skillInput.trim()
    if (!trimmedSkill) return

    const currentSkills = form.getValues('requiredSkills')
    if (!currentSkills.includes(trimmedSkill)) {
      form.setValue('requiredSkills', [...currentSkills, trimmedSkill])
    }
    setSkillInput('')
  }

  const handleRemoveSkill = (skillToRemove: string) => {
    const currentSkills = form.getValues('requiredSkills')
    form.setValue(
      'requiredSkills',
      currentSkills.filter(skill => skill !== skillToRemove)
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddSkill()
    }
  }

  const handleFormSubmit = async (data: ServiceFormData) => {
    await onSubmit(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Service Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., AC Repair, Furnace Installation" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Brief description of this service..."
                  className="min-h-[100px] resize-none"
                  {...field}
                  value={field.value || ''}
                />
              </FormControl>
              <FormDescription>
                Optional description to help identify this service
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Price and Duration Row */}
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Base Price */}
          <FormField
            control={form.control}
            name="price"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Base Price</FormLabel>
                <FormControl>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      $
                    </span>
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="pl-7"
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))}
                    />
                  </div>
                </FormControl>
                <FormDescription>Starting price in dollars</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Duration */}
          <FormField
            control={form.control}
            name="durationMinutes"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimated Duration</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      min="1"
                      max="1440"
                      placeholder="60"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value, 10))}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      minutes
                    </span>
                  </div>
                </FormControl>
                <FormDescription>Expected service duration</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Required Skills */}
        <FormField
          control={form.control}
          name="requiredSkills"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Required Skills</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type a skill and press Enter..."
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleAddSkill}
                      disabled={!skillInput.trim()}
                    >
                      Add
                    </Button>
                  </div>
                  {field.value && field.value.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {field.value.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="gap-1 pr-1">
                          {skill}
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0.5 hover:bg-transparent"
                            onClick={() => handleRemoveSkill(skill)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </FormControl>
              <FormDescription>
                Skills needed to perform this service (e.g., HVAC License, EPA Certified)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Active Status */}
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active Service</FormLabel>
                <FormDescription>
                  Make this service available for booking
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : service ? 'Update Service' : 'Create Service'}
          </Button>
        </div>
      </form>
    </Form>
  )
}

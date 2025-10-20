import { useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Calendar as CalendarIcon } from 'lucide-react'
import { format } from 'date-fns'
import { cn } from '@/lib/utils'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CustomerSearch } from '@/components/CustomerSearch'
import { useCreateAppointment } from '@/hooks/useCreateAppointment'
import { useUpdateAppointment } from '@/hooks/useUpdateAppointment'
import { useActiveServiceTypes } from '@/hooks/useServiceTypes'
import { useTechniciansWithSkills } from '@/hooks/useTechniciansWithSkills'
import { useToast } from '@/hooks/use-toast'
import {
  appointmentSchema,
  type AppointmentFormData,
} from '@/lib/validation/appointment'
import type { AppointmentData } from '@/hooks/useAppointments'

interface AppointmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  appointment?: AppointmentData | null
  onSuccess?: () => void
}

export function AppointmentModal({
  open,
  onOpenChange,
  appointment,
  onSuccess,
}: AppointmentModalProps) {
  const { toast } = useToast()
  const createAppointment = useCreateAppointment()
  const updateAppointment = useUpdateAppointment()

  // Fetch data for dropdowns
  const { data: services = [], isLoading: servicesLoading } = useActiveServiceTypes()
  const { data: technicians = [], isLoading: techniciansLoading } = useTechniciansWithSkills()

  const isEditing = !!appointment

  const form = useForm<AppointmentFormData>({
    resolver: zodResolver(appointmentSchema as any),
    defaultValues: {
      customer_id: '',
      service_id: '',
      assigned_technician_id: undefined,
      scheduled_date: new Date(),
      time_window_start: '09:00',
      time_window_end: '10:00',
      priority: 'normal',
      customer_notes: '',
    },
  })

  // Watch selected service to filter technicians
  const selectedServiceId = form.watch('service_id')
  const selectedService = useMemo(
    () => services.find((s) => s.id === selectedServiceId),
    [services, selectedServiceId]
  )

  // Filter technicians based on service required skills
  const filteredTechnicians = useMemo(() => {
    if (!selectedService || !selectedService.required_skills || selectedService.required_skills.length === 0) {
      return technicians // No skill requirements, show all
    }

    // Filter technicians who have ALL required skills
    return technicians.filter((tech) => {
      return selectedService.required_skills.every((requiredSkill) =>
        tech.skills.includes(requiredSkill)
      )
    })
  }, [selectedService, technicians])

  // Reset form when appointment changes
  useEffect(() => {
    if (appointment) {
      form.reset({
        customer_id: appointment.customerId,
        service_id: appointment.serviceId,
        assigned_technician_id: appointment.technicianId || undefined,
        scheduled_date: new Date(appointment.scheduledDate),
        time_window_start: appointment.timeWindowStart,
        time_window_end: appointment.timeWindowEnd,
        priority: appointment.priority as AppointmentFormData['priority'],
        customer_notes: appointment.notes || '',
      })
    } else {
      form.reset({
        customer_id: '',
        service_id: '',
        assigned_technician_id: undefined,
        scheduled_date: new Date(),
        time_window_start: '09:00',
        time_window_end: '10:00',
        priority: 'normal',
        customer_notes: '',
      })
    }
  }, [appointment, form, open])

  // Clear technician if they don't match new service requirements
  useEffect(() => {
    const currentTechId = form.getValues('assigned_technician_id')
    if (currentTechId && !filteredTechnicians.find((t) => t.id === currentTechId)) {
      form.setValue('assigned_technician_id', undefined)
    }
  }, [filteredTechnicians, form])

  const onSubmit = async (data: AppointmentFormData) => {
    try {
      if (isEditing && appointment) {
        await updateAppointment.mutateAsync({ id: appointment.id, data })
        toast({
          title: 'Appointment updated',
          description: 'Appointment has been updated successfully.',
        })
      } else {
        await createAppointment.mutateAsync(data)
        toast({
          title: 'Appointment created',
          description: 'New appointment has been scheduled successfully.',
        })
      }
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to save appointment',
        variant: 'destructive',
      })
    }
  }

  const isLoading = createAppointment.isPending || updateAppointment.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Appointment' : 'Create New Appointment'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Update appointment details below.'
              : 'Schedule a new appointment for a customer.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Customer Selection */}
            <FormField
              control={form.control}
              name="customer_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Customer</FormLabel>
                  <FormControl>
                    <CustomerSearch
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Service Selection */}
            <FormField
              control={form.control}
              name="service_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoading || servicesLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          <div className="flex flex-col">
                            <span>{service.name}</span>
                            <span className="text-xs text-muted-foreground">
                              {service.priceFormatted} - {service.durationFormatted}
                            </span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedService && selectedService.required_skills && selectedService.required_skills.length > 0 && (
                    <FormDescription>
                      Required skills:{' '}
                      {selectedService.required_skills.map((skill, idx) => (
                        <Badge key={idx} variant="secondary" className="ml-1">
                          {skill}
                        </Badge>
                      ))}
                    </FormDescription>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Technician Selection (filtered by skills) */}
            <FormField
              control={form.control}
              name="assigned_technician_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Technician (Optional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoading || techniciansLoading || !selectedServiceId}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={
                          !selectedServiceId
                            ? 'Select a service first'
                            : filteredTechnicians.length === 0
                            ? 'No qualified technicians'
                            : 'Select a technician'
                        } />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredTechnicians.map((tech) => (
                        <SelectItem key={tech.id} value={tech.id}>
                          <div className="flex items-center gap-2">
                            <span>{tech.name}</span>
                            {tech.skills.length > 0 && (
                              <div className="flex gap-1">
                                {tech.skills.slice(0, 3).map((skill, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    {selectedServiceId && filteredTechnicians.length === 0
                      ? 'No technicians have the required skills for this service'
                      : `${filteredTechnicians.length} technician(s) available with required skills`}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Date and Time */}
            <div className="grid gap-4 sm:grid-cols-3">
              {/* Scheduled Date */}
              <FormField
                control={form.control}
                name="scheduled_date"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              'pl-3 text-left font-normal',
                              !field.value && 'text-muted-foreground'
                            )}
                            disabled={isLoading}
                          >
                            {field.value ? (
                              format(field.value, 'PPP')
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date: Date) =>
                            date < new Date(new Date().setHours(0, 0, 0, 0))
                          }
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Time Window Start */}
              <FormField
                control={form.control}
                name="time_window_start"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Time Window End */}
              <FormField
                control={form.control}
                name="time_window_end"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        {...field}
                        disabled={isLoading}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Priority */}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                    disabled={isLoading}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Customer Notes */}
            <FormField
              control={form.control}
              name="customer_notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={3}
                      placeholder="Any special instructions or notes..."
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormDescription>
                    Additional information about the appointment
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? 'Update Appointment' : 'Create Appointment'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

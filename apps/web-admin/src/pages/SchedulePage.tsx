import { useState, useCallback } from 'react'
import { AppointmentCalendar, type CalendarView } from '@/components/AppointmentCalendar'
import { CalendarFilters } from '@/components/CalendarFilters'
import { AppointmentDetailsDialog } from '@/components/AppointmentDetailsDialog'
import { AppointmentModal } from '@/components/AppointmentModal'
import { useAppointments, type AppointmentFilters } from '@/hooks/useAppointments'
import { Button } from '@/components/ui/button'
import { Calendar, CalendarDays, CalendarRange, Plus } from 'lucide-react'
import type { EventClickArg } from '@fullcalendar/core'

const VIEW_OPTIONS: { value: CalendarView; label: string; icon: typeof Calendar }[] = [
  { value: 'timeGridDay', label: 'Day', icon: Calendar },
  { value: 'timeGridWeek', label: 'Week', icon: CalendarDays },
  { value: 'dayGridMonth', label: 'Month', icon: CalendarRange },
]

export function SchedulePage() {
  const [view, setView] = useState<CalendarView>('timeGridWeek')
  const [filters, setFilters] = useState<AppointmentFilters>({})
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [appointmentModalOpen, setAppointmentModalOpen] = useState(false)

  const { events, appointments, loading, error, refetch } = useAppointments(filters)

  const handleEventClick = useCallback((eventInfo: EventClickArg) => {
    const appointment = appointments.find(apt => apt.id === eventInfo.event.id)
    if (appointment) {
      setSelectedAppointment(appointment)
      setDetailsOpen(true)
    }
  }, [appointments])

  const handleDateChange = useCallback((start: Date, end: Date) => {
    // Update filters with new date range
    setFilters(prev => ({
      ...prev,
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    }))
  }, [])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
          <p className="text-muted-foreground">
            View and manage appointments across your calendar
          </p>
        </div>

        <div className="flex gap-3">
          {/* New Appointment Button */}
          <Button onClick={() => setAppointmentModalOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Appointment
          </Button>

          {/* View Switcher */}
          <div className="flex gap-2">
            {VIEW_OPTIONS.map(option => {
              const Icon = option.icon
              return (
                <Button
                  key={option.value}
                  variant={view === option.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setView(option.value)}
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {option.label}
                </Button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Filters */}
      <CalendarFilters filters={filters} onFiltersChange={setFilters} />

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
          <div className="flex items-center gap-2">
            <svg
              className="h-5 w-5 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm font-medium text-destructive">
              Failed to load appointments: {error.message}
            </p>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      {!error && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-lg border bg-card p-4">
            <div className="text-2xl font-bold">{events.length}</div>
            <div className="text-xs text-muted-foreground">Total Appointments</div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="text-2xl font-bold text-blue-600">
              {appointments.filter(a => a.status === 'scheduled').length}
            </div>
            <div className="text-xs text-muted-foreground">Scheduled</div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="text-2xl font-bold text-amber-600">
              {appointments.filter(a => a.status === 'in_progress').length}
            </div>
            <div className="text-xs text-muted-foreground">In Progress</div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="text-2xl font-bold text-green-600">
              {appointments.filter(a => a.status === 'completed').length}
            </div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
        </div>
      )}

      {/* Calendar */}
      <div className="relative min-h-[600px]">
        {!error && events.length === 0 && !loading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg border border-dashed">
            <div className="text-center">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
              <h3 className="mt-4 text-lg font-semibold">No appointments scheduled</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {filters.technicianIds || filters.serviceTypes || filters.statuses
                  ? 'Try adjusting your filters to see more appointments'
                  : 'Appointments will appear here when they are scheduled'}
              </p>
            </div>
          </div>
        )}

        {!error && (
          <AppointmentCalendar
            events={events}
            view={view}
            onEventClick={handleEventClick}
            onDateChange={handleDateChange}
            loading={loading}
          />
        )}
      </div>

      {/* Appointment Details Dialog */}
      <AppointmentDetailsDialog
        appointment={selectedAppointment}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      />

      {/* Create/Edit Appointment Modal */}
      <AppointmentModal
        open={appointmentModalOpen}
        onOpenChange={setAppointmentModalOpen}
        onSuccess={() => {
          refetch()
        }}
      />
    </div>
  )
}

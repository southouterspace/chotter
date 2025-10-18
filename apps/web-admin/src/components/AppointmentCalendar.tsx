import { useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import type { EventInput, EventClickArg } from '@fullcalendar/core'
import './AppointmentCalendar.css'

export type CalendarView = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'

interface AppointmentCalendarProps {
  events: EventInput[]
  view: CalendarView
  onEventClick?: (eventInfo: EventClickArg) => void
  onDateChange?: (start: Date, end: Date) => void
  loading?: boolean
}

export function AppointmentCalendar({
  events,
  view,
  onEventClick,
  onDateChange,
  loading = false,
}: AppointmentCalendarProps) {
  const calendarRef = useRef<FullCalendar>(null)

  const handleDatesSet = (info: { start: Date; end: Date }) => {
    onDateChange?.(info.start, info.end)
  }

  return (
    <div className="appointment-calendar-wrapper">
      {loading && (
        <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10 rounded-lg">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading appointments...</p>
          </div>
        </div>
      )}
      <FullCalendar
        ref={calendarRef}
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView={view}
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: '', // We'll use external view switcher
        }}
        events={events}
        eventClick={onEventClick}
        datesSet={handleDatesSet}
        height="auto"
        slotMinTime="06:00:00"
        slotMaxTime="20:00:00"
        allDaySlot={false}
        nowIndicator={true}
        editable={false}
        selectable={false}
        selectMirror={true}
        dayMaxEvents={true}
        weekends={true}
        slotDuration="00:30:00"
        slotLabelInterval="01:00"
        eventTimeFormat={{
          hour: 'numeric',
          minute: '2-digit',
          meridiem: 'short',
        }}
        slotLabelFormat={{
          hour: 'numeric',
          minute: '2-digit',
          meridiem: 'short',
        }}
        eventContent={(eventInfo) => {
          const { event } = eventInfo
          const props = event.extendedProps

          return (
            <div className="p-1 overflow-hidden text-xs">
              <div className="font-semibold truncate">{props.customerName}</div>
              <div className="truncate opacity-90">{props.serviceName}</div>
              {props.technicianName && (
                <div className="truncate opacity-75 text-[10px]">{props.technicianName}</div>
              )}
            </div>
          )
        }}
        eventClassNames={(arg) => {
          const status = arg.event.extendedProps.status
          return [`event-status-${status}`]
        }}
      />
    </div>
  )
}

import { Phone, MessageSquare, MapPin, Clock } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import type { TechnicianLocationEnhanced } from '@/hooks/useTechnicianLocationsEnhanced'

interface TechnicianInfoWindowProps {
  technician: TechnicianLocationEnhanced
}

const STATUS_LABELS = {
  available: 'Available',
  on_route: 'On Route',
  busy: 'In Progress',
  off_duty: 'Off Duty',
} as const

const STATUS_VARIANTS = {
  available: 'default' as const,
  on_route: 'secondary' as const,
  busy: 'outline' as const,
  off_duty: 'secondary' as const,
}

function getInitials(name: string): string {
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

function formatAddress(address: any): string {
  if (!address) return 'No address'
  if (typeof address === 'string') return address

  // Handle PostGIS point type or structured address
  const { street, city, state, zip } = address
  if (street) {
    return `${street}, ${city}, ${state} ${zip}`
  }

  return JSON.stringify(address)
}

function formatScheduledTime(scheduledTime: string): string {
  try {
    const date = new Date(scheduledTime)
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    })
  } catch {
    return scheduledTime
  }
}

export function TechnicianInfoWindow({ technician }: TechnicianInfoWindowProps) {
  const initials = getInitials(technician.name)

  const handleCall = () => {
    if (technician.phone) {
      window.location.href = `tel:${technician.phone}`
    }
  }

  const handleMessage = () => {
    if (technician.phone) {
      window.location.href = `sms:${technician.phone}`
    }
  }

  return (
    <div className="p-4 min-w-[320px] max-w-[400px]">
      {/* Technician Header */}
      <div className="flex items-start gap-3 mb-3">
        <Avatar className="w-12 h-12 border-2 border-background">
          <AvatarImage src={technician.photo_url} alt={technician.name} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base leading-tight mb-1">
            {technician.name}
          </h3>
          <p className="text-xs text-muted-foreground mb-2">{technician.email}</p>
          <Badge variant={STATUS_VARIANTS[technician.status]}>
            {STATUS_LABELS[technician.status]}
          </Badge>
        </div>
      </div>

      {/* Quick Actions */}
      {technician.phone && (
        <div className="flex gap-2 mb-3">
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={handleCall}
          >
            <Phone className="w-4 h-4 mr-1" />
            Call
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={handleMessage}
          >
            <MessageSquare className="w-4 h-4 mr-1" />
            Text
          </Button>
        </div>
      )}

      <Separator className="my-3" />

      {/* Current Appointment */}
      {technician.current_appointment && (
        <div className="mb-3">
          <div className="flex items-center gap-1.5 mb-2">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Current Job
            </span>
          </div>
          <div className="ml-5">
            <p className="text-sm font-medium mb-1">
              {technician.current_appointment.customer_name}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatAddress(technician.current_appointment.service_address)}
            </p>
          </div>
        </div>
      )}

      {/* Next Appointment */}
      {technician.next_appointment && (
        <div className="mb-3">
          <div className="flex items-center gap-1.5 mb-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-semibold text-muted-foreground uppercase">
              Next Job
            </span>
          </div>
          <div className="ml-5">
            <p className="text-sm font-medium mb-1">
              {technician.next_appointment.customer_name}
            </p>
            <p className="text-xs text-muted-foreground mb-1">
              {formatAddress(technician.next_appointment.service_address)}
            </p>
            <p className="text-xs text-blue-600 font-medium">
              Scheduled: {formatScheduledTime(technician.next_appointment.scheduled_time)}
            </p>
          </div>
        </div>
      )}

      {/* No appointments */}
      {!technician.current_appointment && !technician.next_appointment && (
        <div className="text-center py-3">
          <p className="text-sm text-muted-foreground">
            {technician.status === 'available'
              ? 'No active appointments'
              : 'No appointment data available'}
          </p>
        </div>
      )}

      {/* Route Summary */}
      {technician.active_route && technician.active_route.appointments.length > 0 && (
        <>
          <Separator className="my-3" />
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">
              {technician.active_route.appointments.length} stops
            </span>{' '}
            on route today
          </div>
        </>
      )}
    </div>
  )
}

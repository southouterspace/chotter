import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Calendar, Clock, MapPin, Phone, User, Wrench, FileText } from 'lucide-react'

interface AppointmentDetails {
  id: string
  customerName: string
  customerPhone: string
  customerAddress: string
  customerCity: string
  serviceName: string
  serviceCategory: string
  technicianName: string | null
  status: string
  priority: string
  scheduledDate: string
  timeWindowStart: string
  timeWindowEnd: string
  notes: string | null
}

interface AppointmentDetailsDialogProps {
  appointment: AppointmentDetails | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  scheduled: 'Scheduled',
  en_route: 'En Route',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-500',
  scheduled: 'bg-blue-500',
  en_route: 'bg-purple-500',
  in_progress: 'bg-amber-500',
  completed: 'bg-green-500',
  cancelled: 'bg-red-500',
}

const PRIORITY_LABELS: Record<string, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  urgent: 'Urgent',
}

const CATEGORY_LABELS: Record<string, string> = {
  installation: 'Installation',
  repair: 'Repair',
  maintenance: 'Maintenance',
  inspection: 'Inspection',
  general: 'General',
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatTime(timeString: string): string {
  const [hours, minutes] = timeString.split(':')
  const hour = parseInt(hours, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour % 12 || 12
  return `${displayHour}:${minutes} ${ampm}`
}

export function AppointmentDetailsDialog({
  appointment,
  open,
  onOpenChange,
}: AppointmentDetailsDialogProps) {
  if (!appointment) return null

  const statusColor = STATUS_COLORS[appointment.status] || STATUS_COLORS.pending
  const statusLabel = STATUS_LABELS[appointment.status] || appointment.status
  const priorityLabel = PRIORITY_LABELS[appointment.priority] || appointment.priority
  const categoryLabel = CATEGORY_LABELS[appointment.serviceCategory] || appointment.serviceCategory

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <DialogTitle className="text-xl">Appointment Details</DialogTitle>
              <DialogDescription className="mt-1">
                ID: {appointment.id.substring(0, 8)}...
              </DialogDescription>
            </div>
            <Badge className={`${statusColor} text-white`}>
              {statusLabel}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Customer Information */}
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-3">Customer Information</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{appointment.customerName}</span>
              </div>
              {appointment.customerPhone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a href={`tel:${appointment.customerPhone}`} className="text-primary hover:underline">
                    {appointment.customerPhone}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{appointment.customerAddress}, {appointment.customerCity}</span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Service Information */}
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-3">Service Information</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Wrench className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">{appointment.serviceName}</span>
                <Badge variant="outline" className="ml-2">
                  {categoryLabel}
                </Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Priority:</span>
                <Badge variant={appointment.priority === 'urgent' || appointment.priority === 'high' ? 'destructive' : 'secondary'}>
                  {priorityLabel}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Schedule Information */}
          <div>
            <h3 className="font-semibold text-sm text-muted-foreground mb-3">Schedule</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(appointment.scheduledDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>
                  {formatTime(appointment.timeWindowStart)} - {formatTime(appointment.timeWindowEnd)}
                </span>
              </div>
            </div>
          </div>

          {/* Technician Information */}
          {appointment.technicianName && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-3">Assigned Technician</h3>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{appointment.technicianName}</span>
                </div>
              </div>
            </>
          )}

          {/* Notes */}
          {appointment.notes && (
            <>
              <Separator />
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-3 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Notes
                </h3>
                <p className="text-sm bg-muted/50 p-3 rounded-md">{appointment.notes}</p>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

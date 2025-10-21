import { InfoWindow } from '@vis.gl/react-google-maps'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, MapPin } from 'lucide-react'
import type { TechnicianWithLocation } from '@/hooks/useTechnicianLocationsMock'

interface LiveTechnicianInfoWindowProps {
  technician: TechnicianWithLocation
  onClose: () => void
}

const STATUS_LABELS = {
  available: 'Available',
  en_route: 'En Route',
  busy: 'Busy',
  off_duty: 'Off Duty'
} as const

const STATUS_VARIANTS = {
  available: 'default' as const,
  en_route: 'secondary' as const,
  busy: 'outline' as const,
  off_duty: 'secondary' as const
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function LiveTechnicianInfoWindow({ technician, onClose }: LiveTechnicianInfoWindowProps) {
  const position = {
    lat: technician.current_location.coordinates[1],
    lng: technician.current_location.coordinates[0]
  }

  const initials = getInitials(technician.first_name, technician.last_name)
  const fullName = `${technician.first_name} ${technician.last_name}`

  return (
    <InfoWindow position={position} onCloseClick={onClose}>
      <Card className="w-72 border-0 shadow-none">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <CardTitle className="text-base">{fullName}</CardTitle>
              <Badge variant={STATUS_VARIANTS[technician.status]} className="mt-1">
                {STATUS_LABELS[technician.status]}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {technician.current_appointment ? (
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">
                    {technician.current_appointment.customer_name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {technician.current_appointment.address}
                  </p>
                </div>
              </div>
              {technician.current_appointment.eta_minutes > 0 && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    ETA: {technician.current_appointment.eta_minutes} min
                  </p>
                </div>
              )}
              {technician.current_appointment.eta_minutes === 0 && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-green-500" />
                  <p className="text-xs text-green-600 font-medium">
                    On site
                  </p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No active appointment
            </p>
          )}
          <Button
            size="sm"
            className="w-full"
            onClick={() => {
              console.log('View route for technician:', technician.id)
            }}
          >
            View Route
          </Button>
        </CardContent>
      </Card>
    </InfoWindow>
  )
}

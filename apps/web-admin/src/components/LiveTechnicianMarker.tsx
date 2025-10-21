import { AdvancedMarker } from '@vis.gl/react-google-maps'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { TechnicianWithLocation } from '@/hooks/useTechnicianLocationsMock'

interface LiveTechnicianMarkerProps {
  technician: TechnicianWithLocation
  onClick?: () => void
}

const STATUS_COLORS = {
  available: 'border-green-500 bg-green-50',
  en_route: 'border-blue-500 bg-blue-50',
  busy: 'border-orange-500 bg-orange-50',
  off_duty: 'border-gray-400 bg-gray-50'
} as const

function getInitials(firstName: string, lastName: string): string {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

export function LiveTechnicianMarker({ technician, onClick }: LiveTechnicianMarkerProps) {
  const position = {
    lat: technician.current_location.coordinates[1],
    lng: technician.current_location.coordinates[0]
  }

  const initials = getInitials(technician.first_name, technician.last_name)
  const hasActiveAppointment = !!technician.current_appointment

  return (
    <AdvancedMarker position={position} onClick={onClick}>
      <div className="relative cursor-pointer hover:scale-110 transition-transform">
        <Avatar className={cn('h-10 w-10 border-2', STATUS_COLORS[technician.status])}>
          <AvatarFallback className="text-xs font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        {hasActiveAppointment && (
          <Badge
            className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs rounded-full"
            variant="destructive"
          >
            1
          </Badge>
        )}
      </div>
    </AdvancedMarker>
  )
}

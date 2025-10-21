import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { TechnicianLocationEnhanced } from '@/hooks/useTechnicianLocationsEnhanced'

interface TechnicianMarkerProps {
  technician: TechnicianLocationEnhanced
  onClick?: () => void
}

const STATUS_COLORS = {
  available: '#22c55e', // green
  on_route: '#3b82f6', // blue
  busy: '#f59e0b', // orange
  off_duty: '#6b7280', // gray
} as const

function getMarkerColor(status: TechnicianLocationEnhanced['status']): string {
  return STATUS_COLORS[status] || STATUS_COLORS.off_duty
}

function getInitials(name: string): string {
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

export function TechnicianMarker({ technician, onClick }: TechnicianMarkerProps) {
  const color = getMarkerColor(technician.status)
  const initials = getInitials(technician.name)

  return (
    <div
      className="cursor-pointer transform transition-all hover:scale-110 relative"
      onClick={onClick}
    >
      {/* Avatar with status border */}
      <div
        className="w-12 h-12 rounded-full p-0.5 shadow-lg"
        style={{ backgroundColor: color }}
      >
        <Avatar className="w-full h-full border-2 border-white">
          <AvatarImage src={technician.photo_url} alt={technician.name} />
          <AvatarFallback className="text-xs font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Status indicator pulse for active technicians */}
      {(technician.status === 'on_route' || technician.status === 'busy') && (
        <div
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full border-2 border-white shadow-sm animate-pulse"
          style={{ backgroundColor: color }}
        />
      )}
    </div>
  )
}

export function TechnicianMarkerSimple({ status }: { status: TechnicianLocationEnhanced['status'] }) {
  const color = getMarkerColor(status)

  return (
    <div
      className="w-8 h-8 rounded-full border-4 border-white shadow-lg cursor-pointer hover:scale-110 transition-transform"
      style={{ backgroundColor: color }}
    />
  )
}

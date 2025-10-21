import { useState } from 'react'
import { useTechnicianLocationsMock } from '@/hooks/useTechnicianLocationsMock'
import { LiveTechnicianMap } from '@/components/LiveTechnicianMap'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { ChevronLeft, ChevronRight, MapPin, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'

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

export function LiveTrackingPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [selectedTechId, setSelectedTechId] = useState<string | null>(null)
  const { data: technicians, isLoading } = useTechnicianLocationsMock()

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)

  return (
    <div className="flex h-[calc(100vh-4rem)] gap-4 p-4">
      {/* Sidebar */}
      <div
        className={cn(
          'transition-all duration-300 ease-in-out flex-shrink-0',
          sidebarOpen ? 'w-80' : 'w-0 overflow-hidden'
        )}
      >
        <Card className="h-full flex flex-col">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="flex items-center justify-between">
              <span>Active Technicians</span>
              <Badge variant="outline">{technicians.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-2">
            <div className="space-y-2">
              {technicians.map(tech => {
                const initials = getInitials(tech.first_name, tech.last_name)
                const fullName = `${tech.first_name} ${tech.last_name}`
                const isSelected = selectedTechId === tech.id

                return (
                  <button
                    key={tech.id}
                    onClick={() => setSelectedTechId(tech.id)}
                    className={cn(
                      'w-full p-3 rounded-lg border transition-colors text-left',
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:bg-muted'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <Avatar className="h-10 w-10 flex-shrink-0">
                        <AvatarFallback className="text-xs">
                          {initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {fullName}
                        </p>
                        <Badge
                          variant={STATUS_VARIANTS[tech.status]}
                          className="mt-1"
                        >
                          {STATUS_LABELS[tech.status]}
                        </Badge>
                        {tech.current_appointment && (
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <MapPin className="h-3 w-3" />
                              <span className="truncate">
                                {tech.current_appointment.customer_name}
                              </span>
                            </div>
                            {tech.current_appointment.eta_minutes > 0 && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                <span>ETA: {tech.current_appointment.eta_minutes} min</span>
                              </div>
                            )}
                            {tech.current_appointment.eta_minutes === 0 && (
                              <div className="flex items-center gap-1 text-xs text-green-600">
                                <Clock className="h-3 w-3" />
                                <span className="font-medium">On site</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Toggle Button */}
      <Button
        variant="outline"
        size="icon"
        className="absolute top-20 left-4 z-10 transition-all duration-300"
        style={{
          left: sidebarOpen ? '21rem' : '1rem'
        }}
        onClick={toggleSidebar}
      >
        {sidebarOpen ? (
          <ChevronLeft className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </Button>

      {/* Map */}
      <div className="flex-1 min-w-0">
        <Card className="h-full">
          <CardHeader className="flex-shrink-0">
            <CardTitle>Live Technician Tracking</CardTitle>
          </CardHeader>
          <CardContent className="p-0 h-[calc(100%-5rem)]">
            {isLoading ? (
              <div className="h-full w-full flex items-center justify-center bg-muted">
                <p className="text-sm text-muted-foreground">Loading map...</p>
              </div>
            ) : (
              <LiveTechnicianMap
                technicians={technicians}
                selectedTechId={selectedTechId}
                onTechnicianSelect={setSelectedTechId}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

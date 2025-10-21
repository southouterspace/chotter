import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { GripVertical, MapPin, Clock } from 'lucide-react'

// TODO: Update @chotter/database types after running migrations
interface TicketWithDetails {
  id: string
  business_id: string
  ticket_number: string
  customer_id: string
  service_id: string
  status: string
  time_window_start: string | null
  time_window_end: string | null
  estimated_duration_minutes: number
  customer_notes: string | null
  customer: {
    id: string
    person_id: string
    address_line1: string | null
    address_line2: string | null
    city: string | null
    state: string | null
    postal_code: string | null
    person: {
      id: string
      first_name: string
      last_name: string
    }
  }
  service: {
    id: string
    name: string
  }
}

interface RouteReorderableListProps {
  tickets: TicketWithDetails[]
  onReorder: (ticketIds: string[]) => void
  disabled?: boolean
}

interface SortableTicketItemProps {
  ticket: TicketWithDetails
  index: number
  disabled?: boolean
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'pending':
      return 'Pending'
    case 'scheduled':
      return 'Scheduled'
    case 'confirmed':
      return 'Confirmed'
    case 'en_route':
      return 'En Route'
    case 'in_progress':
      return 'In Progress'
    case 'completed':
      return 'Completed'
    case 'cancelled':
      return 'Cancelled'
    default:
      return status
  }
}

function formatTimeWindow(start: string | null, end: string | null): string {
  if (!start || !end) return 'Flexible'
  // Remove seconds from time strings
  const startTime = start.substring(0, 5)
  const endTime = end.substring(0, 5)
  return `${startTime} - ${endTime}`
}

function SortableTicketItem({ ticket, index, disabled }: SortableTicketItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: ticket.id, disabled })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const customerName = `${ticket.customer.person.first_name} ${ticket.customer.person.last_name}`
  const address = `${ticket.customer.address_line1 || ''}, ${ticket.customer.city || ''}, ${ticket.customer.state || ''}`

  return (
    <div ref={setNodeRef} style={style} className="mb-2">
      <Card className={`${isDragging ? 'shadow-lg' : 'shadow-sm'} transition-shadow`}>
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {/* Drag Handle */}
            <div
              {...attributes}
              {...listeners}
              className={`flex items-center gap-2 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'}`}
            >
              <GripVertical className="h-5 w-5 text-muted-foreground" />
              <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                {index + 1}
              </div>
            </div>

            {/* Ticket Details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold text-base mb-1">{customerName}</h4>
                  <p className="text-sm text-muted-foreground truncate mb-1">
                    <MapPin className="h-3 w-3 inline mr-1" />
                    {address}
                  </p>
                </div>
                <Badge variant="outline" className="ml-2 whitespace-nowrap">
                  {getStatusLabel(ticket.status)}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-3 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <span className="font-medium">Service:</span>
                  <span>{ticket.service.name}</span>
                </div>

                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{formatTimeWindow(ticket.time_window_start, ticket.time_window_end)}</span>
                </div>

                {ticket.estimated_duration_minutes && (
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <span>{ticket.estimated_duration_minutes} min</span>
                  </div>
                )}
              </div>

              {ticket.customer_notes && (
                <p className="text-sm text-muted-foreground mt-2 italic">
                  Note: {ticket.customer_notes}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function RouteReorderableList({ tickets, onReorder, disabled = false }: RouteReorderableListProps) {
  const [items, setItems] = useState(tickets)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        const newItems = arrayMove(items, oldIndex, newIndex)

        // Call onReorder with just the IDs
        onReorder(newItems.map(item => item.id))

        return newItems
      })
    }
  }

  // Update items when tickets prop changes
  if (tickets.length !== items.length || tickets[0]?.id !== items[0]?.id) {
    setItems(tickets)
  }

  if (tickets.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <MapPin className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>No appointments in this route</p>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={items.map(item => item.id)}
        strategy={verticalListSortingStrategy}
        disabled={disabled}
      >
        <div className="space-y-0">
          {items.map((ticket, index) => (
            <SortableTicketItem
              key={ticket.id}
              ticket={ticket}
              index={index}
              disabled={disabled}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}

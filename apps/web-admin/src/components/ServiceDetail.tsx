import { Clock, DollarSign, Briefcase, CheckCircle2, XCircle, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import type { ServiceTypeWithFormatted } from '@/hooks/useServiceTypes'
import { intervalToMinutes } from '@/lib/validation/service'

interface ServiceDetailProps {
  service: ServiceTypeWithFormatted
  onEdit: () => void
  onDelete: () => void
}

export function ServiceDetail({ service, onEdit, onDelete }: ServiceDetailProps) {
  const durationMinutes = intervalToMinutes(service.estimated_duration)
  const hours = Math.floor(durationMinutes / 60)
  const minutes = durationMinutes % 60

  let durationDisplay = ''
  if (hours > 0) {
    durationDisplay += `${hours}h`
  }
  if (minutes > 0) {
    if (hours > 0) durationDisplay += ' '
    durationDisplay += `${minutes}m`
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold">{service.name}</h2>
          <Badge variant={service.is_active ? 'default' : 'secondary'} className="gap-1">
            {service.is_active ? (
              <>
                <CheckCircle2 className="h-3 w-3" />
                Active
              </>
            ) : (
              <>
                <XCircle className="h-3 w-3" />
                Inactive
              </>
            )}
          </Badge>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={onDelete}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* Description */}
      {service.description && (
        <div>
          <h3 className="mb-2 text-sm font-medium text-muted-foreground">Description</h3>
          <p className="text-sm">{service.description}</p>
        </div>
      )}

      <Separator />

      {/* Key Details */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Price */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            Base Price
          </div>
          <div className="text-2xl font-bold">{service.priceFormatted}</div>
        </div>

        {/* Duration */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Clock className="h-4 w-4" />
            Estimated Duration
          </div>
          <div className="text-2xl font-bold">{durationDisplay || durationMinutes + 'm'}</div>
        </div>
      </div>

      <Separator />

      {/* Required Skills */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <Briefcase className="h-4 w-4" />
          Required Skills
        </div>
        {service.required_skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {service.required_skills.map((skill, index) => (
              <Badge key={index} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            No specific skills required for this service
          </p>
        )}
      </div>

      <Separator />

      {/* Metadata */}
      <div className="space-y-2 text-xs text-muted-foreground">
        <div className="flex justify-between">
          <span>Created:</span>
          <span>{new Date(service.created_at).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Last Updated:</span>
          <span>{new Date(service.updated_at).toLocaleDateString()}</span>
        </div>
        <div className="flex justify-between">
          <span>Service ID:</span>
          <span className="font-mono">{service.id.slice(0, 8)}...</span>
        </div>
      </div>
    </div>
  )
}

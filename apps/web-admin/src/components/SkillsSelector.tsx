import { useServiceTypes } from '@/hooks/useServiceTypes'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { X } from 'lucide-react'

interface SkillsSelectorProps {
  value: string[]
  onChange: (skills: string[]) => void
  disabled?: boolean
}

export function SkillsSelector({ value, onChange, disabled }: SkillsSelectorProps) {
  const { data: serviceTypes, isLoading, error } = useServiceTypes()

  const handleToggleSkill = (skillName: string) => {
    if (value.includes(skillName)) {
      onChange(value.filter(s => s !== skillName))
    } else {
      onChange([...value, skillName])
    }
  }

  const handleRemoveSkill = (skillName: string) => {
    onChange(value.filter(s => s !== skillName))
  }

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <div className="grid grid-cols-2 gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-full" />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-md border border-destructive bg-destructive/10 p-3">
        <p className="text-sm text-destructive">Failed to load skills</p>
      </div>
    )
  }

  if (!serviceTypes || serviceTypes.length === 0) {
    return (
      <div className="rounded-md border border-dashed p-4 text-center">
        <p className="text-sm text-muted-foreground">No skills available</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Selected Skills */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map(skill => (
            <Badge key={skill} variant="default" className="gap-1">
              {skill}
              <button
                type="button"
                onClick={() => handleRemoveSkill(skill)}
                disabled={disabled}
                className="ml-1 rounded-full hover:bg-primary-foreground/20"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Available Skills */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {serviceTypes.map(serviceType => {
          const isChecked = value.includes(serviceType.name)
          return (
            <div key={serviceType.id} className="flex items-center space-x-2">
              <Checkbox
                id={`skill-${serviceType.id}`}
                checked={isChecked}
                onCheckedChange={() => handleToggleSkill(serviceType.name)}
                disabled={disabled}
              />
              <Label
                htmlFor={`skill-${serviceType.id}`}
                className="cursor-pointer text-sm font-normal"
              >
                {serviceType.name}
              </Label>
            </div>
          )
        })}
      </div>

      {value.length === 0 && (
        <p className="text-xs text-muted-foreground">
          Select at least one skill for this technician
        </p>
      )}
    </div>
  )
}

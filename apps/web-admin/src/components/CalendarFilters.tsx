import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useTechnicians } from '@/hooks/useTechnicians'
import { useServices } from '@/hooks/useServices'
import { X } from 'lucide-react'
import type { AppointmentFilters } from '@/hooks/useAppointments'

interface CalendarFiltersProps {
  filters: AppointmentFilters
  onFiltersChange: (filters: AppointmentFilters) => void
}

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'en_route', label: 'En Route' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

export function CalendarFilters({ filters, onFiltersChange }: CalendarFiltersProps) {
  const { technicians } = useTechnicians()
  const { categories } = useServices()

  const [selectedTechnicians, setSelectedTechnicians] = useState<string[]>(filters.technicianIds || [])
  const [selectedServiceTypes, setSelectedServiceTypes] = useState<string[]>(filters.serviceTypes || [])
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>(filters.statuses || [])

  const handleTechnicianToggle = (techId: string) => {
    const newSelection = selectedTechnicians.includes(techId)
      ? selectedTechnicians.filter(id => id !== techId)
      : [...selectedTechnicians, techId]

    setSelectedTechnicians(newSelection)
    onFiltersChange({ ...filters, technicianIds: newSelection.length > 0 ? newSelection : undefined })
  }

  const handleServiceTypeToggle = (category: string) => {
    const newSelection = selectedServiceTypes.includes(category)
      ? selectedServiceTypes.filter(c => c !== category)
      : [...selectedServiceTypes, category]

    setSelectedServiceTypes(newSelection)
    onFiltersChange({ ...filters, serviceTypes: newSelection.length > 0 ? newSelection : undefined })
  }

  const handleStatusToggle = (status: string) => {
    const newSelection = selectedStatuses.includes(status)
      ? selectedStatuses.filter(s => s !== status)
      : [...selectedStatuses, status]

    setSelectedStatuses(newSelection)
    onFiltersChange({ ...filters, statuses: newSelection.length > 0 ? newSelection : undefined })
  }

  const handleClearFilters = () => {
    setSelectedTechnicians([])
    setSelectedServiceTypes([])
    setSelectedStatuses([])
    onFiltersChange({
      startDate: filters.startDate,
      endDate: filters.endDate,
    })
  }

  const hasActiveFilters = selectedTechnicians.length > 0 || selectedServiceTypes.length > 0 || selectedStatuses.length > 0

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-muted/50 rounded-lg">
      {/* Technician Filter */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">Technician</label>
        <Select>
          <SelectTrigger className="w-[200px] bg-background">
            <SelectValue placeholder={selectedTechnicians.length > 0 ? `${selectedTechnicians.length} selected` : 'All Technicians'} />
          </SelectTrigger>
          <SelectContent>
            {technicians.map(tech => (
              <div
                key={tech.id}
                className="flex items-center px-2 py-1.5 cursor-pointer hover:bg-accent rounded-sm"
                onClick={(e) => {
                  e.preventDefault()
                  handleTechnicianToggle(tech.id)
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedTechnicians.includes(tech.id)}
                  onChange={() => handleTechnicianToggle(tech.id)}
                  className="mr-2"
                />
                <span className="text-sm">{tech.name}</span>
              </div>
            ))}
            {technicians.length === 0 && (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">No technicians found</div>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Service Type Filter */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">Service Type</label>
        <Select>
          <SelectTrigger className="w-[200px] bg-background">
            <SelectValue placeholder={selectedServiceTypes.length > 0 ? `${selectedServiceTypes.length} selected` : 'All Types'} />
          </SelectTrigger>
          <SelectContent>
            {categories.map(category => (
              <div
                key={category.value}
                className="flex items-center px-2 py-1.5 cursor-pointer hover:bg-accent rounded-sm"
                onClick={(e) => {
                  e.preventDefault()
                  handleServiceTypeToggle(category.value)
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedServiceTypes.includes(category.value)}
                  onChange={() => handleServiceTypeToggle(category.value)}
                  className="mr-2"
                />
                <span className="text-sm">{category.label} ({category.count})</span>
              </div>
            ))}
            {categories.length === 0 && (
              <div className="px-2 py-1.5 text-sm text-muted-foreground">No categories found</div>
            )}
          </SelectContent>
        </Select>
      </div>

      {/* Status Filter */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-medium text-muted-foreground">Status</label>
        <Select>
          <SelectTrigger className="w-[200px] bg-background">
            <SelectValue placeholder={selectedStatuses.length > 0 ? `${selectedStatuses.length} selected` : 'All Statuses'} />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map(status => (
              <div
                key={status.value}
                className="flex items-center px-2 py-1.5 cursor-pointer hover:bg-accent rounded-sm"
                onClick={(e) => {
                  e.preventDefault()
                  handleStatusToggle(status.value)
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedStatuses.includes(status.value)}
                  onChange={() => handleStatusToggle(status.value)}
                  className="mr-2"
                />
                <span className="text-sm">{status.label}</span>
              </div>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClearFilters}
          className="ml-auto"
        >
          <X className="h-4 w-4 mr-1" />
          Clear Filters
        </Button>
      )}

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="w-full flex flex-wrap gap-2 mt-2">
          {selectedTechnicians.map(techId => {
            const tech = technicians.find(t => t.id === techId)
            return tech ? (
              <div key={techId} className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                <span>{tech.name}</span>
                <button onClick={() => handleTechnicianToggle(techId)} className="hover:bg-primary/20 rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : null
          })}
          {selectedServiceTypes.map(category => {
            const cat = categories.find(c => c.value === category)
            return cat ? (
              <div key={category} className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                <span>{cat.label}</span>
                <button onClick={() => handleServiceTypeToggle(category)} className="hover:bg-primary/20 rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : null
          })}
          {selectedStatuses.map(status => {
            const stat = STATUS_OPTIONS.find(s => s.value === status)
            return stat ? (
              <div key={status} className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-md text-xs">
                <span>{stat.label}</span>
                <button onClick={() => handleStatusToggle(status)} className="hover:bg-primary/20 rounded-full p-0.5">
                  <X className="h-3 w-3" />
                </button>
              </div>
            ) : null
          })}
        </div>
      )}
    </div>
  )
}

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { ServiceTypeWithFormatted } from '@/hooks/useServiceTypes'
import { intervalToMinutes } from '@/lib/validation/service'

interface ServiceTableProps {
  services: ServiceTypeWithFormatted[]
  onSelectService: (service: ServiceTypeWithFormatted) => void
}

export function ServiceTable({ services, onSelectService }: ServiceTableProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')

  // Filter services based on search and status
  const filteredServices = useMemo(() => {
    return services.filter(service => {
      // Status filter
      if (statusFilter === 'active' && !service.is_active) return false
      if (statusFilter === 'inactive' && service.is_active) return false

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const nameMatch = service.name.toLowerCase().includes(query)
        const descMatch = service.description?.toLowerCase().includes(query)
        const skillsMatch = service.required_skills.some(skill =>
          skill.toLowerCase().includes(query)
        )
        if (!nameMatch && !descMatch && !skillsMatch) return false
      }

      return true
    })
  }, [services, searchQuery, statusFilter])

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search services by name, description, or skills..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Services</SelectItem>
            <SelectItem value="active">Active Only</SelectItem>
            <SelectItem value="inactive">Inactive Only</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Service Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-center">Duration</TableHead>
              <TableHead>Required Skills</TableHead>
              <TableHead className="text-center">Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredServices.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center">
                  <div className="text-muted-foreground">
                    {searchQuery || statusFilter !== 'all'
                      ? 'No services match your filters'
                      : 'No services found. Create your first service to get started.'}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredServices.map((service) => (
                <TableRow
                  key={service.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => onSelectService(service)}
                >
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell className="max-w-md truncate">
                    {service.description || (
                      <span className="text-muted-foreground">No description</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {service.priceFormatted}
                  </TableCell>
                  <TableCell className="text-center">
                    {intervalToMinutes(service.estimated_duration)} min
                  </TableCell>
                  <TableCell>
                    {service.required_skills.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {service.required_skills.slice(0, 3).map((skill, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                        {service.required_skills.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{service.required_skills.length - 3}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">No skills required</span>
                    )}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={service.is_active ? 'default' : 'secondary'}>
                      {service.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Results count */}
      {filteredServices.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Showing {filteredServices.length} of {services.length} service
          {services.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}

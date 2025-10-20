import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
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
import { useTechnicians, type TechnicianFilters } from '@/hooks/useTechnicians'
import { Search, Filter, UserCheck, UserX } from 'lucide-react'
import type { TechnicianData } from '@/hooks/useTechnicians'

interface TechnicianTableProps {
  onSelectTechnician: (technician: TechnicianData) => void
}

export function TechnicianTable({ onSelectTechnician }: TechnicianTableProps) {
  const [filters, setFilters] = useState<TechnicianFilters>({
    status: 'active',
    search: '',
  })

  const { data: technicians, isLoading, error } = useTechnicians(filters)

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({ ...prev, search: value }))
  }

  const handleStatusChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      status: value as 'active' | 'inactive' | 'all',
    }))
  }

  if (error) {
    return (
      <div className="rounded-lg border border-destructive bg-destructive/10 p-6">
        <div className="flex items-center gap-2">
          <svg
            className="h-5 w-5 text-destructive"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm font-medium text-destructive">
            Failed to load technicians: {error.message}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name or email..."
            value={filters.search}
            onChange={e => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={filters.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="active">Active Only</SelectItem>
              <SelectItem value="inactive">Inactive Only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Skills</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Loading skeleton
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Skeleton className="h-5 w-16" />
                      <Skeleton className="h-5 w-16" />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-16" />
                  </TableCell>
                </TableRow>
              ))
            ) : !technicians || technicians.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  <div className="flex flex-col items-center gap-2">
                    <UserX className="h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                      {filters.search || filters.status !== 'all'
                        ? 'No technicians found matching your filters'
                        : 'No technicians yet. Create your first technician to get started.'}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              technicians.map(technician => (
                <TableRow
                  key={technician.id}
                  className="cursor-pointer"
                  onClick={() => onSelectTechnician(technician)}
                >
                  <TableCell className="font-medium">
                    <div>
                      <div className="flex items-center gap-2">
                        {technician.firstName} {technician.lastName}
                        {technician.isActive && (
                          <UserCheck className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <div className="text-muted-foreground">{technician.email}</div>
                      {technician.phone && (
                        <div className="text-muted-foreground">{technician.phone}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {technician.skills.length > 0 ? (
                        technician.skills.slice(0, 3).map(skill => (
                          <Badge key={skill} variant="secondary">
                            {skill}
                          </Badge>
                        ))
                      ) : (
                        <span className="text-sm text-muted-foreground">No skills</span>
                      )}
                      {technician.skills.length > 3 && (
                        <Badge variant="outline">+{technician.skills.length - 3}</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={technician.isActive ? 'default' : 'secondary'}>
                      {technician.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={e => {
                        e.stopPropagation()
                        onSelectTechnician(technician)
                      }}
                    >
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Results count */}
      {!isLoading && technicians && technicians.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Showing {technicians.length} technician{technicians.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  )
}

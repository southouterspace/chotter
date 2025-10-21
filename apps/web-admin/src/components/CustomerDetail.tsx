import { useCustomer } from '@/hooks/useCustomer'
import { useDeleteCustomer } from '@/hooks/useDeleteCustomer'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Edit, Trash2, Mail, Phone, MapPin, Calendar, AlertTriangle } from 'lucide-react'
import { format } from 'date-fns'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useState } from 'react'

interface CustomerDetailProps {
  customerId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: () => void
  onDelete?: () => void
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-gray-500',
  scheduled: 'bg-blue-500',
  in_progress: 'bg-amber-500',
  completed: 'bg-green-500',
  cancelled: 'bg-red-500',
}

export function CustomerDetail({
  customerId,
  open,
  onOpenChange,
  onEdit,
  onDelete,
}: CustomerDetailProps) {
  const { toast } = useToast()
  const { data: customer, isLoading } = useCustomer(customerId)
  const deleteCustomer = useDeleteCustomer()
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  const handleDelete = async () => {
    if (!customerId) return

    try {
      await deleteCustomer.mutateAsync(customerId)
      toast({
        title: 'Customer deleted',
        description: 'Customer has been deleted successfully.',
      })
      setDeleteDialogOpen(false)
      onOpenChange(false)
      onDelete?.()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete customer',
        variant: 'destructive',
      })
    }
  }

  const formatAddress = (address: any) => {
    if (!address || typeof address !== 'object') return 'N/A'
    const { street, city, state, zip } = address
    if (!street && !city) return 'N/A'
    return (
      <div className="flex items-start gap-2">
        <MapPin className="h-4 w-4 mt-0.5 text-muted-foreground" />
        <div>
          {street && <div>{street}</div>}
          {(city || state || zip) && (
            <div>
              {city}
              {city && (state || zip) ? ', ' : ''}
              {state} {zip}
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Customer Details</DialogTitle>
            <DialogDescription>View customer information and appointment history</DialogDescription>
          </DialogHeader>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          ) : customer ? (
            <div className="space-y-6">
              {/* Customer Info */}
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {customer.first_name} {customer.last_name}
                    </h2>
                    {customer.company_name && (
                      <p className="text-sm text-muted-foreground">{customer.company_name}</p>
                    )}
                  </div>
                  <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
                    {customer.status}
                  </Badge>
                </div>

                <div className="grid gap-3">
                  {customer.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <a href={`mailto:${customer.email}`} className="text-sm hover:underline">
                        {customer.email}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a href={`tel:${customer.phone}`} className="text-sm hover:underline">
                      {customer.phone}
                    </a>
                  </div>
                  {customer.service_address && (
                    <div className="text-sm">{formatAddress(customer.service_address)}</div>
                  )}
                </div>

                {customer.notes && (
                  <div className="rounded-lg bg-muted p-3">
                    <p className="text-sm font-medium mb-1">Notes</p>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {customer.notes}
                    </p>
                  </div>
                )}

                <div className="flex gap-2">
                  <Button onClick={onEdit} variant="outline" className="gap-2">
                    <Edit className="h-4 w-4" />
                    Edit
                  </Button>
                  <Button
                    onClick={() => setDeleteDialogOpen(true)}
                    variant="outline"
                    className="gap-2 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>

              <Separator />

              {/* Appointment History */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold">Appointment History</h3>
                  <Badge variant="secondary">
                    {customer.appointments.length} total
                  </Badge>
                </div>

                {customer.appointments.length > 0 ? (
                  <div className="rounded-lg border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Service</TableHead>
                          <TableHead>Technician</TableHead>
                          <TableHead>Status</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {customer.appointments.map((appointment) => (
                          <TableRow key={appointment.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">
                                  {appointment.scheduled_for
                                    ? format(new Date(appointment.scheduled_for), 'MMM d, yyyy')
                                    : 'Not scheduled'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              {appointment.service_name}
                            </TableCell>
                            <TableCell>
                              {appointment.technician_name || (
                                <span className="text-muted-foreground">Unassigned</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge
                                variant="secondary"
                                className={`${
                                  STATUS_COLORS[appointment.status] || 'bg-gray-500'
                                } text-white`}
                              >
                                {appointment.status.replace('_', ' ')}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed p-8 text-center">
                    <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-semibold">No appointments yet</h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      This customer has no appointment history.
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center text-muted-foreground">Customer not found</div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this customer and all associated data. This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Delete Customer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

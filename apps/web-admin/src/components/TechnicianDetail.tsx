import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { TechnicianForm } from '@/components/TechnicianForm'
import { TechnicianMetrics } from '@/components/TechnicianMetrics'
import { useUpdateTechnician } from '@/hooks/useUpdateTechnician'
import { useDeleteTechnician } from '@/hooks/useDeleteTechnician'
import { useToast } from '@/hooks/useToast'
import type { TechnicianData } from '@/hooks/useTechnicians'
import type { TechnicianFormData } from '@/lib/validation/technician'
import {
  Mail,
  Phone,
  DollarSign,
  Calendar,
  Clock,
  Edit,
  Trash2,
  UserCheck,
  UserX,
} from 'lucide-react'

interface TechnicianDetailProps {
  technician: TechnicianData
  onClose: () => void
}

const DAYS = [
  { key: 0, label: 'Sunday' },
  { key: 1, label: 'Monday' },
  { key: 2, label: 'Tuesday' },
  { key: 3, label: 'Wednesday' },
  { key: 4, label: 'Thursday' },
  { key: 5, label: 'Friday' },
  { key: 6, label: 'Saturday' },
]

export function TechnicianDetail({ technician, onClose }: TechnicianDetailProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const updateTechnician = useUpdateTechnician()
  const deleteTechnician = useDeleteTechnician()
  const { toast } = useToast()

  const handleUpdate = async (data: TechnicianFormData) => {
    try {
      await updateTechnician.mutateAsync({ ...data, id: technician.id })
      toast({
        title: 'Success',
        description: 'Technician updated successfully',
      })
      setIsEditing(false)
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update technician',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this technician? This will deactivate them.')) {
      return
    }

    try {
      setIsDeleting(true)
      await deleteTechnician.mutateAsync(technician.id)
      toast({
        title: 'Success',
        description: 'Technician deactivated successfully',
      })
      onClose()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to delete technician',
        variant: 'destructive',
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold">
                {technician.firstName} {technician.lastName}
              </h2>
              <Badge variant={technician.isActive ? 'default' : 'secondary'}>
                {technician.isActive ? (
                  <>
                    <UserCheck className="mr-1 h-3 w-3" />
                    Active
                  </>
                ) : (
                  <>
                    <UserX className="mr-1 h-3 w-3" />
                    Inactive
                  </>
                )}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>

        <Separator />

        {/* Performance Metrics */}
        <TechnicianMetrics technicianId={technician.id} />

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span>{technician.email}</span>
            </div>
            {technician.phone && (
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{technician.phone}</span>
              </div>
            )}
            {technician.hourlyRate && (
              <div className="flex items-center gap-3 text-sm">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span>${technician.hourlyRate.toFixed(2)}/hour</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Skills</CardTitle>
          </CardHeader>
          <CardContent>
            {technician.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {technician.skills.map(skill => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No skills assigned</p>
            )}
          </CardContent>
        </Card>

        {/* Certifications */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Certifications</CardTitle>
          </CardHeader>
          <CardContent>
            {technician.certifications && technician.certifications.length > 0 ? (
              <div className="space-y-3">
                {technician.certifications.map((cert, index) => {
                  const isExpired = cert.expiryDate && new Date(cert.expiryDate) < new Date()
                  const isExpiringSoon = cert.expiryDate &&
                    !isExpired &&
                    new Date(cert.expiryDate).getTime() - new Date().getTime() < 30 * 24 * 60 * 60 * 1000

                  return (
                    <div
                      key={index}
                      className={`rounded-lg border p-3 ${
                        isExpired ? 'border-destructive bg-destructive/5' :
                        isExpiringSoon ? 'border-yellow-500 bg-yellow-50' :
                        ''
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="font-medium">{cert.name}</div>
                          <div className="mt-1 space-y-1 text-xs text-muted-foreground">
                            <div>Issued: {new Date(cert.issueDate).toLocaleDateString()}</div>
                            {cert.expiryDate && (
                              <div className={isExpired ? 'text-destructive font-medium' : isExpiringSoon ? 'text-yellow-700 font-medium' : ''}>
                                Expires: {new Date(cert.expiryDate).toLocaleDateString()}
                                {isExpired && ' (Expired)'}
                                {isExpiringSoon && ' (Expires Soon)'}
                              </div>
                            )}
                            {cert.certificationNumber && (
                              <div>Number: {cert.certificationNumber}</div>
                            )}
                          </div>
                        </div>
                        {isExpired ? (
                          <Badge variant="destructive" className="ml-2">Expired</Badge>
                        ) : isExpiringSoon ? (
                          <Badge variant="outline" className="ml-2 border-yellow-500 text-yellow-700">Expiring Soon</Badge>
                        ) : (
                          <Badge variant="outline" className="ml-2">Active</Badge>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No certifications added</p>
            )}
          </CardContent>
        </Card>

        {/* Work Schedule */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Work Schedule
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {DAYS.map(({ key, label }) => {
                const dayAvailability = technician.availability.find(
                  a => a.dayOfWeek === key
                )

                return (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <span className="font-medium">{label}</span>
                    {dayAvailability?.isAvailable ? (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>
                          {dayAvailability.startTime} - {dayAvailability.endTime}
                        </span>
                      </div>
                    ) : (
                      <Badge variant="outline">Unavailable</Badge>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Notes */}
        {technician.notes && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {technician.notes}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Technician</DialogTitle>
          </DialogHeader>
          <TechnicianForm
            technician={technician}
            onSubmit={handleUpdate}
            onCancel={() => setIsEditing(false)}
            isSubmitting={updateTechnician.isPending}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}

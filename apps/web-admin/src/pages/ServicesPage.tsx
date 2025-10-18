import { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { ServiceTable } from '@/components/ServiceTable'
import { ServiceForm } from '@/components/ServiceForm'
import { ServiceDetail } from '@/components/ServiceDetail'
import { useToast } from '@/hooks/use-toast'
import { useServiceTypes, type ServiceTypeWithFormatted } from '@/hooks/useServiceTypes'
import { useCreateServiceType } from '@/hooks/useCreateServiceType'
import { useUpdateServiceType } from '@/hooks/useUpdateServiceType'
import { useDeleteServiceType } from '@/hooks/useDeleteServiceType'
import { dollarsToCents, minutesToInterval, type ServiceFormData } from '@/lib/validation/service'

type DialogMode = 'create' | 'edit' | 'detail' | null

export function ServicesPage() {
  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [selectedService, setSelectedService] = useState<ServiceTypeWithFormatted | null>(null)

  const { toast } = useToast()
  const { data: services = [], isLoading, error } = useServiceTypes()
  const createMutation = useCreateServiceType()
  const updateMutation = useUpdateServiceType()
  const deleteMutation = useDeleteServiceType()

  const handleSelectService = (service: ServiceTypeWithFormatted) => {
    setSelectedService(service)
    setDialogMode('detail')
  }

  const handleCreateClick = () => {
    setSelectedService(null)
    setDialogMode('create')
  }

  const handleEditClick = () => {
    setDialogMode('edit')
  }

  const handleCloseDialog = () => {
    setDialogMode(null)
    setSelectedService(null)
  }

  const handleCreateService = async (data: ServiceFormData) => {
    try {
      await createMutation.mutateAsync({
        name: data.name,
        description: data.description || null,
        base_price: dollarsToCents(data.price),
        estimated_duration: minutesToInterval(data.durationMinutes),
        required_skills: data.requiredSkills,
        is_active: data.isActive,
      })

      toast({
        title: 'Service created',
        description: `${data.name} has been created successfully.`,
      })

      handleCloseDialog()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to create service',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
      })
    }
  }

  const handleUpdateService = async (data: ServiceFormData) => {
    if (!selectedService) return

    try {
      await updateMutation.mutateAsync({
        id: selectedService.id,
        updates: {
          name: data.name,
          description: data.description || null,
          base_price: dollarsToCents(data.price),
          estimated_duration: minutesToInterval(data.durationMinutes),
          required_skills: data.requiredSkills,
          is_active: data.isActive,
        },
      })

      toast({
        title: 'Service updated',
        description: `${data.name} has been updated successfully.`,
      })

      handleCloseDialog()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to update service',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
      })
    }
  }

  const handleDeleteService = async () => {
    if (!selectedService) return

    // Confirm deletion
    if (!confirm(`Are you sure you want to delete "${selectedService.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      await deleteMutation.mutateAsync(selectedService.id)

      toast({
        title: 'Service deleted',
        description: `${selectedService.name} has been deleted successfully.`,
      })

      handleCloseDialog()
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Failed to delete service',
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
      })
    }
  }

  const isDialogOpen = dialogMode !== null
  const isSubmitting = createMutation.isPending || updateMutation.isPending

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Services</h1>
          <p className="text-muted-foreground">
            Manage your bookable services, pricing, and requirements
          </p>
        </div>
        <Button onClick={handleCreateClick}>
          <Plus className="mr-2 h-4 w-4" />
          Create Service
        </Button>
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4">
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
              Failed to load services: {error.message}
            </p>
          </div>
        </div>
      )}

      {/* Stats */}
      {!error && services.length > 0 && (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <div className="rounded-lg border bg-card p-4">
            <div className="text-2xl font-bold">{services.length}</div>
            <div className="text-xs text-muted-foreground">Total Services</div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="text-2xl font-bold text-green-600">
              {services.filter(s => s.is_active).length}
            </div>
            <div className="text-xs text-muted-foreground">Active</div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="text-2xl font-bold text-gray-600">
              {services.filter(s => !s.is_active).length}
            </div>
            <div className="text-xs text-muted-foreground">Inactive</div>
          </div>
          <div className="rounded-lg border bg-card p-4">
            <div className="text-2xl font-bold text-blue-600">
              ${Math.round(services.reduce((sum, s) => sum + s.base_price, 0) / services.length / 100)}
            </div>
            <div className="text-xs text-muted-foreground">Avg. Price</div>
          </div>
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex h-64 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* Services Table */}
      {!isLoading && !error && (
        <ServiceTable services={services} onSelectService={handleSelectService} />
      )}

      {/* Dialogs */}
      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          {dialogMode === 'create' && (
            <>
              <DialogHeader>
                <DialogTitle>Create New Service</DialogTitle>
                <DialogDescription>
                  Add a new bookable service to your business catalog
                </DialogDescription>
              </DialogHeader>
              <ServiceForm
                onSubmit={handleCreateService}
                onCancel={handleCloseDialog}
                isSubmitting={isSubmitting}
              />
            </>
          )}

          {dialogMode === 'edit' && selectedService && (
            <>
              <DialogHeader>
                <DialogTitle>Edit Service</DialogTitle>
                <DialogDescription>
                  Update service details, pricing, and requirements
                </DialogDescription>
              </DialogHeader>
              <ServiceForm
                service={selectedService}
                onSubmit={handleUpdateService}
                onCancel={handleCloseDialog}
                isSubmitting={isSubmitting}
              />
            </>
          )}

          {dialogMode === 'detail' && selectedService && (
            <>
              <DialogHeader>
                <DialogTitle>Service Details</DialogTitle>
              </DialogHeader>
              <ServiceDetail
                service={selectedService}
                onEdit={handleEditClick}
                onDelete={handleDeleteService}
              />
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

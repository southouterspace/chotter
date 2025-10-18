import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { TechnicianTable } from '@/components/TechnicianTable'
import { TechnicianForm } from '@/components/TechnicianForm'
import { TechnicianDetail } from '@/components/TechnicianDetail'
import { useCreateTechnician } from '@/hooks/useCreateTechnician'
import { useToast } from '@/hooks/useToast'
import { useAuth } from '@/hooks/useAuth'
import type { TechnicianData } from '@/hooks/useTechnicians'
import type { TechnicianFormData } from '@/lib/validation/technician'
import { UserPlus, Users } from 'lucide-react'

type View = 'list' | 'detail' | 'create'

export function TechniciansPage() {
  const [view, setView] = useState<View>('list')
  const [selectedTechnician, setSelectedTechnician] = useState<TechnicianData | null>(null)
  const createTechnician = useCreateTechnician()
  const { toast } = useToast()
  const { user } = useAuth()

  const handleSelectTechnician = (technician: TechnicianData) => {
    setSelectedTechnician(technician)
    setView('detail')
  }

  const handleCreateClick = () => {
    setView('create')
  }

  const handleCreate = async (data: TechnicianFormData) => {
    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'You must be logged in to create a technician',
        variant: 'destructive',
      })
      return
    }

    try {
      await createTechnician.mutateAsync({
        ...data,
        authUserId: user.id,
      })
      toast({
        title: 'Success',
        description: 'Technician created successfully',
      })
      setView('list')
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create technician',
        variant: 'destructive',
      })
    }
  }

  const handleCloseDetail = () => {
    setSelectedTechnician(null)
    setView('list')
  }

  const handleCancelCreate = () => {
    setView('list')
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Technicians</h1>
          <p className="text-muted-foreground">
            Manage your team of technicians, their skills, and availability
          </p>
        </div>

        <Button onClick={handleCreateClick}>
          <UserPlus className="mr-2 h-4 w-4" />
          Add Technician
        </Button>
      </div>

      {/* Main Content */}
      {view === 'list' && (
        <TechnicianTable onSelectTechnician={handleSelectTechnician} />
      )}

      {/* Detail View */}
      {view === 'detail' && selectedTechnician && (
        <div className="rounded-lg border bg-card p-6">
          <TechnicianDetail
            technician={selectedTechnician}
            onClose={handleCloseDetail}
          />
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={view === 'create'} onOpenChange={(open) => !open && handleCancelCreate()}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Add New Technician
            </DialogTitle>
          </DialogHeader>
          <TechnicianForm
            onSubmit={handleCreate}
            onCancel={handleCancelCreate}
            isSubmitting={createTechnician.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

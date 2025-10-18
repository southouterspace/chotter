import { useState } from 'react'
import { CustomerTable } from '@/components/CustomerTable'
import { CustomerForm } from '@/components/CustomerForm'
import { CustomerDetail } from '@/components/CustomerDetail'
import { useCustomer } from '@/hooks/useCustomer'
import type { Database } from '@chotter/database/types/database'

type Customer = Database['public']['Tables']['customers']['Row']

export function CustomersPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)

  const { data: customerData } = useCustomer(selectedCustomerId)

  const handleCustomerClick = (customerId: string) => {
    setSelectedCustomerId(customerId)
    setDetailsOpen(true)
  }

  const handleCreateClick = () => {
    setEditingCustomer(null)
    setFormOpen(true)
  }

  const handleEditClick = () => {
    if (customerData) {
      setEditingCustomer(customerData)
      setDetailsOpen(false)
      setFormOpen(true)
    }
  }

  const handleFormClose = () => {
    setFormOpen(false)
    setEditingCustomer(null)
  }

  const handleDetailsClose = () => {
    setDetailsOpen(false)
    setSelectedCustomerId(null)
  }

  const handleDeleteSuccess = () => {
    setSelectedCustomerId(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
        <p className="text-muted-foreground">
          Manage your customer database and view appointment history
        </p>
      </div>

      {/* Customer Table */}
      <CustomerTable onCustomerClick={handleCustomerClick} onCreateClick={handleCreateClick} />

      {/* Customer Form Dialog */}
      <CustomerForm
        open={formOpen}
        onOpenChange={handleFormClose}
        customer={editingCustomer}
        onSuccess={() => {
          handleFormClose()
        }}
      />

      {/* Customer Details Dialog */}
      <CustomerDetail
        customerId={selectedCustomerId}
        open={detailsOpen}
        onOpenChange={handleDetailsClose}
        onEdit={handleEditClick}
        onDelete={handleDeleteSuccess}
      />
    </div>
  )
}

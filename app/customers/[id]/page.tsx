'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useCustomerStore } from '@/lib/stores/customer-store'
import { Customer } from '@/lib/types/customers'
import { CustomerDetail } from '@/components/customers/customer-detail'
import { CustomerForm } from '@/components/customers/customer-form'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ArrowLeft, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'

export default function CustomerDetailPage() {
  const router = useRouter()
  const params = useParams()
  const customerId = params.id as string

  const getCustomer = useCustomerStore((state) => state.getCustomer)
  const deleteCustomer = useCustomerStore((state) => state.deleteCustomer)

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)

  useEffect(() => {
    const foundCustomer = getCustomer(customerId)
    setCustomer(foundCustomer || null)
  }, [customerId, getCustomer])

  const handleEdit = () => {
    setIsEditDialogOpen(true)
  }

  const handleDelete = () => {
    if (customer && confirm(`Are you sure you want to delete ${customer.name}?`)) {
      deleteCustomer(customer.id)
      router.push('/customers')
    }
  }

  const handleSaveCustomer = (updatedCustomer: Customer) => {
    setCustomer(updatedCustomer)
    setIsEditDialogOpen(false)
  }

  const handleCancelForm = () => {
    setIsEditDialogOpen(false)
  }

  const handleCreateEstimate = () => {
    // Navigate to create estimate with customer pre-filled
    console.log('Create estimate for:', customer?.name)
    // router.push(`/estimates/new?customerId=${customer?.id}`)
  }

  const handleCreateWorkOrder = () => {
    // Navigate to create work order with customer pre-filled
    console.log('Create work order for:', customer?.name)
    // router.push(`/work-orders/new?customerId=${customer?.id}`)
  }

  const handleCreateInvoice = () => {
    // Navigate to create invoice with customer pre-filled
    console.log('Create invoice for:', customer?.name)
    // router.push(`/invoices/new?customerId=${customer?.id}`)
  }

  const handleScheduleAppointment = () => {
    // Navigate to create appointment with customer pre-filled
    console.log('Schedule appointment for:', customer?.name)
    // router.push(`/appointments/new?customerId=${customer?.id}`)
  }

  if (!customer) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Button variant="ghost" onClick={() => router.push('/customers')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Customers
        </Button>

        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Customer not found. The customer may have been deleted or the ID is invalid.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Button variant="ghost" onClick={() => router.push('/customers')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Customers
      </Button>

      <CustomerDetail
        customer={customer}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onCreateEstimate={handleCreateEstimate}
        onCreateWorkOrder={handleCreateWorkOrder}
        onCreateInvoice={handleCreateInvoice}
        onScheduleAppointment={handleScheduleAppointment}
      />

      {/* Edit Customer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>
              Update customer information, addresses, and contacts.
            </DialogDescription>
          </DialogHeader>
          <CustomerForm
            customer={customer}
            onSave={handleSaveCustomer}
            onCancel={handleCancelForm}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

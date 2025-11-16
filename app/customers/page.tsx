'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Customer } from '@/lib/types/customers'
import { CustomerList } from '@/components/customers/customer-list'
import { CustomerStats } from '@/components/customers/customer-stats'
import { CustomerForm } from '@/components/customers/customer-form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Users, BarChart3 } from 'lucide-react'

export default function CustomersPage() {
  const router = useRouter()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [activeTab, setActiveTab] = useState('customers')

  const handleCustomerClick = (customer: Customer) => {
    router.push(`/customers/${customer.id}`)
  }

  const handleCreateCustomer = () => {
    setIsCreateDialogOpen(true)
  }

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setIsEditDialogOpen(true)
  }

  const handleDeleteCustomer = (customer: Customer) => {
    if (confirm(`Are you sure you want to delete ${customer.name}?`)) {
      // Delete handled by the store
    }
  }

  const handleSaveCustomer = (customer: Customer) => {
    setIsCreateDialogOpen(false)
    setIsEditDialogOpen(false)
    setSelectedCustomer(null)
    // Optionally navigate to the customer detail page
    // router.push(`/customers/${customer.id}`)
  }

  const handleCancelForm = () => {
    setIsCreateDialogOpen(false)
    setIsEditDialogOpen(false)
    setSelectedCustomer(null)
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="customers" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Customers
          </TabsTrigger>
          <TabsTrigger value="stats" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Statistics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-6">
          <CustomerList
            onCustomerClick={handleCustomerClick}
            onCreateCustomer={handleCreateCustomer}
            onEditCustomer={handleEditCustomer}
            onDeleteCustomer={handleDeleteCustomer}
            onCreateEstimate={(customer) => {
              // Navigate to create estimate with customer pre-filled
              console.log('Create estimate for:', customer.name)
            }}
            onScheduleAppointment={(customer) => {
              // Navigate to create appointment with customer pre-filled
              console.log('Schedule appointment for:', customer.name)
            }}
          />
        </TabsContent>

        <TabsContent value="stats" className="space-y-6">
          <CustomerStats />
        </TabsContent>
      </Tabs>

      {/* Create Customer Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Add New Customer</DialogTitle>
            <DialogDescription>
              Create a new customer record with contact information, addresses, and more.
            </DialogDescription>
          </DialogHeader>
          <CustomerForm onSave={handleSaveCustomer} onCancel={handleCancelForm} />
        </DialogContent>
      </Dialog>

      {/* Edit Customer Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>
              Update customer information, addresses, and contacts.
            </DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <CustomerForm
              customer={selectedCustomer}
              onSave={handleSaveCustomer}
              onCancel={handleCancelForm}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

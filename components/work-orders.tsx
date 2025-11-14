'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  ArrowLeft,
  FileText,
  Calendar,
  Edit,
  Trash2,
  Check,
  ArrowRight,
  Clock,
  CheckCircle2
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import LineItemEditor from './line-item-editor'
import {
  LineItem,
  WorkOrderDocument,
  calculateDocumentTotals
} from '@/lib/line-items'

export default function WorkOrders() {
  const {
    workOrders,
    entities,
    updateWorkOrder,
    deleteWorkOrder,
    addWorkOrder,
    convertWorkOrderToInvoice,
    setCurrentSection,
    saveSettings
  } = useAppStore()

  const [view, setView] = useState<'list' | 'create' | 'edit' | 'view'>('list')
  const [selectedWO, setSelectedWO] = useState<WorkOrderDocument | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const [formData, setFormData] = useState<{
    customerName: string
    customerId: string
    jobName: string
    jobId: string
    date: number
    scheduledDate?: number
    status: 'Scheduled' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled'
    assignedTo: string
    taxRate: number
    notes: string
    internalNotes: string
  }>({
    customerName: '',
    customerId: '',
    jobName: '',
    jobId: '',
    date: Date.now(),
    scheduledDate: Date.now() + (24 * 60 * 60 * 1000), // Tomorrow
    status: 'Scheduled',
    assignedTo: '',
    taxRate: 6,
    notes: '',
    internalNotes: ''
  })

  const [lineItems, setLineItems] = useState<LineItem[]>([])

  // Get customers and jobs
  const customers = useMemo(() => entities.filter(e => e.entityType === 'customer'), [entities])
  const jobs = useMemo(() => entities.filter(e => e.entityType === 'job'), [entities])

  // Filter work orders
  const filteredWorkOrders = useMemo(() => {
    if (filterStatus === 'all') return workOrders
    return workOrders.filter(wo => wo.status === filterStatus)
  }, [workOrders, filterStatus])

  const handleCreate = () => {
    setFormData({
      customerName: '',
      customerId: '',
      jobName: '',
      jobId: '',
      date: Date.now(),
      scheduledDate: Date.now() + (24 * 60 * 60 * 1000),
      status: 'Scheduled',
      assignedTo: '',
      taxRate: 6,
      notes: '',
      internalNotes: ''
    })
    setLineItems([])
    setView('create')
  }

  const handleEdit = (wo: WorkOrderDocument) => {
    setFormData({
      customerName: wo.customerName,
      customerId: wo.customerId || '',
      jobName: wo.jobName || '',
      jobId: wo.jobId || '',
      date: wo.date,
      scheduledDate: wo.scheduledDate,
      status: wo.status,
      assignedTo: wo.assignedTo || '',
      taxRate: wo.taxRate,
      notes: wo.notes || '',
      internalNotes: wo.internalNotes || ''
    })
    setLineItems(wo.lineItems)
    setSelectedWO(wo)
    setView('edit')
  }

  const handleView = (wo: WorkOrderDocument) => {
    setSelectedWO(wo)
    setView('view')
  }

  const handleSave = () => {
    if (!formData.customerName) {
      alert('Please select a customer')
      return
    }

    if (lineItems.length === 0) {
      alert('Please add at least one line item')
      return
    }

    const totals = calculateDocumentTotals(lineItems, formData.taxRate)

    const woData: Omit<WorkOrderDocument, 'id' | 'number' | 'companyId' | 'createdAt' | 'updatedAt'> = {
      customerName: formData.customerName,
      customerId: formData.customerId || undefined,
      jobName: formData.jobName || undefined,
      jobId: formData.jobId || undefined,
      date: formData.date,
      scheduledDate: formData.scheduledDate,
      completedDate: formData.status === 'Completed' ? Date.now() : undefined,
      status: formData.status,
      assignedTo: formData.assignedTo || undefined,
      lineItems,
      subtotal: totals.subtotal,
      taxRate: formData.taxRate,
      taxAmount: totals.taxAmount,
      total: totals.total,
      notes: formData.notes,
      internalNotes: formData.internalNotes
    }

    if (view === 'edit' && selectedWO) {
      updateWorkOrder(selectedWO.id, woData)
    } else {
      addWorkOrder(woData)
    }

    saveSettings()
    setView('list')
    setSelectedWO(null)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this work order?')) {
      deleteWorkOrder(id)
      saveSettings()
    }
  }

  const handleConvertToInvoice = (woId: string) => {
    const invId = convertWorkOrderToInvoice(woId)
    updateWorkOrder(woId, { status: 'Completed' })
    saveSettings()
    alert('Invoice created! You can find it in the Invoices section.')
  }

  const handleCustomerChange = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId)
    if (customer) {
      setFormData({
        ...formData,
        customerId: customer.id,
        customerName: customer.data.name || customer.data.company || 'Unknown'
      })
    }
  }

  const handleJobChange = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId)
    if (job) {
      setFormData({
        ...formData,
        jobId: job.id,
        jobName: job.data.name || job.data.address || 'Unknown'
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Scheduled': return 'default'
      case 'In Progress': return 'default'
      case 'On Hold': return 'secondary'
      case 'Completed': return 'outline'
      case 'Cancelled': return 'destructive'
      default: return 'default'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Scheduled': return <Calendar className="w-4 h-4" />
      case 'In Progress': return <Clock className="w-4 h-4" />
      case 'Completed': return <CheckCircle2 className="w-4 h-4" />
      default: return null
    }
  }

  // List View
  if (view === 'list') {
    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentSection('jobs')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Work Orders</h1>
              <p className="text-muted-foreground mt-1">
                Schedule and track work
              </p>
            </div>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            New Work Order
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex gap-2">
              <Button
                variant={filterStatus === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('all')}
              >
                All ({workOrders.length})
              </Button>
              <Button
                variant={filterStatus === 'Scheduled' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('Scheduled')}
              >
                Scheduled ({workOrders.filter(wo => wo.status === 'Scheduled').length})
              </Button>
              <Button
                variant={filterStatus === 'In Progress' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('In Progress')}
              >
                In Progress ({workOrders.filter(wo => wo.status === 'In Progress').length})
              </Button>
              <Button
                variant={filterStatus === 'Completed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('Completed')}
              >
                Completed ({workOrders.filter(wo => wo.status === 'Completed').length})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Work Orders List */}
        <div className="space-y-3">
          {filteredWorkOrders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No work orders found</p>
                <Button className="mt-4" onClick={handleCreate}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Work Order
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredWorkOrders.sort((a, b) => (b.scheduledDate || b.date) - (a.scheduledDate || a.date)).map(wo => (
              <Card key={wo.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{wo.number}</h3>
                        <Badge variant={getStatusColor(wo.status)} className="flex items-center gap-1">
                          {getStatusIcon(wo.status)}
                          {wo.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p className="font-medium text-foreground">{wo.customerName}</p>
                        {wo.jobName && <p>Job: {wo.jobName}</p>}
                        {wo.scheduledDate && (
                          <p className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Scheduled: {new Date(wo.scheduledDate).toLocaleDateString()}
                          </p>
                        )}
                        {wo.assignedTo && <p>Assigned: {wo.assignedTo}</p>}
                        <p className="text-lg font-semibold text-foreground">
                          ${wo.total.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(wo)}
                      >
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(wo)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      {wo.status === 'Completed' && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleConvertToInvoice(wo.id)}
                        >
                          <ArrowRight className="w-4 h-4 mr-2" />
                          Create Invoice
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(wo.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    )
  }

  // Create/Edit View
  if (view === 'create' || view === 'edit') {
    const totals = calculateDocumentTotals(lineItems, formData.taxRate)

    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => {
                setView('list')
                setSelectedWO(null)
              }}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">
                {view === 'edit' ? 'Edit' : 'New'} Work Order
              </h1>
              <p className="text-muted-foreground mt-1">
                {view === 'edit' && selectedWO ? selectedWO.number : 'Number will be auto-generated'}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setView('list')}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Check className="w-4 h-4 mr-2" />
              Save Work Order
            </Button>
          </div>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Work Order Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {view === 'edit' && selectedWO && (
                    <div>
                      <label className="text-sm font-medium mb-1 block">WO Number</label>
                      <Input
                        value={selectedWO.number}
                        disabled
                        className="bg-muted"
                      />
                    </div>
                  )}
                  <div className={view === 'create' ? 'col-span-2' : ''}>
                    <label className="text-sm font-medium mb-1 block">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="Scheduled">Scheduled</option>
                      <option value="In Progress">In Progress</option>
                      <option value="On Hold">On Hold</option>
                      <option value="Completed">Completed</option>
                      <option value="Cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Customer *</label>
                    <select
                      value={formData.customerId}
                      onChange={(e) => handleCustomerChange(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="">Select customer...</option>
                      {customers.map(customer => (
                        <option key={customer.id} value={customer.id}>
                          {customer.data.name || customer.data.company}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Job (Optional)</label>
                    <select
                      value={formData.jobId}
                      onChange={(e) => handleJobChange(e.target.value)}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="">Select job...</option>
                      {jobs.map(job => (
                        <option key={job.id} value={job.id}>
                          {job.data.name || job.data.address}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Created Date</label>
                    <Input
                      type="date"
                      value={new Date(formData.date).toISOString().split('T')[0]}
                      onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value).getTime() })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Scheduled Date</label>
                    <Input
                      type="date"
                      value={formData.scheduledDate ? new Date(formData.scheduledDate).toISOString().split('T')[0] : ''}
                      onChange={(e) => setFormData({ ...formData, scheduledDate: new Date(e.target.value).getTime() })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Assigned To</label>
                    <Input
                      placeholder="Tech name"
                      value={formData.assignedTo}
                      onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Tax Rate (%)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.taxRate}
                    onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Line Items */}
            <LineItemEditor
              lineItems={lineItems}
              onChange={setLineItems}
              taxRate={formData.taxRate}
            />

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Customer Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background text-sm"
                    placeholder="Notes for customer..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-1 block">Internal Notes</label>
                  <textarea
                    value={formData.internalNotes}
                    onChange={(e) => setFormData({ ...formData, internalNotes: e.target.value })}
                    className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background text-sm"
                    placeholder="Internal notes (not visible to customer)..."
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Summary Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span>Subtotal:</span>
                  <span>${totals.subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>Taxable Amount:</span>
                  <span>${totals.taxableAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax ({formData.taxRate}%):</span>
                  <span>${totals.taxAmount.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>${totals.total.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return null
}

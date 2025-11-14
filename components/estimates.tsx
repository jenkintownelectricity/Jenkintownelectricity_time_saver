'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  ArrowLeft,
  FileText,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  Send,
  Check,
  X,
  Download,
  Copy,
  ArrowRight
} from 'lucide-react'
import { useAppStore } from '@/lib/store'
import LineItemEditor from './line-item-editor'
import {
  LineItem,
  EstimateDocument,
  calculateDocumentTotals
} from '@/lib/line-items'

export default function Estimates() {
  const {
    estimates,
    entities,
    addEstimate,
    updateEstimate,
    deleteEstimate,
    convertEstimateToWorkOrder,
    saveSettings
  } = useAppStore()

  const [view, setView] = useState<'list' | 'create' | 'edit' | 'view'>('list')
  const [selectedEstimate, setSelectedEstimate] = useState<EstimateDocument | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const [formData, setFormData] = useState<{
    number: string
    customerName: string
    customerId: string
    jobName: string
    jobId: string
    date: number
    expiryDate: number
    status: 'Draft' | 'Sent' | 'Approved' | 'Rejected' | 'Expired'
    taxRate: number
    notes: string
    termsAndConditions: string
    includeTerms: boolean
  }>({
    number: `EST-${Date.now()}`,
    customerName: '',
    customerId: '',
    jobName: '',
    jobId: '',
    date: Date.now(),
    expiryDate: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days from now
    status: 'Draft',
    taxRate: 6,
    notes: '',
    termsAndConditions: 'This estimate is valid for 30 days from the date above. A 50% deposit is required to begin work. Final payment is due upon completion.',
    includeTerms: true
  })

  const [lineItems, setLineItems] = useState<LineItem[]>([])

  // Get customers for dropdown
  const customers = useMemo(() =>
    entities.filter(e => e.entityType === 'customer'),
    [entities]
  )

  // Get jobs for dropdown
  const jobs = useMemo(() =>
    entities.filter(e => e.entityType === 'job'),
    [entities]
  )

  // Filter estimates
  const filteredEstimates = useMemo(() => {
    if (filterStatus === 'all') return estimates
    return estimates.filter(e => e.status === filterStatus)
  }, [estimates, filterStatus])

  const handleCreate = () => {
    setFormData({
      number: `EST-${Date.now()}`,
      customerName: '',
      customerId: '',
      jobName: '',
      jobId: '',
      date: Date.now(),
      expiryDate: Date.now() + (30 * 24 * 60 * 60 * 1000),
      status: 'Draft',
      taxRate: 6,
      notes: '',
      termsAndConditions: 'This estimate is valid for 30 days from the date above. A 50% deposit is required to begin work. Final payment is due upon completion.',
      includeTerms: true
    })
    setLineItems([])
    setView('create')
  }

  const handleEdit = (estimate: EstimateDocument) => {
    setFormData({
      number: estimate.number,
      customerName: estimate.customerName,
      customerId: estimate.customerId || '',
      jobName: estimate.jobName || '',
      jobId: estimate.jobId || '',
      date: estimate.date,
      expiryDate: estimate.expiryDate || Date.now() + (30 * 24 * 60 * 60 * 1000),
      status: estimate.status,
      taxRate: estimate.taxRate,
      notes: estimate.notes || '',
      termsAndConditions: estimate.termsAndConditions || '',
      includeTerms: estimate.includeTerms
    })
    setLineItems(estimate.lineItems)
    setSelectedEstimate(estimate)
    setView('edit')
  }

  const handleView = (estimate: EstimateDocument) => {
    setSelectedEstimate(estimate)
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

    const estimateData: Omit<EstimateDocument, 'id' | 'createdAt' | 'updatedAt'> = {
      number: formData.number,
      customerName: formData.customerName,
      customerId: formData.customerId || undefined,
      jobName: formData.jobName || undefined,
      jobId: formData.jobId || undefined,
      date: formData.date,
      expiryDate: formData.expiryDate,
      status: formData.status,
      lineItems,
      subtotal: totals.subtotal,
      taxRate: formData.taxRate,
      taxAmount: totals.taxAmount,
      total: totals.total,
      notes: formData.notes,
      termsAndConditions: formData.termsAndConditions,
      includeTerms: formData.includeTerms
    }

    if (view === 'edit' && selectedEstimate) {
      updateEstimate(selectedEstimate.id, estimateData)
    } else {
      addEstimate(estimateData)
    }

    saveSettings()
    setView('list')
    setSelectedEstimate(null)
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this estimate?')) {
      deleteEstimate(id)
      saveSettings()
    }
  }

  const handleConvertToWorkOrder = (estimateId: string) => {
    const woId = convertEstimateToWorkOrder(estimateId)
    updateEstimate(estimateId, { status: 'Approved' })
    saveSettings()
    alert('Work Order created! You can find it in the Work Orders section.')
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
      case 'Draft': return 'secondary'
      case 'Sent': return 'default'
      case 'Approved': return 'outline'
      case 'Rejected': return 'destructive'
      case 'Expired': return 'secondary'
      default: return 'default'
    }
  }

  // List View
  if (view === 'list') {
    return (
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Estimates</h1>
            <p className="text-muted-foreground mt-1">
              Create and manage customer estimates
            </p>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            New Estimate
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
                All ({estimates.length})
              </Button>
              <Button
                variant={filterStatus === 'Draft' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('Draft')}
              >
                Draft ({estimates.filter(e => e.status === 'Draft').length})
              </Button>
              <Button
                variant={filterStatus === 'Sent' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('Sent')}
              >
                Sent ({estimates.filter(e => e.status === 'Sent').length})
              </Button>
              <Button
                variant={filterStatus === 'Approved' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterStatus('Approved')}
              >
                Approved ({estimates.filter(e => e.status === 'Approved').length})
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Estimates List */}
        <div className="space-y-3">
          {filteredEstimates.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No estimates found</p>
                <Button className="mt-4" onClick={handleCreate}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Estimate
                </Button>
              </CardContent>
            </Card>
          ) : (
            filteredEstimates.sort((a, b) => b.date - a.date).map(estimate => (
              <Card key={estimate.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{estimate.number}</h3>
                        <Badge variant={getStatusColor(estimate.status)}>
                          {estimate.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground space-y-1">
                        <p className="font-medium text-foreground">{estimate.customerName}</p>
                        {estimate.jobName && <p>Job: {estimate.jobName}</p>}
                        <p>{new Date(estimate.date).toLocaleDateString()}</p>
                        <p className="text-lg font-semibold text-foreground">
                          ${estimate.total.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleView(estimate)}
                      >
                        View
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(estimate)}
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      {estimate.status === 'Approved' && (
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => handleConvertToWorkOrder(estimate.id)}
                        >
                          <ArrowRight className="w-4 h-4 mr-2" />
                          Create Work Order
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(estimate.id)}
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
                setSelectedEstimate(null)
              }}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">
                {view === 'edit' ? 'Edit' : 'New'} Estimate
              </h1>
              <p className="text-muted-foreground mt-1">{formData.number}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setView('list')}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Check className="w-4 h-4 mr-2" />
              Save Estimate
            </Button>
          </div>
        </div>

        {/* Form */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Estimate Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Estimate Number</label>
                    <Input
                      value={formData.number}
                      onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Status</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                      className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm"
                    >
                      <option value="Draft">Draft</option>
                      <option value="Sent">Sent</option>
                      <option value="Approved">Approved</option>
                      <option value="Rejected">Rejected</option>
                      <option value="Expired">Expired</option>
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium mb-1 block">Date</label>
                    <Input
                      type="date"
                      value={new Date(formData.date).toISOString().split('T')[0]}
                      onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value).getTime() })}
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">Expiry Date</label>
                    <Input
                      type="date"
                      value={new Date(formData.expiryDate).toISOString().split('T')[0]}
                      onChange={(e) => setFormData({ ...formData, expiryDate: new Date(e.target.value).getTime() })}
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

            {/* Notes & Terms */}
            <Card>
              <CardHeader>
                <CardTitle>Notes & Terms</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Notes (Internal)</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full min-h-[80px] px-3 py-2 rounded-md border border-input bg-background text-sm"
                    placeholder="Internal notes..."
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-sm font-medium">Terms & Conditions</label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.includeTerms}
                        onChange={(e) => setFormData({ ...formData, includeTerms: e.target.checked })}
                        className="w-4 h-4"
                      />
                      <span className="text-sm">Include on PDF</span>
                    </label>
                  </div>
                  <textarea
                    value={formData.termsAndConditions}
                    onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
                    className="w-full min-h-[120px] px-3 py-2 rounded-md border border-input bg-background text-sm"
                    placeholder="Terms and conditions..."
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

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" size="sm" className="w-full">
                  <Download className="w-4 h-4 mr-2" />
                  Export PDF
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Email Customer
                </Button>
                <Button variant="outline" size="sm" className="w-full">
                  <Copy className="w-4 h-4 mr-2" />
                  Duplicate
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return null
}

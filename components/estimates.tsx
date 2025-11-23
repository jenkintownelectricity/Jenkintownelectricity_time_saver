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
  ArrowRight,
  Mail,
  Building2
} from 'lucide-react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { useAppStore } from '@/lib/store'
import LineItemEditor from './line-item-editor'
import {
  LineItem,
  EstimateDocument,
  calculateDocumentTotals
} from '@/lib/line-items'
import { EstimatePDF } from './pdf/estimate-pdf'

export default function Estimates() {
  const {
    estimates,
    entities,
    addEstimate,
    updateEstimate,
    deleteEstimate,
    convertEstimateToWorkOrder,
    duplicateEstimate,
    companyProfiles,
    currentCompanyId,
    setCurrentSection,
    saveSettings,
    integrations,
    setIntegration
  } = useAppStore()

  const [view, setView] = useState<'list' | 'create' | 'edit' | 'view'>('list')
  const [selectedEstimate, setSelectedEstimate] = useState<EstimateDocument | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const [formData, setFormData] = useState<{
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

    const estimateData: Omit<EstimateDocument, 'id' | 'number' | 'companyId' | 'createdAt' | 'updatedAt'> = {
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

  const handleDuplicate = (estimateId: string) => {
    const newId = duplicateEstimate(estimateId)
    saveSettings()
    const newEstimate = estimates.find(e => e.id === newId)
    if (newEstimate) {
      alert(`Duplicate created: ${newEstimate.number}`)
    }
  }

  const handleEmail = async (estimate: EstimateDocument) => {
    const company = companyProfiles.find(p => p.id === (estimate.companyId || currentCompanyId)) ||
                    companyProfiles.find(p => p.isDefault) ||
                    companyProfiles[0]

    const customerEmail = prompt(`Send estimate ${estimate.number} to:`, estimate.customerName ? `${estimate.customerName.toLowerCase().replace(/\s+/g, '.')}@email.com` : '')
    if (!customerEmail) return

    try {
      const response = await fetch('/api/email/send-estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estimate,
          company,
          recipientEmail: customerEmail
        })
      })

      if (response.ok) {
        updateEstimate(estimate.id, { status: 'Sent' })
        saveSettings()
        alert(`Estimate sent to ${customerEmail}`)
      } else {
        alert('Failed to send email. Please check your email configuration.')
      }
    } catch (error) {
      alert('Error sending email. Please try again.')
    }
  }

  const handleQuickBooksSync = async (estimate: EstimateDocument) => {
    // Check if QuickBooks is connected
    if (!integrations.quickbooks.enabled || !integrations.quickbooks.accessToken) {
      if (confirm('QuickBooks is not connected. Would you like to connect now?')) {
        try {
          const response = await fetch('/api/quickbooks/auth')
          const data = await response.json()
          if (data.authUrl) {
            window.location.href = data.authUrl
          }
        } catch (error) {
          alert('Failed to initiate QuickBooks connection. Please try again.')
        }
      }
      return
    }

    const company = companyProfiles.find(p => p.id === (estimate.companyId || currentCompanyId)) ||
                    companyProfiles.find(p => p.isDefault) ||
                    companyProfiles[0]

    try {
      const response = await fetch('/api/quickbooks/sync-estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          estimate,
          company,
          accessToken: integrations.quickbooks.accessToken,
          realmId: integrations.quickbooks.realmId
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert(`✅ Estimate ${estimate.number} synced to QuickBooks successfully!`)
      } else {
        // Show detailed error message
        let errorMsg = `Failed to sync to QuickBooks: ${data.error}`
        if (data.details?.Fault?.Error) {
          const qbError = data.details.Fault.Error[0]
          errorMsg += `\n\nQuickBooks Error: ${qbError.Message}`
          if (qbError.Detail) {
            errorMsg += `\nDetails: ${qbError.Detail}`
          }
        }
        alert(errorMsg)
      }
    } catch (error) {
      alert('Error syncing to QuickBooks. Please check your connection and try again.')
    }
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
        jobName: job.data.title || job.data.jobNumber || job.data.address || 'Unknown'
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
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setCurrentSection('jobs')}
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Estimates</h1>
              <p className="text-muted-foreground mt-1">
                Create and manage customer estimates
              </p>
            </div>
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
                      <PDFDownloadLink
                        document={
                          <EstimatePDF
                            estimate={estimate}
                            company={
                              companyProfiles.find(p => p.id === (estimate.companyId || currentCompanyId)) ||
                              companyProfiles.find(p => p.isDefault) ||
                              companyProfiles[0]
                            }
                          />
                        }
                        fileName={`${estimate.number}-estimate.pdf`}
                      >
                        {({ loading }) => (
                          <Button
                            variant="outline"
                            size="sm"
                            disabled={loading}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            {loading ? 'Generating...' : 'PDF'}
                          </Button>
                        )}
                      </PDFDownloadLink>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEmail(estimate)}
                      >
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleQuickBooksSync(estimate)}
                      >
                        <Building2 className="w-4 h-4 mr-2" />
                        Sync QB
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDuplicate(estimate.id)}
                      >
                        <Copy className="w-4 h-4 mr-2" />
                        Duplicate
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
              <p className="text-muted-foreground mt-1">
                {view === 'edit' && selectedEstimate ? selectedEstimate.number : 'Number will be auto-generated'}
              </p>
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
                  {view === 'edit' && selectedEstimate && (
                    <div>
                      <label className="text-sm font-medium mb-1 block">Estimate Number</label>
                      <Input
                        value={selectedEstimate.number}
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
                          {job.data.title || job.data.jobNumber || job.data.address || 'Untitled Job'}
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
                {view === 'edit' && selectedEstimate && (
                  <>
                    <PDFDownloadLink
                      document={
                        <EstimatePDF
                          estimate={selectedEstimate}
                          company={
                            companyProfiles.find(p => p.id === (selectedEstimate.companyId || currentCompanyId)) ||
                            companyProfiles.find(p => p.isDefault) ||
                            companyProfiles[0]
                          }
                        />
                      }
                      fileName={`${selectedEstimate.number}-estimate.pdf`}
                    >
                      {({ loading }) => (
                        <Button variant="outline" size="sm" className="w-full" disabled={loading}>
                          <Download className="w-4 h-4 mr-2" />
                          {loading ? 'Generating...' : 'Export PDF'}
                        </Button>
                      )}
                    </PDFDownloadLink>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleEmail(selectedEstimate)}
                    >
                      <Send className="w-4 h-4 mr-2" />
                      Email Customer
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleDuplicate(selectedEstimate.id)}
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Duplicate
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => handleQuickBooksSync(selectedEstimate)}
                    >
                      <Building2 className="w-4 h-4 mr-2" />
                      Sync to QuickBooks
                    </Button>
                  </>
                )}
                {view === 'create' && (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    Save the estimate first to use quick actions
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return null
}

'use client'

import { useState, useMemo } from 'react'
import { useAppStore } from '@/lib/store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Search,
  Edit,
  Trash2,
  FileText,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  ArrowLeft,
  Download,
  Mail,
  Copy,
  Building2
} from 'lucide-react'
import { PDFDownloadLink } from '@react-pdf/renderer'
import { InvoiceDocument, calculateDocumentTotals } from '@/lib/line-items'
import LineItemEditor from '@/components/line-item-editor'
import { InvoicePDF } from './pdf/invoice-pdf'

type View = 'list' | 'create' | 'edit'

export default function Invoices() {
  const {
    invoices,
    addInvoice,
    updateInvoice,
    deleteInvoice,
    duplicateInvoice,
    getEntitiesByType,
    estimates,
    workOrders,
    companyProfiles,
    currentCompanyId,
    setCurrentSection,
    saveSettings,
    integrations,
    setIntegration
  } = useAppStore()

  // Get customers and jobs from entities
  const customers = getEntitiesByType('customer')
  const jobs = getEntitiesByType('job')

  const [view, setView] = useState<View>('list')
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDocument | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const [formData, setFormData] = useState<{
    customerName: string
    customerId: string
    jobName: string
    jobId: string
    estimateId: string
    workOrderId: string
    date: number
    dueDate: number
    status: 'Draft' | 'Sent' | 'Viewed' | 'Partial' | 'Paid' | 'Overdue' | 'Cancelled'
    taxRate: number
    amountPaid: number
    paymentTerms: string
    notes: string
    termsAndConditions: string
    includeTerms: boolean
  }>({
    customerName: '',
    customerId: '',
    jobName: '',
    jobId: '',
    estimateId: '',
    workOrderId: '',
    date: Date.now(),
    dueDate: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days from now
    status: 'Draft',
    taxRate: 6,
    amountPaid: 0,
    paymentTerms: 'Net 30',
    notes: '',
    termsAndConditions: 'Payment is due upon receipt. Late payments may incur additional fees.',
    includeTerms: true
  })

  const [lineItems, setLineItems] = useState<InvoiceDocument['lineItems']>([])

  // Filter invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      const matchesSearch =
        invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (invoice.jobName && invoice.jobName.toLowerCase().includes(searchTerm.toLowerCase()))

      const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter

      return matchesSearch && matchesStatus
    }).sort((a, b) => b.date - a.date)
  }, [invoices, searchTerm, statusFilter])

  const handleCreate = () => {
    setFormData({
      customerName: '',
      customerId: '',
      jobName: '',
      jobId: '',
      estimateId: '',
      workOrderId: '',
      date: Date.now(),
      dueDate: Date.now() + 30 * 24 * 60 * 60 * 1000,
      status: 'Draft',
      taxRate: 6,
      amountPaid: 0,
      paymentTerms: 'Net 30',
      notes: '',
      termsAndConditions: 'Payment is due upon receipt. Late payments may incur additional fees.',
      includeTerms: true
    })
    setLineItems([])
    setView('create')
    setSelectedInvoice(null)
  }

  const handleEdit = (invoice: InvoiceDocument) => {
    setSelectedInvoice(invoice)
    setFormData({
      customerName: invoice.customerName,
      customerId: invoice.customerId || '',
      jobName: invoice.jobName || '',
      jobId: invoice.jobId || '',
      estimateId: invoice.estimateId || '',
      workOrderId: invoice.workOrderId || '',
      date: invoice.date,
      dueDate: invoice.dueDate || Date.now() + 30 * 24 * 60 * 60 * 1000,
      status: invoice.status,
      taxRate: invoice.taxRate,
      amountPaid: invoice.amountPaid,
      paymentTerms: invoice.paymentTerms || 'Net 30',
      notes: invoice.notes || '',
      termsAndConditions: invoice.termsAndConditions || '',
      includeTerms: invoice.includeTerms
    })
    setLineItems([...invoice.lineItems])
    setView('edit')
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      deleteInvoice(id)
      saveSettings()
    }
  }

  const handleDuplicate = (invoiceId: string) => {
    const newId = duplicateInvoice(invoiceId)
    saveSettings()
    alert(`Invoice duplicated successfully`)
  }

  const handleEmail = async (invoice: InvoiceDocument) => {
    const customerEmail = prompt(`Send invoice ${invoice.number} to:`, invoice.customerName ? `${invoice.customerName.toLowerCase().replace(/\s+/g, '.')}@email.com` : '')
    if (customerEmail) {
      alert(`Email feature coming soon. Would send to: ${customerEmail}`)
    }
  }

  const handleQuickBooksSync = async (invoice: InvoiceDocument) => {
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

    const company = companyProfiles.find(p => p.id === (invoice.companyId || currentCompanyId)) ||
                    companyProfiles.find(p => p.isDefault) ||
                    companyProfiles[0]

    try {
      const response = await fetch('/api/quickbooks/sync-invoice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invoice,
          company,
          accessToken: integrations.quickbooks.accessToken,
          realmId: integrations.quickbooks.realmId
        })
      })

      const data = await response.json()

      if (response.ok) {
        alert(`✅ Invoice ${invoice.number} synced to QuickBooks successfully!`)
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

  const handleSave = () => {
    if (!formData.customerName) {
      alert('Customer name is required')
      return
    }

    if (lineItems.length === 0) {
      alert('Add at least one line item')
      return
    }

    const totals = calculateDocumentTotals(lineItems, formData.taxRate)
    const balance = totals.total - formData.amountPaid

    // Auto-update status based on payment
    let status = formData.status
    if (formData.amountPaid >= totals.total) {
      status = 'Paid'
    } else if (formData.amountPaid > 0) {
      status = 'Partial'
    } else if (formData.dueDate < Date.now() && status !== 'Cancelled' && status !== 'Draft') {
      status = 'Overdue'
    }

    const invoiceData: Omit<InvoiceDocument, 'id' | 'number' | 'companyId' | 'createdAt' | 'updatedAt'> = {
      customerName: formData.customerName,
      customerId: formData.customerId || undefined,
      jobName: formData.jobName || undefined,
      jobId: formData.jobId || undefined,
      estimateId: formData.estimateId || undefined,
      workOrderId: formData.workOrderId || undefined,
      date: formData.date,
      dueDate: formData.dueDate,
      status,
      lineItems,
      subtotal: totals.subtotal,
      taxRate: formData.taxRate,
      taxAmount: totals.taxAmount,
      total: totals.total,
      amountPaid: formData.amountPaid,
      balance,
      paymentTerms: formData.paymentTerms,
      notes: formData.notes,
      termsAndConditions: formData.termsAndConditions,
      includeTerms: formData.includeTerms
    }

    if (view === 'edit' && selectedInvoice) {
      updateInvoice(selectedInvoice.id, invoiceData)
    } else {
      addInvoice(invoiceData)
    }

    saveSettings()
    setView('list')
    setSelectedInvoice(null)
  }

  const handleRecordPayment = () => {
    if (!selectedInvoice) return

    const totals = calculateDocumentTotals(lineItems, formData.taxRate)
    const currentPaid = formData.amountPaid
    const remaining = totals.total - currentPaid

    const payment = prompt(`Enter payment amount (Balance: $${remaining.toFixed(2)}):`)
    if (payment === null) return

    const paymentAmount = parseFloat(payment)
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      alert('Invalid payment amount')
      return
    }

    const newAmountPaid = Math.min(currentPaid + paymentAmount, totals.total)
    setFormData({ ...formData, amountPaid: newAmountPaid })
  }

  const getStatusIcon = (status: InvoiceDocument['status']) => {
    switch (status) {
      case 'Paid':
        return <CheckCircle className="w-4 h-4" />
      case 'Partial':
        return <DollarSign className="w-4 h-4" />
      case 'Overdue':
        return <AlertCircle className="w-4 h-4" />
      case 'Sent':
        return <FileText className="w-4 h-4" />
      case 'Viewed':
        return <Eye className="w-4 h-4" />
      case 'Cancelled':
        return <XCircle className="w-4 h-4" />
      default:
        return <Clock className="w-4 h-4" />
    }
  }

  const getStatusColor = (status: InvoiceDocument['status']) => {
    switch (status) {
      case 'Paid':
        return 'bg-green-500/10 text-green-700 border-green-200'
      case 'Partial':
        return 'bg-blue-500/10 text-blue-700 border-blue-200'
      case 'Overdue':
        return 'bg-red-500/10 text-red-700 border-red-200'
      case 'Sent':
        return 'bg-purple-500/10 text-purple-700 border-purple-200'
      case 'Viewed':
        return 'bg-cyan-500/10 text-cyan-700 border-cyan-200'
      case 'Cancelled':
        return 'bg-gray-500/10 text-gray-700 border-gray-200'
      default:
        return 'bg-yellow-500/10 text-yellow-700 border-yellow-200'
    }
  }

  // List View
  if (view === 'list') {
    return (
      <div className="space-y-6">
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
              <h1 className="text-3xl font-bold">Invoices</h1>
              <p className="text-muted-foreground mt-1">
                Manage and track invoices and payments
              </p>
            </div>
          </div>
          <Button onClick={handleCreate}>
            <Plus className="w-4 h-4 mr-2" />
            New Invoice
          </Button>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search invoices..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border rounded-md px-3 py-2 bg-background"
              >
                <option value="all">All Statuses</option>
                <option value="Draft">Draft</option>
                <option value="Sent">Sent</option>
                <option value="Viewed">Viewed</option>
                <option value="Partial">Partial Payment</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          </CardHeader>
          <CardContent>
            {filteredInvoices.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No invoices found</p>
                <Button onClick={handleCreate} variant="outline" className="mt-4">
                  <Plus className="w-4 h-4 mr-2" />
                  Create First Invoice
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredInvoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="font-semibold">{invoice.number}</span>
                        <Badge variant="outline" className={getStatusColor(invoice.status)}>
                          <span className="mr-1">{getStatusIcon(invoice.status)}</span>
                          {invoice.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {invoice.customerName}
                        {invoice.jobName && ` • ${invoice.jobName}`}
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Date: {new Date(invoice.date).toLocaleDateString()}</span>
                        <span>Due: {new Date(invoice.dueDate || invoice.date).toLocaleDateString()}</span>
                        {invoice.workOrderId && <span>WO: {workOrders.find(w => w.id === invoice.workOrderId)?.number || 'N/A'}</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold">${invoice.total.toFixed(2)}</p>
                        {invoice.balance > 0 && (
                          <p className="text-xs text-red-600">
                            Balance: ${invoice.balance.toFixed(2)}
                          </p>
                        )}
                        {invoice.amountPaid > 0 && (
                          <p className="text-xs text-green-600">
                            Paid: ${invoice.amountPaid.toFixed(2)}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(invoice)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <PDFDownloadLink
                          document={
                            <InvoicePDF
                              invoice={invoice}
                              company={
                                companyProfiles.find(p => p.id === (invoice.companyId || currentCompanyId)) ||
                                companyProfiles.find(p => p.isDefault) ||
                                companyProfiles[0]
                              }
                            />
                          }
                          fileName={`${invoice.number}-invoice.pdf`}
                        >
                          {({ loading }) => (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={loading}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                        </PDFDownloadLink>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEmail(invoice)}
                        >
                          <Mail className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleQuickBooksSync(invoice)}
                        >
                          <Building2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDuplicate(invoice.id)}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(invoice.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  // Create/Edit View
  const totals = calculateDocumentTotals(lineItems, formData.taxRate)
  const balance = totals.total - formData.amountPaid

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">
            {view === 'edit' ? 'Edit' : 'New'} Invoice
          </h1>
          <p className="text-muted-foreground mt-1">
            {view === 'edit' && selectedInvoice
              ? selectedInvoice.number
              : 'Number will be auto-generated'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setView('list')}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Invoice
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {view === 'edit' && selectedInvoice && (
                  <div>
                    <label className="text-sm font-medium mb-1 block">Invoice Number</label>
                    <Input
                      value={selectedInvoice.number}
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
                    className="w-full border rounded-md px-3 py-2 bg-background"
                  >
                    <option value="Draft">Draft</option>
                    <option value="Sent">Sent</option>
                    <option value="Viewed">Viewed</option>
                    <option value="Partial">Partial Payment</option>
                    <option value="Paid">Paid</option>
                    <option value="Overdue">Overdue</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Invoice Date</label>
                  <Input
                    type="date"
                    value={new Date(formData.date).toISOString().split('T')[0]}
                    onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value).getTime() })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Due Date</label>
                  <Input
                    type="date"
                    value={new Date(formData.dueDate).toISOString().split('T')[0]}
                    onChange={(e) => setFormData({ ...formData, dueDate: new Date(e.target.value).getTime() })}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Customer *</label>
                <div className="flex gap-2">
                  <select
                    value={formData.customerId}
                    onChange={(e) => {
                      const customer = customers.find(c => c.id === e.target.value)
                      setFormData({
                        ...formData,
                        customerId: e.target.value,
                        customerName: customer?.data.name || customer?.data.company || ''
                      })
                    }}
                    className="flex-1 border rounded-md px-3 py-2 bg-background"
                  >
                    <option value="">Select Customer</option>
                    {customers.map(customer => (
                      <option key={customer.id} value={customer.id}>
                        {customer.data.name || customer.data.company}
                      </option>
                    ))}
                  </select>
                  <Input
                    placeholder="Or enter name"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value, customerId: '' })}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Job (Optional)</label>
                <div className="flex gap-2">
                  <select
                    value={formData.jobId}
                    onChange={(e) => {
                      const job = jobs.find(j => j.id === e.target.value)
                      setFormData({
                        ...formData,
                        jobId: e.target.value,
                        jobName: job?.data.name || ''
                      })
                    }}
                    className="flex-1 border rounded-md px-3 py-2 bg-background"
                  >
                    <option value="">Select Job</option>
                    {jobs.map(job => (
                      <option key={job.id} value={job.id}>
                        {job.data.name}
                      </option>
                    ))}
                  </select>
                  <Input
                    placeholder="Or enter job name"
                    value={formData.jobName}
                    onChange={(e) => setFormData({ ...formData, jobName: e.target.value, jobId: '' })}
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1 block">Linked Estimate</label>
                  <select
                    value={formData.estimateId}
                    onChange={(e) => setFormData({ ...formData, estimateId: e.target.value })}
                    className="w-full border rounded-md px-3 py-2 bg-background"
                  >
                    <option value="">None</option>
                    {estimates.map(est => (
                      <option key={est.id} value={est.id}>
                        {est.number} - {est.customerName}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Linked Work Order</label>
                  <select
                    value={formData.workOrderId}
                    onChange={(e) => setFormData({ ...formData, workOrderId: e.target.value })}
                    className="w-full border rounded-md px-3 py-2 bg-background"
                  >
                    <option value="">None</option>
                    {workOrders.map(wo => (
                      <option key={wo.id} value={wo.id}>
                        {wo.number} - {wo.customerName}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Payment Terms</label>
                <Input
                  value={formData.paymentTerms}
                  onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                  placeholder="e.g., Net 30, Due on Receipt"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 block">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full border rounded-md px-3 py-2 min-h-[80px] bg-background"
                  placeholder="Internal notes or special instructions"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-1 flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.includeTerms}
                    onChange={(e) => setFormData({ ...formData, includeTerms: e.target.checked })}
                  />
                  Include Terms & Conditions
                </label>
                {formData.includeTerms && (
                  <textarea
                    value={formData.termsAndConditions}
                    onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
                    className="w-full border rounded-md px-3 py-2 min-h-[80px] mt-2 bg-background"
                    placeholder="Payment terms, late fees, etc."
                  />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Line Items</CardTitle>
            </CardHeader>
            <CardContent>
              <LineItemEditor
                lineItems={lineItems}
                onChange={setLineItems}
              />
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal:</span>
                <span>${totals.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm items-center gap-2">
                <span className="text-muted-foreground">Tax Rate:</span>
                <div className="flex items-center gap-1">
                  <Input
                    type="number"
                    value={formData.taxRate}
                    onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
                    className="w-16 h-7 text-xs text-right"
                    step="0.1"
                    min="0"
                  />
                  <span className="text-xs">%</span>
                </div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Tax Amount:</span>
                <span>${totals.taxAmount.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3 flex justify-between font-semibold">
                <span>Total:</span>
                <span>${totals.total.toFixed(2)}</span>
              </div>
              <div className="border-t pt-3 space-y-2">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-sm text-muted-foreground">Amount Paid:</span>
                  <Input
                    type="number"
                    value={formData.amountPaid}
                    onChange={(e) => setFormData({ ...formData, amountPaid: Math.min(parseFloat(e.target.value) || 0, totals.total) })}
                    className="w-24 h-7 text-xs text-right"
                    step="0.01"
                    min="0"
                    max={totals.total}
                  />
                </div>
                <div className="flex justify-between font-semibold text-lg">
                  <span className={balance > 0 ? 'text-red-600' : 'text-green-600'}>
                    Balance:
                  </span>
                  <span className={balance > 0 ? 'text-red-600' : 'text-green-600'}>
                    ${balance.toFixed(2)}
                  </span>
                </div>
                {view === 'edit' && balance > 0 && (
                  <Button
                    onClick={handleRecordPayment}
                    variant="outline"
                    className="w-full"
                    size="sm"
                  >
                    <DollarSign className="w-4 h-4 mr-2" />
                    Record Payment
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Line Items:</span>
                <span>{lineItems.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Taxable Items:</span>
                <span>{lineItems.filter(item => item.taxable).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment %:</span>
                <span>{totals.total > 0 ? Math.round((formData.amountPaid / totals.total) * 100) : 0}%</span>
              </div>
              {formData.dueDate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Days Until Due:</span>
                  <span className={
                    formData.dueDate < Date.now()
                      ? 'text-red-600 font-semibold'
                      : ''
                  }>
                    {Math.ceil((formData.dueDate - Date.now()) / (1000 * 60 * 60 * 24))}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

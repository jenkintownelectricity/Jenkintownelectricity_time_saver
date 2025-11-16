// Document Utilities

import {
  LineItem,
  DocumentTotals,
  Payment,
  EstimateDocument,
  WorkOrderDocument,
  InvoiceDocument,
  calculateLineItemAmount,
  calculateDocumentTotals,
} from '@/lib/types/documents'

// Currency formatting
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount)
}

// Generate unique document numbers
let estimateCounter = 0
let workOrderCounter = 0
let invoiceCounter = 0

export function generateEstimateNumber(existingNumbers: string[]): string {
  estimateCounter = Math.max(
    estimateCounter,
    ...existingNumbers
      .filter((num) => num.startsWith('EST-'))
      .map((num) => parseInt(num.split('-')[1], 10))
      .filter((num) => !isNaN(num)),
    0
  )
  estimateCounter++
  return `EST-${String(estimateCounter).padStart(4, '0')}`
}

export function generateWorkOrderNumber(existingNumbers: string[]): string {
  workOrderCounter = Math.max(
    workOrderCounter,
    ...existingNumbers
      .filter((num) => num.startsWith('WO-'))
      .map((num) => parseInt(num.split('-')[1], 10))
      .filter((num) => !isNaN(num)),
    0
  )
  workOrderCounter++
  return `WO-${String(workOrderCounter).padStart(4, '0')}`
}

export function generateInvoiceNumber(existingNumbers: string[]): string {
  invoiceCounter = Math.max(
    invoiceCounter,
    ...existingNumbers
      .filter((num) => num.startsWith('INV-'))
      .map((num) => parseInt(num.split('-')[1], 10))
      .filter((num) => !isNaN(num)),
    0
  )
  invoiceCounter++
  return `INV-${String(invoiceCounter).padStart(4, '0')}`
}

// Line item calculations
export function calculateLineItemTotal(lineItems: LineItem[]): number {
  return lineItems.reduce((sum, item) => sum + item.amount, 0)
}

export function recalculateLineItemAmounts(lineItems: LineItem[]): LineItem[] {
  return lineItems.map((item) => ({
    ...item,
    amount: calculateLineItemAmount(item.quantity, item.rate),
  }))
}

// Tax calculations
export function calculateTax(amount: number, taxRate: number): number {
  return Math.round(amount * (taxRate / 100) * 100) / 100
}

export function calculateSubtotal(lineItems: LineItem[]): number {
  return Math.round(lineItems.reduce((sum, item) => sum + item.amount, 0) * 100) / 100
}

export function calculateTaxableAmount(lineItems: LineItem[]): number {
  return Math.round(
    lineItems.filter((item) => item.taxable).reduce((sum, item) => sum + item.amount, 0) * 100
  ) / 100
}

export function calculateTotals(lineItems: LineItem[], taxRate: number, payments: Payment[] = []): DocumentTotals {
  return calculateDocumentTotals(lineItems, taxRate, payments)
}

// Document conversion helpers
export function convertEstimateToWorkOrder(
  estimate: EstimateDocument,
  workOrderNumber: string,
  scheduledDate?: Date,
  assignedTo?: string[]
): Omit<WorkOrderDocument, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'> {
  return {
    documentNumber: workOrderNumber,
    estimateId: estimate.id,
    customerId: estimate.customerId,
    customerName: estimate.customerName,
    customerEmail: estimate.customerEmail,
    customerPhone: estimate.customerPhone,
    serviceAddress: estimate.serviceAddress,
    lineItems: [...estimate.lineItems],
    status: 'scheduled',
    scheduledDate,
    scheduledTime: undefined,
    assignedTo,
    taxRate: estimate.taxRate,
    totals: { ...estimate.totals },
    internalNotes: `Created from estimate ${estimate.documentNumber}`,
    customerNotes: estimate.notes,
    instructions: undefined,
    priority: 'normal',
    photos: [],
    timeTracking: [],
    startedAt: undefined,
    completedAt: undefined,
    convertedToInvoiceId: undefined,
  }
}

export function convertWorkOrderToInvoice(
  workOrder: WorkOrderDocument,
  invoiceNumber: string,
  paymentTerms: string = 'Net 30',
  dueDate?: Date
): Omit<InvoiceDocument, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'> {
  const invoiceDueDate = dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now

  return {
    documentNumber: invoiceNumber,
    workOrderId: workOrder.id,
    estimateId: workOrder.estimateId,
    customerId: workOrder.customerId,
    customerName: workOrder.customerName,
    customerEmail: workOrder.customerEmail,
    customerPhone: workOrder.customerPhone,
    serviceAddress: workOrder.serviceAddress,
    billingAddress: undefined,
    lineItems: [...workOrder.lineItems],
    status: 'draft',
    taxRate: workOrder.taxRate,
    totals: { ...workOrder.totals, amountPaid: 0, balance: workOrder.totals.total },
    paymentTerms,
    dueDate: invoiceDueDate,
    payments: [],
    notes: workOrder.customerNotes,
    termsAndConditions: undefined,
    sentAt: undefined,
    viewedAt: undefined,
    paidAt: undefined,
  }
}

export function convertEstimateToInvoice(
  estimate: EstimateDocument,
  invoiceNumber: string,
  paymentTerms: string = 'Net 30',
  dueDate?: Date
): Omit<InvoiceDocument, 'id' | 'createdBy' | 'createdAt' | 'updatedAt'> {
  const invoiceDueDate = dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now

  return {
    documentNumber: invoiceNumber,
    workOrderId: undefined,
    estimateId: estimate.id,
    customerId: estimate.customerId,
    customerName: estimate.customerName,
    customerEmail: estimate.customerEmail,
    customerPhone: estimate.customerPhone,
    serviceAddress: estimate.serviceAddress,
    billingAddress: estimate.billingAddress,
    lineItems: [...estimate.lineItems],
    status: 'draft',
    taxRate: estimate.taxRate,
    totals: { ...estimate.totals, amountPaid: 0, balance: estimate.totals.total },
    paymentTerms,
    dueDate: invoiceDueDate,
    payments: [],
    notes: estimate.notes,
    termsAndConditions: estimate.termsAndConditions,
    sentAt: undefined,
    viewedAt: undefined,
    paidAt: undefined,
  }
}

// Export to CSV
export function exportEstimatesToCSV(estimates: EstimateDocument[]): string {
  const headers = [
    'Document Number',
    'Customer',
    'Status',
    'Date',
    'Valid Until',
    'Subtotal',
    'Tax',
    'Total',
  ]

  const rows = estimates.map((est) => [
    est.documentNumber,
    est.customerName,
    est.status,
    est.createdAt.toLocaleDateString(),
    est.validUntil.toLocaleDateString(),
    est.totals.subtotal.toFixed(2),
    est.totals.taxAmount.toFixed(2),
    est.totals.total.toFixed(2),
  ])

  return [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n')
}

export function exportWorkOrdersToCSV(workOrders: WorkOrderDocument[]): string {
  const headers = [
    'Document Number',
    'Customer',
    'Status',
    'Priority',
    'Scheduled Date',
    'Assigned To',
    'Total',
  ]

  const rows = workOrders.map((wo) => [
    wo.documentNumber,
    wo.customerName,
    wo.status,
    wo.priority,
    wo.scheduledDate?.toLocaleDateString() || '',
    wo.assignedTo?.join('; ') || '',
    wo.totals.total.toFixed(2),
  ])

  return [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n')
}

export function exportInvoicesToCSV(invoices: InvoiceDocument[]): string {
  const headers = [
    'Invoice Number',
    'Customer',
    'Status',
    'Issue Date',
    'Due Date',
    'Total',
    'Paid',
    'Balance',
  ]

  const rows = invoices.map((inv) => [
    inv.documentNumber,
    inv.customerName,
    inv.status,
    inv.createdAt.toLocaleDateString(),
    inv.dueDate.toLocaleDateString(),
    inv.totals.total.toFixed(2),
    (inv.totals.amountPaid || 0).toFixed(2),
    (inv.totals.balance || 0).toFixed(2),
  ])

  return [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
    ),
  ].join('\n')
}

// Date utilities
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatDateTime(date: Date): string {
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function getDaysSince(date: Date): number {
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

export function getDaysUntil(date: Date): number {
  const now = new Date()
  const diffTime = date.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

// Download helpers
export function downloadCSV(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

export function downloadPDF(pdfBlob: Blob, filename: string): void {
  const link = document.createElement('a')
  const url = URL.createObjectURL(pdfBlob)
  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// Email placeholder (to be implemented with actual email service)
export function sendEstimateEmail(estimate: EstimateDocument): Promise<void> {
  // Placeholder for email sending functionality
  console.log('Sending estimate email:', estimate.documentNumber)
  return Promise.resolve()
}

export function sendInvoiceEmail(invoice: InvoiceDocument): Promise<void> {
  // Placeholder for email sending functionality
  console.log('Sending invoice email:', invoice.documentNumber)
  return Promise.resolve()
}

export function sendPaymentReminderEmail(invoice: InvoiceDocument): Promise<void> {
  // Placeholder for payment reminder email
  console.log('Sending payment reminder for invoice:', invoice.documentNumber)
  return Promise.resolve()
}

// Document Management Types

// Line Item Types
export type LineItemType = 'material' | 'labor' | 'equipment' | 'subcontractor' | 'permit'

export interface LineItem {
  id: string
  type: LineItemType
  description: string
  quantity: number
  rate: number
  amount: number // quantity * rate
  taxable: boolean
  order: number
}

// Document Status Enums
export type EstimateStatus = 'draft' | 'sent' | 'viewed' | 'accepted' | 'declined' | 'expired'
export type WorkOrderStatus = 'draft' | 'scheduled' | 'in_progress' | 'on_hold' | 'completed' | 'cancelled'
export type InvoiceStatus = 'draft' | 'sent' | 'viewed' | 'partial' | 'paid' | 'overdue' | 'cancelled'

// Payment Types
export type PaymentMethod = 'cash' | 'check' | 'credit_card' | 'debit_card' | 'ach' | 'wire' | 'other'

export interface Payment {
  id: string
  amount: number
  date: Date
  method: PaymentMethod
  reference?: string // check number, transaction ID, etc.
  notes?: string
}

// Document Totals
export interface DocumentTotals {
  subtotal: number
  taxAmount: number
  total: number
  amountPaid?: number // for invoices
  balance?: number // for invoices
}

// Estimate Document
export interface EstimateDocument {
  id: string
  documentNumber: string // EST-0001
  customerId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  serviceAddress: string
  billingAddress?: string
  lineItems: LineItem[]
  status: EstimateStatus
  taxRate: number // percentage (e.g., 6 = 6%)
  totals: DocumentTotals
  notes?: string
  termsAndConditions?: string
  validUntil: Date
  createdBy: string
  createdAt: Date
  updatedAt: Date
  sentAt?: Date
  viewedAt?: Date
  acceptedAt?: Date
  declinedAt?: Date
  convertedToWorkOrderId?: string
}

// Work Order Document
export interface WorkOrderDocument {
  id: string
  documentNumber: string // WO-0001
  estimateId?: string // if created from estimate
  customerId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  serviceAddress: string
  lineItems: LineItem[]
  status: WorkOrderStatus
  scheduledDate?: Date
  scheduledTime?: string
  assignedTo?: string[] // team member IDs
  taxRate: number
  totals: DocumentTotals
  internalNotes?: string
  customerNotes?: string
  instructions?: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  photos: string[] // URLs to uploaded photos
  timeTracking: TimeEntry[]
  createdBy: string
  createdAt: Date
  updatedAt: Date
  startedAt?: Date
  completedAt?: Date
  convertedToInvoiceId?: string
}

export interface TimeEntry {
  id: string
  userId: string
  userName: string
  startTime: Date
  endTime?: Date
  hours: number
  notes?: string
}

// Invoice Document
export interface InvoiceDocument {
  id: string
  documentNumber: string // INV-0001
  workOrderId?: string // if created from work order
  estimateId?: string // if created from estimate
  customerId: string
  customerName: string
  customerEmail: string
  customerPhone: string
  serviceAddress: string
  billingAddress?: string
  lineItems: LineItem[]
  status: InvoiceStatus
  taxRate: number
  totals: DocumentTotals
  paymentTerms: string // e.g., "Net 30", "Due on receipt"
  dueDate: Date
  payments: Payment[]
  notes?: string
  termsAndConditions?: string
  createdBy: string
  createdAt: Date
  updatedAt: Date
  sentAt?: Date
  viewedAt?: Date
  paidAt?: Date
}

// Filter interfaces
export interface EstimateFilters {
  search?: string
  status?: EstimateStatus[]
  customerId?: string
  dateFrom?: Date
  dateTo?: Date
  minAmount?: number
  maxAmount?: number
}

export interface WorkOrderFilters {
  search?: string
  status?: WorkOrderStatus[]
  customerId?: string
  assignedTo?: string[]
  priority?: ('low' | 'normal' | 'high' | 'urgent')[]
  dateFrom?: Date
  dateTo?: Date
}

export interface InvoiceFilters {
  search?: string
  status?: InvoiceStatus[]
  customerId?: string
  dateFrom?: Date
  dateTo?: Date
  minAmount?: number
  maxAmount?: number
  overdue?: boolean
}

// Sort types
export type DocumentSortField = 'documentNumber' | 'customerName' | 'createdAt' | 'total' | 'status' | 'dueDate'
export type SortDirection = 'asc' | 'desc'

export interface DocumentSort {
  field: DocumentSortField
  direction: SortDirection
}

// Stats interfaces
export interface EstimateStats {
  total: number
  draft: number
  sent: number
  accepted: number
  declined: number
  expired: number
  totalValue: number
  averageValue: number
  acceptanceRate: number
}

export interface WorkOrderStats {
  total: number
  scheduled: number
  inProgress: number
  completed: number
  cancelled: number
  totalValue: number
  averageCompletionTime: number
}

export interface InvoiceStats {
  total: number
  draft: number
  sent: number
  paid: number
  overdue: number
  totalValue: number
  totalPaid: number
  totalOutstanding: number
  averageDaysToPay: number
}

// Labels for UI
export const LINE_ITEM_TYPE_LABELS: Record<LineItemType, string> = {
  material: 'Material',
  labor: 'Labor',
  equipment: 'Equipment',
  subcontractor: 'Subcontractor',
  permit: 'Permit',
}

export const ESTIMATE_STATUS_LABELS: Record<EstimateStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  viewed: 'Viewed',
  accepted: 'Accepted',
  declined: 'Declined',
  expired: 'Expired',
}

export const WORK_ORDER_STATUS_LABELS: Record<WorkOrderStatus, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  in_progress: 'In Progress',
  on_hold: 'On Hold',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  viewed: 'Viewed',
  partial: 'Partially Paid',
  paid: 'Paid',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
}

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  cash: 'Cash',
  check: 'Check',
  credit_card: 'Credit Card',
  debit_card: 'Debit Card',
  ach: 'ACH Transfer',
  wire: 'Wire Transfer',
  other: 'Other',
}

// Helper functions
export function calculateLineItemAmount(quantity: number, rate: number): number {
  return Math.round(quantity * rate * 100) / 100
}

export function createLineItem(
  data: Omit<LineItem, 'id' | 'amount'>
): LineItem {
  return {
    ...data,
    id: `line_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    amount: calculateLineItemAmount(data.quantity, data.rate),
  }
}

export function calculateDocumentTotals(
  lineItems: LineItem[],
  taxRate: number,
  payments: Payment[] = []
): DocumentTotals {
  const taxableAmount = lineItems
    .filter((item) => item.taxable)
    .reduce((sum, item) => sum + item.amount, 0)

  const nonTaxableAmount = lineItems
    .filter((item) => !item.taxable)
    .reduce((sum, item) => sum + item.amount, 0)

  const subtotal = Math.round((taxableAmount + nonTaxableAmount) * 100) / 100
  const taxAmount = Math.round(taxableAmount * (taxRate / 100) * 100) / 100
  const total = Math.round((subtotal + taxAmount) * 100) / 100

  const amountPaid = payments.reduce((sum, payment) => sum + payment.amount, 0)
  const balance = Math.round((total - amountPaid) * 100) / 100

  return {
    subtotal,
    taxAmount,
    total,
    amountPaid,
    balance,
  }
}

export function getInvoiceStatus(invoice: InvoiceDocument): InvoiceStatus {
  const now = new Date()
  const { total, amountPaid = 0 } = invoice.totals

  if (invoice.status === 'cancelled') return 'cancelled'
  if (invoice.status === 'draft') return 'draft'

  if (amountPaid >= total) return 'paid'
  if (amountPaid > 0 && amountPaid < total) return 'partial'
  if (now > invoice.dueDate && amountPaid < total) return 'overdue'

  return invoice.status
}

export function isEstimateExpired(estimate: EstimateDocument): boolean {
  return new Date() > estimate.validUntil && estimate.status !== 'accepted'
}

export function formatDocumentNumber(prefix: string, number: number): string {
  return `${prefix}-${String(number).padStart(4, '0')}`
}

export function parseDocumentNumber(documentNumber: string): { prefix: string; number: number } | null {
  const match = documentNumber.match(/^([A-Z]+)-(\d+)$/)
  if (!match) return null
  return {
    prefix: match[1],
    number: parseInt(match[2], 10),
  }
}

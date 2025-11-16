import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  EstimateDocument,
  WorkOrderDocument,
  InvoiceDocument,
  LineItem,
  Payment,
  EstimateFilters,
  WorkOrderFilters,
  InvoiceFilters,
  DocumentSort,
  EstimateStats,
  WorkOrderStats,
  InvoiceStats,
  TimeEntry,
  getInvoiceStatus,
  isEstimateExpired,
} from '@/lib/types/documents'
import {
  generateEstimateNumber,
  generateWorkOrderNumber,
  generateInvoiceNumber,
  calculateTotals,
  convertEstimateToWorkOrder,
  convertWorkOrderToInvoice,
  convertEstimateToInvoice,
  recalculateLineItemAmounts,
} from '@/lib/utils/document-utils'

interface DocumentState {
  // Data
  estimates: EstimateDocument[]
  workOrders: WorkOrderDocument[]
  invoices: InvoiceDocument[]

  // Filters and sorting
  estimateFilters: EstimateFilters
  workOrderFilters: WorkOrderFilters
  invoiceFilters: InvoiceFilters
  estimateSort: DocumentSort
  workOrderSort: DocumentSort
  invoiceSort: DocumentSort

  // ============ ESTIMATE OPERATIONS ============
  addEstimate: (estimate: Omit<EstimateDocument, 'id' | 'documentNumber' | 'createdAt' | 'updatedAt'>) => string
  updateEstimate: (id: string, estimate: Partial<EstimateDocument>) => void
  deleteEstimate: (id: string) => void
  getEstimate: (id: string) => EstimateDocument | undefined
  duplicateEstimate: (id: string) => string | null

  // Estimate status updates
  sendEstimate: (id: string) => void
  markEstimateViewed: (id: string) => void
  acceptEstimate: (id: string) => void
  declineEstimate: (id: string) => void

  // Estimate line items
  addEstimateLineItem: (estimateId: string, lineItem: Omit<LineItem, 'id'>) => void
  updateEstimateLineItem: (estimateId: string, lineItemId: string, lineItem: Partial<LineItem>) => void
  deleteEstimateLineItem: (estimateId: string, lineItemId: string) => void
  reorderEstimateLineItems: (estimateId: string, lineItems: LineItem[]) => void

  // ============ WORK ORDER OPERATIONS ============
  addWorkOrder: (workOrder: Omit<WorkOrderDocument, 'id' | 'documentNumber' | 'createdAt' | 'updatedAt'>) => string
  updateWorkOrder: (id: string, workOrder: Partial<WorkOrderDocument>) => void
  deleteWorkOrder: (id: string) => void
  getWorkOrder: (id: string) => WorkOrderDocument | undefined
  duplicateWorkOrder: (id: string) => string | null

  // Work order status updates
  scheduleWorkOrder: (id: string, scheduledDate: Date, scheduledTime?: string) => void
  startWorkOrder: (id: string) => void
  completeWorkOrder: (id: string) => void
  cancelWorkOrder: (id: string) => void

  // Work order line items
  addWorkOrderLineItem: (workOrderId: string, lineItem: Omit<LineItem, 'id'>) => void
  updateWorkOrderLineItem: (workOrderId: string, lineItemId: string, lineItem: Partial<LineItem>) => void
  deleteWorkOrderLineItem: (workOrderId: string, lineItemId: string) => void
  reorderWorkOrderLineItems: (workOrderId: string, lineItems: LineItem[]) => void

  // Work order time tracking
  addTimeEntry: (workOrderId: string, timeEntry: Omit<TimeEntry, 'id'>) => void
  updateTimeEntry: (workOrderId: string, timeEntryId: string, timeEntry: Partial<TimeEntry>) => void
  deleteTimeEntry: (workOrderId: string, timeEntryId: string) => void

  // Work order photos
  addPhoto: (workOrderId: string, photoUrl: string) => void
  removePhoto: (workOrderId: string, photoUrl: string) => void

  // ============ INVOICE OPERATIONS ============
  addInvoice: (invoice: Omit<InvoiceDocument, 'id' | 'documentNumber' | 'createdAt' | 'updatedAt'>) => string
  updateInvoice: (id: string, invoice: Partial<InvoiceDocument>) => void
  deleteInvoice: (id: string) => void
  getInvoice: (id: string) => InvoiceDocument | undefined
  duplicateInvoice: (id: string) => string | null

  // Invoice status updates
  sendInvoice: (id: string) => void
  markInvoiceViewed: (id: string) => void
  markInvoicePaid: (id: string) => void

  // Invoice line items
  addInvoiceLineItem: (invoiceId: string, lineItem: Omit<LineItem, 'id'>) => void
  updateInvoiceLineItem: (invoiceId: string, lineItemId: string, lineItem: Partial<LineItem>) => void
  deleteInvoiceLineItem: (invoiceId: string, lineItemId: string) => void
  reorderInvoiceLineItems: (invoiceId: string, lineItems: LineItem[]) => void

  // Invoice payments
  addPayment: (invoiceId: string, payment: Omit<Payment, 'id'>) => void
  updatePayment: (invoiceId: string, paymentId: string, payment: Partial<Payment>) => void
  deletePayment: (invoiceId: string, paymentId: string) => void

  // ============ DOCUMENT CONVERSION ============
  convertEstimateToWorkOrder: (estimateId: string, scheduledDate?: Date, assignedTo?: string[]) => string | null
  convertWorkOrderToInvoice: (workOrderId: string, paymentTerms?: string, dueDate?: Date) => string | null
  convertEstimateToInvoice: (estimateId: string, paymentTerms?: string, dueDate?: Date) => string | null

  // ============ FILTERS AND SORTING ============
  setEstimateFilters: (filters: Partial<EstimateFilters>) => void
  clearEstimateFilters: () => void
  setWorkOrderFilters: (filters: Partial<WorkOrderFilters>) => void
  clearWorkOrderFilters: () => void
  setInvoiceFilters: (filters: Partial<InvoiceFilters>) => void
  clearInvoiceFilters: () => void

  setEstimateSort: (sort: DocumentSort) => void
  setWorkOrderSort: (sort: DocumentSort) => void
  setInvoiceSort: (sort: DocumentSort) => void

  // ============ GETTERS ============
  getFilteredEstimates: () => EstimateDocument[]
  getFilteredWorkOrders: () => WorkOrderDocument[]
  getFilteredInvoices: () => InvoiceDocument[]

  getEstimateStats: () => EstimateStats
  getWorkOrderStats: () => WorkOrderStats
  getInvoiceStats: () => InvoiceStats
}

const STORAGE_KEY = 'documents-storage'

export const useDocumentStore = create<DocumentState>()(
  persist(
    (set, get) => ({
      estimates: [],
      workOrders: [],
      invoices: [],

      estimateFilters: {},
      workOrderFilters: {},
      invoiceFilters: {},

      estimateSort: { field: 'createdAt', direction: 'desc' },
      workOrderSort: { field: 'createdAt', direction: 'desc' },
      invoiceSort: { field: 'createdAt', direction: 'desc' },

      // ============ ESTIMATE OPERATIONS ============
      addEstimate: (estimateData) => {
        const id = `estimate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const now = new Date()
        const existingNumbers = get().estimates.map((e) => e.documentNumber)
        const documentNumber = generateEstimateNumber(existingNumbers)

        const estimate: EstimateDocument = {
          ...estimateData,
          id,
          documentNumber,
          createdAt: now,
          updatedAt: now,
        }

        set((state) => ({
          estimates: [...state.estimates, estimate],
        }))

        return id
      },

      updateEstimate: (id, updates) => {
        set((state) => ({
          estimates: state.estimates.map((estimate) =>
            estimate.id === id
              ? {
                  ...estimate,
                  ...updates,
                  updatedAt: new Date(),
                  // Recalculate totals if line items or tax rate changed
                  totals: updates.lineItems || updates.taxRate
                    ? calculateTotals(
                        updates.lineItems || estimate.lineItems,
                        updates.taxRate ?? estimate.taxRate
                      )
                    : estimate.totals,
                }
              : estimate
          ),
        }))
      },

      deleteEstimate: (id) => {
        set((state) => ({
          estimates: state.estimates.filter((estimate) => estimate.id !== id),
        }))
      },

      getEstimate: (id) => {
        return get().estimates.find((estimate) => estimate.id === id)
      },

      duplicateEstimate: (id) => {
        const estimate = get().getEstimate(id)
        if (!estimate) return null

        const newId = get().addEstimate({
          ...estimate,
          status: 'draft',
          sentAt: undefined,
          viewedAt: undefined,
          acceptedAt: undefined,
          declinedAt: undefined,
          convertedToWorkOrderId: undefined,
          validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        })

        return newId
      },

      sendEstimate: (id) => {
        set((state) => ({
          estimates: state.estimates.map((estimate) =>
            estimate.id === id
              ? {
                  ...estimate,
                  status: 'sent',
                  sentAt: new Date(),
                  updatedAt: new Date(),
                }
              : estimate
          ),
        }))
      },

      markEstimateViewed: (id) => {
        set((state) => ({
          estimates: state.estimates.map((estimate) =>
            estimate.id === id && estimate.status === 'sent'
              ? {
                  ...estimate,
                  status: 'viewed',
                  viewedAt: new Date(),
                  updatedAt: new Date(),
                }
              : estimate
          ),
        }))
      },

      acceptEstimate: (id) => {
        set((state) => ({
          estimates: state.estimates.map((estimate) =>
            estimate.id === id
              ? {
                  ...estimate,
                  status: 'accepted',
                  acceptedAt: new Date(),
                  updatedAt: new Date(),
                }
              : estimate
          ),
        }))
      },

      declineEstimate: (id) => {
        set((state) => ({
          estimates: state.estimates.map((estimate) =>
            estimate.id === id
              ? {
                  ...estimate,
                  status: 'declined',
                  declinedAt: new Date(),
                  updatedAt: new Date(),
                }
              : estimate
          ),
        }))
      },

      addEstimateLineItem: (estimateId, lineItemData) => {
        const lineItemId = `line_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const lineItem: LineItem = {
          ...lineItemData,
          id: lineItemId,
          amount: lineItemData.quantity * lineItemData.rate,
        }

        set((state) => ({
          estimates: state.estimates.map((estimate) =>
            estimate.id === estimateId
              ? {
                  ...estimate,
                  lineItems: [...estimate.lineItems, lineItem],
                  totals: calculateTotals([...estimate.lineItems, lineItem], estimate.taxRate),
                  updatedAt: new Date(),
                }
              : estimate
          ),
        }))
      },

      updateEstimateLineItem: (estimateId, lineItemId, updates) => {
        set((state) => ({
          estimates: state.estimates.map((estimate) => {
            if (estimate.id !== estimateId) return estimate

            const updatedLineItems = estimate.lineItems.map((item) => {
              if (item.id !== lineItemId) return item
              const updated = { ...item, ...updates }
              return {
                ...updated,
                amount: updated.quantity * updated.rate,
              }
            })

            return {
              ...estimate,
              lineItems: updatedLineItems,
              totals: calculateTotals(updatedLineItems, estimate.taxRate),
              updatedAt: new Date(),
            }
          }),
        }))
      },

      deleteEstimateLineItem: (estimateId, lineItemId) => {
        set((state) => ({
          estimates: state.estimates.map((estimate) => {
            if (estimate.id !== estimateId) return estimate

            const updatedLineItems = estimate.lineItems.filter((item) => item.id !== lineItemId)

            return {
              ...estimate,
              lineItems: updatedLineItems,
              totals: calculateTotals(updatedLineItems, estimate.taxRate),
              updatedAt: new Date(),
            }
          }),
        }))
      },

      reorderEstimateLineItems: (estimateId, lineItems) => {
        set((state) => ({
          estimates: state.estimates.map((estimate) =>
            estimate.id === estimateId
              ? {
                  ...estimate,
                  lineItems: lineItems.map((item, index) => ({ ...item, order: index })),
                  updatedAt: new Date(),
                }
              : estimate
          ),
        }))
      },

      // ============ WORK ORDER OPERATIONS ============
      addWorkOrder: (workOrderData) => {
        const id = `workorder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const now = new Date()
        const existingNumbers = get().workOrders.map((wo) => wo.documentNumber)
        const documentNumber = generateWorkOrderNumber(existingNumbers)

        const workOrder: WorkOrderDocument = {
          ...workOrderData,
          id,
          documentNumber,
          createdAt: now,
          updatedAt: now,
        }

        set((state) => ({
          workOrders: [...state.workOrders, workOrder],
        }))

        return id
      },

      updateWorkOrder: (id, updates) => {
        set((state) => ({
          workOrders: state.workOrders.map((workOrder) =>
            workOrder.id === id
              ? {
                  ...workOrder,
                  ...updates,
                  updatedAt: new Date(),
                  // Recalculate totals if line items or tax rate changed
                  totals: updates.lineItems || updates.taxRate
                    ? calculateTotals(
                        updates.lineItems || workOrder.lineItems,
                        updates.taxRate ?? workOrder.taxRate
                      )
                    : workOrder.totals,
                }
              : workOrder
          ),
        }))
      },

      deleteWorkOrder: (id) => {
        set((state) => ({
          workOrders: state.workOrders.filter((workOrder) => workOrder.id !== id),
        }))
      },

      getWorkOrder: (id) => {
        return get().workOrders.find((workOrder) => workOrder.id === id)
      },

      duplicateWorkOrder: (id) => {
        const workOrder = get().getWorkOrder(id)
        if (!workOrder) return null

        const newId = get().addWorkOrder({
          ...workOrder,
          estimateId: undefined,
          status: 'draft',
          scheduledDate: undefined,
          scheduledTime: undefined,
          startedAt: undefined,
          completedAt: undefined,
          convertedToInvoiceId: undefined,
          photos: [],
          timeTracking: [],
        })

        return newId
      },

      scheduleWorkOrder: (id, scheduledDate, scheduledTime) => {
        set((state) => ({
          workOrders: state.workOrders.map((workOrder) =>
            workOrder.id === id
              ? {
                  ...workOrder,
                  status: 'scheduled',
                  scheduledDate,
                  scheduledTime,
                  updatedAt: new Date(),
                }
              : workOrder
          ),
        }))
      },

      startWorkOrder: (id) => {
        set((state) => ({
          workOrders: state.workOrders.map((workOrder) =>
            workOrder.id === id
              ? {
                  ...workOrder,
                  status: 'in_progress',
                  startedAt: new Date(),
                  updatedAt: new Date(),
                }
              : workOrder
          ),
        }))
      },

      completeWorkOrder: (id) => {
        set((state) => ({
          workOrders: state.workOrders.map((workOrder) =>
            workOrder.id === id
              ? {
                  ...workOrder,
                  status: 'completed',
                  completedAt: new Date(),
                  updatedAt: new Date(),
                }
              : workOrder
          ),
        }))
      },

      cancelWorkOrder: (id) => {
        set((state) => ({
          workOrders: state.workOrders.map((workOrder) =>
            workOrder.id === id
              ? {
                  ...workOrder,
                  status: 'cancelled',
                  updatedAt: new Date(),
                }
              : workOrder
          ),
        }))
      },

      addWorkOrderLineItem: (workOrderId, lineItemData) => {
        const lineItemId = `line_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const lineItem: LineItem = {
          ...lineItemData,
          id: lineItemId,
          amount: lineItemData.quantity * lineItemData.rate,
        }

        set((state) => ({
          workOrders: state.workOrders.map((workOrder) =>
            workOrder.id === workOrderId
              ? {
                  ...workOrder,
                  lineItems: [...workOrder.lineItems, lineItem],
                  totals: calculateTotals([...workOrder.lineItems, lineItem], workOrder.taxRate),
                  updatedAt: new Date(),
                }
              : workOrder
          ),
        }))
      },

      updateWorkOrderLineItem: (workOrderId, lineItemId, updates) => {
        set((state) => ({
          workOrders: state.workOrders.map((workOrder) => {
            if (workOrder.id !== workOrderId) return workOrder

            const updatedLineItems = workOrder.lineItems.map((item) => {
              if (item.id !== lineItemId) return item
              const updated = { ...item, ...updates }
              return {
                ...updated,
                amount: updated.quantity * updated.rate,
              }
            })

            return {
              ...workOrder,
              lineItems: updatedLineItems,
              totals: calculateTotals(updatedLineItems, workOrder.taxRate),
              updatedAt: new Date(),
            }
          }),
        }))
      },

      deleteWorkOrderLineItem: (workOrderId, lineItemId) => {
        set((state) => ({
          workOrders: state.workOrders.map((workOrder) => {
            if (workOrder.id !== workOrderId) return workOrder

            const updatedLineItems = workOrder.lineItems.filter((item) => item.id !== lineItemId)

            return {
              ...workOrder,
              lineItems: updatedLineItems,
              totals: calculateTotals(updatedLineItems, workOrder.taxRate),
              updatedAt: new Date(),
            }
          }),
        }))
      },

      reorderWorkOrderLineItems: (workOrderId, lineItems) => {
        set((state) => ({
          workOrders: state.workOrders.map((workOrder) =>
            workOrder.id === workOrderId
              ? {
                  ...workOrder,
                  lineItems: lineItems.map((item, index) => ({ ...item, order: index })),
                  updatedAt: new Date(),
                }
              : workOrder
          ),
        }))
      },

      addTimeEntry: (workOrderId, timeEntryData) => {
        const timeEntryId = `time_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const timeEntry: TimeEntry = {
          ...timeEntryData,
          id: timeEntryId,
        }

        set((state) => ({
          workOrders: state.workOrders.map((workOrder) =>
            workOrder.id === workOrderId
              ? {
                  ...workOrder,
                  timeTracking: [...workOrder.timeTracking, timeEntry],
                  updatedAt: new Date(),
                }
              : workOrder
          ),
        }))
      },

      updateTimeEntry: (workOrderId, timeEntryId, updates) => {
        set((state) => ({
          workOrders: state.workOrders.map((workOrder) =>
            workOrder.id === workOrderId
              ? {
                  ...workOrder,
                  timeTracking: workOrder.timeTracking.map((entry) =>
                    entry.id === timeEntryId ? { ...entry, ...updates } : entry
                  ),
                  updatedAt: new Date(),
                }
              : workOrder
          ),
        }))
      },

      deleteTimeEntry: (workOrderId, timeEntryId) => {
        set((state) => ({
          workOrders: state.workOrders.map((workOrder) =>
            workOrder.id === workOrderId
              ? {
                  ...workOrder,
                  timeTracking: workOrder.timeTracking.filter((entry) => entry.id !== timeEntryId),
                  updatedAt: new Date(),
                }
              : workOrder
          ),
        }))
      },

      addPhoto: (workOrderId, photoUrl) => {
        set((state) => ({
          workOrders: state.workOrders.map((workOrder) =>
            workOrder.id === workOrderId
              ? {
                  ...workOrder,
                  photos: [...workOrder.photos, photoUrl],
                  updatedAt: new Date(),
                }
              : workOrder
          ),
        }))
      },

      removePhoto: (workOrderId, photoUrl) => {
        set((state) => ({
          workOrders: state.workOrders.map((workOrder) =>
            workOrder.id === workOrderId
              ? {
                  ...workOrder,
                  photos: workOrder.photos.filter((url) => url !== photoUrl),
                  updatedAt: new Date(),
                }
              : workOrder
          ),
        }))
      },

      // ============ INVOICE OPERATIONS ============
      addInvoice: (invoiceData) => {
        const id = `invoice_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const now = new Date()
        const existingNumbers = get().invoices.map((inv) => inv.documentNumber)
        const documentNumber = generateInvoiceNumber(existingNumbers)

        const invoice: InvoiceDocument = {
          ...invoiceData,
          id,
          documentNumber,
          createdAt: now,
          updatedAt: now,
        }

        set((state) => ({
          invoices: [...state.invoices, invoice],
        }))

        return id
      },

      updateInvoice: (id, updates) => {
        set((state) => ({
          invoices: state.invoices.map((invoice) => {
            if (invoice.id !== id) return invoice

            const updated = {
              ...invoice,
              ...updates,
              updatedAt: new Date(),
              // Recalculate totals if line items, tax rate, or payments changed
              totals: updates.lineItems || updates.taxRate || updates.payments
                ? calculateTotals(
                    updates.lineItems || invoice.lineItems,
                    updates.taxRate ?? invoice.taxRate,
                    updates.payments || invoice.payments
                  )
                : invoice.totals,
            }

            // Auto-update status based on payments
            return {
              ...updated,
              status: getInvoiceStatus(updated),
            }
          }),
        }))
      },

      deleteInvoice: (id) => {
        set((state) => ({
          invoices: state.invoices.filter((invoice) => invoice.id !== id),
        }))
      },

      getInvoice: (id) => {
        return get().invoices.find((invoice) => invoice.id === id)
      },

      duplicateInvoice: (id) => {
        const invoice = get().getInvoice(id)
        if (!invoice) return null

        const newId = get().addInvoice({
          ...invoice,
          workOrderId: undefined,
          estimateId: undefined,
          status: 'draft',
          payments: [],
          sentAt: undefined,
          viewedAt: undefined,
          paidAt: undefined,
          dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          totals: {
            ...invoice.totals,
            amountPaid: 0,
            balance: invoice.totals.total,
          },
        })

        return newId
      },

      sendInvoice: (id) => {
        set((state) => ({
          invoices: state.invoices.map((invoice) =>
            invoice.id === id
              ? {
                  ...invoice,
                  status: invoice.status === 'draft' ? 'sent' : invoice.status,
                  sentAt: new Date(),
                  updatedAt: new Date(),
                }
              : invoice
          ),
        }))
      },

      markInvoiceViewed: (id) => {
        set((state) => ({
          invoices: state.invoices.map((invoice) =>
            invoice.id === id && invoice.status === 'sent'
              ? {
                  ...invoice,
                  status: 'viewed',
                  viewedAt: new Date(),
                  updatedAt: new Date(),
                }
              : invoice
          ),
        }))
      },

      markInvoicePaid: (id) => {
        const invoice = get().getInvoice(id)
        if (!invoice) return

        const remainingBalance = invoice.totals.balance || invoice.totals.total

        get().addPayment(id, {
          amount: remainingBalance,
          date: new Date(),
          method: 'other',
          notes: 'Marked as paid',
        })
      },

      addInvoiceLineItem: (invoiceId, lineItemData) => {
        const lineItemId = `line_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const lineItem: LineItem = {
          ...lineItemData,
          id: lineItemId,
          amount: lineItemData.quantity * lineItemData.rate,
        }

        set((state) => ({
          invoices: state.invoices.map((invoice) =>
            invoice.id === invoiceId
              ? {
                  ...invoice,
                  lineItems: [...invoice.lineItems, lineItem],
                  totals: calculateTotals(
                    [...invoice.lineItems, lineItem],
                    invoice.taxRate,
                    invoice.payments
                  ),
                  updatedAt: new Date(),
                }
              : invoice
          ),
        }))
      },

      updateInvoiceLineItem: (invoiceId, lineItemId, updates) => {
        set((state) => ({
          invoices: state.invoices.map((invoice) => {
            if (invoice.id !== invoiceId) return invoice

            const updatedLineItems = invoice.lineItems.map((item) => {
              if (item.id !== lineItemId) return item
              const updated = { ...item, ...updates }
              return {
                ...updated,
                amount: updated.quantity * updated.rate,
              }
            })

            return {
              ...invoice,
              lineItems: updatedLineItems,
              totals: calculateTotals(updatedLineItems, invoice.taxRate, invoice.payments),
              updatedAt: new Date(),
            }
          }),
        }))
      },

      deleteInvoiceLineItem: (invoiceId, lineItemId) => {
        set((state) => ({
          invoices: state.invoices.map((invoice) => {
            if (invoice.id !== invoiceId) return invoice

            const updatedLineItems = invoice.lineItems.filter((item) => item.id !== lineItemId)

            return {
              ...invoice,
              lineItems: updatedLineItems,
              totals: calculateTotals(updatedLineItems, invoice.taxRate, invoice.payments),
              updatedAt: new Date(),
            }
          }),
        }))
      },

      reorderInvoiceLineItems: (invoiceId, lineItems) => {
        set((state) => ({
          invoices: state.invoices.map((invoice) =>
            invoice.id === invoiceId
              ? {
                  ...invoice,
                  lineItems: lineItems.map((item, index) => ({ ...item, order: index })),
                  updatedAt: new Date(),
                }
              : invoice
          ),
        }))
      },

      addPayment: (invoiceId, paymentData) => {
        const paymentId = `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const payment: Payment = {
          ...paymentData,
          id: paymentId,
        }

        set((state) => ({
          invoices: state.invoices.map((invoice) => {
            if (invoice.id !== invoiceId) return invoice

            const payments = [...invoice.payments, payment]
            const totals = calculateTotals(invoice.lineItems, invoice.taxRate, payments)
            const updated = {
              ...invoice,
              payments,
              totals,
              updatedAt: new Date(),
            }

            // Mark as paid if fully paid
            if (totals.balance === 0) {
              updated.paidAt = new Date()
            }

            return {
              ...updated,
              status: getInvoiceStatus(updated),
            }
          }),
        }))
      },

      updatePayment: (invoiceId, paymentId, updates) => {
        set((state) => ({
          invoices: state.invoices.map((invoice) => {
            if (invoice.id !== invoiceId) return invoice

            const payments = invoice.payments.map((payment) =>
              payment.id === paymentId ? { ...payment, ...updates } : payment
            )
            const totals = calculateTotals(invoice.lineItems, invoice.taxRate, payments)

            const updated = {
              ...invoice,
              payments,
              totals,
              updatedAt: new Date(),
            }

            return {
              ...updated,
              status: getInvoiceStatus(updated),
            }
          }),
        }))
      },

      deletePayment: (invoiceId, paymentId) => {
        set((state) => ({
          invoices: state.invoices.map((invoice) => {
            if (invoice.id !== invoiceId) return invoice

            const payments = invoice.payments.filter((payment) => payment.id !== paymentId)
            const totals = calculateTotals(invoice.lineItems, invoice.taxRate, payments)

            const updated = {
              ...invoice,
              payments,
              totals,
              paidAt: undefined,
              updatedAt: new Date(),
            }

            return {
              ...updated,
              status: getInvoiceStatus(updated),
            }
          }),
        }))
      },

      // ============ DOCUMENT CONVERSION ============
      convertEstimateToWorkOrder: (estimateId, scheduledDate, assignedTo) => {
        const estimate = get().getEstimate(estimateId)
        if (!estimate) return null

        const existingNumbers = get().workOrders.map((wo) => wo.documentNumber)
        const workOrderNumber = generateWorkOrderNumber(existingNumbers)

        const workOrderData = convertEstimateToWorkOrder(
          estimate,
          workOrderNumber,
          scheduledDate,
          assignedTo
        )

        const newId = get().addWorkOrder({
          ...workOrderData,
          createdBy: estimate.createdBy,
        })

        // Update estimate with conversion reference
        get().updateEstimate(estimateId, {
          convertedToWorkOrderId: newId,
        })

        return newId
      },

      convertWorkOrderToInvoice: (workOrderId, paymentTerms, dueDate) => {
        const workOrder = get().getWorkOrder(workOrderId)
        if (!workOrder) return null

        const existingNumbers = get().invoices.map((inv) => inv.documentNumber)
        const invoiceNumber = generateInvoiceNumber(existingNumbers)

        const invoiceData = convertWorkOrderToInvoice(
          workOrder,
          invoiceNumber,
          paymentTerms,
          dueDate
        )

        const newId = get().addInvoice({
          ...invoiceData,
          createdBy: workOrder.createdBy,
        })

        // Update work order with conversion reference
        get().updateWorkOrder(workOrderId, {
          convertedToInvoiceId: newId,
        })

        return newId
      },

      convertEstimateToInvoice: (estimateId, paymentTerms, dueDate) => {
        const estimate = get().getEstimate(estimateId)
        if (!estimate) return null

        const existingNumbers = get().invoices.map((inv) => inv.documentNumber)
        const invoiceNumber = generateInvoiceNumber(existingNumbers)

        const invoiceData = convertEstimateToInvoice(
          estimate,
          invoiceNumber,
          paymentTerms,
          dueDate
        )

        const newId = get().addInvoice({
          ...invoiceData,
          createdBy: estimate.createdBy,
        })

        return newId
      },

      // ============ FILTERS AND SORTING ============
      setEstimateFilters: (filters) => {
        set((state) => ({
          estimateFilters: { ...state.estimateFilters, ...filters },
        }))
      },

      clearEstimateFilters: () => {
        set({ estimateFilters: {} })
      },

      setWorkOrderFilters: (filters) => {
        set((state) => ({
          workOrderFilters: { ...state.workOrderFilters, ...filters },
        }))
      },

      clearWorkOrderFilters: () => {
        set({ workOrderFilters: {} })
      },

      setInvoiceFilters: (filters) => {
        set((state) => ({
          invoiceFilters: { ...state.invoiceFilters, ...filters },
        }))
      },

      clearInvoiceFilters: () => {
        set({ invoiceFilters: {} })
      },

      setEstimateSort: (sort) => {
        set({ estimateSort: sort })
      },

      setWorkOrderSort: (sort) => {
        set({ workOrderSort: sort })
      },

      setInvoiceSort: (sort) => {
        set({ invoiceSort: sort })
      },

      // ============ GETTERS ============
      getFilteredEstimates: () => {
        const { estimates, estimateFilters, estimateSort } = get()
        let filtered = [...estimates]

        // Apply filters
        if (estimateFilters.search) {
          const search = estimateFilters.search.toLowerCase()
          filtered = filtered.filter(
            (est) =>
              est.documentNumber.toLowerCase().includes(search) ||
              est.customerName.toLowerCase().includes(search) ||
              est.customerEmail.toLowerCase().includes(search)
          )
        }

        if (estimateFilters.status && estimateFilters.status.length > 0) {
          filtered = filtered.filter((est) =>
            estimateFilters.status!.includes(est.status)
          )
        }

        if (estimateFilters.customerId) {
          filtered = filtered.filter((est) => est.customerId === estimateFilters.customerId)
        }

        if (estimateFilters.dateFrom) {
          filtered = filtered.filter((est) => est.createdAt >= estimateFilters.dateFrom!)
        }

        if (estimateFilters.dateTo) {
          filtered = filtered.filter((est) => est.createdAt <= estimateFilters.dateTo!)
        }

        if (estimateFilters.minAmount !== undefined) {
          filtered = filtered.filter((est) => est.totals.total >= estimateFilters.minAmount!)
        }

        if (estimateFilters.maxAmount !== undefined) {
          filtered = filtered.filter((est) => est.totals.total <= estimateFilters.maxAmount!)
        }

        // Check for expired estimates
        filtered = filtered.map((est) => {
          if (isEstimateExpired(est) && est.status !== 'accepted' && est.status !== 'declined') {
            return { ...est, status: 'expired' as const }
          }
          return est
        })

        // Apply sorting
        filtered.sort((a, b) => {
          let aValue: any
          let bValue: any

          if (estimateSort.field === 'total') {
            aValue = a.totals.total
            bValue = b.totals.total
          } else if (estimateSort.field === 'dueDate') {
            // Estimates don't have dueDate, use validUntil instead
            aValue = new Date(a.validUntil).getTime()
            bValue = new Date(b.validUntil).getTime()
          } else if (estimateSort.field === 'createdAt') {
            aValue = new Date(a.createdAt).getTime()
            bValue = new Date(b.createdAt).getTime()
          } else if (estimateSort.field in a && estimateSort.field in b) {
            aValue = a[estimateSort.field as keyof EstimateDocument]
            bValue = b[estimateSort.field as keyof EstimateDocument]
          } else {
            return 0
          }

          if (typeof aValue === 'string' && typeof bValue === 'string') {
            aValue = aValue.toLowerCase()
            bValue = bValue.toLowerCase()
          }

          if (aValue < bValue) return estimateSort.direction === 'asc' ? -1 : 1
          if (aValue > bValue) return estimateSort.direction === 'asc' ? 1 : -1
          return 0
        })

        return filtered
      },

      getFilteredWorkOrders: () => {
        const { workOrders, workOrderFilters, workOrderSort } = get()
        let filtered = [...workOrders]

        // Apply filters
        if (workOrderFilters.search) {
          const search = workOrderFilters.search.toLowerCase()
          filtered = filtered.filter(
            (wo) =>
              wo.documentNumber.toLowerCase().includes(search) ||
              wo.customerName.toLowerCase().includes(search) ||
              wo.customerEmail.toLowerCase().includes(search)
          )
        }

        if (workOrderFilters.status && workOrderFilters.status.length > 0) {
          filtered = filtered.filter((wo) =>
            workOrderFilters.status!.includes(wo.status)
          )
        }

        if (workOrderFilters.customerId) {
          filtered = filtered.filter((wo) => wo.customerId === workOrderFilters.customerId)
        }

        if (workOrderFilters.assignedTo && workOrderFilters.assignedTo.length > 0) {
          filtered = filtered.filter((wo) =>
            wo.assignedTo?.some((id) => workOrderFilters.assignedTo!.includes(id))
          )
        }

        if (workOrderFilters.priority && workOrderFilters.priority.length > 0) {
          filtered = filtered.filter((wo) =>
            workOrderFilters.priority!.includes(wo.priority)
          )
        }

        if (workOrderFilters.dateFrom) {
          filtered = filtered.filter(
            (wo) => wo.scheduledDate && wo.scheduledDate >= workOrderFilters.dateFrom!
          )
        }

        if (workOrderFilters.dateTo) {
          filtered = filtered.filter(
            (wo) => wo.scheduledDate && wo.scheduledDate <= workOrderFilters.dateTo!
          )
        }

        // Apply sorting
        filtered.sort((a, b) => {
          let aValue: any
          let bValue: any

          if (workOrderSort.field === 'total') {
            aValue = a.totals.total
            bValue = b.totals.total
          } else if (workOrderSort.field === 'dueDate') {
            // Work orders don't have dueDate, use scheduledDate instead
            aValue = a.scheduledDate ? new Date(a.scheduledDate).getTime() : 0
            bValue = b.scheduledDate ? new Date(b.scheduledDate).getTime() : 0
          } else if (workOrderSort.field === 'createdAt') {
            aValue = new Date(a.createdAt).getTime()
            bValue = new Date(b.createdAt).getTime()
          } else if (workOrderSort.field in a && workOrderSort.field in b) {
            aValue = a[workOrderSort.field as keyof WorkOrderDocument]
            bValue = b[workOrderSort.field as keyof WorkOrderDocument]
          } else {
            return 0
          }

          if (typeof aValue === 'string' && typeof bValue === 'string') {
            aValue = aValue.toLowerCase()
            bValue = bValue.toLowerCase()
          }

          if (aValue < bValue) return workOrderSort.direction === 'asc' ? -1 : 1
          if (aValue > bValue) return workOrderSort.direction === 'asc' ? 1 : -1
          return 0
        })

        return filtered
      },

      getFilteredInvoices: () => {
        const { invoices, invoiceFilters, invoiceSort } = get()
        let filtered = [...invoices].map((inv) => ({
          ...inv,
          status: getInvoiceStatus(inv),
        }))

        // Apply filters
        if (invoiceFilters.search) {
          const search = invoiceFilters.search.toLowerCase()
          filtered = filtered.filter(
            (inv) =>
              inv.documentNumber.toLowerCase().includes(search) ||
              inv.customerName.toLowerCase().includes(search) ||
              inv.customerEmail.toLowerCase().includes(search)
          )
        }

        if (invoiceFilters.status && invoiceFilters.status.length > 0) {
          filtered = filtered.filter((inv) =>
            invoiceFilters.status!.includes(inv.status)
          )
        }

        if (invoiceFilters.customerId) {
          filtered = filtered.filter((inv) => inv.customerId === invoiceFilters.customerId)
        }

        if (invoiceFilters.dateFrom) {
          filtered = filtered.filter((inv) => inv.createdAt >= invoiceFilters.dateFrom!)
        }

        if (invoiceFilters.dateTo) {
          filtered = filtered.filter((inv) => inv.createdAt <= invoiceFilters.dateTo!)
        }

        if (invoiceFilters.minAmount !== undefined) {
          filtered = filtered.filter((inv) => inv.totals.total >= invoiceFilters.minAmount!)
        }

        if (invoiceFilters.maxAmount !== undefined) {
          filtered = filtered.filter((inv) => inv.totals.total <= invoiceFilters.maxAmount!)
        }

        if (invoiceFilters.overdue) {
          filtered = filtered.filter((inv) => inv.status === 'overdue')
        }

        // Apply sorting
        filtered.sort((a, b) => {
          let aValue: any
          let bValue: any

          if (invoiceSort.field === 'total') {
            aValue = a.totals.total
            bValue = b.totals.total
          } else if (invoiceSort.field === 'dueDate') {
            aValue = new Date(a.dueDate).getTime()
            bValue = new Date(b.dueDate).getTime()
          } else if (invoiceSort.field === 'createdAt') {
            aValue = new Date(a.createdAt).getTime()
            bValue = new Date(b.createdAt).getTime()
          } else {
            aValue = a[invoiceSort.field]
            bValue = b[invoiceSort.field]
          }

          if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase()
            bValue = bValue.toLowerCase()
          }

          if (aValue < bValue) return invoiceSort.direction === 'asc' ? -1 : 1
          if (aValue > bValue) return invoiceSort.direction === 'asc' ? 1 : -1
          return 0
        })

        return filtered
      },

      getEstimateStats: () => {
        const estimates = get().estimates

        const total = estimates.length
        const draft = estimates.filter((e) => e.status === 'draft').length
        const sent = estimates.filter((e) => e.status === 'sent' || e.status === 'viewed').length
        const accepted = estimates.filter((e) => e.status === 'accepted').length
        const declined = estimates.filter((e) => e.status === 'declined').length
        const expired = estimates.filter((e) => isEstimateExpired(e)).length

        const totalValue = estimates.reduce((sum, e) => sum + e.totals.total, 0)
        const averageValue = total > 0 ? totalValue / total : 0
        const acceptanceRate =
          sent + accepted + declined > 0 ? (accepted / (sent + accepted + declined)) * 100 : 0

        return {
          total,
          draft,
          sent,
          accepted,
          declined,
          expired,
          totalValue,
          averageValue,
          acceptanceRate,
        }
      },

      getWorkOrderStats: () => {
        const workOrders = get().workOrders

        const total = workOrders.length
        const scheduled = workOrders.filter((wo) => wo.status === 'scheduled').length
        const inProgress = workOrders.filter((wo) => wo.status === 'in_progress').length
        const completed = workOrders.filter((wo) => wo.status === 'completed').length
        const cancelled = workOrders.filter((wo) => wo.status === 'cancelled').length

        const totalValue = workOrders.reduce((sum, wo) => sum + wo.totals.total, 0)

        const completedOrders = workOrders.filter(
          (wo) => wo.status === 'completed' && wo.startedAt && wo.completedAt
        )
        const totalCompletionTime = completedOrders.reduce((sum, wo) => {
          const start = new Date(wo.startedAt!).getTime()
          const end = new Date(wo.completedAt!).getTime()
          return sum + (end - start)
        }, 0)
        const averageCompletionTime =
          completedOrders.length > 0
            ? totalCompletionTime / completedOrders.length / (1000 * 60 * 60)
            : 0 // in hours

        return {
          total,
          scheduled,
          inProgress,
          completed,
          cancelled,
          totalValue,
          averageCompletionTime,
        }
      },

      getInvoiceStats: () => {
        const invoices = get().invoices.map((inv) => ({
          ...inv,
          status: getInvoiceStatus(inv),
        }))

        const total = invoices.length
        const draft = invoices.filter((i) => i.status === 'draft').length
        const sent = invoices.filter((i) => i.status === 'sent' || i.status === 'viewed').length
        const paid = invoices.filter((i) => i.status === 'paid').length
        const overdue = invoices.filter((i) => i.status === 'overdue').length

        const totalValue = invoices.reduce((sum, i) => sum + i.totals.total, 0)
        const totalPaid = invoices.reduce((sum, i) => sum + (i.totals.amountPaid || 0), 0)
        const totalOutstanding = totalValue - totalPaid

        const paidInvoices = invoices.filter((i) => i.status === 'paid' && i.paidAt)
        const totalDaysToPay = paidInvoices.reduce((sum, inv) => {
          const created = new Date(inv.createdAt).getTime()
          const paidDate = new Date(inv.paidAt!).getTime()
          return sum + (paidDate - created) / (1000 * 60 * 60 * 24)
        }, 0)
        const averageDaysToPay = paidInvoices.length > 0 ? totalDaysToPay / paidInvoices.length : 0

        return {
          total,
          draft,
          sent,
          paid,
          overdue,
          totalValue,
          totalPaid,
          totalOutstanding,
          averageDaysToPay,
        }
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        estimates: state.estimates.map((e) => ({
          ...e,
          createdAt: e.createdAt.toISOString(),
          updatedAt: e.updatedAt.toISOString(),
          validUntil: e.validUntil.toISOString(),
          sentAt: e.sentAt?.toISOString(),
          viewedAt: e.viewedAt?.toISOString(),
          acceptedAt: e.acceptedAt?.toISOString(),
          declinedAt: e.declinedAt?.toISOString(),
        })),
        workOrders: state.workOrders.map((wo) => ({
          ...wo,
          createdAt: wo.createdAt.toISOString(),
          updatedAt: wo.updatedAt.toISOString(),
          scheduledDate: wo.scheduledDate?.toISOString(),
          startedAt: wo.startedAt?.toISOString(),
          completedAt: wo.completedAt?.toISOString(),
          timeTracking: wo.timeTracking.map((t) => ({
            ...t,
            startTime: t.startTime.toISOString(),
            endTime: t.endTime?.toISOString(),
          })),
        })),
        invoices: state.invoices.map((inv) => ({
          ...inv,
          createdAt: inv.createdAt.toISOString(),
          updatedAt: inv.updatedAt.toISOString(),
          dueDate: inv.dueDate.toISOString(),
          sentAt: inv.sentAt?.toISOString(),
          viewedAt: inv.viewedAt?.toISOString(),
          paidAt: inv.paidAt?.toISOString(),
          payments: inv.payments.map((p) => ({
            ...p,
            date: p.date.toISOString(),
          })),
        })),
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert ISO strings back to Date objects
          state.estimates = state.estimates.map((e: any) => ({
            ...e,
            createdAt: new Date(e.createdAt),
            updatedAt: new Date(e.updatedAt),
            validUntil: new Date(e.validUntil),
            sentAt: e.sentAt ? new Date(e.sentAt) : undefined,
            viewedAt: e.viewedAt ? new Date(e.viewedAt) : undefined,
            acceptedAt: e.acceptedAt ? new Date(e.acceptedAt) : undefined,
            declinedAt: e.declinedAt ? new Date(e.declinedAt) : undefined,
          }))

          state.workOrders = state.workOrders.map((wo: any) => ({
            ...wo,
            createdAt: new Date(wo.createdAt),
            updatedAt: new Date(wo.updatedAt),
            scheduledDate: wo.scheduledDate ? new Date(wo.scheduledDate) : undefined,
            startedAt: wo.startedAt ? new Date(wo.startedAt) : undefined,
            completedAt: wo.completedAt ? new Date(wo.completedAt) : undefined,
            timeTracking: wo.timeTracking.map((t: any) => ({
              ...t,
              startTime: new Date(t.startTime),
              endTime: t.endTime ? new Date(t.endTime) : undefined,
            })),
          }))

          state.invoices = state.invoices.map((inv: any) => ({
            ...inv,
            createdAt: new Date(inv.createdAt),
            updatedAt: new Date(inv.updatedAt),
            dueDate: new Date(inv.dueDate),
            sentAt: inv.sentAt ? new Date(inv.sentAt) : undefined,
            viewedAt: inv.viewedAt ? new Date(inv.viewedAt) : undefined,
            paidAt: inv.paidAt ? new Date(inv.paidAt) : undefined,
            payments: inv.payments.map((p: any) => ({
              ...p,
              date: new Date(p.date),
            })),
          }))
        }
      },
    }
  )
)

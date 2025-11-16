import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  Receipt,
  ReceiptCategory,
  ReceiptFilters,
  ReceiptSort,
  ReceiptStats,
  getTaxQuarter,
  getTaxYear,
} from '@/lib/types/receipts'

interface ReceiptState {
  receipts: Receipt[]
  filters: ReceiptFilters
  sort: ReceiptSort
  viewMode: 'grid' | 'list'
  selectedReceipts: string[]

  // CRUD operations
  addReceipt: (receipt: Omit<Receipt, 'id' | 'createdAt' | 'updatedAt' | 'taxYear' | 'taxQuarter'>) => string
  updateReceipt: (id: string, receipt: Partial<Receipt>) => void
  deleteReceipt: (id: string) => void
  deleteReceipts: (ids: string[]) => void
  getReceipt: (id: string) => Receipt | undefined

  // Filter and search
  setFilters: (filters: Partial<ReceiptFilters>) => void
  clearFilters: () => void
  setSort: (sort: ReceiptSort) => void
  setViewMode: (mode: 'grid' | 'list') => void

  // Selection
  selectReceipt: (id: string) => void
  unselectReceipt: (id: string) => void
  selectAllReceipts: () => void
  clearSelection: () => void

  // Computed getters
  getFilteredReceipts: () => Receipt[]
  getReceiptStats: () => ReceiptStats
  getAllVendors: () => string[]
  getAllTags: () => string[]

  // Bulk operations
  bulkUpdateCategory: (ids: string[], category: ReceiptCategory) => void
  bulkUpdateTags: (ids: string[], tags: string[]) => void
}

const STORAGE_KEY = 'receipts-storage'

export const useReceiptStore = create<ReceiptState>()(
  persist(
    (set, get) => ({
      receipts: [],
      filters: {},
      sort: { field: 'date', direction: 'desc' },
      viewMode: 'list',
      selectedReceipts: [],

      addReceipt: (receiptData) => {
        const id = `receipt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const now = new Date()

        const receipt: Receipt = {
          ...receiptData,
          id,
          taxYear: getTaxYear(receiptData.date),
          taxQuarter: getTaxQuarter(receiptData.date),
          createdAt: now,
          updatedAt: now,
        }

        set((state) => ({
          receipts: [...state.receipts, receipt],
        }))

        return id
      },

      updateReceipt: (id, updates) => {
        set((state) => ({
          receipts: state.receipts.map((receipt) =>
            receipt.id === id
              ? {
                  ...receipt,
                  ...updates,
                  taxYear: updates.date ? getTaxYear(updates.date) : receipt.taxYear,
                  taxQuarter: updates.date ? getTaxQuarter(updates.date) : receipt.taxQuarter,
                  updatedAt: new Date(),
                }
              : receipt
          ),
        }))
      },

      deleteReceipt: (id) => {
        set((state) => ({
          receipts: state.receipts.filter((receipt) => receipt.id !== id),
          selectedReceipts: state.selectedReceipts.filter((selectedId) => selectedId !== id),
        }))
      },

      deleteReceipts: (ids) => {
        set((state) => ({
          receipts: state.receipts.filter((receipt) => !ids.includes(receipt.id)),
          selectedReceipts: state.selectedReceipts.filter((id) => !ids.includes(id)),
        }))
      },

      getReceipt: (id) => {
        return get().receipts.find((receipt) => receipt.id === id)
      },

      setFilters: (filters) => {
        set((state) => ({
          filters: { ...state.filters, ...filters },
        }))
      },

      clearFilters: () => {
        set({ filters: {} })
      },

      setSort: (sort) => {
        set({ sort })
      },

      setViewMode: (mode) => {
        set({ viewMode: mode })
      },

      selectReceipt: (id) => {
        set((state) => ({
          selectedReceipts: state.selectedReceipts.includes(id)
            ? state.selectedReceipts
            : [...state.selectedReceipts, id],
        }))
      },

      unselectReceipt: (id) => {
        set((state) => ({
          selectedReceipts: state.selectedReceipts.filter((selectedId) => selectedId !== id),
        }))
      },

      selectAllReceipts: () => {
        const filtered = get().getFilteredReceipts()
        set({ selectedReceipts: filtered.map((r) => r.id) })
      },

      clearSelection: () => {
        set({ selectedReceipts: [] })
      },

      getFilteredReceipts: () => {
        const { receipts, filters, sort } = get()

        let filtered = [...receipts]

        // Apply filters
        if (filters.search) {
          const search = filters.search.toLowerCase()
          filtered = filtered.filter(
            (receipt) =>
              receipt.vendor.toLowerCase().includes(search) ||
              receipt.description.toLowerCase().includes(search) ||
              receipt.notes.toLowerCase().includes(search)
          )
        }

        if (filters.categories && filters.categories.length > 0) {
          filtered = filtered.filter((receipt) =>
            filters.categories!.includes(receipt.category)
          )
        }

        if (filters.vendors && filters.vendors.length > 0) {
          filtered = filtered.filter((receipt) =>
            filters.vendors!.includes(receipt.vendor)
          )
        }

        if (filters.paymentMethods && filters.paymentMethods.length > 0) {
          filtered = filtered.filter((receipt) =>
            filters.paymentMethods!.includes(receipt.paymentMethod)
          )
        }

        if (filters.dateFrom) {
          filtered = filtered.filter(
            (receipt) => receipt.date >= filters.dateFrom!
          )
        }

        if (filters.dateTo) {
          filtered = filtered.filter(
            (receipt) => receipt.date <= filters.dateTo!
          )
        }

        if (filters.amountMin !== undefined) {
          filtered = filtered.filter(
            (receipt) => receipt.amount >= filters.amountMin!
          )
        }

        if (filters.amountMax !== undefined) {
          filtered = filtered.filter(
            (receipt) => receipt.amount <= filters.amountMax!
          )
        }

        if (filters.tags && filters.tags.length > 0) {
          filtered = filtered.filter((receipt) =>
            filters.tags!.some((tag) => receipt.tags.includes(tag))
          )
        }

        if (filters.jobId) {
          filtered = filtered.filter((receipt) => receipt.jobId === filters.jobId)
        }

        if (filters.isTaxDeductible !== undefined) {
          filtered = filtered.filter(
            (receipt) => receipt.isTaxDeductible === filters.isTaxDeductible
          )
        }

        if (filters.isPersonal !== undefined) {
          filtered = filtered.filter(
            (receipt) => receipt.isPersonal === filters.isPersonal
          )
        }

        if (filters.taxYear) {
          filtered = filtered.filter(
            (receipt) => receipt.taxYear === filters.taxYear
          )
        }

        if (filters.taxQuarter) {
          filtered = filtered.filter(
            (receipt) => receipt.taxQuarter === filters.taxQuarter
          )
        }

        // Apply sorting
        filtered.sort((a, b) => {
          let aValue: any = a[sort.field]
          let bValue: any = b[sort.field]

          if (sort.field === 'date' || sort.field === 'createdAt') {
            aValue = new Date(aValue).getTime()
            bValue = new Date(bValue).getTime()
          }

          if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase()
            bValue = bValue.toLowerCase()
          }

          if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1
          if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1
          return 0
        })

        return filtered
      },

      getReceiptStats: () => {
        const receipts = get().getFilteredReceipts()

        const totalExpenses = receipts.reduce(
          (sum, receipt) => sum + receipt.amount,
          0
        )

        const categoryBreakdown = receipts.reduce(
          (acc, receipt) => {
            acc[receipt.category] = (acc[receipt.category] || 0) + receipt.amount
            return acc
          },
          {} as Record<ReceiptCategory, number>
        )

        // Monthly trend (last 12 months)
        const monthlyTrend: { month: string; amount: number }[] = []
        const now = new Date()
        for (let i = 11; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
          const month = date.toLocaleDateString('en-US', {
            month: 'short',
            year: 'numeric',
          })
          const amount = receipts
            .filter(
              (r) =>
                r.date.getMonth() === date.getMonth() &&
                r.date.getFullYear() === date.getFullYear()
            )
            .reduce((sum, r) => sum + r.amount, 0)
          monthlyTrend.push({ month, amount })
        }

        const taxDeductibleTotal = receipts
          .filter((r) => r.isTaxDeductible)
          .reduce((sum, r) => sum + r.amount, 0)

        const personalTotal = receipts
          .filter((r) => r.isPersonal)
          .reduce((sum, r) => sum + r.amount, 0)

        const quarterlyTotals = receipts.reduce(
          (acc, receipt) => {
            acc[receipt.taxQuarter] =
              (acc[receipt.taxQuarter] || 0) + receipt.amount
            return acc
          },
          {} as Record<1 | 2 | 3 | 4, number>
        )

        return {
          totalExpenses,
          categoryBreakdown,
          monthlyTrend,
          taxDeductibleTotal,
          personalTotal,
          quarterlyTotals,
        }
      },

      getAllVendors: () => {
        const vendors = new Set(get().receipts.map((r) => r.vendor))
        return Array.from(vendors).sort()
      },

      getAllTags: () => {
        const tags = new Set(get().receipts.flatMap((r) => r.tags))
        return Array.from(tags).sort()
      },

      bulkUpdateCategory: (ids, category) => {
        set((state) => ({
          receipts: state.receipts.map((receipt) =>
            ids.includes(receipt.id)
              ? { ...receipt, category, updatedAt: new Date() }
              : receipt
          ),
        }))
      },

      bulkUpdateTags: (ids, tags) => {
        set((state) => ({
          receipts: state.receipts.map((receipt) =>
            ids.includes(receipt.id)
              ? { ...receipt, tags, updatedAt: new Date() }
              : receipt
          ),
        }))
      },
    }),
    {
      name: STORAGE_KEY,
      // Custom serialization for Date objects
      partialize: (state) => ({
        receipts: state.receipts.map((r) => ({
          ...r,
          date: r.date.toISOString(),
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString(),
        })),
        filters: state.filters,
        sort: state.sort,
        viewMode: state.viewMode,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert ISO strings back to Date objects
          state.receipts = state.receipts.map((r: any) => ({
            ...r,
            date: new Date(r.date),
            createdAt: new Date(r.createdAt),
            updatedAt: new Date(r.updatedAt),
          }))
        }
      },
    }
  )
)

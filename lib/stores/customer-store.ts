import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  Customer,
  Address,
  Contact,
  Communication,
  CustomerFilters,
  CustomerSort,
  CustomerStats,
  getLastCommunication,
} from '@/lib/types/customers'

interface CustomerState {
  customers: Customer[]
  filters: CustomerFilters
  sort: CustomerSort
  viewMode: 'grid' | 'list'
  selectedCustomers: string[]

  // CRUD operations
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>) => string
  updateCustomer: (id: string, customer: Partial<Customer>) => void
  deleteCustomer: (id: string) => void
  deleteCustomers: (ids: string[]) => void
  getCustomer: (id: string) => Customer | undefined
  duplicateCustomer: (id: string) => string | null

  // Address management
  addAddress: (customerId: string, address: Omit<Address, 'id'>) => void
  updateAddress: (customerId: string, addressId: string, address: Partial<Address>) => void
  deleteAddress: (customerId: string, addressId: string) => void
  setPrimaryAddress: (customerId: string, addressId: string) => void

  // Contact management
  addContact: (customerId: string, contact: Omit<Contact, 'id'>) => void
  updateContact: (customerId: string, contactId: string, contact: Partial<Contact>) => void
  deleteContact: (customerId: string, contactId: string) => void
  setPrimaryContact: (customerId: string, contactId: string) => void

  // Communication history
  addCommunication: (customerId: string, communication: Omit<Communication, 'id'>) => void
  updateCommunication: (customerId: string, commId: string, communication: Partial<Communication>) => void
  deleteCommunication: (customerId: string, commId: string) => void

  // Tag management
  addTag: (customerId: string, tag: string) => void
  removeTag: (customerId: string, tag: string) => void
  bulkAddTags: (customerIds: string[], tags: string[]) => void
  bulkRemoveTags: (customerIds: string[], tags: string[]) => void

  // Filter and search
  setFilters: (filters: Partial<CustomerFilters>) => void
  clearFilters: () => void
  setSort: (sort: CustomerSort) => void
  setViewMode: (mode: 'grid' | 'list') => void

  // Selection
  selectCustomer: (id: string) => void
  unselectCustomer: (id: string) => void
  selectAllCustomers: () => void
  clearSelection: () => void

  // Computed getters
  getFilteredCustomers: () => Customer[]
  getCustomerStats: () => CustomerStats
  getAllTags: () => string[]

  // Bulk operations
  bulkUpdateStatus: (ids: string[], status: Customer['status']) => void
  bulkArchive: (ids: string[]) => void

  // CSV operations
  exportToCSV: () => string
  importFromCSV: (csvData: string) => void

  // Merge customers
  mergeCustomers: (sourceId: string, targetId: string) => void
}

const STORAGE_KEY = 'customers-storage'

export const useCustomerStore = create<CustomerState>()(
  persist(
    (set, get) => ({
      customers: [],
      filters: {},
      sort: { field: 'name', direction: 'asc' },
      viewMode: 'list',
      selectedCustomers: [],

      addCustomer: (customerData) => {
        const id = `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const now = new Date()

        const customer: Customer = {
          ...customerData,
          id,
          createdAt: now,
          updatedAt: now,
        }

        set((state) => ({
          customers: [...state.customers, customer],
        }))

        return id
      },

      updateCustomer: (id, updates) => {
        set((state) => ({
          customers: state.customers.map((customer) =>
            customer.id === id
              ? {
                  ...customer,
                  ...updates,
                  updatedAt: new Date(),
                }
              : customer
          ),
        }))
      },

      deleteCustomer: (id) => {
        set((state) => ({
          customers: state.customers.filter((customer) => customer.id !== id),
          selectedCustomers: state.selectedCustomers.filter((selectedId) => selectedId !== id),
        }))
      },

      deleteCustomers: (ids) => {
        set((state) => ({
          customers: state.customers.filter((customer) => !ids.includes(customer.id)),
          selectedCustomers: state.selectedCustomers.filter((id) => !ids.includes(id)),
        }))
      },

      getCustomer: (id) => {
        return get().customers.find((customer) => customer.id === id)
      },

      duplicateCustomer: (id) => {
        const customer = get().getCustomer(id)
        if (!customer) return null

        const newId = `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const now = new Date()

        const duplicated: Customer = {
          ...customer,
          id: newId,
          name: `${customer.name} (Copy)`,
          createdAt: now,
          updatedAt: now,
          communicationHistory: [], // Don't copy communication history
        }

        set((state) => ({
          customers: [...state.customers, duplicated],
        }))

        return newId
      },

      // Address management
      addAddress: (customerId, addressData) => {
        const addressId = `address_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const address: Address = { ...addressData, id: addressId }

        set((state) => ({
          customers: state.customers.map((customer) =>
            customer.id === customerId
              ? {
                  ...customer,
                  addresses: [...customer.addresses, address],
                  updatedAt: new Date(),
                }
              : customer
          ),
        }))
      },

      updateAddress: (customerId, addressId, updates) => {
        set((state) => ({
          customers: state.customers.map((customer) =>
            customer.id === customerId
              ? {
                  ...customer,
                  addresses: customer.addresses.map((addr) =>
                    addr.id === addressId ? { ...addr, ...updates } : addr
                  ),
                  updatedAt: new Date(),
                }
              : customer
          ),
        }))
      },

      deleteAddress: (customerId, addressId) => {
        set((state) => ({
          customers: state.customers.map((customer) =>
            customer.id === customerId
              ? {
                  ...customer,
                  addresses: customer.addresses.filter((addr) => addr.id !== addressId),
                  updatedAt: new Date(),
                }
              : customer
          ),
        }))
      },

      setPrimaryAddress: (customerId, addressId) => {
        set((state) => ({
          customers: state.customers.map((customer) =>
            customer.id === customerId
              ? {
                  ...customer,
                  addresses: customer.addresses.map((addr) => ({
                    ...addr,
                    isPrimary: addr.id === addressId,
                  })),
                  updatedAt: new Date(),
                }
              : customer
          ),
        }))
      },

      // Contact management
      addContact: (customerId, contactData) => {
        const contactId = `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const contact: Contact = { ...contactData, id: contactId }

        set((state) => ({
          customers: state.customers.map((customer) =>
            customer.id === customerId
              ? {
                  ...customer,
                  contacts: [...customer.contacts, contact],
                  updatedAt: new Date(),
                }
              : customer
          ),
        }))
      },

      updateContact: (customerId, contactId, updates) => {
        set((state) => ({
          customers: state.customers.map((customer) =>
            customer.id === customerId
              ? {
                  ...customer,
                  contacts: customer.contacts.map((contact) =>
                    contact.id === contactId ? { ...contact, ...updates } : contact
                  ),
                  updatedAt: new Date(),
                }
              : customer
          ),
        }))
      },

      deleteContact: (customerId, contactId) => {
        set((state) => ({
          customers: state.customers.map((customer) =>
            customer.id === customerId
              ? {
                  ...customer,
                  contacts: customer.contacts.filter((contact) => contact.id !== contactId),
                  updatedAt: new Date(),
                }
              : customer
          ),
        }))
      },

      setPrimaryContact: (customerId, contactId) => {
        set((state) => ({
          customers: state.customers.map((customer) =>
            customer.id === customerId
              ? {
                  ...customer,
                  contacts: customer.contacts.map((contact) => ({
                    ...contact,
                    isPrimary: contact.id === contactId,
                  })),
                  updatedAt: new Date(),
                }
              : customer
          ),
        }))
      },

      // Communication history
      addCommunication: (customerId, communicationData) => {
        const commId = `comm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const communication: Communication = { ...communicationData, id: commId }

        set((state) => ({
          customers: state.customers.map((customer) =>
            customer.id === customerId
              ? {
                  ...customer,
                  communicationHistory: [...customer.communicationHistory, communication],
                  updatedAt: new Date(),
                }
              : customer
          ),
        }))
      },

      updateCommunication: (customerId, commId, updates) => {
        set((state) => ({
          customers: state.customers.map((customer) =>
            customer.id === customerId
              ? {
                  ...customer,
                  communicationHistory: customer.communicationHistory.map((comm) =>
                    comm.id === commId ? { ...comm, ...updates } : comm
                  ),
                  updatedAt: new Date(),
                }
              : customer
          ),
        }))
      },

      deleteCommunication: (customerId, commId) => {
        set((state) => ({
          customers: state.customers.map((customer) =>
            customer.id === customerId
              ? {
                  ...customer,
                  communicationHistory: customer.communicationHistory.filter((comm) => comm.id !== commId),
                  updatedAt: new Date(),
                }
              : customer
          ),
        }))
      },

      // Tag management
      addTag: (customerId, tag) => {
        set((state) => ({
          customers: state.customers.map((customer) =>
            customer.id === customerId && !customer.tags.includes(tag)
              ? {
                  ...customer,
                  tags: [...customer.tags, tag],
                  updatedAt: new Date(),
                }
              : customer
          ),
        }))
      },

      removeTag: (customerId, tag) => {
        set((state) => ({
          customers: state.customers.map((customer) =>
            customer.id === customerId
              ? {
                  ...customer,
                  tags: customer.tags.filter((t) => t !== tag),
                  updatedAt: new Date(),
                }
              : customer
          ),
        }))
      },

      bulkAddTags: (customerIds, tags) => {
        set((state) => ({
          customers: state.customers.map((customer) =>
            customerIds.includes(customer.id)
              ? {
                  ...customer,
                  tags: [...new Set([...customer.tags, ...tags])],
                  updatedAt: new Date(),
                }
              : customer
          ),
        }))
      },

      bulkRemoveTags: (customerIds, tags) => {
        set((state) => ({
          customers: state.customers.map((customer) =>
            customerIds.includes(customer.id)
              ? {
                  ...customer,
                  tags: customer.tags.filter((t) => !tags.includes(t)),
                  updatedAt: new Date(),
                }
              : customer
          ),
        }))
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

      selectCustomer: (id) => {
        set((state) => ({
          selectedCustomers: state.selectedCustomers.includes(id)
            ? state.selectedCustomers
            : [...state.selectedCustomers, id],
        }))
      },

      unselectCustomer: (id) => {
        set((state) => ({
          selectedCustomers: state.selectedCustomers.filter((selectedId) => selectedId !== id),
        }))
      },

      selectAllCustomers: () => {
        const filtered = get().getFilteredCustomers()
        set({ selectedCustomers: filtered.map((c) => c.id) })
      },

      clearSelection: () => {
        set({ selectedCustomers: [] })
      },

      getFilteredCustomers: () => {
        const { customers, filters, sort } = get()

        let filtered = [...customers]

        // Apply filters
        if (filters.search) {
          const search = filters.search.toLowerCase()
          filtered = filtered.filter(
            (customer) =>
              customer.name.toLowerCase().includes(search) ||
              customer.email.toLowerCase().includes(search) ||
              customer.phone.toLowerCase().includes(search) ||
              (customer.company && customer.company.toLowerCase().includes(search)) ||
              customer.tags.some((tag) => tag.toLowerCase().includes(search))
          )
        }

        if (filters.types && filters.types.length > 0) {
          filtered = filtered.filter((customer) =>
            filters.types!.includes(customer.type)
          )
        }

        if (filters.statuses && filters.statuses.length > 0) {
          filtered = filtered.filter((customer) =>
            filters.statuses!.includes(customer.status)
          )
        }

        if (filters.sources && filters.sources.length > 0) {
          filtered = filtered.filter((customer) =>
            filters.sources!.includes(customer.source)
          )
        }

        if (filters.tags && filters.tags.length > 0) {
          filtered = filtered.filter((customer) =>
            filters.tags!.some((tag) => customer.tags.includes(tag))
          )
        }

        if (filters.createdAfter) {
          filtered = filtered.filter(
            (customer) => customer.createdAt >= filters.createdAfter!
          )
        }

        if (filters.createdBefore) {
          filtered = filtered.filter(
            (customer) => customer.createdAt <= filters.createdBefore!
          )
        }

        // Apply sorting
        filtered.sort((a, b) => {
          let aValue: any
          let bValue: any

          if (sort.field === 'lastContact') {
            const aLastComm = getLastCommunication(a)
            const bLastComm = getLastCommunication(b)
            aValue = aLastComm ? new Date(aLastComm.date).getTime() : 0
            bValue = bLastComm ? new Date(bLastComm.date).getTime() : 0
          } else {
            aValue = a[sort.field]
            bValue = b[sort.field]
          }

          if (sort.field === 'createdAt' || sort.field === 'updatedAt') {
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

      getCustomerStats: () => {
        const customers = get().customers

        const totalCustomers = customers.length
        const activeCustomers = customers.filter((c) => c.status === 'active').length
        const inactiveCustomers = customers.filter((c) => c.status === 'inactive').length
        const potentialCustomers = customers.filter((c) => c.status === 'potential').length
        const residentialCount = customers.filter((c) => c.type === 'residential').length
        const commercialCount = customers.filter((c) => c.type === 'commercial').length

        const sourceBreakdown = customers.reduce(
          (acc, customer) => {
            acc[customer.source] = (acc[customer.source] || 0) + 1
            return acc
          },
          {} as Record<string, number>
        )

        const tagBreakdown = customers.reduce(
          (acc, customer) => {
            customer.tags.forEach((tag) => {
              acc[tag] = (acc[tag] || 0) + 1
            })
            return acc
          },
          {} as Record<string, number>
        )

        // Get last 10 customers
        const recentAdditions = [...customers]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10)

        return {
          totalCustomers,
          activeCustomers,
          inactiveCustomers,
          potentialCustomers,
          residentialCount,
          commercialCount,
          sourceBreakdown,
          recentAdditions,
          tagBreakdown,
        }
      },

      getAllTags: () => {
        const tags = new Set(get().customers.flatMap((c) => c.tags))
        return Array.from(tags).sort()
      },

      bulkUpdateStatus: (ids, status) => {
        set((state) => ({
          customers: state.customers.map((customer) =>
            ids.includes(customer.id)
              ? { ...customer, status, updatedAt: new Date() }
              : customer
          ),
        }))
      },

      bulkArchive: (ids) => {
        set((state) => ({
          customers: state.customers.map((customer) =>
            ids.includes(customer.id)
              ? { ...customer, status: 'inactive' as const, updatedAt: new Date() }
              : customer
          ),
        }))
      },

      exportToCSV: () => {
        const customers = get().getFilteredCustomers()
        const headers = [
          'Name',
          'Email',
          'Phone',
          'Company',
          'Type',
          'Status',
          'Source',
          'Tags',
          'Notes',
          'Created At',
        ]

        const rows = customers.map((customer) => [
          customer.name,
          customer.email,
          customer.phone,
          customer.company || '',
          customer.type,
          customer.status,
          customer.source,
          customer.tags.join(';'),
          customer.notes,
          customer.createdAt.toISOString(),
        ])

        const csv = [
          headers.join(','),
          ...rows.map((row) =>
            row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
          ),
        ].join('\n')

        return csv
      },

      importFromCSV: (csvData) => {
        const lines = csvData.split('\n')
        const headers = lines[0].split(',')

        const newCustomers: Customer[] = []

        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map((v) => v.replace(/^"|"$/g, '').replace(/""/g, '"'))

          if (values.length < headers.length) continue

          const now = new Date()
          const id = `customer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}_${i}`

          const customer: Customer = {
            id,
            companyId: '', // Will need to be set based on current user
            name: values[0] || '',
            email: values[1] || '',
            phone: values[2] || '',
            company: values[3] || undefined,
            type: (values[4] as 'residential' | 'commercial') || 'residential',
            status: (values[5] as 'active' | 'inactive' | 'potential') || 'active',
            source: (values[6] as Customer['source']) || 'manual',
            tags: values[7] ? values[7].split(';') : [],
            notes: values[8] || '',
            addresses: [],
            contacts: [],
            communicationHistory: [],
            createdAt: now,
            updatedAt: now,
          }

          newCustomers.push(customer)
        }

        set((state) => ({
          customers: [...state.customers, ...newCustomers],
        }))
      },

      mergeCustomers: (sourceId, targetId) => {
        const source = get().getCustomer(sourceId)
        const target = get().getCustomer(targetId)

        if (!source || !target) return

        // Merge data into target
        const merged: Customer = {
          ...target,
          addresses: [...target.addresses, ...source.addresses],
          contacts: [...target.contacts, ...source.contacts],
          tags: [...new Set([...target.tags, ...source.tags])],
          communicationHistory: [...target.communicationHistory, ...source.communicationHistory],
          notes: target.notes + (source.notes ? `\n\n--- Merged from ${source.name} ---\n${source.notes}` : ''),
          updatedAt: new Date(),
        }

        set((state) => ({
          customers: state.customers.map((customer) =>
            customer.id === targetId ? merged : customer
          ).filter((customer) => customer.id !== sourceId),
        }))
      },
    }),
    {
      name: STORAGE_KEY,
      // Custom serialization for Date objects
      partialize: (state) => ({
        customers: state.customers.map((c) => ({
          ...c,
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
          communicationHistory: c.communicationHistory.map((comm) => ({
            ...comm,
            date: comm.date.toISOString(),
          })),
        })),
        filters: state.filters,
        sort: state.sort,
        viewMode: state.viewMode,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Convert ISO strings back to Date objects
          state.customers = state.customers.map((c: any) => ({
            ...c,
            createdAt: new Date(c.createdAt),
            updatedAt: new Date(c.updatedAt),
            communicationHistory: c.communicationHistory.map((comm: any) => ({
              ...comm,
              date: new Date(comm.date),
            })),
          }))
        }
      },
    }
  )
)

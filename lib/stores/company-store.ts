import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  CompanyProfile,
  CompanyFilters,
  CompanySort,
  DocumentCounters,
  CompanySettings,
  CompanyBranding,
  DEFAULT_BRANDING,
  DEFAULT_COMPANY_SETTINGS,
  DEFAULT_DOCUMENT_COUNTERS,
  getNextDocumentNumber,
  incrementDocumentCounter,
  isInsuranceExpired,
} from '@/lib/types/company'

interface CompanyState {
  companies: CompanyProfile[]
  activeCompanyId: string | null
  filters: CompanyFilters
  sort: CompanySort

  // CRUD operations
  addCompany: (company: Omit<CompanyProfile, 'id' | 'createdAt' | 'updatedAt'>) => string
  updateCompany: (id: string, company: Partial<CompanyProfile>) => void
  deleteCompany: (id: string) => void
  getCompany: (id: string) => CompanyProfile | undefined
  duplicateCompany: (id: string) => string | null

  // Active company management
  setActiveCompany: (id: string) => void
  getActiveCompany: () => CompanyProfile | null
  setDefaultCompany: (id: string) => void

  // Document counter management
  getNextDocumentNumber: (
    companyId: string,
    type: 'estimate' | 'workOrder' | 'invoice'
  ) => string | null
  incrementCounter: (companyId: string, type: 'estimate' | 'workOrder' | 'invoice') => void
  updateDocumentCounters: (companyId: string, counters: Partial<DocumentCounters>) => void

  // Settings management
  updateSettings: (companyId: string, settings: Partial<CompanySettings>) => void
  updateBranding: (companyId: string, branding: Partial<CompanyBranding>) => void

  // Logo management
  updateLogo: (companyId: string, logo: string) => void
  removeLogo: (companyId: string) => void

  // Filter and search
  setFilters: (filters: Partial<CompanyFilters>) => void
  clearFilters: () => void
  setSort: (sort: CompanySort) => void

  // Computed getters
  getFilteredCompanies: () => CompanyProfile[]
  getDefaultCompany: () => CompanyProfile | null
  getCompaniesWithExpiredInsurance: () => CompanyProfile[]
  getCompaniesWithExpiringSoonInsurance: (days: number) => CompanyProfile[]
}

const STORAGE_KEY = 'company-storage'

export const useCompanyStore = create<CompanyState>()(
  persist(
    (set, get) => ({
      companies: [],
      activeCompanyId: null,
      filters: {},
      sort: { field: 'name', direction: 'asc' },

      addCompany: (companyData) => {
        const id = `company_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const now = new Date()

        // If this is the first company, make it default and active
        const isFirstCompany = get().companies.length === 0

        const company: CompanyProfile = {
          ...companyData,
          id,
          isDefault: isFirstCompany || companyData.isDefault,
          createdAt: now,
          updatedAt: now,
        }

        // If making this default, clear other defaults
        if (company.isDefault) {
          set((state) => ({
            companies: state.companies.map((c) => ({ ...c, isDefault: false })),
          }))
        }

        set((state) => ({
          companies: [...state.companies, company],
          activeCompanyId: isFirstCompany ? id : state.activeCompanyId,
        }))

        return id
      },

      updateCompany: (id, updates) => {
        // If making this default, clear other defaults
        if (updates.isDefault) {
          set((state) => ({
            companies: state.companies.map((c) =>
              c.id === id ? c : { ...c, isDefault: false }
            ),
          }))
        }

        set((state) => ({
          companies: state.companies.map((company) =>
            company.id === id
              ? {
                  ...company,
                  ...updates,
                  updatedAt: new Date(),
                }
              : company
          ),
        }))
      },

      deleteCompany: (id) => {
        const company = get().getCompany(id)
        if (!company) return

        // Don't allow deleting the last company
        if (get().companies.length === 1) {
          console.warn('Cannot delete the last company')
          return
        }

        // If deleting the default company, make another one default
        if (company.isDefault) {
          const otherCompanies = get().companies.filter((c) => c.id !== id)
          if (otherCompanies.length > 0) {
            set((state) => ({
              companies: state.companies.map((c) =>
                c.id === otherCompanies[0].id ? { ...c, isDefault: true } : c
              ),
            }))
          }
        }

        // If deleting the active company, switch to another one
        if (get().activeCompanyId === id) {
          const otherCompanies = get().companies.filter((c) => c.id !== id)
          if (otherCompanies.length > 0) {
            set({ activeCompanyId: otherCompanies[0].id })
          }
        }

        set((state) => ({
          companies: state.companies.filter((company) => company.id !== id),
        }))
      },

      getCompany: (id) => {
        return get().companies.find((company) => company.id === id)
      },

      duplicateCompany: (id) => {
        const company = get().getCompany(id)
        if (!company) return null

        const newId = `company_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        const now = new Date()

        const duplicated: CompanyProfile = {
          ...company,
          id: newId,
          name: `${company.name} (Copy)`,
          dba: company.dba ? `${company.dba} (Copy)` : undefined,
          isDefault: false,
          documentCounters: { ...DEFAULT_DOCUMENT_COUNTERS },
          createdAt: now,
          updatedAt: now,
        }

        set((state) => ({
          companies: [...state.companies, duplicated],
        }))

        return newId
      },

      setActiveCompany: (id) => {
        const company = get().getCompany(id)
        if (company) {
          set({ activeCompanyId: id })
        }
      },

      getActiveCompany: () => {
        const { activeCompanyId } = get()
        if (!activeCompanyId) {
          // Return default company if no active company
          return get().getDefaultCompany()
        }
        return get().getCompany(activeCompanyId) || get().getDefaultCompany()
      },

      setDefaultCompany: (id) => {
        set((state) => ({
          companies: state.companies.map((company) => ({
            ...company,
            isDefault: company.id === id,
            updatedAt: company.id === id ? new Date() : company.updatedAt,
          })),
        }))
      },

      getNextDocumentNumber: (companyId, type) => {
        const company = get().getCompany(companyId)
        if (!company) return null
        return getNextDocumentNumber(company, type)
      },

      incrementCounter: (companyId, type) => {
        const company = get().getCompany(companyId)
        if (!company) return

        const newCounters = incrementDocumentCounter(company, type)

        set((state) => ({
          companies: state.companies.map((c) =>
            c.id === companyId
              ? { ...c, documentCounters: newCounters, updatedAt: new Date() }
              : c
          ),
        }))
      },

      updateDocumentCounters: (companyId, counters) => {
        set((state) => ({
          companies: state.companies.map((company) =>
            company.id === companyId
              ? {
                  ...company,
                  documentCounters: { ...company.documentCounters, ...counters },
                  updatedAt: new Date(),
                }
              : company
          ),
        }))
      },

      updateSettings: (companyId, settings) => {
        set((state) => ({
          companies: state.companies.map((company) =>
            company.id === companyId
              ? {
                  ...company,
                  settings: { ...company.settings, ...settings },
                  updatedAt: new Date(),
                }
              : company
          ),
        }))
      },

      updateBranding: (companyId, branding) => {
        set((state) => ({
          companies: state.companies.map((company) =>
            company.id === companyId
              ? {
                  ...company,
                  branding: { ...company.branding, ...branding },
                  updatedAt: new Date(),
                }
              : company
          ),
        }))
      },

      updateLogo: (companyId, logo) => {
        set((state) => ({
          companies: state.companies.map((company) =>
            company.id === companyId ? { ...company, logo, updatedAt: new Date() } : company
          ),
        }))
      },

      removeLogo: (companyId) => {
        set((state) => ({
          companies: state.companies.map((company) =>
            company.id === companyId
              ? { ...company, logo: undefined, updatedAt: new Date() }
              : company
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

      getFilteredCompanies: () => {
        const { companies, filters, sort } = get()

        let filtered = [...companies]

        // Apply filters
        if (filters.search) {
          const search = filters.search.toLowerCase()
          filtered = filtered.filter(
            (company) =>
              company.name.toLowerCase().includes(search) ||
              (company.dba && company.dba.toLowerCase().includes(search)) ||
              company.email.toLowerCase().includes(search) ||
              company.phone.toLowerCase().includes(search)
          )
        }

        if (filters.types && filters.types.length > 0) {
          filtered = filtered.filter((company) => filters.types!.includes(company.type))
        }

        if (filters.isDefault !== undefined) {
          filtered = filtered.filter((company) => company.isDefault === filters.isDefault)
        }

        // Apply sorting
        filtered.sort((a, b) => {
          let aValue: any = a[sort.field]
          let bValue: any = b[sort.field]

          if (sort.field === 'createdAt') {
            aValue = new Date(aValue).getTime()
            bValue = new Date(bValue).getTime()
          }

          if (typeof aValue === 'string') {
            aValue = aValue.toLowerCase()
            bValue = bValue.toLowerCase()
          }

          // Handle undefined dba
          if (sort.field === 'dba') {
            aValue = aValue || ''
            bValue = bValue || ''
          }

          if (aValue < bValue) return sort.direction === 'asc' ? -1 : 1
          if (aValue > bValue) return sort.direction === 'asc' ? 1 : -1
          return 0
        })

        return filtered
      },

      getDefaultCompany: () => {
        return get().companies.find((company) => company.isDefault) || get().companies[0] || null
      },

      getCompaniesWithExpiredInsurance: () => {
        return get().companies.filter((company) => isInsuranceExpired(company))
      },

      getCompaniesWithExpiringSoonInsurance: (days) => {
        const now = new Date()
        const threshold = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)

        return get().companies.filter((company) => {
          const expiration = new Date(company.insuranceExpiration)
          return expiration > now && expiration <= threshold
        })
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        companies: state.companies.map((c) => ({
          ...c,
          insuranceExpiration: c.insuranceExpiration.toISOString(),
          createdAt: c.createdAt.toISOString(),
          updatedAt: c.updatedAt.toISOString(),
        })),
        activeCompanyId: state.activeCompanyId,
        filters: state.filters,
        sort: state.sort,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.companies = state.companies.map((c: any) => ({
            ...c,
            insuranceExpiration: new Date(c.insuranceExpiration),
            createdAt: new Date(c.createdAt),
            updatedAt: new Date(c.updatedAt),
          }))
        }
      },
    }
  )
)

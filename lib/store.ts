import { create } from 'zustand'
import { EntityType, EntityInstance, DEFAULT_ENTITIES, ContactAddress, LinkedContact } from './entities'
import { TaxDocument, TaxPackage, getQuarterFromDate } from './tax-documents'
import { EstimateDocument, WorkOrderDocument, InvoiceDocument, calculateDocumentTotals } from './line-items'
import { CompanyProfile, createDefaultCompanyProfile, generateDocumentNumber, incrementDocumentCounter } from './company-profiles'

export type AppSection = 'home' | 'voice' | 'photo' | 'nec' | 'jobs' | 'settings' | 'get-paid' | 'get-reviews' | 'my-contractors' | 'tax-manager' | 'estimates' | 'work-orders' | 'invoices'

export interface VoiceCallState {
  isActive: boolean
  isConnecting: boolean
  transcript: string[]
  duration: number
}

export interface PhotoAnalysis {
  id: string
  imageUrl: string
  analysis: string | null
  timestamp: number
  isAnalyzing: boolean
}

export interface NECCode {
  code: string
  title: string
  description: string
  isBookmarked: boolean
}

interface AppState {
  // Navigation
  currentSection: AppSection
  setCurrentSection: (section: AppSection) => void
  
  // Voice AI
  voiceCall: VoiceCallState
  startVoiceCall: () => void
  endVoiceCall: () => void
  addTranscript: (text: string) => void
  updateCallDuration: (duration: number) => void
  
  // Photo Analysis
  photos: PhotoAnalysis[]
  addPhoto: (imageUrl: string) => void
  updatePhotoAnalysis: (id: string, analysis: string) => void
  removePhoto: (id: string) => void
  
  // NEC Codes
  bookmarkedCodes: NECCode[]
  addBookmark: (code: NECCode) => void
  removeBookmark: (codeNumber: string) => void
  
  // Entity Management System
  entityTypes: { [key: string]: EntityType }
  entities: EntityInstance[]
  currentEntityView: string | null
  currentEntityId: string | null
  setEntityType: (entityTypeId: string, config: Partial<EntityType>) => void
  createEntity: (entityTypeId: string, data: any, addresses?: ContactAddress[], linkedContacts?: LinkedContact[]) => void
  updateEntity: (id: string, data: any, addresses?: ContactAddress[], linkedContacts?: LinkedContact[]) => void
  deleteEntity: (id: string) => void
  getEntity: (id: string) => EntityInstance | undefined
  getEntitiesByType: (entityTypeId: string) => EntityInstance[]
  setCurrentEntityView: (entityTypeId: string | null, entityId?: string | null) => void

  // Tax Documents
  taxDocuments: TaxDocument[]
  taxPackages: TaxPackage[]
  addTaxDocument: (document: Omit<TaxDocument, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateTaxDocument: (id: string, updates: Partial<TaxDocument>) => void
  deleteTaxDocument: (id: string) => void
  getTaxDocumentsByYear: (year: number) => TaxDocument[]
  getTaxDocumentsByQuarter: (year: number, quarter: string) => TaxDocument[]
  createTaxPackage: (year: number, quarter?: string, type?: 'quarterly' | 'annual') => string
  markPackageSubmitted: (packageId: string, accountantEmail?: string) => void

  // Estimates, Work Orders, Invoices
  estimates: EstimateDocument[]
  workOrders: WorkOrderDocument[]
  invoices: InvoiceDocument[]
  addEstimate: (estimate: Omit<EstimateDocument, 'id' | 'number' | 'createdAt' | 'updatedAt'> & { companyId?: string }) => string
  updateEstimate: (id: string, updates: Partial<EstimateDocument>) => void
  deleteEstimate: (id: string) => void
  getEstimate: (id: string) => EstimateDocument | undefined
  addWorkOrder: (workOrder: Omit<WorkOrderDocument, 'id' | 'number' | 'createdAt' | 'updatedAt'> & { companyId?: string }) => string
  updateWorkOrder: (id: string, updates: Partial<WorkOrderDocument>) => void
  deleteWorkOrder: (id: string) => void
  getWorkOrder: (id: string) => WorkOrderDocument | undefined
  addInvoice: (invoice: Omit<InvoiceDocument, 'id' | 'number' | 'createdAt' | 'updatedAt'> & { companyId?: string }) => string
  updateInvoice: (id: string, updates: Partial<InvoiceDocument>) => void
  deleteInvoice: (id: string) => void
  getInvoice: (id: string) => InvoiceDocument | undefined
  convertEstimateToWorkOrder: (estimateId: string) => string
  convertWorkOrderToInvoice: (workOrderId: string) => string
  duplicateEstimate: (estimateId: string) => string
  duplicateWorkOrder: (workOrderId: string) => string
  duplicateInvoice: (invoiceId: string) => string

  // Company Profiles (for multiple companies/DBAs)
  companyProfiles: CompanyProfile[]
  currentCompanyId: string | null
  addCompanyProfile: (profile: Omit<CompanyProfile, 'id' | 'createdAt' | 'updatedAt'>) => string
  updateCompanyProfile: (id: string, updates: Partial<CompanyProfile>) => void
  deleteCompanyProfile: (id: string) => void
  setDefaultCompany: (id: string) => void
  setCurrentCompany: (id: string) => void
  getCurrentCompany: () => CompanyProfile | null
  getDefaultCompany: () => CompanyProfile | null

  // API Keys & Settings
  apiKeys: {
    vapi: string | null
    vapiAssistantId: string | null
    anthropic: string | null
    quickbooks: string | null
    stripe: string | null
  }
  // Owner/Admin Settings
  ownerSettings: {
    provideDefaultKeys: boolean // If true, use owner's keys as fallback
    defaultVapiKey: string
    defaultVapiAssistantId: string
    defaultAnthropicKey: string
  }
  integrations: {
    // Phase 1: Core Foundation (Based on customer research - absolute priorities)
    quickbooks: { enabled: boolean; companyId: string | null; accessToken: string | null; refreshToken: string | null; realmId: string | null }
    googleCalendar: { enabled: boolean; calendarId: string | null; apiKey: string | null; oauth: string | null }
    stripe: { enabled: boolean; publishableKey: string | null; secretKey: string | null; webhookSecret: string | null }
    gmail: { enabled: boolean; email: string | null; apiKey: string | null; oauth: string | null }

    // Phase 2: Growth Enablers
    zapier: { enabled: boolean; webhookUrl: string | null; apiKey: string | null }
    mailchimp: { enabled: boolean; apiKey: string | null; listId: string | null; serverPrefix: string | null }
    googleDrive: { enabled: boolean; folderId: string | null; apiKey: string | null; oauth: string | null }

    // Phase 3: Team & Reputation
    slack: { enabled: boolean; webhookUrl: string | null; botToken: string | null; channelId: string | null }
    microsoftTeams: { enabled: boolean; webhookUrl: string | null; tenantId: string | null }
    nicejob: { enabled: boolean; apiKey: string | null; companyId: string | null }
    broadly: { enabled: boolean; apiKey: string | null; locationId: string | null }

    // Legacy/Other
    microsoft: { enabled: boolean; clientId: string | null; tenantId: string | null }
    make: { enabled: boolean; webhookUrl: string | null; apiKey: string | null }
    email: { enabled: boolean; smtpHost: string | null; smtpPort: string | null; username: string | null }
  }
  setApiKey: (key: string, value: string) => void
  setOwnerSetting: (key: string, value: any) => void
  setIntegration: (platform: string, config: any) => void
  loadSettings: () => void
  saveSettings: () => void
}

export const useAppStore = create<AppState>((set, get) => ({
  // Navigation
  currentSection: 'home',
  setCurrentSection: (section) => set({ currentSection: section }),
  
  // Voice AI
  voiceCall: {
    isActive: false,
    isConnecting: false,
    transcript: [],
    duration: 0,
  },
  startVoiceCall: () => set((state) => ({
    voiceCall: { ...state.voiceCall, isActive: true, isConnecting: true }
  })),
  endVoiceCall: () => set((state) => ({
    voiceCall: { ...state.voiceCall, isActive: false, isConnecting: false, transcript: [], duration: 0 }
  })),
  addTranscript: (text) => set((state) => ({
    voiceCall: { ...state.voiceCall, transcript: [...state.voiceCall.transcript, text] }
  })),
  updateCallDuration: (duration) => set((state) => ({
    voiceCall: { ...state.voiceCall, duration }
  })),
  
  // Photo Analysis
  photos: [],
  addPhoto: (imageUrl) => set((state) => ({
    photos: [...state.photos, {
      id: Date.now().toString(),
      imageUrl,
      analysis: null,
      timestamp: Date.now(),
      isAnalyzing: true,
    }]
  })),
  updatePhotoAnalysis: (id, analysis) => set((state) => ({
    photos: state.photos.map(photo => 
      photo.id === id ? { ...photo, analysis, isAnalyzing: false } : photo
    )
  })),
  removePhoto: (id) => set((state) => ({
    photos: state.photos.filter(photo => photo.id !== id)
  })),
  
  // NEC Codes
  bookmarkedCodes: [],
  addBookmark: (code) => set((state) => ({
    bookmarkedCodes: [...state.bookmarkedCodes, code]
  })),
  removeBookmark: (codeNumber) => set((state) => ({
    bookmarkedCodes: state.bookmarkedCodes.filter(code => code.code !== codeNumber)
  })),

  // Entity Management System
  entityTypes: DEFAULT_ENTITIES,
  entities: [],
  currentEntityView: null,
  currentEntityId: null,
  setEntityType: (entityTypeId, config) => set((state) => ({
    entityTypes: {
      ...state.entityTypes,
      [entityTypeId]: { ...state.entityTypes[entityTypeId], ...config }
    }
  })),
  createEntity: (entityTypeId, data, addresses?, linkedContacts?) => set((state) => {
    const newEntity: EntityInstance = {
      id: `${entityTypeId}_${Date.now()}`,
      entityType: entityTypeId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: state.entityTypes[entityTypeId]?.fields.find(f => f.name === 'status')?.defaultValue || 'active',
      data,
      relationships: {},
      addresses: addresses || [],
      linkedContacts: linkedContacts || []
    }
    return { entities: [...state.entities, newEntity] }
  }),
  updateEntity: (id, data, addresses?, linkedContacts?) => set((state) => ({
    entities: state.entities.map(entity =>
      entity.id === id
        ? {
            ...entity,
            data: { ...entity.data, ...data },
            addresses: addresses !== undefined ? addresses : entity.addresses,
            linkedContacts: linkedContacts !== undefined ? linkedContacts : entity.linkedContacts,
            updatedAt: Date.now()
          }
        : entity
    )
  })),
  deleteEntity: (id) => set((state) => ({
    entities: state.entities.filter(entity => entity.id !== id)
  })),
  getEntity: (id) => {
    const state = get()
    return state.entities.find(entity => entity.id === id)
  },
  getEntitiesByType: (entityTypeId) => {
    const state = get()
    return state.entities.filter(entity => entity.entityType === entityTypeId)
  },
  setCurrentEntityView: (entityTypeId, entityId = null) => set({
    currentEntityView: entityTypeId,
    currentEntityId: entityId
  }),

  // Tax Documents
  taxDocuments: [],
  taxPackages: [],
  addTaxDocument: (document) => set((state) => {
    const now = Date.now()
    const newDoc: TaxDocument = {
      ...document,
      id: `tax_${now}`,
      createdAt: now,
      updatedAt: now,
      year: new Date(document.date).getFullYear(),
      quarter: getQuarterFromDate(document.date)
    }
    return { taxDocuments: [...state.taxDocuments, newDoc] }
  }),
  updateTaxDocument: (id, updates) => set((state) => ({
    taxDocuments: state.taxDocuments.map(doc =>
      doc.id === id
        ? { ...doc, ...updates, updatedAt: Date.now() }
        : doc
    )
  })),
  deleteTaxDocument: (id) => set((state) => ({
    taxDocuments: state.taxDocuments.filter(doc => doc.id !== id)
  })),
  getTaxDocumentsByYear: (year) => {
    const state = get()
    return state.taxDocuments.filter(doc => doc.year === year)
  },
  getTaxDocumentsByQuarter: (year, quarter) => {
    const state = get()
    return state.taxDocuments.filter(doc => doc.year === year && doc.quarter === quarter)
  },
  createTaxPackage: (year, quarter?, type = 'annual') => {
    const state = get()
    let documents: string[]

    if (quarter && type === 'quarterly') {
      documents = state.taxDocuments
        .filter(doc => doc.year === year && doc.quarter === quarter)
        .map(doc => doc.id)
    } else {
      documents = state.taxDocuments
        .filter(doc => doc.year === year)
        .map(doc => doc.id)
    }

    const newPackage: TaxPackage = {
      id: `package_${Date.now()}`,
      year,
      quarter: quarter as any,
      type,
      documents,
      generatedAt: Date.now()
    }

    set((state) => ({
      taxPackages: [...state.taxPackages, newPackage]
    }))

    return newPackage.id
  },
  markPackageSubmitted: (packageId, accountantEmail?) => set((state) => ({
    taxPackages: state.taxPackages.map(pkg =>
      pkg.id === packageId
        ? { ...pkg, submittedAt: Date.now(), accountantEmail }
        : pkg
    )
  })),

  // Estimates, Work Orders, Invoices
  estimates: [],
  workOrders: [],
  invoices: [],

  addEstimate: (estimate) => {
    const state = get()
    const now = Date.now()

    // Get company for numbering (use estimate's companyId, current company, or default)
    let company = estimate.companyId
      ? state.companyProfiles.find(p => p.id === estimate.companyId)
      : state.currentCompanyId
        ? state.companyProfiles.find(p => p.id === state.currentCompanyId)
        : state.companyProfiles.find(p => p.isDefault) || state.companyProfiles[0]

    // If no company exists, create a default one
    if (!company) {
      const defaultProfile = createDefaultCompanyProfile()
      const newCompanyId = `company_${now}`
      const newCompany: CompanyProfile = {
        ...defaultProfile,
        id: newCompanyId,
        createdAt: now,
        updatedAt: now
      }
      set((state) => ({
        companyProfiles: [...state.companyProfiles, newCompany],
        currentCompanyId: newCompanyId
      }))
      company = newCompany
    }

    // Generate document number
    const documentNumber = generateDocumentNumber(company, 'estimate')

    const newEstimate: EstimateDocument = {
      ...estimate,
      id: `est_${now}`,
      number: documentNumber,
      companyId: company.id,
      createdAt: now,
      updatedAt: now
    }

    // Increment counter and update company
    const updatedCompany = incrementDocumentCounter(company, 'estimate')

    set((state) => ({
      estimates: [...state.estimates, newEstimate],
      companyProfiles: state.companyProfiles.map(p =>
        p.id === company.id ? updatedCompany : p
      )
    }))

    return newEstimate.id
  },

  updateEstimate: (id, updates) => set((state) => ({
    estimates: state.estimates.map(est =>
      est.id === id
        ? { ...est, ...updates, updatedAt: Date.now() }
        : est
    )
  })),

  deleteEstimate: (id) => set((state) => ({
    estimates: state.estimates.filter(est => est.id !== id)
  })),

  getEstimate: (id) => {
    const state = get()
    return state.estimates.find(est => est.id === id)
  },

  addWorkOrder: (workOrder) => {
    const state = get()
    const now = Date.now()

    // Get company for numbering
    let company = workOrder.companyId
      ? state.companyProfiles.find(p => p.id === workOrder.companyId)
      : state.currentCompanyId
        ? state.companyProfiles.find(p => p.id === state.currentCompanyId)
        : state.companyProfiles.find(p => p.isDefault) || state.companyProfiles[0]

    if (!company) {
      const defaultProfile = createDefaultCompanyProfile()
      const newCompanyId = `company_${now}`
      const newCompany: CompanyProfile = {
        ...defaultProfile,
        id: newCompanyId,
        createdAt: now,
        updatedAt: now
      }
      set((state) => ({
        companyProfiles: [...state.companyProfiles, newCompany],
        currentCompanyId: newCompanyId
      }))
      company = newCompany
    }

    const documentNumber = generateDocumentNumber(company, 'workOrder')

    const newWorkOrder: WorkOrderDocument = {
      ...workOrder,
      id: `wo_${now}`,
      number: documentNumber,
      companyId: company.id,
      createdAt: now,
      updatedAt: now
    }

    const updatedCompany = incrementDocumentCounter(company, 'workOrder')

    set((state) => ({
      workOrders: [...state.workOrders, newWorkOrder],
      companyProfiles: state.companyProfiles.map(p =>
        p.id === company.id ? updatedCompany : p
      )
    }))

    return newWorkOrder.id
  },

  updateWorkOrder: (id, updates) => set((state) => ({
    workOrders: state.workOrders.map(wo =>
      wo.id === id
        ? { ...wo, ...updates, updatedAt: Date.now() }
        : wo
    )
  })),

  deleteWorkOrder: (id) => set((state) => ({
    workOrders: state.workOrders.filter(wo => wo.id !== id)
  })),

  getWorkOrder: (id) => {
    const state = get()
    return state.workOrders.find(wo => wo.id === id)
  },

  addInvoice: (invoice) => {
    const state = get()
    const now = Date.now()

    // Get company for numbering
    let company = invoice.companyId
      ? state.companyProfiles.find(p => p.id === invoice.companyId)
      : state.currentCompanyId
        ? state.companyProfiles.find(p => p.id === state.currentCompanyId)
        : state.companyProfiles.find(p => p.isDefault) || state.companyProfiles[0]

    if (!company) {
      const defaultProfile = createDefaultCompanyProfile()
      const newCompanyId = `company_${now}`
      const newCompany: CompanyProfile = {
        ...defaultProfile,
        id: newCompanyId,
        createdAt: now,
        updatedAt: now
      }
      set((state) => ({
        companyProfiles: [...state.companyProfiles, newCompany],
        currentCompanyId: newCompanyId
      }))
      company = newCompany
    }

    const documentNumber = generateDocumentNumber(company, 'invoice')

    const newInvoice: InvoiceDocument = {
      ...invoice,
      id: `inv_${now}`,
      number: documentNumber,
      companyId: company.id,
      createdAt: now,
      updatedAt: now
    }

    const updatedCompany = incrementDocumentCounter(company, 'invoice')

    set((state) => ({
      invoices: [...state.invoices, newInvoice],
      companyProfiles: state.companyProfiles.map(p =>
        p.id === company.id ? updatedCompany : p
      )
    }))

    return newInvoice.id
  },

  updateInvoice: (id, updates) => set((state) => ({
    invoices: state.invoices.map(inv =>
      inv.id === id
        ? { ...inv, ...updates, updatedAt: Date.now() }
        : inv
    )
  })),

  deleteInvoice: (id) => set((state) => ({
    invoices: state.invoices.filter(inv => inv.id !== id)
  })),

  getInvoice: (id) => {
    const state = get()
    return state.invoices.find(inv => inv.id === id)
  },

  convertEstimateToWorkOrder: (estimateId) => {
    const state = get()
    const estimate = state.estimates.find(e => e.id === estimateId)
    if (!estimate) return ''

    const now = Date.now()
    const workOrder: Omit<WorkOrderDocument, 'id' | 'number' | 'createdAt' | 'updatedAt'> = {
      companyId: estimate.companyId,
      customerId: estimate.customerId,
      customerName: estimate.customerName,
      jobId: estimate.jobId,
      jobName: estimate.jobName,
      estimateId: estimate.id,
      date: now,
      status: 'Scheduled',
      lineItems: [...estimate.lineItems],
      subtotal: estimate.subtotal,
      taxRate: estimate.taxRate,
      taxAmount: estimate.taxAmount,
      total: estimate.total
    }

    return get().addWorkOrder(workOrder)
  },

  convertWorkOrderToInvoice: (workOrderId) => {
    const state = get()
    const workOrder = state.workOrders.find(wo => wo.id === workOrderId)
    if (!workOrder) return ''

    const now = Date.now()
    const invoice: Omit<InvoiceDocument, 'id' | 'number' | 'createdAt' | 'updatedAt'> = {
      companyId: workOrder.companyId,
      customerId: workOrder.customerId,
      customerName: workOrder.customerName,
      jobId: workOrder.jobId,
      jobName: workOrder.jobName,
      estimateId: workOrder.estimateId,
      workOrderId: workOrder.id,
      date: now,
      status: 'Draft',
      lineItems: [...workOrder.lineItems],
      subtotal: workOrder.subtotal,
      taxRate: workOrder.taxRate,
      taxAmount: workOrder.taxAmount,
      total: workOrder.total,
      amountPaid: 0,
      balance: workOrder.total,
      includeTerms: true
    }

    return get().addInvoice(invoice)
  },

  duplicateEstimate: (estimateId) => {
    const state = get()
    const estimate = state.estimates.find(e => e.id === estimateId)
    if (!estimate) return ''

    const duplicatedEstimate: Omit<EstimateDocument, 'id' | 'number' | 'createdAt' | 'updatedAt'> = {
      companyId: estimate.companyId,
      customerId: estimate.customerId,
      customerName: estimate.customerName,
      jobId: estimate.jobId,
      jobName: estimate.jobName,
      date: Date.now(),
      expiryDate: estimate.expiryDate ? Date.now() + (estimate.expiryDate - estimate.date) : undefined,
      status: 'Draft',
      lineItems: [...estimate.lineItems],
      subtotal: estimate.subtotal,
      taxRate: estimate.taxRate,
      taxAmount: estimate.taxAmount,
      total: estimate.total,
      notes: estimate.notes,
      termsAndConditions: estimate.termsAndConditions,
      includeTerms: estimate.includeTerms
    }

    return get().addEstimate(duplicatedEstimate)
  },

  duplicateWorkOrder: (workOrderId) => {
    const state = get()
    const workOrder = state.workOrders.find(wo => wo.id === workOrderId)
    if (!workOrder) return ''

    const duplicatedWorkOrder: Omit<WorkOrderDocument, 'id' | 'number' | 'createdAt' | 'updatedAt'> = {
      companyId: workOrder.companyId,
      customerId: workOrder.customerId,
      customerName: workOrder.customerName,
      jobId: workOrder.jobId,
      jobName: workOrder.jobName,
      estimateId: workOrder.estimateId,
      date: Date.now(),
      status: 'Scheduled',
      assignedTo: workOrder.assignedTo,
      lineItems: [...workOrder.lineItems],
      subtotal: workOrder.subtotal,
      taxRate: workOrder.taxRate,
      taxAmount: workOrder.taxAmount,
      total: workOrder.total,
      notes: workOrder.notes,
      internalNotes: workOrder.internalNotes
    }

    return get().addWorkOrder(duplicatedWorkOrder)
  },

  duplicateInvoice: (invoiceId) => {
    const state = get()
    const invoice = state.invoices.find(inv => inv.id === invoiceId)
    if (!invoice) return ''

    const duplicatedInvoice: Omit<InvoiceDocument, 'id' | 'number' | 'createdAt' | 'updatedAt'> = {
      companyId: invoice.companyId,
      customerId: invoice.customerId,
      customerName: invoice.customerName,
      jobId: invoice.jobId,
      jobName: invoice.jobName,
      estimateId: invoice.estimateId,
      workOrderId: invoice.workOrderId,
      date: Date.now(),
      dueDate: invoice.dueDate ? Date.now() + (invoice.dueDate - invoice.date) : undefined,
      status: 'Draft',
      lineItems: [...invoice.lineItems],
      subtotal: invoice.subtotal,
      taxRate: invoice.taxRate,
      taxAmount: invoice.taxAmount,
      total: invoice.total,
      amountPaid: 0,
      balance: invoice.total,
      paymentTerms: invoice.paymentTerms,
      notes: invoice.notes,
      termsAndConditions: invoice.termsAndConditions,
      includeTerms: invoice.includeTerms
    }

    return get().addInvoice(duplicatedInvoice)
  },

  // Company Profiles
  companyProfiles: [],
  currentCompanyId: null,

  addCompanyProfile: (profile) => {
    const now = Date.now()
    const newProfile: CompanyProfile = {
      ...profile,
      id: `company_${now}`,
      createdAt: now,
      updatedAt: now
    }

    set((state) => {
      // If this is the first company or marked as default, unset other defaults
      let profiles = state.companyProfiles
      if (newProfile.isDefault || profiles.length === 0) {
        newProfile.isDefault = true
        profiles = profiles.map(p => ({ ...p, isDefault: false }))
      }

      const updatedProfiles = [...profiles, newProfile]

      // Set as current if it's the first or default
      return {
        companyProfiles: updatedProfiles,
        currentCompanyId: profiles.length === 0 || newProfile.isDefault ? newProfile.id : state.currentCompanyId
      }
    })

    return newProfile.id
  },

  updateCompanyProfile: (id, updates) => set((state) => {
    let profiles = state.companyProfiles.map(profile =>
      profile.id === id
        ? { ...profile, ...updates, updatedAt: Date.now() }
        : profile
    )

    // If setting as default, unset others
    if (updates.isDefault) {
      profiles = profiles.map(p =>
        p.id === id ? p : { ...p, isDefault: false }
      )
    }

    return { companyProfiles: profiles }
  }),

  deleteCompanyProfile: (id) => set((state) => {
    const filtered = state.companyProfiles.filter(p => p.id !== id)

    // If deleted the current company, switch to default
    let newCurrentId = state.currentCompanyId
    if (state.currentCompanyId === id) {
      const defaultCompany = filtered.find(p => p.isDefault)
      newCurrentId = defaultCompany?.id || (filtered.length > 0 ? filtered[0].id : null)
    }

    return {
      companyProfiles: filtered,
      currentCompanyId: newCurrentId
    }
  }),

  setDefaultCompany: (id) => set((state) => ({
    companyProfiles: state.companyProfiles.map(p => ({
      ...p,
      isDefault: p.id === id
    }))
  })),

  setCurrentCompany: (id) => set({
    currentCompanyId: id
  }),

  getCurrentCompany: () => {
    const state = get()
    if (!state.currentCompanyId) return null
    return state.companyProfiles.find(p => p.id === state.currentCompanyId) || null
  },

  getDefaultCompany: () => {
    const state = get()
    return state.companyProfiles.find(p => p.isDefault) || state.companyProfiles[0] || null
  },

  // API Keys & Settings
  apiKeys: {
    vapi: null,
    vapiAssistantId: null,
    anthropic: null,
    quickbooks: null,
    stripe: null,
  },
  // Owner/Admin Settings - these are YOUR credentials
  ownerSettings: {
    provideDefaultKeys: true, // Toggle this to enable/disable fallback to your keys
    defaultVapiKey: '58f63a6f-6694-4fe3-8f72-fea362908803',
    defaultVapiAssistantId: '00788639-dd74-48ec-aa8b-a6572d70e45b',
    defaultAnthropicKey: '', // Add your Anthropic key here if you want
  },
  integrations: {
    // Phase 1: Core Foundation (82.4% of contractors need these)
    quickbooks: { enabled: false, companyId: null, accessToken: null, refreshToken: null, realmId: null },
    googleCalendar: { enabled: false, calendarId: null, apiKey: null, oauth: null },
    stripe: { enabled: false, publishableKey: null, secretKey: null, webhookSecret: null },
    gmail: { enabled: false, email: null, apiKey: null, oauth: null },

    // Phase 2: Growth Enablers
    zapier: { enabled: false, webhookUrl: null, apiKey: null },
    mailchimp: { enabled: false, apiKey: null, listId: null, serverPrefix: null },
    googleDrive: { enabled: false, folderId: null, apiKey: null, oauth: null },

    // Phase 3: Team & Reputation
    slack: { enabled: false, webhookUrl: null, botToken: null, channelId: null },
    microsoftTeams: { enabled: false, webhookUrl: null, tenantId: null },
    nicejob: { enabled: false, apiKey: null, companyId: null },
    broadly: { enabled: false, apiKey: null, locationId: null },

    // Legacy
    microsoft: { enabled: false, clientId: null, tenantId: null },
    make: { enabled: false, webhookUrl: null, apiKey: null },
    email: { enabled: false, smtpHost: null, smtpPort: null, username: null },
  },
  setApiKey: (key, value) => {
    set((state) => ({
      apiKeys: { ...state.apiKeys, [key]: value }
    }))
    // Auto-save to localStorage
    setTimeout(() => {
      get().saveSettings()
    }, 0)
  },
  setOwnerSetting: (key, value) => {
    set((state) => ({
      ownerSettings: { ...state.ownerSettings, [key]: value }
    }))
    // Auto-save to localStorage
    setTimeout(() => {
      get().saveSettings()
    }, 0)
  },
  setIntegration: (platform, config) => {
    set((state) => ({
      integrations: {
        ...state.integrations,
        [platform]: { ...state.integrations[platform as keyof typeof state.integrations], ...config }
      }
    }))
    // Auto-save to localStorage
    setTimeout(() => {
      get().saveSettings()
    }, 0)
  },
  loadSettings: () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('appio-settings')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          const { apiKeys, integrations, ownerSettings, entities, entityTypes, taxDocuments, taxPackages, estimates, workOrders, invoices, companyProfiles, currentCompanyId } = parsed
          set({
            apiKeys,
            integrations,
            ...(ownerSettings && { ownerSettings }),
            ...(entities && { entities }),
            ...(entityTypes && { entityTypes }),
            ...(taxDocuments && { taxDocuments }),
            ...(taxPackages && { taxPackages }),
            ...(estimates && { estimates }),
            ...(workOrders && { workOrders }),
            ...(invoices && { invoices }),
            ...(companyProfiles && { companyProfiles }),
            ...(currentCompanyId !== undefined && { currentCompanyId })
          })
        } catch (e) {
          console.error('Failed to load settings:', e)
        }
      }
    }
  },
  saveSettings: () => {
    if (typeof window !== 'undefined') {
      const { apiKeys, integrations, ownerSettings, entities, entityTypes, taxDocuments, taxPackages, estimates, workOrders, invoices, companyProfiles, currentCompanyId } = get()
      localStorage.setItem('appio-settings', JSON.stringify({ apiKeys, integrations, ownerSettings, entities, entityTypes, taxDocuments, taxPackages, estimates, workOrders, invoices, companyProfiles, currentCompanyId }))
    }
  },
}))

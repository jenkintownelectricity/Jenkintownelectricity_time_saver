import { create } from 'zustand'
import { EntityType, EntityInstance, DEFAULT_ENTITIES, ContactAddress, LinkedContact } from './entities'
import { TaxDocument, TaxPackage, getQuarterFromDate } from './tax-documents'
import { EstimateDocument, WorkOrderDocument, InvoiceDocument, calculateDocumentTotals } from './line-items'
import { CompanyProfile, createDefaultCompanyProfile, generateDocumentNumber, incrementDocumentCounter } from './company-profiles'

export type AppSection = 'home' | 'voice' | 'photo' | 'nec' | 'jobs' | 'settings' | 'get-paid' | 'get-reviews' | 'my-contractors' | 'tax-manager' | 'estimates' | 'work-orders' | 'invoices' | 'call-bidding' | 'billing' | 'network-marketplace' | 'company-management'

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

export interface OnCallStatus {
  isOnCall: boolean
  personName: string | null
  startedAt: number | null
}

export interface TeamMember {
  id: string
  name: string
  phone: string
  email?: string
  type: 'employee' | '1099' | 'subcontractor' | 'contractor_for'
  onCallAvailable: boolean
  notes?: string
  createdAt: number
  memberNumber?: string // Unique member identifier
  linkedToAccount?: boolean // Whether this member has their own app account
  entityId?: string // Link to entity card (subcontractor, vendor, etc.)
  syncToEntity?: boolean // Whether to sync this member to entity system
}

export interface UserProfile {
  id: string
  memberNumber: string // Unique 8-digit member number
  name: string
  email: string
  phone: string
  photoUrl?: string
  linkedCompanies: string[] // Array of company codes this user is linked to
  primaryCompanyCode?: string // Main company

  // Subscription tracking (optional - only needed when monetization enabled)
  subscriptionTier?: 'free' | 'team_small' | 'team_medium' | 'team_large'
  apiMode?: 'byoa' | 'managed' // Bring Your Own APIs vs Managed APIs

  createdAt: number
  updatedAt: number
}

export interface CompanyAccount {
  id: string
  companyCode: string // Unique 6-character company code (e.g., "ELX-A3B")
  companyName: string
  businessType: string
  address: string
  phone: string
  email: string
  ownerMemberNumber: string // Member number of the owner
  members: string[] // Array of member numbers
  connectedCompanies: string[] // Array of company codes connected for work sharing
  settings: {
    allowExternalBidding: boolean
    requireBidApproval: boolean
    defaultCallBonus: number
    daytimeCallBonus: number
    emergencyCallBonus: number
  }

  // Subscription & billing (optional - only needed when monetization enabled)
  subscription?: {
    tier: 'free' | 'team_small' | 'team_medium' | 'team_large'
    status: 'active' | 'trial' | 'past_due' | 'cancelled'
    apiMode: 'byoa' | 'managed'
    maxUsers: number // Based on tier
    currentUsers: number // Track team size
    billingCycle: 'monthly' | 'annual'
    nextBillingDate?: number
    stripeCustomerId?: string
    stripeSubscriptionId?: string
  }

  createdAt: number
  updatedAt: number
}

export interface IncomingCall {
  id: string
  callType: 'emergency' | 'daytime' | 'scheduled'
  customerName: string
  customerPhone: string
  location: string
  description: string
  estimatedValue: number
  callBonus: number
  receivedAt: number
  expiresAt: number
  status: 'open' | 'claimed' | 'expired' | 'cancelled'
  companyCode: string // Which company received the call
  claimedBy?: string // Member number of who claimed it
  claimedAt?: number
}

export interface CallBid {
  id: string
  callId: string
  memberNumber: string
  memberName: string
  bidTime: number
  estimatedArrival: number // Minutes until arrival
  status: 'pending' | 'accepted' | 'rejected'
}

// Billing & Payment Tracking
export interface BillingEvent {
  id: string
  companyCode: string
  memberNumber?: string // Who triggered the event
  type: 'call_claim_fee' | 'bonus_pool_fee' | 'subscription_charge' | 'api_usage' | 'lead_fee' | 'network_access_fee' | 'refund'
  amount: number
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded'
  description: string
  metadata: {
    callId?: string
    callType?: string
    bonusAmount?: number
    invoiceId?: string
    [key: string]: any
  }
  stripePaymentIntentId?: string
  createdAt: number
  processedAt?: number
}

export interface PaymentMethod {
  id: string
  companyCode: string
  stripePaymentMethodId: string
  type: 'card' | 'bank_account'
  last4: string
  brand?: string // For cards (Visa, Mastercard, etc.)
  isDefault: boolean
  createdAt: number
}

export interface BillingInvoice {
  id: string
  invoiceNumber: string
  companyCode: string
  billingPeriodStart: number
  billingPeriodEnd: number
  items: {
    type: string
    description: string
    quantity: number
    unitPrice: number
    total: number
  }[]
  subtotal: number
  fees: number
  tax: number
  total: number
  status: 'draft' | 'open' | 'paid' | 'void' | 'uncollectible'
  dueDate: number
  paidAt?: number
  stripeInvoiceId?: string
  createdAt: number
}

export interface NetworkMarketplace {
  id: string
  name: string
  description: string
  memberCompanies: string[] // Array of company codes
  serviceArea: {
    cities: string[]
    radius: number // Miles from center
    centerLat?: number
    centerLng?: number
  }
  settings: {
    allowAutoAccept: boolean
    requireVerification: boolean
    minimumRating: number
    monthlyFee: number
  }
  stats: {
    totalCalls: number
    totalValue: number
    avgResponseTime: number
  }
  createdAt: number
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

  // On-Call Status & Team Management
  onCallStatus: OnCallStatus
  teamMembers: TeamMember[]
  setOnCall: (personName: string) => void
  clearOnCall: () => void
  addTeamMember: (member: Omit<TeamMember, 'id' | 'createdAt'>) => void
  updateTeamMember: (id: string, updates: Partial<TeamMember>) => void
  removeTeamMember: (id: string) => void
  toggleOnCallAvailable: (id: string) => void

  // User Profile & Account System
  userProfile: UserProfile | null
  companyAccounts: CompanyAccount[]
  currentCompanyCode: string | null
  createUserProfile: (profile: Omit<UserProfile, 'id' | 'memberNumber' | 'createdAt' | 'updatedAt'>) => string
  updateUserProfile: (updates: Partial<UserProfile>) => void
  generateMemberNumber: () => string
  createCompanyAccount: (company: Omit<CompanyAccount, 'id' | 'companyCode' | 'createdAt' | 'updatedAt'>) => string
  updateCompanyAccount: (companyCode: string, updates: Partial<CompanyAccount>) => void
  setCurrentCompanyCode: (code: string) => void
  generateCompanyCode: () => string
  linkCompanyToUser: (companyCode: string) => void
  connectCompanies: (companyCode: string) => void // Connect to another company for work sharing

  // Call Bidding System
  incomingCalls: IncomingCall[]
  callBids: CallBid[]
  addIncomingCall: (call: Omit<IncomingCall, 'id' | 'receivedAt' | 'status'>) => string
  claimCall: (callId: string, memberNumber: string) => void
  bidOnCall: (callId: string, memberNumber: string, memberName: string, estimatedArrival: number) => void
  acceptBid: (bidId: string) => void
  rejectBid: (bidId: string) => void
  cancelCall: (callId: string) => void
  getActiveCallsForCompany: (companyCode: string) => IncomingCall[]
  getAvailableBidders: () => TeamMember[] // Members currently on-call and available

  // Billing & Payment System
  billingEvents: BillingEvent[]
  paymentMethods: PaymentMethod[]
  billingInvoices: BillingInvoice[]
  addBillingEvent: (event: Omit<BillingEvent, 'id' | 'createdAt' | 'status'>) => string
  updateBillingEvent: (id: string, updates: Partial<BillingEvent>) => void
  getBillingEventsForCompany: (companyCode: string, startDate?: number, endDate?: number) => BillingEvent[]
  getCompanyBalance: (companyCode: string) => number
  addPaymentMethod: (method: Omit<PaymentMethod, 'id' | 'createdAt'>) => string
  removePaymentMethod: (id: string) => void
  setDefaultPaymentMethod: (id: string) => void
  generateBillingInvoice: (companyCode: string, startDate: number, endDate: number) => string
  markBillingInvoicePaid: (invoiceId: string) => void
  processPayment: (eventId: string, paymentMethodId: string) => Promise<boolean>

  // Network Marketplace
  networkMarketplaces: NetworkMarketplace[]
  createMarketplace: (marketplace: Omit<NetworkMarketplace, 'id' | 'createdAt' | 'stats'>) => string
  joinMarketplace: (marketplaceId: string, companyCode: string) => void
  leaveMarketplace: (marketplaceId: string, companyCode: string) => void
  shareCallToNetwork: (callId: string, marketplaceId: string) => void
  getMarketplacesForCompany: (companyCode: string) => NetworkMarketplace[]

  // Entity Management System
  entityTypes: { [key: string]: EntityType }
  entities: EntityInstance[]
  currentEntityView: string | null
  currentEntityId: string | null
  setEntityType: (entityTypeId: string, config: Partial<EntityType>) => void
  createEntity: (entityTypeId: string, data: any, addresses?: ContactAddress[], linkedContacts?: LinkedContact[]) => string
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
    vapiAgentType: string | null
    anthropic: string | null
    quickbooks: string | null
    stripe: string | null
  }
  // Owner/Admin Settings
  ownerSettings: {
    onCallFeatureEnabled: boolean
    teamManagementEnabled: boolean
    provideDefaultKeys: boolean // If true, use owner's keys as fallback
    defaultVapiKey: string
    defaultVapiAssistantId: string
    defaultAnthropicKey: string

    // Monetization Controls - All disabled by default during beta
    monetization: {
      // Master switch - turns ALL money features on/off
      enabled: boolean

      // Subscription system
      subscriptions: {
        enabled: boolean
        enforceLimits: boolean // If false, all tiers get enterprise features
        billingProvider: 'stripe' | 'manual'
      }

      // Call bidding fees
      callBidding: {
        enabled: boolean
        transactionFee: {
          emergency: number
          daytime: number
          scheduled: number
        }
        bonusPoolFee: number // Percentage (0.15 = 15%)
        networkAccessFee: number // Monthly fee
      }

      // API management
      apiManagement: {
        enabled: boolean
        allowBYOA: boolean // Allow Bring Your Own APIs
        managedMarkup: number // Multiplier (2.0 = 2x cost)
        trackUsage: boolean
      }

      // Jake chatbot integration
      jakeChatbot: {
        enabled: boolean
        leadFee: number // Per qualified lead
        conversionBonus: number // Percentage of job value
        whitelabelFee: number // Monthly fee for custom branding
      }

      // Marketplace & referrals
      marketplace: {
        enabled: boolean
        referralCommission: number // Percentage (0.08 = 8%)
        premiumListingFee: number // Monthly fee
      }
    }
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

  // Billing & Monetization Functions (all guarded by monetization toggles)
  canAccessFeature: (feature: string) => boolean
  canAddTeamMemberToTier: (companyCode: string) => boolean
  calculateCallClaimFee: (callType: 'emergency' | 'daytime' | 'scheduled') => number
  calculateBonusPoolFee: (bonusAmount: number) => number
  recordBillableEvent: (eventType: string, amount: number, metadata?: any) => void
  getSubscriptionLimits: (tier: 'free' | 'team_small' | 'team_medium' | 'team_large') => { maxUsers: number, features: string[] }
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

  // On-Call Status & Team Management
  onCallStatus: {
    isOnCall: false,
    personName: null,
    startedAt: null
  },
  teamMembers: [],
  setOnCall: (personName) => {
    set({
      onCallStatus: {
        isOnCall: true,
        personName,
        startedAt: Date.now()
      }
    })
    get().saveSettings()
  },
  clearOnCall: () => {
    set({
      onCallStatus: {
        isOnCall: false,
        personName: null,
        startedAt: null
      }
    })
    get().saveSettings()
  },
  addTeamMember: (member) => {
    const newMember: TeamMember = {
      ...member,
      id: `team_${Date.now()}`,
      createdAt: Date.now()
    }

    // If syncToEntity is true, also create corresponding entity
    if (member.syncToEntity) {
      const entityTypeMap: { [key: string]: string } = {
        'subcontractor': 'subcontractor',
        'contractor_for': 'vendor',
        '1099': 'subcontractor',
        'employee': 'customer' // Can be changed to employee entity type if created
      }

      const entityType = entityTypeMap[member.type]
      if (entityType) {
        const entityId = get().createEntity(entityType, {
          name: member.name,
          phone: member.phone,
          email: member.email || '',
          notes: member.notes || '',
          status: 'active'
        })
        newMember.entityId = entityId
      }
    }

    set((state) => ({
      teamMembers: [...state.teamMembers, newMember]
    }))
    get().saveSettings()
  },
  updateTeamMember: (id, updates) => {
    set((state) => ({
      teamMembers: state.teamMembers.map(m =>
        m.id === id ? { ...m, ...updates } : m
      )
    }))
    get().saveSettings()
  },
  removeTeamMember: (id) => {
    set((state) => ({
      teamMembers: state.teamMembers.filter(m => m.id !== id)
    }))
    get().saveSettings()
  },
  toggleOnCallAvailable: (id) => {
    set((state) => ({
      teamMembers: state.teamMembers.map(m =>
        m.id === id ? { ...m, onCallAvailable: !m.onCallAvailable } : m
      )
    }))
    get().saveSettings()
  },

  // User Profile & Account System
  userProfile: null,
  companyAccounts: [],
  currentCompanyCode: null,

  generateMemberNumber: () => {
    // Generate 8-digit member number (e.g., "M2501234")
    const timestamp = Date.now().toString().slice(-6)
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0')
    return `M${timestamp}${random}`
  },

  generateCompanyCode: () => {
    // Generate 6-character company code (e.g., "ELX-A3B")
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    const prefix = Array(3).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('')
    const suffix = Array(3).fill(0).map(() => chars[Math.floor(Math.random() * chars.length)]).join('')
    return `${prefix}-${suffix}`
  },

  createUserProfile: (profile) => {
    const memberNumber = get().generateMemberNumber()
    const newProfile: UserProfile = {
      ...profile,
      id: `user_${Date.now()}`,
      memberNumber,
      linkedCompanies: profile.linkedCompanies || [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    set({ userProfile: newProfile })
    get().saveSettings()
    return memberNumber
  },

  updateUserProfile: (updates) => {
    set((state) => ({
      userProfile: state.userProfile ? {
        ...state.userProfile,
        ...updates,
        updatedAt: Date.now()
      } : null
    }))
    get().saveSettings()
  },

  createCompanyAccount: (company) => {
    const companyCode = get().generateCompanyCode()
    const newCompany: CompanyAccount = {
      ...company,
      id: `company_${Date.now()}`,
      companyCode,
      members: company.members || [],
      connectedCompanies: company.connectedCompanies || [],
      settings: company.settings || {
        allowExternalBidding: true,
        requireBidApproval: false,
        defaultCallBonus: 50,
        daytimeCallBonus: 25,
        emergencyCallBonus: 100
      },
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
    set((state) => ({
      companyAccounts: [...state.companyAccounts, newCompany],
      currentCompanyCode: companyCode
    }))
    get().saveSettings()
    return companyCode
  },

  updateCompanyAccount: (companyCode, updates) => {
    set((state) => ({
      companyAccounts: state.companyAccounts.map(c =>
        c.companyCode === companyCode ? { ...c, ...updates, updatedAt: Date.now() } : c
      )
    }))
    get().saveSettings()
  },

  setCurrentCompanyCode: (code) => {
    set({ currentCompanyCode: code })
    get().saveSettings()
  },

  linkCompanyToUser: (companyCode) => {
    const state = get()
    if (state.userProfile && !state.userProfile.linkedCompanies.includes(companyCode)) {
      set((state) => ({
        userProfile: state.userProfile ? {
          ...state.userProfile,
          linkedCompanies: [...state.userProfile.linkedCompanies, companyCode],
          updatedAt: Date.now()
        } : null
      }))
      get().saveSettings()
    }
  },

  connectCompanies: (companyCode) => {
    const state = get()
    if (state.currentCompanyCode) {
      set((state) => ({
        companyAccounts: state.companyAccounts.map(c =>
          c.companyCode === state.currentCompanyCode
            ? {
                ...c,
                connectedCompanies: [...(c.connectedCompanies || []), companyCode],
                updatedAt: Date.now()
              }
            : c
        )
      }))
      get().saveSettings()
    }
  },

  // Call Bidding System
  incomingCalls: [],
  callBids: [],

  addIncomingCall: (call) => {
    const newCall: IncomingCall = {
      ...call,
      id: `call_${Date.now()}`,
      receivedAt: Date.now(),
      status: 'open'
    }
    set((state) => ({
      incomingCalls: [...state.incomingCalls, newCall]
    }))
    get().saveSettings()
    return newCall.id
  },

  claimCall: (callId, memberNumber) => {
    const call = get().incomingCalls.find(c => c.id === callId)
    if (!call) return

    // Update call status
    set((state) => ({
      incomingCalls: state.incomingCalls.map(c =>
        c.id === callId
          ? { ...c, status: 'claimed', claimedBy: memberNumber, claimedAt: Date.now() }
          : c
      )
    }))

    // Calculate and record fees if monetization enabled
    const { ownerSettings } = get()
    if (ownerSettings.monetization.enabled && ownerSettings.monetization.callBidding.enabled) {
      // Transaction fee
      const transactionFee = get().calculateCallClaimFee(call.callType)
      if (transactionFee > 0) {
        get().addBillingEvent({
          companyCode: call.companyCode,
          memberNumber,
          type: 'call_claim_fee',
          amount: transactionFee,
          description: `${call.callType.charAt(0).toUpperCase() + call.callType.slice(1)} call claim fee`,
          metadata: {
            callId,
            callType: call.callType,
            customerName: call.customerName,
            location: call.location
          }
        })
      }

      // Bonus pool fee (charged to company posting the call)
      const bonusPoolFee = get().calculateBonusPoolFee(call.callBonus)
      if (bonusPoolFee > 0) {
        get().addBillingEvent({
          companyCode: call.companyCode,
          type: 'bonus_pool_fee',
          amount: bonusPoolFee,
          description: `Platform fee on $${call.callBonus.toFixed(2)} bonus`,
          metadata: {
            callId,
            bonusAmount: call.callBonus,
            feePercentage: ownerSettings.monetization.callBidding.bonusPoolFee
          }
        })
      }
    }

    get().saveSettings()
  },

  bidOnCall: (callId, memberNumber, memberName, estimatedArrival) => {
    const newBid: CallBid = {
      id: `bid_${Date.now()}`,
      callId,
      memberNumber,
      memberName,
      bidTime: Date.now(),
      estimatedArrival,
      status: 'pending'
    }
    set((state) => ({
      callBids: [...state.callBids, newBid]
    }))
    get().saveSettings()
  },

  acceptBid: (bidId) => {
    const bid = get().callBids.find(b => b.id === bidId)
    if (bid) {
      get().claimCall(bid.callId, bid.memberNumber)
      set((state) => ({
        callBids: state.callBids.map(b =>
          b.id === bidId ? { ...b, status: 'accepted' } :
          b.callId === bid.callId ? { ...b, status: 'rejected' } : b
        )
      }))
      get().saveSettings()
    }
  },

  rejectBid: (bidId) => {
    set((state) => ({
      callBids: state.callBids.map(b =>
        b.id === bidId ? { ...b, status: 'rejected' } : b
      )
    }))
    get().saveSettings()
  },

  cancelCall: (callId) => {
    set((state) => ({
      incomingCalls: state.incomingCalls.map(call =>
        call.id === callId ? { ...call, status: 'cancelled' } : call
      )
    }))
    get().saveSettings()
  },

  getActiveCallsForCompany: (companyCode) => {
    const state = get()
    return state.incomingCalls.filter(
      call => call.companyCode === companyCode && call.status === 'open'
    )
  },

  getAvailableBidders: () => {
    const state = get()
    return state.teamMembers.filter(m => m.onCallAvailable)
  },

  // Billing & Payment System
  billingEvents: [],
  paymentMethods: [],
  billingInvoices: [],

  addBillingEvent: (event) => {
    const newEvent: BillingEvent = {
      ...event,
      id: `billing_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      status: 'pending',
      createdAt: Date.now()
    }
    set((state) => ({
      billingEvents: [...state.billingEvents, newEvent]
    }))
    get().saveSettings()
    return newEvent.id
  },

  updateBillingEvent: (id, updates) => {
    set((state) => ({
      billingEvents: state.billingEvents.map(event =>
        event.id === id ? { ...event, ...updates } : event
      )
    }))
    get().saveSettings()
  },

  getBillingEventsForCompany: (companyCode, startDate, endDate) => {
    const { billingEvents } = get()
    return billingEvents.filter(event => {
      const matchesCompany = event.companyCode === companyCode
      const afterStart = !startDate || event.createdAt >= startDate
      const beforeEnd = !endDate || event.createdAt <= endDate
      return matchesCompany && afterStart && beforeEnd
    })
  },

  getCompanyBalance: (companyCode) => {
    const events = get().getBillingEventsForCompany(companyCode)
    return events
      .filter(e => e.status === 'pending' || e.status === 'processing')
      .reduce((sum, e) => sum + e.amount, 0)
  },

  addPaymentMethod: (method) => {
    const newMethod: PaymentMethod = {
      ...method,
      id: `pm_${Date.now()}`,
      createdAt: Date.now()
    }
    set((state) => ({
      paymentMethods: [...state.paymentMethods, newMethod]
    }))
    get().saveSettings()
    return newMethod.id
  },

  removePaymentMethod: (id) => {
    set((state) => ({
      paymentMethods: state.paymentMethods.filter(pm => pm.id !== id)
    }))
    get().saveSettings()
  },

  setDefaultPaymentMethod: (id) => {
    set((state) => ({
      paymentMethods: state.paymentMethods.map(pm => ({
        ...pm,
        isDefault: pm.id === id
      }))
    }))
    get().saveSettings()
  },

  generateBillingInvoice: (companyCode, startDate, endDate) => {
    const events = get().getBillingEventsForCompany(companyCode, startDate, endDate)
    const company = get().companyAccounts.find(c => c.companyCode === companyCode)

    // Group events by type for invoice line items
    const itemsMap = new Map<string, { quantity: number, total: number }>()

    events.forEach(event => {
      const existing = itemsMap.get(event.type) || { quantity: 0, total: 0 }
      itemsMap.set(event.type, {
        quantity: existing.quantity + 1,
        total: existing.total + event.amount
      })
    })

    const items = Array.from(itemsMap.entries()).map(([type, data]) => ({
      type,
      description: type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      quantity: data.quantity,
      unitPrice: data.total / data.quantity,
      total: data.total
    }))

    const subtotal = items.reduce((sum, item) => sum + item.total, 0)
    const fees = 0 // Could add processing fees here
    const tax = 0 // Calculate tax based on company location

    const invoiceNumber = `BILL-${Date.now()}`

    const invoice: BillingInvoice = {
      id: `billing_invoice_${Date.now()}`,
      invoiceNumber,
      companyCode,
      billingPeriodStart: startDate,
      billingPeriodEnd: endDate,
      items,
      subtotal,
      fees,
      tax,
      total: subtotal + fees + tax,
      status: 'open',
      dueDate: Date.now() + (30 * 24 * 60 * 60 * 1000), // 30 days from now
      createdAt: Date.now()
    }

    set((state) => ({
      billingInvoices: [...state.billingInvoices, invoice]
    }))
    get().saveSettings()
    return invoice.id
  },

  markBillingInvoicePaid: (invoiceId) => {
    const invoice = get().billingInvoices.find(inv => inv.id === invoiceId)
    if (!invoice) return

    // Mark invoice as paid
    set((state) => ({
      billingInvoices: state.billingInvoices.map(inv =>
        inv.id === invoiceId
          ? { ...inv, status: 'paid', paidAt: Date.now() }
          : inv
      )
    }))

    // Mark all related billing events as completed
    const startDate = invoice.billingPeriodStart
    const endDate = invoice.billingPeriodEnd
    const events = get().getBillingEventsForCompany(invoice.companyCode, startDate, endDate)

    events.forEach(event => {
      if (event.status === 'pending' || event.status === 'processing') {
        get().updateBillingEvent(event.id, {
          status: 'completed',
          processedAt: Date.now(),
          metadata: { ...event.metadata, invoiceId }
        })
      }
    })

    get().saveSettings()
  },

  processPayment: async (eventId, paymentMethodId) => {
    const event = get().billingEvents.find(e => e.id === eventId)
    const paymentMethod = get().paymentMethods.find(pm => pm.id === paymentMethodId)

    if (!event || !paymentMethod) {
      return false
    }

    // Update event status to processing
    get().updateBillingEvent(eventId, { status: 'processing' })

    try {
      // TODO: Integrate with Stripe API
      // For now, simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Mark as completed
      get().updateBillingEvent(eventId, {
        status: 'completed',
        processedAt: Date.now()
      })

      return true
    } catch (error) {
      // Mark as failed
      get().updateBillingEvent(eventId, { status: 'failed' })
      return false
    }
  },

  // Network Marketplace
  networkMarketplaces: [],

  createMarketplace: (marketplace) => {
    const newMarketplace: NetworkMarketplace = {
      ...marketplace,
      id: `marketplace_${Date.now()}`,
      stats: {
        totalCalls: 0,
        totalValue: 0,
        avgResponseTime: 0
      },
      createdAt: Date.now()
    }
    set((state) => ({
      networkMarketplaces: [...state.networkMarketplaces, newMarketplace]
    }))
    get().saveSettings()
    return newMarketplace.id
  },

  joinMarketplace: (marketplaceId, companyCode) => {
    set((state) => ({
      networkMarketplaces: state.networkMarketplaces.map(mp =>
        mp.id === marketplaceId && !mp.memberCompanies.includes(companyCode)
          ? { ...mp, memberCompanies: [...mp.memberCompanies, companyCode] }
          : mp
      )
    }))
    get().saveSettings()
  },

  leaveMarketplace: (marketplaceId, companyCode) => {
    set((state) => ({
      networkMarketplaces: state.networkMarketplaces.map(mp =>
        mp.id === marketplaceId
          ? { ...mp, memberCompanies: mp.memberCompanies.filter(cc => cc !== companyCode) }
          : mp
      )
    }))
    get().saveSettings()
  },

  shareCallToNetwork: (callId, marketplaceId) => {
    const call = get().incomingCalls.find(c => c.id === callId)
    const marketplace = get().networkMarketplaces.find(mp => mp.id === marketplaceId)

    if (!call || !marketplace) return

    // Update marketplace stats
    set((state) => ({
      networkMarketplaces: state.networkMarketplaces.map(mp =>
        mp.id === marketplaceId
          ? {
              ...mp,
              stats: {
                ...mp.stats,
                totalCalls: mp.stats.totalCalls + 1,
                totalValue: mp.stats.totalValue + call.estimatedValue
              }
            }
          : mp
      )
    }))

    // Charge network access fee if monetization enabled
    const { ownerSettings } = get()
    if (ownerSettings.monetization.enabled && ownerSettings.monetization.callBidding.enabled) {
      const networkFee = marketplace.settings.monthlyFee / 30 // Daily rate
      get().addBillingEvent({
        companyCode: call.companyCode,
        type: 'network_access_fee',
        amount: networkFee,
        description: `Network marketplace access for call sharing`,
        metadata: {
          callId,
          marketplaceId,
          marketplaceName: marketplace.name
        }
      })
    }

    get().saveSettings()
  },

  getMarketplacesForCompany: (companyCode) => {
    const { networkMarketplaces } = get()
    return networkMarketplaces.filter(mp => mp.memberCompanies.includes(companyCode))
  },

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
  createEntity: (entityTypeId, data, addresses?, linkedContacts?) => {
    const entityId = `${entityTypeId}_${Date.now()}`
    set((state) => {
      const newEntity: EntityInstance = {
        id: entityId,
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
    })
    get().saveSettings()
    return entityId
  },
  updateEntity: (id, data, addresses?, linkedContacts?) => {
    set((state) => ({
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
    }))
    get().saveSettings()
  },
  deleteEntity: (id) => {
    set((state) => ({
      entities: state.entities.filter(entity => entity.id !== id)
    }))
    get().saveSettings()
  },
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
    vapiAgentType: 'electrical', // Default to electrical/HVAC/plumbing agent
    anthropic: null,
    quickbooks: null,
    stripe: null,
  },
  // Owner/Admin Settings - these are YOUR credentials
  ownerSettings: {
    onCallFeatureEnabled: false, // Toggle on-call emergency system
    teamManagementEnabled: false, // Toggle team/squad management
    provideDefaultKeys: true, // Toggle this to enable/disable fallback to your keys
    defaultVapiKey: '58f63a6f-6694-4fe3-8f72-fea362908803',
    defaultVapiAssistantId: '00788639-dd74-48ec-aa8b-a6572d70e45b',
    defaultAnthropicKey: '', // Add your Anthropic key here if you want

    // Monetization Controls - All disabled during beta testing
    monetization: {
      enabled: false, // Master switch

      subscriptions: {
        enabled: false,
        enforceLimits: false, // Beta users get all features
        billingProvider: 'stripe'
      },

      callBidding: {
        enabled: false,
        transactionFee: {
          emergency: 5.00,
          daytime: 3.00,
          scheduled: 2.00
        },
        bonusPoolFee: 0.15, // 15%
        networkAccessFee: 50.00
      },

      apiManagement: {
        enabled: false,
        allowBYOA: true,
        managedMarkup: 2.0, // 2x cost
        trackUsage: false
      },

      jakeChatbot: {
        enabled: false,
        leadFee: 7.50,
        conversionBonus: 0.15, // 15%
        whitelabelFee: 200.00
      },

      marketplace: {
        enabled: false,
        referralCommission: 0.08, // 8%
        premiumListingFee: 50.00
      }
    }
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

  // Billing & Monetization Function Implementations
  // All functions check monetization.enabled before applying any fees/limits

  canAccessFeature: (feature) => {
    const { ownerSettings } = get()

    // If monetization is disabled, everyone gets all features
    if (!ownerSettings.monetization.enabled) {
      return true
    }

    // If subscriptions aren't enabled or limits aren't enforced, allow access
    if (!ownerSettings.monetization.subscriptions.enabled ||
        !ownerSettings.monetization.subscriptions.enforceLimits) {
      return true
    }

    // TODO: Implement feature-based access control when needed
    // For now, all features are available to all tiers
    return true
  },

  canAddTeamMemberToTier: (companyCode) => {
    const { ownerSettings, companyAccounts } = get()

    // If monetization disabled or limits not enforced, allow unlimited
    if (!ownerSettings.monetization.enabled ||
        !ownerSettings.monetization.subscriptions.enabled ||
        !ownerSettings.monetization.subscriptions.enforceLimits) {
      return true
    }

    const company = companyAccounts.find(c => c.companyCode === companyCode)
    if (!company || !company.subscription) {
      // No subscription info = free tier during beta
      return true
    }

    // Check if current user count is below max for tier
    return company.subscription.currentUsers < company.subscription.maxUsers
  },

  calculateCallClaimFee: (callType) => {
    const { ownerSettings } = get()

    // If monetization disabled, no fees
    if (!ownerSettings.monetization.enabled ||
        !ownerSettings.monetization.callBidding.enabled) {
      return 0
    }

    return ownerSettings.monetization.callBidding.transactionFee[callType]
  },

  calculateBonusPoolFee: (bonusAmount) => {
    const { ownerSettings } = get()

    // If monetization disabled, no fees
    if (!ownerSettings.monetization.enabled ||
        !ownerSettings.monetization.callBidding.enabled) {
      return 0
    }

    return bonusAmount * ownerSettings.monetization.callBidding.bonusPoolFee
  },

  recordBillableEvent: (eventType, amount, metadata = {}) => {
    const { ownerSettings } = get()

    // Only record if monetization is enabled
    if (!ownerSettings.monetization.enabled) {
      console.log(`[BETA MODE] Billable event skipped: ${eventType} - $${amount}`, metadata)
      return
    }

    // TODO: When database is ready, store billable events
    // For now, just log them
    console.log(`[BILLING] ${eventType}: $${amount}`, metadata)

    // Future: Store in billing_events table
    // const event = {
    //   id: `billing_${Date.now()}`,
    //   type: eventType,
    //   amount,
    //   metadata,
    //   timestamp: Date.now()
    // }
  },

  getSubscriptionLimits: (tier) => {
    switch (tier) {
      case 'free':
        return {
          maxUsers: 1,
          features: ['all'] // Solo users get all features, just limited to 1 user
        }
      case 'team_small':
        return {
          maxUsers: 3,
          features: ['all']
        }
      case 'team_medium':
        return {
          maxUsers: 10,
          features: ['all', 'network_bidding']
        }
      case 'team_large':
        return {
          maxUsers: 999, // Effectively unlimited
          features: ['all', 'network_bidding', 'priority_support', 'custom_integrations']
        }
      default:
        return {
          maxUsers: 1,
          features: ['all']
        }
    }
  },

  loadSettings: () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('appio-settings')
      if (saved) {
        try {
          const parsed = JSON.parse(saved)
          const { apiKeys, integrations, ownerSettings, entities, entityTypes, taxDocuments, taxPackages, estimates, workOrders, invoices, companyProfiles, currentCompanyId, onCallStatus, teamMembers, userProfile, companyAccounts, currentCompanyCode, incomingCalls, callBids, billingEvents, paymentMethods, billingInvoices, networkMarketplaces } = parsed
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
            ...(currentCompanyId !== undefined && { currentCompanyId }),
            ...(onCallStatus && { onCallStatus }),
            ...(teamMembers && { teamMembers }),
            ...(userProfile && { userProfile }),
            ...(companyAccounts && { companyAccounts }),
            ...(currentCompanyCode && { currentCompanyCode }),
            ...(incomingCalls && { incomingCalls }),
            ...(callBids && { callBids }),
            ...(billingEvents && { billingEvents }),
            ...(paymentMethods && { paymentMethods }),
            ...(billingInvoices && { billingInvoices }),
            ...(networkMarketplaces && { networkMarketplaces })
          })
        } catch (e) {
          console.error('Failed to load settings:', e)
        }
      }
    }
  },
  saveSettings: () => {
    if (typeof window !== 'undefined') {
      const { apiKeys, integrations, ownerSettings, entities, entityTypes, taxDocuments, taxPackages, estimates, workOrders, invoices, companyProfiles, currentCompanyId, onCallStatus, teamMembers, userProfile, companyAccounts, currentCompanyCode, incomingCalls, callBids, billingEvents, paymentMethods, billingInvoices, networkMarketplaces } = get()
      localStorage.setItem('appio-settings', JSON.stringify({ apiKeys, integrations, ownerSettings, entities, entityTypes, taxDocuments, taxPackages, estimates, workOrders, invoices, companyProfiles, currentCompanyId, onCallStatus, teamMembers, userProfile, companyAccounts, currentCompanyCode, incomingCalls, callBids, billingEvents, paymentMethods, billingInvoices, networkMarketplaces }))
    }
  },
}))

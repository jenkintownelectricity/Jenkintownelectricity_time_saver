import { create } from 'zustand'
import { EntityType, EntityInstance, DEFAULT_ENTITIES, FieldValue } from './entities'

export type AppSection = 'home' | 'voice' | 'photo' | 'nec' | 'jobs' | 'settings' | 'work-calls'

// Work Call Bidding System Types
export type CallType = 'emergency' | 'daytime' | 'scheduled'
export type CallStatus = 'active' | 'claimed' | 'expired' | 'completed'
export type BidMode = 'first-come' | 'bidding'

export interface UserAccount {
  memberNumber: string // e.g., "M2501234"
  name: string
  email: string
  phone: string
  jobTitle: string // e.g., "Electrician", "Project Manager", "Owner"
  createdAt: number
}

export interface Company {
  code: string // e.g., "ELX-A3B"
  name: string
  ownerId: string // member number of owner
  members: string[] // member numbers
  linkedCompanies: string[] // company codes
  settings: CompanySettings
  createdAt: number
}

export interface CompanySettings {
  bidMode: BidMode
  emergencyBonus: number
  daytimeBonus: number
  scheduledBonus: number
  emergencyTimeout: number // minutes
  daytimeTimeout: number // minutes
  scheduledTimeout: number // minutes
}

export interface WorkCall {
  id: string
  companyCode: string
  type: CallType
  title: string
  description: string
  location: string
  customerName: string
  customerPhone: string
  bonus: number
  createdAt: number
  expiresAt: number
  status: CallStatus
  claimedBy?: string // member number
  claimedAt?: number
  bids?: CallBid[]
}

export interface CallBid {
  memberNumber: string
  arrivalTime: string // e.g., "15 minutes"
  bidAt: number
}

export interface CallStats {
  totalCalls: number
  claimedCalls: number
  expiredCalls: number
  totalBonusEarned: number
  averageResponseTime: number // seconds
}

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
  createEntity: (entityTypeId: string, data: Record<string, FieldValue>) => void
  updateEntity: (id: string, data: Record<string, FieldValue>) => void
  deleteEntity: (id: string) => void
  getEntity: (id: string) => EntityInstance | undefined
  getEntitiesByType: (entityTypeId: string) => EntityInstance[]
  setCurrentEntityView: (entityTypeId: string | null, entityId?: string | null) => void

  // Work Call Bidding System
  userAccount: UserAccount | null
  companies: Company[]
  currentCompanyCode: string | null
  workCalls: WorkCall[]
  callStats: CallStats
  isOnCall: boolean
  createAccount: (name: string, email: string, phone: string, jobTitle: string) => void
  createCompany: (name: string) => void
  switchCompany: (code: string) => void
  linkCompany: (code: string) => void
  updateCompanySettings: (code: string, settings: Partial<CompanySettings>) => void
  createWorkCall: (call: Omit<WorkCall, 'id' | 'createdAt' | 'expiresAt' | 'status'>) => void
  claimCall: (callId: string) => void
  placeBid: (callId: string, arrivalTime: string) => void
  acceptBid: (callId: string, memberNumber: string) => void
  setOnCall: (isOnCall: boolean) => void
  expireOldCalls: () => void

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
    provideDefaultKeys: boolean // If true, use owner's keys as fallback
    defaultVapiKey: string
    defaultVapiAssistantId: string
    defaultAnthropicKey: string
  }
  // Feature Toggles
  features: {
    receiptsEnabled: boolean
    taxComplianceEnabled: boolean
    teamManagementEnabled: boolean
    companyManagementEnabled: boolean
    vapiCallsEnabled: boolean
    appointmentsEnabled: boolean
    photoAnalysisEnabled: boolean
    necLookupEnabled: boolean
    voiceAssistantEnabled: boolean
    estimatesEnabled: boolean
    workOrdersEnabled: boolean
    invoicesEnabled: boolean
    analyticsEnabled: boolean
    customerPortalEnabled: boolean
  }
  setFeature: (feature: string, enabled: boolean) => void
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
  setOwnerSetting: (key: string, value: string | boolean) => void
  setIntegration: (platform: string, config: Record<string, string | boolean | null>) => void
  loadSettings: () => void
  saveSettings: () => void
}

/**
 * Generates a unique member number in the format M{YY}{####}
 * Example: M2501234 (Member created in 2025, random number 1234)
 * @returns A unique member number string
 */
const generateMemberNumber = (): string => {
  const year = new Date().getFullYear().toString().slice(2)
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
  return `M${year}${random}`
}

/**
 * Generates a unique company code in the format ABC-DEF
 * Uses alphanumeric characters (A-Z, 0-9)
 * Example: ELX-A3B, QT9-M2K
 * @returns A unique company code string
 */
const generateCompanyCode = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 3; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  code += '-'
  for (let i = 0; i < 3; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return code
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
  createEntity: (entityTypeId, data) => set((state) => {
    const statusField = state.entityTypes[entityTypeId]?.fields.find(f => f.name === 'status')
    const statusValue = typeof statusField?.defaultValue === 'string' ? statusField.defaultValue : 'active'

    const newEntity: EntityInstance = {
      id: `${entityTypeId}_${Date.now()}`,
      entityType: entityTypeId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      status: statusValue,
      data,
      relationships: {}
    }
    return { entities: [...state.entities, newEntity] }
  }),
  updateEntity: (id, data) => set((state) => ({
    entities: state.entities.map(entity =>
      entity.id === id
        ? { ...entity, data: { ...entity.data, ...data }, updatedAt: Date.now() }
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

  // Work Call Bidding System
  userAccount: null,
  companies: [],
  currentCompanyCode: null,
  workCalls: [],
  callStats: {
    totalCalls: 0,
    claimedCalls: 0,
    expiredCalls: 0,
    totalBonusEarned: 0,
    averageResponseTime: 0,
  },
  isOnCall: false,

  createAccount: (name, email, phone, jobTitle) => {
    const memberNumber = generateMemberNumber()
    const account: UserAccount = {
      memberNumber,
      name,
      email,
      phone,
      jobTitle,
      createdAt: Date.now(),
    }
    set({ userAccount: account })
    get().saveSettings()
  },

  createCompany: (name) => {
    const { userAccount } = get()
    if (!userAccount) return

    const code = generateCompanyCode()
    const company: Company = {
      code,
      name,
      ownerId: userAccount.memberNumber,
      members: [userAccount.memberNumber],
      linkedCompanies: [],
      settings: {
        bidMode: 'first-come',
        emergencyBonus: 100,
        daytimeBonus: 25,
        scheduledBonus: 50,
        emergencyTimeout: 5,
        daytimeTimeout: 15,
        scheduledTimeout: 15,
      },
      createdAt: Date.now(),
    }
    set((state) => ({
      companies: [...state.companies, company],
      currentCompanyCode: code,
    }))
    get().saveSettings()
  },

  switchCompany: (code) => {
    set({ currentCompanyCode: code })
    get().saveSettings()
  },

  linkCompany: (code) => {
    const { currentCompanyCode, companies } = get()
    if (!currentCompanyCode) return

    set({
      companies: companies.map((c) =>
        c.code === currentCompanyCode
          ? { ...c, linkedCompanies: [...c.linkedCompanies, code] }
          : c
      ),
    })
    get().saveSettings()
  },

  updateCompanySettings: (code, settings) => {
    const { companies } = get()
    set({
      companies: companies.map((c) =>
        c.code === code
          ? { ...c, settings: { ...c.settings, ...settings } }
          : c
      ),
    })
    get().saveSettings()
  },

  createWorkCall: (call) => {
    const { currentCompanyCode, companies } = get()
    if (!currentCompanyCode) return

    const company = companies.find((c) => c.code === currentCompanyCode)
    if (!company) return

    const timeout =
      call.type === 'emergency' ? company.settings.emergencyTimeout :
      call.type === 'daytime' ? company.settings.daytimeTimeout :
      company.settings.scheduledTimeout

    const bonus =
      call.type === 'emergency' ? company.settings.emergencyBonus :
      call.type === 'daytime' ? company.settings.daytimeBonus :
      company.settings.scheduledBonus

    const workCall: WorkCall = {
      ...call,
      id: `call_${Date.now()}`,
      bonus,
      createdAt: Date.now(),
      expiresAt: Date.now() + timeout * 60 * 1000,
      status: 'active',
      bids: [],
    }

    set((state) => ({
      workCalls: [...state.workCalls, workCall],
      callStats: {
        ...state.callStats,
        totalCalls: state.callStats.totalCalls + 1,
      },
    }))
    get().saveSettings()
  },

  claimCall: (callId) => {
    const { userAccount, workCalls, callStats } = get()
    if (!userAccount) return

    const call = workCalls.find((c) => c.id === callId)
    if (!call || call.status !== 'active') return

    const responseTime = (Date.now() - call.createdAt) / 1000

    set({
      workCalls: workCalls.map((c) =>
        c.id === callId
          ? { ...c, status: 'claimed', claimedBy: userAccount.memberNumber, claimedAt: Date.now() }
          : c
      ),
      callStats: {
        ...callStats,
        claimedCalls: callStats.claimedCalls + 1,
        totalBonusEarned: callStats.totalBonusEarned + call.bonus,
        averageResponseTime:
          (callStats.averageResponseTime * callStats.claimedCalls + responseTime) /
          (callStats.claimedCalls + 1),
      },
    })
    get().saveSettings()
  },

  placeBid: (callId, arrivalTime) => {
    const { userAccount, workCalls } = get()
    if (!userAccount) return

    const bid: CallBid = {
      memberNumber: userAccount.memberNumber,
      arrivalTime,
      bidAt: Date.now(),
    }

    set({
      workCalls: workCalls.map((c) =>
        c.id === callId
          ? { ...c, bids: [...(c.bids || []), bid] }
          : c
      ),
    })
    get().saveSettings()
  },

  acceptBid: (callId, memberNumber) => {
    const { workCalls, callStats } = get()
    const call = workCalls.find((c) => c.id === callId)
    if (!call) return

    const responseTime = (Date.now() - call.createdAt) / 1000

    set({
      workCalls: workCalls.map((c) =>
        c.id === callId
          ? { ...c, status: 'claimed', claimedBy: memberNumber, claimedAt: Date.now() }
          : c
      ),
      callStats: {
        ...callStats,
        claimedCalls: callStats.claimedCalls + 1,
        totalBonusEarned: callStats.totalBonusEarned + call.bonus,
        averageResponseTime:
          (callStats.averageResponseTime * callStats.claimedCalls + responseTime) /
          (callStats.claimedCalls + 1),
      },
    })
    get().saveSettings()
  },

  setOnCall: (isOnCall) => {
    set({ isOnCall })
    get().saveSettings()
  },

  expireOldCalls: () => {
    const now = Date.now()
    const { workCalls, callStats } = get()
    let expiredCount = 0

    const updatedCalls = workCalls.map((call) => {
      if (call.status === 'active' && call.expiresAt < now) {
        expiredCount++
        return { ...call, status: 'expired' as CallStatus }
      }
      return call
    })

    if (expiredCount > 0) {
      set({
        workCalls: updatedCalls,
        callStats: {
          ...callStats,
          expiredCalls: callStats.expiredCalls + expiredCount,
        },
      })
      get().saveSettings()
    }
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
  // Owner/Admin Settings - loaded from environment variables
  ownerSettings: {
    provideDefaultKeys: !!(process.env.NEXT_PUBLIC_DEFAULT_VAPI_KEY || process.env.NEXT_PUBLIC_DEFAULT_ANTHROPIC_KEY),
    defaultVapiKey: process.env.NEXT_PUBLIC_DEFAULT_VAPI_KEY || '',
    defaultVapiAssistantId: process.env.NEXT_PUBLIC_DEFAULT_VAPI_ASSISTANT_ID || '',
    defaultAnthropicKey: process.env.NEXT_PUBLIC_DEFAULT_ANTHROPIC_KEY || '',
  },
  // Feature Toggles
  features: {
    receiptsEnabled: true,
    taxComplianceEnabled: true,
    teamManagementEnabled: true,
    companyManagementEnabled: true,
    vapiCallsEnabled: true,
    appointmentsEnabled: true,
    photoAnalysisEnabled: true,
    necLookupEnabled: true,
    voiceAssistantEnabled: true,
    estimatesEnabled: true,
    workOrdersEnabled: true,
    invoicesEnabled: true,
    analyticsEnabled: true,
    customerPortalEnabled: true,
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
  setFeature: (feature, enabled) => {
    set((state) => ({
      features: { ...state.features, [feature]: enabled }
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
          const { apiKeys, integrations, ownerSettings, features, entities, entityTypes, userAccount, companies, currentCompanyCode, workCalls, callStats, isOnCall } = parsed
          set({
            apiKeys,
            integrations,
            ...(ownerSettings && { ownerSettings }),
            ...(features && { features }),
            ...(entities && { entities }),
            ...(entityTypes && { entityTypes }),
            ...(userAccount && { userAccount }),
            ...(companies && { companies }),
            ...(currentCompanyCode && { currentCompanyCode }),
            ...(workCalls && { workCalls }),
            ...(callStats && { callStats }),
            ...(isOnCall !== undefined && { isOnCall }),
          })
        } catch (e) {
          // Failed to load settings - will use defaults
          // In production, this should be logged to an error tracking service
        }
      }
    }
  },
  saveSettings: () => {
    if (typeof window !== 'undefined') {
      const { apiKeys, integrations, ownerSettings, features, entities, entityTypes, userAccount, companies, currentCompanyCode, workCalls, callStats, isOnCall } = get()
      localStorage.setItem('appio-settings', JSON.stringify({ apiKeys, integrations, ownerSettings, features, entities, entityTypes, userAccount, companies, currentCompanyCode, workCalls, callStats, isOnCall }))
    }
  },
}))

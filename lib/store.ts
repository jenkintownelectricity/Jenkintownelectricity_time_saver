import { create } from 'zustand'
import { EntityType, EntityInstance, DEFAULT_ENTITIES, ContactAddress, LinkedContact } from './entities'

export type AppSection = 'home' | 'voice' | 'photo' | 'nec' | 'jobs' | 'settings' | 'get-paid' | 'get-reviews' | 'my-contractors'

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
          const { apiKeys, integrations, ownerSettings, entities, entityTypes } = parsed
          set({
            apiKeys,
            integrations,
            ...(ownerSettings && { ownerSettings }),
            ...(entities && { entities }),
            ...(entityTypes && { entityTypes })
          })
        } catch (e) {
          console.error('Failed to load settings:', e)
        }
      }
    }
  },
  saveSettings: () => {
    if (typeof window !== 'undefined') {
      const { apiKeys, integrations, ownerSettings, entities, entityTypes } = get()
      localStorage.setItem('appio-settings', JSON.stringify({ apiKeys, integrations, ownerSettings, entities, entityTypes }))
    }
  },
}))

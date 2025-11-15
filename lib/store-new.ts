import { create } from 'zustand'
import type { Company, Contact, WorkCall, UserProfile } from './database/types'
import * as db from './database'

export type AppSection = 'home' | 'voice' | 'photo' | 'nec' | 'jobs' | 'settings' | 'work-calls'

// UI-only state interfaces
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

export interface CallStats {
  totalCalls: number
  claimedCalls: number
  expiredCalls: number
  totalBonusEarned: number
  averageResponseTime: number
}

interface AppState {
  // ============================================================================
  // UI STATE (kept in memory)
  // ============================================================================

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

  // NEC Codes (bookmarks stored in user_profiles.preferences)
  bookmarkedCodes: NECCode[]
  addBookmark: (code: NECCode) => void
  removeBookmark: (codeNumber: string) => void

  // API Keys (stored in user_profiles.preferences)
  apiKeys: {
    vapi: string | null
    vapiAssistantId: string | null
    anthropic: string | null
  }
  setApiKey: (key: string, value: string) => void

  // Owner Settings (from env)
  ownerSettings: {
    provideDefaultKeys: boolean
    defaultVapiKey: string
    defaultVapiAssistantId: string
    defaultAnthropicKey: string
  }

  // ============================================================================
  // DATABASE STATE (synced with Supabase)
  // ============================================================================

  // User
  userProfile: UserProfile | null
  setUserProfile: (profile: UserProfile | null) => void
  loadUserProfile: () => Promise<void>

  // Companies
  companies: Company[]
  currentCompanyId: string | null
  setCompanies: (companies: Company[]) => void
  setCurrentCompany: (companyId: string | null) => void
  loadCompanies: () => Promise<void>
  createCompanyAction: (name: string, code: string) => Promise<Company | null>
  linkCompanyAction: (targetCode: string) => Promise<boolean>

  // Contacts (replaces old entity system)
  contacts: Contact[]
  setContacts: (contacts: Contact[]) => void
  loadContacts: () => Promise<void>
  createContactAction: (contactData: Partial<Contact>) => Promise<Contact | null>
  updateContactAction: (contactId: string, updates: Partial<Contact>) => Promise<boolean>
  deleteContactAction: (contactId: string) => Promise<boolean>

  // Work Calls
  workCalls: WorkCall[]
  myClaimedCalls: WorkCall[]
  setWorkCalls: (calls: WorkCall[]) => void
  setMyClaimedCalls: (calls: WorkCall[]) => void
  loadWorkCalls: () => Promise<void>
  loadMyClaimedCalls: () => Promise<void>
  createWorkCallAction: (callData: Parameters<typeof db.createWorkCall>[1]) => Promise<WorkCall | null>
  claimCallAction: (callId: string) => Promise<boolean>
  updateCallStatusAction: (callId: string, status: WorkCall['status']) => Promise<boolean>

  // On-call status (stored in company_members table)
  isOnCall: boolean
  setOnCallAction: (isOnCall: boolean) => Promise<boolean>

  // Call statistics
  callStats: CallStats
  setCallStats: (stats: CallStats) => void

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================
  getCurrentCompany: () => Company | null
  refreshAll: () => Promise<void>
}

export const useAppStore = create<AppState>((set, get) => ({
  // ============================================================================
  // UI STATE
  // ============================================================================

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

  // API Keys
  apiKeys: {
    vapi: null,
    vapiAssistantId: null,
    anthropic: null,
  },
  setApiKey: (key, value) => set((state) => ({
    apiKeys: { ...state.apiKeys, [key]: value }
  })),

  // Owner Settings (from environment variables)
  ownerSettings: {
    provideDefaultKeys: !!(process.env.NEXT_PUBLIC_DEFAULT_VAPI_KEY || process.env.NEXT_PUBLIC_DEFAULT_ANTHROPIC_KEY),
    defaultVapiKey: process.env.NEXT_PUBLIC_DEFAULT_VAPI_KEY || '',
    defaultVapiAssistantId: process.env.NEXT_PUBLIC_DEFAULT_VAPI_ASSISTANT_ID || '',
    defaultAnthropicKey: process.env.NEXT_PUBLIC_DEFAULT_ANTHROPIC_KEY || '',
  },

  // ============================================================================
  // DATABASE STATE
  // ============================================================================

  // User Profile
  userProfile: null,
  setUserProfile: (profile) => set({ userProfile: profile }),
  loadUserProfile: async () => {
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      set({ userProfile: null })
      return
    }

    const { data } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      set({ userProfile: data })
    }
  },

  // Companies
  companies: [],
  currentCompanyId: null,
  setCompanies: (companies) => set({ companies }),
  setCurrentCompany: (companyId) => set({ currentCompanyId: companyId }),
  loadCompanies: async () => {
    const companies = await db.getUserCompanies()
    set({ companies })

    // Auto-select first company if none selected
    const state = get()
    if (!state.currentCompanyId && companies.length > 0) {
      set({ currentCompanyId: companies[0].id })
    }
  },
  createCompanyAction: async (name, code) => {
    const company = await db.createCompany(name, code)
    if (company) {
      const state = get()
      set({
        companies: [...state.companies, company],
        currentCompanyId: company.id,
      })
    }
    return company
  },
  linkCompanyAction: async (targetCode) => {
    const state = get()
    if (!state.currentCompanyId) return false

    const success = await db.linkCompany(state.currentCompanyId, targetCode)
    if (success) {
      await get().loadCompanies()
    }
    return success
  },

  // Contacts
  contacts: [],
  setContacts: (contacts) => set({ contacts }),
  loadContacts: async () => {
    const state = get()
    const contacts = await db.getContacts(state.currentCompanyId || undefined)
    set({ contacts })
  },
  createContactAction: async (contactData) => {
    const contact = await db.createContact(contactData as Omit<Contact, 'id' | 'user_id' | 'created_at' | 'updated_at'>)
    if (contact) {
      const state = get()
      set({ contacts: [...state.contacts, contact] })
    }
    return contact
  },
  updateContactAction: async (contactId, updates) => {
    const success = await db.updateContact(contactId, updates)
    if (success) {
      await get().loadContacts()
    }
    return success
  },
  deleteContactAction: async (contactId) => {
    const success = await db.deleteContact(contactId)
    if (success) {
      await get().loadContacts()
    }
    return success
  },

  // Work Calls
  workCalls: [],
  myClaimedCalls: [],
  setWorkCalls: (calls) => set({ workCalls: calls }),
  setMyClaimedCalls: (calls) => set({ myClaimedCalls: calls }),
  loadWorkCalls: async () => {
    const state = get()
    if (!state.currentCompanyId) {
      set({ workCalls: [] })
      return
    }

    const calls = await db.getActiveWorkCalls(state.currentCompanyId)
    set({ workCalls: calls })
  },
  loadMyClaimedCalls: async () => {
    const calls = await db.getMyClaimedCalls()
    set({ myClaimedCalls: calls })
  },
  createWorkCallAction: async (callData) => {
    const state = get()
    if (!state.currentCompanyId) return null

    const call = await db.createWorkCall(state.currentCompanyId, callData)
    if (call) {
      await get().loadWorkCalls()
    }
    return call
  },
  claimCallAction: async (callId) => {
    const success = await db.claimWorkCall(callId)
    if (success) {
      await Promise.all([
        get().loadWorkCalls(),
        get().loadMyClaimedCalls(),
      ])
    }
    return success
  },
  updateCallStatusAction: async (callId, status) => {
    const success = await db.updateWorkCallStatus(callId, status)
    if (success) {
      await Promise.all([
        get().loadWorkCalls(),
        get().loadMyClaimedCalls(),
      ])
    }
    return success
  },

  // On-call status
  isOnCall: false,
  setOnCallAction: async (isOnCall) => {
    const state = get()
    if (!state.currentCompanyId || !state.userProfile) return false

    const success = await db.updateMemberOnCallStatus(
      state.currentCompanyId,
      state.userProfile.id,
      isOnCall
    )

    if (success) {
      set({ isOnCall })
    }

    return success
  },

  // Call Statistics
  callStats: {
    totalCalls: 0,
    claimedCalls: 0,
    expiredCalls: 0,
    totalBonusEarned: 0,
    averageResponseTime: 0,
  },
  setCallStats: (stats) => set({ callStats: stats }),

  // ============================================================================
  // UTILITY FUNCTIONS
  // ============================================================================

  getCurrentCompany: () => {
    const state = get()
    if (!state.currentCompanyId) return null
    return state.companies.find(c => c.id === state.currentCompanyId) || null
  },

  refreshAll: async () => {
    await Promise.all([
      get().loadUserProfile(),
      get().loadCompanies(),
      get().loadContacts(),
      get().loadWorkCalls(),
      get().loadMyClaimedCalls(),
    ])
  },
}))

import { create } from 'zustand'

export type AppSection = 'home' | 'voice' | 'photo' | 'nec' | 'jobs' | 'settings'

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
  
  // API Keys & Settings
  apiKeys: {
    vapi: string | null
    vapiAssistantId: string | null
    anthropic: string | null
  }
  integrations: {
    microsoft: { enabled: boolean; clientId: string | null; tenantId: string | null }
    google: { enabled: boolean; clientId: string | null; apiKey: string | null }
    zapier: { enabled: boolean; webhookUrl: string | null; apiKey: string | null }
    make: { enabled: boolean; webhookUrl: string | null; apiKey: string | null }
    slack: { enabled: boolean; webhookUrl: string | null; botToken: string | null }
    email: { enabled: boolean; smtpHost: string | null; smtpPort: string | null; username: string | null }
  }
  setApiKey: (key: string, value: string) => void
  setIntegration: (platform: string, config: any) => void
  loadSettings: () => void
  saveSettings: () => void
}

export const useAppStore = create<AppState>((set) => ({
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
  
  // API Keys & Settings
  apiKeys: {
    vapi: null,
    vapiAssistantId: null,
    anthropic: null,
  },
  integrations: {
    microsoft: { enabled: false, clientId: null, tenantId: null },
    google: { enabled: false, clientId: null, apiKey: null },
    zapier: { enabled: false, webhookUrl: null, apiKey: null },
    make: { enabled: false, webhookUrl: null, apiKey: null },
    slack: { enabled: false, webhookUrl: null, botToken: null },
    email: { enabled: false, smtpHost: null, smtpPort: null, username: null },
  },
  setApiKey: (key, value) => {
    set((state) => ({
      apiKeys: { ...state.apiKeys, [key]: value }
    }))
    // Auto-save to localStorage
    setTimeout(() => {
      const state = useAppStore.getState()
      state.saveSettings()
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
      const state = useAppStore.getState()
      state.saveSettings()
    }, 0)
  },
  loadSettings: () => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('appio-settings')
      if (saved) {
        try {
          const { apiKeys, integrations } = JSON.parse(saved)
          set({ apiKeys, integrations })
        } catch (e) {
          console.error('Failed to load settings:', e)
        }
      }
    }
  },
  saveSettings: () => {
    if (typeof window !== 'undefined') {
      const { apiKeys, integrations } = useAppStore.getState()
      localStorage.setItem('appio-settings', JSON.stringify({ apiKeys, integrations }))
    }
  },
}))

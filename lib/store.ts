import { create } from 'zustand'

export type AppSection = 'home' | 'voice' | 'photo' | 'nec' | 'jobs'

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
  
  // API Keys (stored in memory only, user will provide)
  apiKeys: {
    vapi: string | null
    anthropic: string | null
  }
  setApiKey: (key: 'vapi' | 'anthropic', value: string) => void
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
  
  // API Keys
  apiKeys: {
    vapi: null,
    anthropic: null,
  },
  setApiKey: (key, value) => set((state) => ({
    apiKeys: { ...state.apiKeys, [key]: value }
  })),
}))

/**
 * VAPI Store - Zustand Store for Managing VAPI Calls
 */

import { create } from 'zustand'
import { VAPICall, CallStatus, CallUrgency, ExtractedData } from '@/lib/types/vapi'

interface VAPIState {
  calls: VAPICall[]
  activeCalls: VAPICall[]
  selectedCall: VAPICall | null
  loading: boolean
  error: string | null

  // Actions
  addCall: (call: VAPICall) => void
  updateCall: (id: string, updates: Partial<VAPICall>) => void
  deleteCall: (id: string) => void
  setSelectedCall: (call: VAPICall | null) => void

  // Call management
  startCall: (callData: Partial<VAPICall>) => VAPICall
  endCall: (id: string, duration: number, transcript: string) => void
  updateTranscript: (id: string, transcript: string) => void
  updateExtractedData: (id: string, data: ExtractedData) => void
  markAsConverted: (id: string, appointmentId: string) => void

  // Filtering and search
  getCallsByStatus: (status: CallStatus) => VAPICall[]
  getCallsByUrgency: (urgency: CallUrgency) => VAPICall[]
  getCallsByDateRange: (startDate: Date, endDate: Date) => VAPICall[]
  searchCalls: (query: string) => VAPICall[]
  getCallsByCustomer: (customerId: string) => VAPICall[]

  // Statistics
  getCallStats: () => {
    total: number
    completed: number
    missed: number
    converted: number
    conversionRate: number
    averageDuration: number
    totalDuration: number
  }

  // Utilities
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearCalls: () => void
}

export const useVAPIStore = create<VAPIState>((set, get) => ({
  calls: [],
  activeCalls: [],
  selectedCall: null,
  loading: false,
  error: null,

  // Add new call
  addCall: (call) => {
    set((state) => ({
      calls: [call, ...state.calls],
      activeCalls: call.status === CallStatus.IN_PROGRESS
        ? [call, ...state.activeCalls]
        : state.activeCalls
    }))
  },

  // Update existing call
  updateCall: (id, updates) => {
    set((state) => ({
      calls: state.calls.map((call) =>
        call.id === id ? { ...call, ...updates, updatedAt: new Date() } : call
      ),
      activeCalls: state.activeCalls.map((call) =>
        call.id === id ? { ...call, ...updates, updatedAt: new Date() } : call
      ),
      selectedCall: state.selectedCall?.id === id
        ? { ...state.selectedCall, ...updates, updatedAt: new Date() }
        : state.selectedCall
    }))
  },

  // Delete call
  deleteCall: (id) => {
    set((state) => ({
      calls: state.calls.filter((call) => call.id !== id),
      activeCalls: state.activeCalls.filter((call) => call.id !== id),
      selectedCall: state.selectedCall?.id === id ? null : state.selectedCall
    }))
  },

  // Set selected call
  setSelectedCall: (call) => {
    set({ selectedCall: call })
  },

  // Start a new call
  startCall: (callData) => {
    const newCall: VAPICall = {
      id: crypto.randomUUID(),
      userId: callData.userId || '',
      companyId: callData.companyId || '',
      callId: callData.callId || crypto.randomUUID(),
      callerPhone: callData.callerPhone || '',
      callerName: callData.callerName,
      duration: 0,
      transcript: '',
      recording: callData.recording,
      extractedData: callData.extractedData || {},
      appointmentCreated: false,
      status: CallStatus.IN_PROGRESS,
      tags: callData.tags || [],
      createdAt: new Date(),
      updatedAt: new Date()
    }

    set((state) => ({
      calls: [newCall, ...state.calls],
      activeCalls: [newCall, ...state.activeCalls]
    }))

    return newCall
  },

  // End a call
  endCall: (id, duration, transcript) => {
    set((state) => ({
      calls: state.calls.map((call) =>
        call.id === id
          ? {
              ...call,
              duration,
              transcript,
              status: CallStatus.COMPLETED,
              updatedAt: new Date()
            }
          : call
      ),
      activeCalls: state.activeCalls.filter((call) => call.id !== id)
    }))
  },

  // Update transcript
  updateTranscript: (id, transcript) => {
    set((state) => ({
      calls: state.calls.map((call) =>
        call.id === id ? { ...call, transcript, updatedAt: new Date() } : call
      )
    }))
  },

  // Update extracted data
  updateExtractedData: (id, data) => {
    set((state) => ({
      calls: state.calls.map((call) =>
        call.id === id
          ? {
              ...call,
              extractedData: { ...call.extractedData, ...data },
              updatedAt: new Date()
            }
          : call
      )
    }))
  },

  // Mark call as converted to appointment
  markAsConverted: (id, appointmentId) => {
    set((state) => ({
      calls: state.calls.map((call) =>
        call.id === id
          ? {
              ...call,
              appointmentCreated: true,
              appointmentId,
              status: CallStatus.CONVERTED,
              updatedAt: new Date()
            }
          : call
      )
    }))
  },

  // Get calls by status
  getCallsByStatus: (status) => {
    return get().calls.filter((call) => call.status === status)
  },

  // Get calls by urgency
  getCallsByUrgency: (urgency) => {
    return get().calls.filter(
      (call) => call.extractedData.urgency === urgency
    )
  },

  // Get calls by date range
  getCallsByDateRange: (startDate, endDate) => {
    return get().calls.filter((call) => {
      const callDate = new Date(call.createdAt)
      return callDate >= startDate && callDate <= endDate
    })
  },

  // Search calls
  searchCalls: (query) => {
    const lowerQuery = query.toLowerCase()
    return get().calls.filter(
      (call) =>
        call.callerName?.toLowerCase().includes(lowerQuery) ||
        call.callerPhone.includes(query) ||
        call.transcript.toLowerCase().includes(lowerQuery) ||
        call.extractedData.customerName?.toLowerCase().includes(lowerQuery) ||
        call.extractedData.serviceRequested?.toLowerCase().includes(lowerQuery)
    )
  },

  // Get calls by customer
  getCallsByCustomer: (customerId) => {
    return get().calls.filter((call) => call.customerId === customerId)
  },

  // Get call statistics
  getCallStats: () => {
    const calls = get().calls
    const total = calls.length
    const completed = calls.filter((c) => c.status === CallStatus.COMPLETED).length
    const missed = calls.filter((c) => c.status === CallStatus.MISSED).length
    const converted = calls.filter((c) => c.appointmentCreated).length
    const conversionRate = total > 0 ? (converted / total) * 100 : 0
    const totalDuration = calls.reduce((sum, call) => sum + call.duration, 0)
    const averageDuration = total > 0 ? totalDuration / total : 0

    return {
      total,
      completed,
      missed,
      converted,
      conversionRate,
      averageDuration,
      totalDuration
    }
  },

  // Set loading state
  setLoading: (loading) => {
    set({ loading })
  },

  // Set error
  setError: (error) => {
    set({ error })
  },

  // Clear all calls
  clearCalls: () => {
    set({ calls: [], activeCalls: [], selectedCall: null })
  }
}))

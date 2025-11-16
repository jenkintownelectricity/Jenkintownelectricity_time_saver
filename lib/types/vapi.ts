/**
 * Type definitions for VAPI SDK
 * Based on @vapi-ai/web SDK v2.5.0
 */

export interface VapiMessage {
  type: 'transcript' | 'function-call' | 'metadata' | 'conversation-update'
  transcriptType?: 'partial' | 'final'
  role?: 'user' | 'assistant' | 'system'
  transcript?: string
  timestamp?: number
  [key: string]: unknown
}

export interface VapiError {
  message: string
  code?: string
  details?: unknown
}

export interface VapiCallMetadata {
  callId?: string
  duration?: number
  endedReason?: string
}

/**
 * Extended VAPI Call Interface
 * For tracking and managing incoming calls
 */

export enum CallStatus {
  COMPLETED = 'completed',
  MISSED = 'missed',
  IN_PROGRESS = 'in_progress',
  FOLLOWUP_NEEDED = 'followup_needed',
  CONVERTED = 'converted'
}

export enum CallUrgency {
  EMERGENCY = 'emergency',
  ROUTINE = 'routine',
  SCHEDULED = 'scheduled',
  UNKNOWN = 'unknown'
}

export interface ExtractedData {
  customerName?: string
  customerPhone?: string
  customerEmail?: string
  address?: string
  serviceRequested?: string
  preferredDate?: string
  preferredTime?: string
  urgency?: CallUrgency
  budget?: number
  notes?: string
}

export interface VAPICall {
  id: string
  userId: string
  companyId: string
  callId: string // VAPI call ID
  callerPhone: string
  callerName?: string
  duration: number // seconds
  transcript: string
  recording?: string // URL
  extractedData: ExtractedData
  appointmentCreated: boolean
  appointmentId?: string
  customerId?: string
  status: CallStatus
  tags?: string[]
  createdAt: Date
  updatedAt: Date
}

export interface VAPIWebhookPayload {
  type: 'call.started' | 'call.ended' | 'transcript.updated' | 'function.called'
  call: {
    id: string
    phoneNumber?: string
    duration?: number
    status?: string
    transcript?: string
    recording?: string
  }
  timestamp: string
  metadata?: Record<string, unknown>
}

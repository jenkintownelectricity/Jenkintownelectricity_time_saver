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

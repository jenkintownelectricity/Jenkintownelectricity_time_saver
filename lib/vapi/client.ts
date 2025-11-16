/**
 * VAPI Client Integration
 * Handles VAPI SDK initialization and call management
 */

'use client'

import Vapi from '@vapi-ai/web'
import { VapiMessage, VapiError, VapiCallMetadata } from '@/lib/types/vapi'

export class VAPIClient {
  private vapi: Vapi | null = null
  private publicKey: string
  private assistantId?: string
  private onMessageCallback?: (message: VapiMessage) => void
  private onCallStartCallback?: (metadata: VapiCallMetadata) => void
  private onCallEndCallback?: (metadata: VapiCallMetadata) => void
  private onErrorCallback?: (error: VapiError) => void

  constructor(publicKey: string, assistantId?: string) {
    this.publicKey = publicKey
    this.assistantId = assistantId
    this.initialize()
  }

  /**
   * Initialize VAPI SDK
   */
  private initialize() {
    try {
      this.vapi = new Vapi(this.publicKey)
      this.setupEventListeners()
    } catch (error) {
      console.error('Failed to initialize VAPI:', error)
      throw error
    }
  }

  /**
   * Setup event listeners for VAPI events
   */
  private setupEventListeners() {
    if (!this.vapi) return

    // Message events (transcript updates)
    this.vapi.on('message', (message: VapiMessage) => {
      console.log('VAPI Message:', message)
      if (this.onMessageCallback) {
        this.onMessageCallback(message)
      }
    })

    // Call start event
    this.vapi.on('call-start', () => {
      console.log('VAPI Call Started')
      const metadata: VapiCallMetadata = {
        callId: (this.vapi as any)?.callId || `call_${Date.now()}`,
        duration: 0
      }
      if (this.onCallStartCallback) {
        this.onCallStartCallback(metadata)
      }
    })

    // Call end event
    this.vapi.on('call-end', () => {
      console.log('VAPI Call Ended')
      const metadata: VapiCallMetadata = {
        callId: (this.vapi as any)?.callId || `call_${Date.now()}`,
        duration: 0, // Will be calculated from start/end times
        endedReason: 'completed'
      }
      if (this.onCallEndCallback) {
        this.onCallEndCallback(metadata)
      }
    })

    // Error event
    this.vapi.on('error', (error: VapiError) => {
      console.error('VAPI Error:', error)
      if (this.onErrorCallback) {
        this.onErrorCallback(error)
      }
    })

    // Speech start/end events
    this.vapi.on('speech-start', () => {
      console.log('User started speaking')
    })

    this.vapi.on('speech-end', () => {
      console.log('User stopped speaking')
    })

    // Volume level (for visualization)
    this.vapi.on('volume-level', (level: number) => {
      // Can be used for audio visualization
      // console.log('Volume level:', level)
    })
  }

  /**
   * Start a new call
   */
  async startCall(assistantId?: string): Promise<void> {
    if (!this.vapi) {
      throw new Error('VAPI not initialized')
    }

    try {
      const idToUse = assistantId || this.assistantId
      if (!idToUse) {
        throw new Error('Assistant ID is required')
      }

      await this.vapi.start(idToUse)
    } catch (error) {
      console.error('Failed to start call:', error)
      throw error
    }
  }

  /**
   * End the current call
   */
  endCall(): void {
    if (!this.vapi) {
      throw new Error('VAPI not initialized')
    }

    try {
      this.vapi.stop()
    } catch (error) {
      console.error('Failed to end call:', error)
      throw error
    }
  }

  /**
   * Check if call is active
   */
  isCallActive(): boolean {
    return this.vapi?.isMuted !== undefined
  }

  /**
   * Mute/unmute microphone
   */
  setMuted(muted: boolean): void {
    if (!this.vapi) {
      throw new Error('VAPI not initialized')
    }

    if (muted) {
      this.vapi.setMuted(true)
    } else {
      this.vapi.setMuted(false)
    }
  }

  /**
   * Send a message during the call
   */
  sendMessage(message: string): void {
    if (!this.vapi) {
      throw new Error('VAPI not initialized')
    }

    this.vapi.send({
      type: 'add-message',
      message: {
        role: 'user',
        content: message
      }
    })
  }

  /**
   * Get current call ID
   */
  getCallId(): string | undefined {
    return (this.vapi as any)?.callId
  }

  /**
   * Register callback for messages
   */
  onMessage(callback: (message: VapiMessage) => void): void {
    this.onMessageCallback = callback
  }

  /**
   * Register callback for call start
   */
  onCallStart(callback: (metadata: VapiCallMetadata) => void): void {
    this.onCallStartCallback = callback
  }

  /**
   * Register callback for call end
   */
  onCallEnd(callback: (metadata: VapiCallMetadata) => void): void {
    this.onCallEndCallback = callback
  }

  /**
   * Register callback for errors
   */
  onError(callback: (error: VapiError) => void): void {
    this.onErrorCallback = callback
  }

  /**
   * Cleanup and destroy VAPI instance
   */
  destroy(): void {
    if (this.vapi) {
      try {
        this.vapi.stop()
      } catch (error) {
        console.error('Error stopping VAPI:', error)
      }
      this.vapi = null
    }
  }
}

/**
 * Create VAPI client instance
 */
export function createVAPIClient(publicKey?: string, assistantId?: string): VAPIClient | null {
  const key = publicKey || process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY

  if (!key) {
    console.error('VAPI public key not provided')
    return null
  }

  return new VAPIClient(key, assistantId)
}

/**
 * Hook to use VAPI client (for React components)
 */
export function useVAPIClient(publicKey?: string, assistantId?: string) {
  const [client, setClient] = React.useState<VAPIClient | null>(null)
  const [isCallActive, setIsCallActive] = React.useState(false)
  const [transcript, setTranscript] = React.useState<string[]>([])
  const [error, setError] = React.useState<VapiError | null>(null)

  React.useEffect(() => {
    const vapiClient = createVAPIClient(publicKey, assistantId)

    if (vapiClient) {
      // Setup callbacks
      vapiClient.onMessage((message) => {
        if (message.type === 'transcript' && message.transcriptType === 'final') {
          setTranscript((prev) => [...prev, message.transcript || ''])
        }
      })

      vapiClient.onCallStart(() => {
        setIsCallActive(true)
        setTranscript([])
      })

      vapiClient.onCallEnd(() => {
        setIsCallActive(false)
      })

      vapiClient.onError((err) => {
        setError(err)
      })

      setClient(vapiClient)
    }

    return () => {
      vapiClient?.destroy()
    }
  }, [publicKey, assistantId])

  return {
    client,
    isCallActive,
    transcript,
    error,
    startCall: () => client?.startCall(),
    endCall: () => client?.endCall(),
    setMuted: (muted: boolean) => client?.setMuted(muted)
  }
}

// Import React for the hook
import React from 'react'

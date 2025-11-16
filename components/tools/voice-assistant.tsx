'use client'

import { useEffect, useState, useRef } from 'react'
import Vapi from '@vapi-ai/web'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mic, PhoneOff, Loader2, Volume2, VolumeX, Clock, History } from 'lucide-react'
import type { VapiMessage, VapiError } from '@/lib/types/vapi'

interface CallHistoryItem {
  id: string
  timestamp: number
  duration: number
  transcript: string[]
}

export default function VoiceAssistant() {
  const { voiceCall, startVoiceCall, endVoiceCall, addTranscript, updateCallDuration, apiKeys, ownerSettings } = useAppStore()
  const [isInitializing, setIsInitializing] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [callHistory, setCallHistory] = useState<CallHistoryItem[]>([])
  const [showHistory, setShowHistory] = useState(false)
  const vapiRef = useRef<Vapi | null>(null)
  const durationTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Waveform animation
  const [waveformBars, setWaveformBars] = useState<number[]>(new Array(40).fill(20))

  useEffect(() => {
    // Animate waveform when call is active and not muted
    if (voiceCall.isActive && !isMuted) {
      const interval = setInterval(() => {
        setWaveformBars(prev => prev.map(() => Math.random() * 60 + 10))
      }, 100)
      return () => clearInterval(interval)
    } else {
      setWaveformBars(new Array(40).fill(20))
    }
  }, [voiceCall.isActive, isMuted])

  // Call duration timer
  useEffect(() => {
    if (voiceCall.isActive) {
      durationTimerRef.current = setInterval(() => {
        updateCallDuration(voiceCall.duration + 1)
      }, 1000)
    } else {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current)
        durationTimerRef.current = null
      }
    }

    return () => {
      if (durationTimerRef.current) {
        clearInterval(durationTimerRef.current)
      }
    }
  }, [voiceCall.isActive, voiceCall.duration, updateCallDuration])

  // Load call history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem('voice-call-history')
    if (saved) {
      try {
        setCallHistory(JSON.parse(saved))
      } catch (e) {
        // Invalid history data
      }
    }
  }, [])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop()
      }
    }
  }, [])

  const handleStartCall = async () => {
    // Check if we have user keys OR owner is providing default keys
    const publicKey = apiKeys.vapi || (ownerSettings.provideDefaultKeys ? ownerSettings.defaultVapiKey : null)
    const assistantId = apiKeys.vapiAssistantId || (ownerSettings.provideDefaultKeys ? ownerSettings.defaultVapiAssistantId : null)

    if (!publicKey || !assistantId) {
      addTranscript('System: Please add your VAPI API keys in Settings to start a call')
      return
    }

    setIsInitializing(true)

    try {
      // Initialize VAPI SDK
      if (!vapiRef.current) {
        vapiRef.current = new Vapi(publicKey)

        // Set up event handlers
        vapiRef.current.on('call-start', () => {
          startVoiceCall()
          setIsInitializing(false)
          addTranscript('System: Call connected with Fabio')
        })

        vapiRef.current.on('call-end', () => {
          // Save to history
          const historyItem: CallHistoryItem = {
            id: `call_${Date.now()}`,
            timestamp: Date.now(),
            duration: voiceCall.duration,
            transcript: voiceCall.transcript
          }
          const newHistory = [historyItem, ...callHistory].slice(0, 20) // Keep last 20 calls
          setCallHistory(newHistory)
          localStorage.setItem('voice-call-history', JSON.stringify(newHistory))

          endVoiceCall()
          addTranscript('System: Call ended')
        })

        vapiRef.current.on('speech-start', () => {
          // Speech started
        })

        vapiRef.current.on('speech-end', () => {
          // Speech ended
        })

        vapiRef.current.on('message', (message: VapiMessage) => {
          // Handle transcript messages
          if (message.type === 'transcript' && message.transcriptType === 'final') {
            const role = message.role === 'user' ? 'You' : 'Fabio'
            addTranscript(`${role}: ${message.transcript}`)
          }
        })

        vapiRef.current.on('error', (error: VapiError) => {
          addTranscript(`System: Error - ${error.message || 'Connection failed'}`)
          setIsInitializing(false)
          endVoiceCall()
        })
      }

      // Start the call with Fabio assistant
      await vapiRef.current.start(assistantId)

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      addTranscript(`System: Failed to start call - ${errorMessage}`)
      setIsInitializing(false)
      endVoiceCall()
    }
  }

  const handleEndCall = () => {
    if (vapiRef.current) {
      vapiRef.current.stop()
    }
    endVoiceCall()
  }

  const handleToggleMute = () => {
    if (vapiRef.current && voiceCall.isActive) {
      vapiRef.current.setMuted(!isMuted)
      setIsMuted(!isMuted)
    }
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins.toString().padStart(2, '0') + ':' + secs.toString().padStart(2, '0')
  }

  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp)
    return date.toLocaleString()
  }

  return (
    <div className="space-y-6">
      {/* Status Badge */}
      <div className="flex justify-center">
        {voiceCall.isActive ? (
          <Badge variant="default" className="px-4 py-2 text-sm">
            Connected - {formatDuration(voiceCall.duration)}
          </Badge>
        ) : (
          <Badge variant="outline" className="px-4 py-2 text-sm">
            Ready to connect
          </Badge>
        )}
      </div>

      {/* Waveform Visualization */}
      <Card className="p-8">
        <div className="flex items-center justify-center gap-1 h-32">
          {waveformBars.map((height, index) => (
            <div
              key={index}
              className="w-1 bg-primary rounded-full transition-all duration-100 ease-out"
              style={{ height: height + '%' }}
            />
          ))}
        </div>

        {voiceCall.isActive && (
          <div className="flex justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={handleToggleMute}
            >
              {isMuted ? (
                <>
                  <VolumeX className="w-4 h-4 mr-2" />
                  Unmute
                </>
              ) : (
                <>
                  <Volume2 className="w-4 h-4 mr-2" />
                  Mute
                </>
              )}
            </Button>
          </div>
        )}
      </Card>

      {/* API Keys Warning */}
      {(!apiKeys.vapi || !apiKeys.vapiAssistantId) && !ownerSettings.provideDefaultKeys ? (
        <Card className="bg-yellow-500/10 border-yellow-500/30">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              API Keys Required
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              To use voice calls, you need to add your own VAPI API keys in Settings.
              This ensures you control your own usage and billing.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {/* Default Keys Notice */}
      {(!apiKeys.vapi || !apiKeys.vapiAssistantId) && ownerSettings.provideDefaultKeys ? (
        <Card className="bg-blue-500/10 border-blue-500/30">
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
              Using Default Service
            </h3>
            <p className="text-sm text-muted-foreground mb-2">
              You're using the default AppIo.AI voice service. For your own custom assistant or to control your billing, add your VAPI keys in Settings.
            </p>
          </CardContent>
        </Card>
      ) : null}

      {/* Call Controls */}
      <div className="flex justify-center gap-4">
        {!voiceCall.isActive ? (
          <Button
            size="lg"
            onClick={handleStartCall}
            disabled={isInitializing || (!apiKeys.vapi && !apiKeys.vapiAssistantId && !ownerSettings.provideDefaultKeys)}
            className="w-48 h-16 text-lg"
          >
            {isInitializing ? (
              <>
                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Mic className="w-6 h-6 mr-2" />
                Start Call
              </>
            )}
          </Button>
        ) : (
          <Button
            size="lg"
            variant="destructive"
            onClick={handleEndCall}
            className="w-48 h-16 text-lg"
          >
            <PhoneOff className="w-6 h-6 mr-2" />
            End Call
          </Button>
        )}
      </div>

      {/* Live Transcript */}
      {voiceCall.transcript.length > 0 && (
        <Card>
          <CardContent className="p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Live Transcript
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {voiceCall.transcript.map((text: string, index: number) => (
                <div
                  key={index}
                  className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg"
                >
                  {text}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Call History */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <History className="w-5 h-5" />
              Call History
            </h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowHistory(!showHistory)}
            >
              {showHistory ? 'Hide' : 'Show'}
            </Button>
          </div>

          {showHistory && (
            <div className="space-y-4">
              {callHistory.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No call history yet
                </p>
              ) : (
                callHistory.map((call) => (
                  <div key={call.id} className="border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">
                        {formatTimestamp(call.timestamp)}
                      </span>
                      <Badge variant="outline">
                        {formatDuration(call.duration)}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {call.transcript.length} messages
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <h3 className="font-semibold text-foreground mb-2">
            Meet Fabio - Your Italian Master Craftsman
          </h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li>Ask about construction codes and regulations (NEC, OSHA, IBC)</li>
            <li>Get material recommendations and calculations</li>
            <li>Learn installation procedures and best practices</li>
            <li>Search the construction knowledge database</li>
            <li>Voice-activated assistant for hands-free support</li>
          </ul>
          <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
            Powered by VAPI AI. Fabio responds with warmth, expertise, and a touch of Italian charm.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

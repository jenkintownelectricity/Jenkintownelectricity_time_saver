'use client'

import { useEffect, useState, useRef } from 'react'
import Vapi from '@vapi-ai/web'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Mic, PhoneOff, Loader2 } from 'lucide-react'

export default function VoiceInterface() {
  const { setCurrentSection, voiceCall, startVoiceCall, endVoiceCall, addTranscript, apiKeys } = useAppStore()
  const [isInitializing, setIsInitializing] = useState(false)
  const vapiRef = useRef<Vapi | null>(null)

  // Placeholder waveform animation
  const [waveformBars, setWaveformBars] = useState<number[]>(new Array(40).fill(20))

  useEffect(() => {
    // Animate waveform when call is active
    if (voiceCall.isActive) {
      const interval = setInterval(() => {
        setWaveformBars(prev => prev.map(() => Math.random() * 60 + 10))
      }, 100)
      return () => clearInterval(interval)
    } else {
      setWaveformBars(new Array(40).fill(20))
    }
  }, [voiceCall.isActive])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (vapiRef.current) {
        vapiRef.current.stop()
      }
    }
  }, [])

  const handleStartCall = async () => {
    setIsInitializing(true)

    try {
      // Use provided VAPI credentials
      const publicKey = apiKeys.vapi || '58f63a6f-6694-4fe3-8f72-fea362908803'
      const assistantId = apiKeys.vapiAssistantId || '00788639-dd74-48ec-aa8b-a6572d70e45b'

      // Initialize VAPI SDK
      if (!vapiRef.current) {
        vapiRef.current = new Vapi(publicKey)

        // Set up event handlers
        vapiRef.current.on('call-start', () => {
          console.log('Call started')
          startVoiceCall()
          setIsInitializing(false)
          addTranscript('System: Call connected with Fabio')
        })

        vapiRef.current.on('call-end', () => {
          console.log('Call ended')
          endVoiceCall()
          addTranscript('System: Call ended')
        })

        vapiRef.current.on('speech-start', () => {
          console.log('Assistant started speaking')
        })

        vapiRef.current.on('speech-end', () => {
          console.log('Assistant stopped speaking')
        })

        vapiRef.current.on('message', (message: any) => {
          console.log('Message received:', message)

          // Handle transcript messages
          if (message.type === 'transcript' && message.transcriptType === 'final') {
            const role = message.role === 'user' ? 'You' : 'Fabio'
            addTranscript(`${role}: ${message.transcript}`)
          }
        })

        vapiRef.current.on('error', (error: any) => {
          console.error('VAPI error:', error)
          addTranscript(`System: Error - ${error.message || 'Connection failed'}`)
          setIsInitializing(false)
          endVoiceCall()
        })
      }

      // Start the call with Fabio assistant
      await vapiRef.current.start(assistantId)

    } catch (error: any) {
      console.error('Failed to start call:', error)
      addTranscript(`System: Failed to start call - ${error.message || 'Unknown error'}`)
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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return mins.toString().padStart(2, '0') + ':' + secs.toString().padStart(2, '0')
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentSection('home')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Voice Assistant</h1>
              <p className="text-xs text-muted-foreground">Talk to AppIo.AI</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="space-y-6">
          <div className="flex justify-center">
            {voiceCall.isActive ? (
              <Badge variant="default" className="px-4 py-2 text-sm">
                Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="px-4 py-2 text-sm">
                Ready to connect
              </Badge>
            )}
          </div>

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
          </Card>

          <div className="flex justify-center gap-4">
            {!voiceCall.isActive ? (
              <Button
                size="xl"
                onClick={handleStartCall}
                disabled={isInitializing}
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
                size="xl"
                variant="destructive"
                onClick={handleEndCall}
                className="w-48 h-16 text-lg"
              >
                <PhoneOff className="w-6 h-6 mr-2" />
                End Call
              </Button>
            )}
          </div>

          {voiceCall.transcript.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Live Transcript</h3>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {voiceCall.transcript.map((text, index) => (
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

          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-2">
                Meet Fabio - Your Italian Master Craftsman
              </h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>🔧 Ask about construction codes and regulations (NEC, OSHA, IBC)</li>
                <li>📐 Get material recommendations and calculations</li>
                <li>⚡ Learn installation procedures and best practices</li>
                <li>🏗️ Search the construction knowledge database</li>
                <li>💡 Voice-activated assistant for hands-free support</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
                Powered by VAPI AI. Fabio responds with warmth, expertise, and a touch of Italian charm.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

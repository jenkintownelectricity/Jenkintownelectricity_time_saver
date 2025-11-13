'use client'

import { useEffect, useState, useRef } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Mic, PhoneOff, Loader2 } from 'lucide-react'

export default function VoiceInterface() {
  const { setCurrentSection, voiceCall, startVoiceCall, endVoiceCall, addTranscript } = useAppStore()
  const [isInitializing, setIsInitializing] = useState(false)
  const vapiRef = useRef<any>(null)

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

  const handleStartCall = async () => {
    setIsInitializing(true)
    startVoiceCall()

    // TODO: Initialize VAPI SDK
    // This is a placeholder - integrate with actual VAPI when API key is provided

    // Simulate call start for demo
    setTimeout(() => {
      setIsInitializing(false)
      addTranscript('System: Call connected (demo mode)')
      addTranscript('System: Say "Tell me about wire gauges" or "What NEC code covers GFCI?"')
    }, 1500)
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
                Voice Assistant Features
              </h3>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>Ask about construction codes and regulations</li>
                <li>Get material recommendations and calculations</li>
                <li>Learn installation procedures and best practices</li>
                <li>Search the construction knowledge database</li>
              </ul>
              <p className="text-xs text-muted-foreground mt-4 pt-4 border-t border-border">
                To enable real voice calls, add your VAPI API key in settings.
                Currently running in demo mode.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

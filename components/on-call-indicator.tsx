'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Check, Zap, X, Phone } from 'lucide-react'

export default function OnCallIndicator() {
  const { onCallStatus, setOnCall, clearOnCall, teamMembers } = useAppStore()
  const [showModal, setShowModal] = useState(false)
  const [personName, setPersonName] = useState('')

  // Only show team members who are on-call available
  const onCallAvailableMembers = teamMembers.filter(m => m.onCallAvailable)

  const handleSetOnCall = () => {
    if (personName.trim()) {
      setOnCall(personName.trim())
      setPersonName('')
      setShowModal(false)
    }
  }

  const handleSelectVolunteer = (name: string) => {
    setOnCall(name)
    setShowModal(false)
  }

  const handleClearOnCall = () => {
    if (confirm(`Clear on-call status for ${onCallStatus.personName}?`)) {
      clearOnCall()
    }
  }

  return (
    <>
      {/* On-Call Status Card - Compact Version */}
      <Card
        className={`
          relative overflow-hidden cursor-pointer transition-all duration-300
          ${onCallStatus.isOnCall
            ? 'border-green-500 border-2 bg-green-500/5'
            : 'border-red-500 border-2 animate-flash-red bg-red-500/5'
          }
        `}
        onClick={() => !onCallStatus.isOnCall && setShowModal(true)}
      >
        {/* Electric pulsing background when active */}
        {onCallStatus.isOnCall && (
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-emerald-500/20 to-green-500/10 animate-breathe" />
        )}

        <CardContent className="relative p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Status Indicator - Smaller */}
              <div className={`
                w-12 h-12 rounded-full flex items-center justify-center
                ${onCallStatus.isOnCall
                  ? 'bg-green-500 animate-pulse-green'
                  : 'bg-red-500 animate-pulse'
                }
              `}>
                {onCallStatus.isOnCall ? (
                  <Zap className="w-6 h-6 text-white animate-zap" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-white" />
                )}
              </div>

              {/* Status Text - Compact */}
              <div>
                {onCallStatus.isOnCall ? (
                  <>
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-bold text-green-700 dark:text-green-400">
                        ON CALL
                      </h3>
                      <Zap className="w-4 h-4 text-green-500 animate-bounce" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-semibold">{onCallStatus.personName}</span> • Since {new Date(onCallStatus.startedAt!).toLocaleTimeString()}
                    </p>
                  </>
                ) : (
                  <>
                    <h3 className="text-lg font-bold text-red-700 dark:text-red-400">
                      NO ONE ON CALL
                    </h3>
                    <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                      ⚠️ Click to assign
                    </p>
                  </>
                )}
              </div>
            </div>

            {/* Action Button */}
            {onCallStatus.isOnCall && (
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  handleClearOnCall()
                }}
                className="border-red-500 text-red-600 hover:bg-red-500 hover:text-white"
              >
                <X className="w-4 h-4 mr-2" />
                End
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Set On-Call Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Set On-Call Person
              </CardTitle>
              <CardDescription>Choose from available team members or enter a name</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Available Team Members List */}
              {onCallAvailableMembers.length > 0 && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Available Team Members</label>
                  <div className="grid gap-2">
                    {onCallAvailableMembers.map(member => (
                      <Button
                        key={member.id}
                        variant="outline"
                        className="w-full justify-start text-left h-auto py-3"
                        onClick={() => handleSelectVolunteer(member.name)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{member.name}</span>
                            {member.type === '1099' ? (
                              <Badge variant="outline" className="text-xs bg-purple-500 text-white">1099</Badge>
                            ) : member.type === 'employee' ? (
                              <Badge variant="outline" className="text-xs bg-blue-500 text-white">Employee</Badge>
                            ) : member.type === 'subcontractor' ? (
                              <Badge variant="outline" className="text-xs bg-orange-500 text-white">Sub</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs bg-green-500 text-white">Work For</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Phone className="w-3 h-3" />
                            {member.phone}
                          </div>
                        </div>
                        <Check className="w-4 h-4 text-green-500" />
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {onCallAvailableMembers.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm mb-2">No team members available for on-call</p>
                  <p className="text-xs">Go to Jobs & Business → Team to add members and mark them as on-call available</p>
                </div>
              )}

              {/* Custom Name Entry */}
              <div className="pt-4 border-t">
                <label className="text-sm font-medium mb-2 block">
                  Or enter a name manually
                </label>
                <Input
                  placeholder="Enter name..."
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSetOnCall()}
                />
              </div>

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowModal(false)
                    setPersonName('')
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSetOnCall}
                  disabled={!personName.trim()}
                  className="bg-green-600 hover:bg-green-700"
                >
                  <Check className="w-4 h-4 mr-2" />
                  Start On-Call
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <style jsx global>{`
        /* Red flashing border for when no one is on call */
        @keyframes flash-red {
          0%, 100% {
            border-color: rgb(239 68 68);
            box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
          }
          50% {
            border-color: rgb(220 38 38);
            box-shadow: 0 0 8px 2px rgba(239, 68, 68, 0.5);
          }
        }

        /* Breathing/electric animation for green on-call state */
        @keyframes breathe {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.02); }
        }

        /* Pulsing green indicator */
        @keyframes pulse-green {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
          }
          50% {
            opacity: 0.85;
            transform: scale(1.05);
            box-shadow: 0 0 15px 3px rgba(34, 197, 94, 0.4);
          }
        }

        /* Electric zap animation */
        @keyframes zap {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(-8deg); }
          75% { transform: rotate(8deg); }
        }

        .animate-flash-red {
          animation: flash-red 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        .animate-breathe {
          animation: breathe 3.5s ease-in-out infinite;
        }

        .animate-pulse-green {
          animation: pulse-green 2.5s ease-in-out infinite;
        }

        .animate-zap {
          animation: zap 1.5s ease-in-out infinite;
        }
      `}</style>
    </>
  )
}

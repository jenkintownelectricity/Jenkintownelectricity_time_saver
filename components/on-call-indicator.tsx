'use client'

import { useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, Check, Zap, X, UserPlus, Trash2, Phone, Briefcase } from 'lucide-react'

export default function OnCallIndicator() {
  const { onCallStatus, setOnCall, clearOnCall, onCallVolunteers, addOnCallVolunteer, removeOnCallVolunteer } = useAppStore()
  const [showModal, setShowModal] = useState(false)
  const [showManageVolunteers, setShowManageVolunteers] = useState(false)
  const [personName, setPersonName] = useState('')
  const [newVolunteer, setNewVolunteer] = useState({ name: '', phone: '', type: 'employee' as 'employee' | '1099' })

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

  const handleAddVolunteer = () => {
    if (newVolunteer.name.trim() && newVolunteer.phone.trim()) {
      addOnCallVolunteer({
        name: newVolunteer.name.trim(),
        phone: newVolunteer.phone.trim(),
        type: newVolunteer.type
      })
      setNewVolunteer({ name: '', phone: '', type: 'employee' })
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
      {showModal && !showManageVolunteers && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                Set On-Call Person
              </CardTitle>
              <CardDescription>Choose from your volunteers or enter a name</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Volunteer List */}
              {onCallVolunteers.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Quick Select</label>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowManageVolunteers(true)}
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      Manage
                    </Button>
                  </div>
                  <div className="grid gap-2">
                    {onCallVolunteers.map(volunteer => (
                      <Button
                        key={volunteer.id}
                        variant="outline"
                        className="w-full justify-start text-left h-auto py-3"
                        onClick={() => handleSelectVolunteer(volunteer.name)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold">{volunteer.name}</span>
                            {volunteer.type === '1099' ? (
                              <Badge variant="outline" className="text-xs">1099</Badge>
                            ) : (
                              <Badge variant="outline" className="text-xs">Employee</Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                            <Phone className="w-3 h-3" />
                            {volunteer.phone}
                          </div>
                        </div>
                        <Check className="w-4 h-4 text-green-500" />
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {onCallVolunteers.length === 0 && (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="text-sm mb-2">No volunteers added yet</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowManageVolunteers(true)}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Add Volunteers
                  </Button>
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

      {/* Manage Volunteers Modal */}
      {showManageVolunteers && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-blue-500" />
                Manage On-Call Volunteers
              </CardTitle>
              <CardDescription>Add or remove people who can respond to emergencies</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Add New Volunteer */}
              <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-semibold text-sm">Add New Volunteer</h4>
                <div>
                  <Input
                    placeholder="Name"
                    value={newVolunteer.name}
                    onChange={(e) => setNewVolunteer({ ...newVolunteer, name: e.target.value })}
                  />
                </div>
                <div>
                  <Input
                    placeholder="Phone number"
                    type="tel"
                    value={newVolunteer.phone}
                    onChange={(e) => setNewVolunteer({ ...newVolunteer, phone: e.target.value })}
                  />
                </div>
                <div>
                  <select
                    value={newVolunteer.type}
                    onChange={(e) => setNewVolunteer({ ...newVolunteer, type: e.target.value as 'employee' | '1099' })}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="employee">Employee</option>
                    <option value="1099">1099 Contractor</option>
                  </select>
                </div>
                <Button
                  onClick={handleAddVolunteer}
                  disabled={!newVolunteer.name.trim() || !newVolunteer.phone.trim()}
                  className="w-full"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Volunteer
                </Button>
              </div>

              {/* Volunteer List */}
              {onCallVolunteers.length > 0 && (
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Current Volunteers</h4>
                  {onCallVolunteers.map(volunteer => (
                    <div
                      key={volunteer.id}
                      className="flex items-center justify-between p-3 bg-background rounded-lg border"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm">{volunteer.name}</span>
                          {volunteer.type === '1099' ? (
                            <Badge variant="outline" className="text-xs">1099</Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">Employee</Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Phone className="w-3 h-3" />
                          {volunteer.phone}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOnCallVolunteer(volunteer.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-3 justify-end pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowManageVolunteers(false)
                    setNewVolunteer({ name: '', phone: '', type: 'employee' })
                  }}
                >
                  Done
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

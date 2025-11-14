'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Zap,
  AlertCircle,
  Clock,
  DollarSign,
  MapPin,
  Phone,
  CheckCircle,
  XCircle,
  Users,
  Timer,
  TrendingUp
} from 'lucide-react'

export default function CallBidding() {
  const {
    setCurrentSection,
    incomingCalls,
    callBids,
    userProfile,
    currentCompanyCode,
    companyAccounts,
    addIncomingCall,
    claimCall,
    bidOnCall,
    acceptBid,
    rejectBid,
    cancelCall,
    getActiveCallsForCompany,
    getAvailableBidders
  } = useAppStore()

  const [showSimulateCall, setShowSimulateCall] = useState(false)
  const [estimatedArrival, setEstimatedArrival] = useState(15)

  const currentCompany = companyAccounts.find(c => c.companyCode === currentCompanyCode)
  const activeCalls = currentCompanyCode ? getActiveCallsForCompany(currentCompanyCode) : []
  const availableBidders = getAvailableBidders()

  // Simulate an incoming call for demo purposes
  const simulateIncomingCall = (type: 'emergency' | 'daytime' | 'scheduled') => {
    if (!currentCompanyCode) {
      alert('Please set up a company first')
      return
    }

    const bonusAmount = type === 'emergency'
      ? (currentCompany?.settings.emergencyCallBonus || 100)
      : type === 'daytime'
        ? (currentCompany?.settings.daytimeCallBonus || 25)
        : (currentCompany?.settings.defaultCallBonus || 50)

    addIncomingCall({
      callType: type,
      customerName: 'Test Customer',
      customerPhone: '(555) 123-4567',
      location: '123 Main St, City, ST',
      description: type === 'emergency'
        ? 'Power outage - needs immediate assistance'
        : type === 'daytime'
          ? 'Regular service call - ceiling fan installation'
          : 'Scheduled maintenance visit',
      estimatedValue: type === 'emergency' ? 500 : type === 'daytime' ? 200 : 150,
      callBonus: bonusAmount,
      expiresAt: Date.now() + (type === 'emergency' ? 5 * 60 * 1000 : 15 * 60 * 1000), // 5 or 15 minutes
      companyCode: currentCompanyCode
    })
  }

  const handleClaimCall = (callId: string) => {
    if (!userProfile) {
      alert('Please create your profile first')
      return
    }
    claimCall(callId, userProfile.memberNumber)
  }

  const handleBidOnCall = (callId: string) => {
    if (!userProfile) {
      alert('Please create your profile first')
      return
    }
    bidOnCall(callId, userProfile.memberNumber, userProfile.name, estimatedArrival)
    alert(`Bid submitted! You can arrive in ${estimatedArrival} minutes.`)
  }

  const getTimeRemaining = (expiresAt: number) => {
    const remaining = Math.max(0, expiresAt - Date.now())
    const minutes = Math.floor(remaining / 60000)
    const seconds = Math.floor((remaining % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const getBidsForCall = (callId: string) => {
    return callBids.filter(b => b.callId === callId && b.status === 'pending')
      .sort((a, b) => a.bidTime - b.bidTime) // First come, first served
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
            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Zap className="w-6 h-6 text-yellow-500" />
                Work Call Bidding
              </h1>
              <p className="text-xs text-muted-foreground">
                Uber-style system for claiming incoming work calls
              </p>
            </div>
            <Button onClick={() => setShowSimulateCall(true)} variant="outline" size="sm">
              + Simulate Call
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="space-y-6">
          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Calls</p>
                    <p className="text-3xl font-bold text-foreground">{activeCalls.length}</p>
                  </div>
                  <Zap className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Available Bidders</p>
                    <p className="text-3xl font-bold text-foreground">{availableBidders.length}</p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Claimed</p>
                    <p className="text-3xl font-bold text-foreground">
                      {incomingCalls.filter(c => c.status === 'claimed').length}
                    </p>
                  </div>
                  <CheckCircle className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Bonuses Earned</p>
                    <p className="text-3xl font-bold text-green-600">
                      ${incomingCalls.filter(c => c.status === 'claimed').reduce((sum, c) => sum + c.callBonus, 0)}
                    </p>
                  </div>
                  <DollarSign className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Active Calls */}
          {activeCalls.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Zap className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-semibold mb-2">No Active Calls</h3>
                <p className="text-muted-foreground mb-4">
                  When calls come in, they'll appear here for your team to claim
                </p>
                <Button onClick={() => setShowSimulateCall(true)}>
                  Simulate Incoming Call
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">Available Calls</h2>
              {activeCalls.map(call => {
                const bids = getBidsForCall(call.id)
                const timeLeft = getTimeRemaining(call.expiresAt)
                const isExpiringSoon = call.expiresAt - Date.now() < 2 * 60 * 1000 // Less than 2 minutes

                return (
                  <Card
                    key={call.id}
                    className={`${
                      call.callType === 'emergency'
                        ? 'border-red-500 border-2 bg-red-500/5'
                        : call.callType === 'daytime'
                          ? 'border-yellow-500 border-2 bg-yellow-500/5'
                          : 'border-blue-500 bg-blue-500/5'
                    } ${isExpiringSoon ? 'animate-pulse' : ''}`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <CardTitle className="text-lg">{call.customerName}</CardTitle>
                            <Badge className={
                              call.callType === 'emergency'
                                ? 'bg-red-500'
                                : call.callType === 'daytime'
                                  ? 'bg-yellow-500'
                                  : 'bg-blue-500'
                            }>
                              {call.callType.toUpperCase()}
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3" />
                              ${call.callBonus} bonus
                            </Badge>
                          </div>
                          <CardDescription className="space-y-1">
                            <div className="flex items-center gap-2">
                              <MapPin className="w-4 h-4" />
                              {call.location}
                            </div>
                            <div className="flex items-center gap-2">
                              <Phone className="w-4 h-4" />
                              {call.customerPhone}
                            </div>
                          </CardDescription>
                        </div>

                        <div className="text-right">
                          <div className={`flex items-center gap-2 ${isExpiringSoon ? 'text-red-600' : 'text-muted-foreground'}`}>
                            <Timer className="w-4 h-4" />
                            <span className="font-mono text-lg font-bold">{timeLeft}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">to claim</p>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Job Description:</h4>
                        <p className="text-sm text-muted-foreground">{call.description}</p>
                        <p className="text-sm font-semibold mt-2">
                          Estimated Value: ${call.estimatedValue}
                        </p>
                      </div>

                      {/* Bidding Section */}
                      {currentCompany?.settings.requireBidApproval ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3">
                            <Input
                              type="number"
                              placeholder="Minutes to arrival"
                              value={estimatedArrival}
                              onChange={(e) => setEstimatedArrival(Number(e.target.value))}
                              className="w-32"
                            />
                            <Button onClick={() => handleBidOnCall(call.id)} className="flex-1">
                              Submit Bid
                            </Button>
                          </div>

                          {bids.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="text-sm font-semibold">Current Bids:</h4>
                              {bids.map(bid => (
                                <div key={bid.id} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                                  <div>
                                    <p className="font-semibold text-sm">{bid.memberName}</p>
                                    <p className="text-xs text-muted-foreground">
                                      Can arrive in {bid.estimatedArrival} min
                                    </p>
                                  </div>
                                  {userProfile?.memberNumber === currentCompany?.ownerMemberNumber && (
                                    <div className="flex gap-2">
                                      <Button size="sm" onClick={() => acceptBid(bid.id)} className="bg-green-600">
                                        <CheckCircle className="w-4 h-4" />
                                      </Button>
                                      <Button size="sm" variant="outline" onClick={() => rejectBid(bid.id)}>
                                        <XCircle className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ) : (
                        <Button
                          onClick={() => handleClaimCall(call.id)}
                          className="w-full"
                          size="lg"
                        >
                          <Zap className="w-5 h-5 mr-2" />
                          Claim This Call
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* Simulate Call Modal */}
      {showSimulateCall && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Simulate Incoming Call</CardTitle>
              <CardDescription>Test the bidding system with different call types</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={() => { simulateIncomingCall('emergency'); setShowSimulateCall(false) }}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                <AlertCircle className="w-4 h-4 mr-2" />
                Emergency Call (+$100 bonus)
              </Button>

              <Button
                onClick={() => { simulateIncomingCall('daytime'); setShowSimulateCall(false) }}
                className="w-full bg-yellow-600 hover:bg-yellow-700"
              >
                <Clock className="w-4 h-4 mr-2" />
                Daytime Call (+$25 bonus)
              </Button>

              <Button
                onClick={() => { simulateIncomingCall('scheduled'); setShowSimulateCall(false) }}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Scheduled Call (+$50 bonus)
              </Button>

              <Button
                onClick={() => setShowSimulateCall(false)}
                variant="outline"
                className="w-full"
              >
                Cancel
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

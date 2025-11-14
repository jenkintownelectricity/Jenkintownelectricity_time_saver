'use client'

import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ArrowLeft,
  Zap,
  Sun,
  Calendar,
  Plus,
  DollarSign,
  Users,
  TrendingUp,
  Clock,
  Settings,
  Phone,
  Copy,
  Building2,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { CallType, WorkCall } from '@/lib/store'

export default function WorkCallBidding() {
  const {
    setCurrentSection,
    userAccount,
    companies,
    currentCompanyCode,
    workCalls,
    callStats,
    isOnCall,
    createWorkCall,
    claimCall,
    placeBid,
    acceptBid,
    setOnCall,
    expireOldCalls,
    updateCompanySettings,
  } = useAppStore()

  const [showCreateCall, setShowCreateCall] = useState(false)
  const [callType, setCallType] = useState<CallType>('daytime')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [location, setLocation] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [bidTime, setBidTime] = useState('')
  const [, setTick] = useState(0)
  const [activeTab, setActiveTab] = useState('dashboard')

  const currentCompany = companies.find((c) => c.code === currentCompanyCode)

  // Auto-expire old calls every second
  useEffect(() => {
    const interval = setInterval(() => {
      expireOldCalls()
      setTick((t) => t + 1) // Force re-render for countdown timers
    }, 1000)
    return () => clearInterval(interval)
  }, [expireOldCalls])

  const handleCreateCall = () => {
    if (!currentCompanyCode || !title) return

    createWorkCall({
      companyCode: currentCompanyCode,
      type: callType,
      title,
      description,
      location,
      customerName,
      customerPhone,
      bonus: 0, // Will be set by store based on type
    })

    // Reset form
    setShowCreateCall(false)
    setTitle('')
    setDescription('')
    setLocation('')
    setCustomerName('')
    setCustomerPhone('')
  }

  const handleClaimCall = (callId: string) => {
    claimCall(callId)
  }

  const handlePlaceBid = (callId: string) => {
    if (!bidTime) return
    placeBid(callId, bidTime)
    setBidTime('')
  }

  const formatTimeRemaining = (expiresAt: number): string => {
    const remaining = expiresAt - Date.now()
    if (remaining <= 0) return 'Expired'

    const minutes = Math.floor(remaining / 60000)
    const seconds = Math.floor((remaining % 60000) / 1000)

    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const getCallColor = (type: CallType): string => {
    switch (type) {
      case 'emergency':
        return 'border-red-500 bg-red-500/10'
      case 'daytime':
        return 'border-yellow-500 bg-yellow-500/10'
      case 'scheduled':
        return 'border-blue-500 bg-blue-500/10'
    }
  }

  const getCallIcon = (type: CallType) => {
    switch (type) {
      case 'emergency':
        return <Zap className="w-5 h-5 text-red-500" />
      case 'daytime':
        return <Sun className="w-5 h-5 text-yellow-500" />
      case 'scheduled':
        return <Calendar className="w-5 h-5 text-blue-500" />
    }
  }

  const getCallBadgeColor = (type: CallType): "destructive" | "default" | "outline" => {
    switch (type) {
      case 'emergency':
        return 'destructive'
      case 'daytime':
        return 'default'
      case 'scheduled':
        return 'outline'
    }
  }

  const activeCalls = workCalls.filter((c) => c.status === 'active' && c.companyCode === currentCompanyCode)
  const claimedCalls = workCalls.filter((c) => c.status === 'claimed' && c.companyCode === currentCompanyCode)
  const availableBidders = isOnCall ? 1 : 0 // Simplified - would be network members in real app

  if (!userAccount) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Create Account First</CardTitle>
            <CardDescription>
              You need to create an account before using the work call bidding system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setCurrentSection('home')} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!currentCompany) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Create Company First</CardTitle>
            <CardDescription>
              You need to create a company before using the work call bidding system
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => setCurrentSection('home')} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setCurrentSection('home')}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
              <div>
                <h1 className="text-xl font-bold text-foreground">Work Call Bidding</h1>
                <p className="text-xs text-muted-foreground">{currentCompany.name}</p>
              </div>
            </div>
            <Button
              variant={isOnCall ? 'default' : 'outline'}
              size="sm"
              onClick={() => setOnCall(!isOnCall)}
            >
              {isOnCall ? '🟢 On-Call' : '⚪ Off-Call'}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="calls">Calls ({activeCalls.length})</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="network">Network</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Active Calls</CardDescription>
                  <CardTitle className="text-3xl">{activeCalls.length}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Phone className="w-4 h-4" />
                    Available now
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Available Bidders</CardDescription>
                  <CardTitle className="text-3xl">{availableBidders}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4" />
                    On-call team
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Total Bonuses</CardDescription>
                  <CardTitle className="text-3xl">${callStats.totalBonusEarned}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <DollarSign className="w-4 h-4" />
                    Earned so far
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardDescription>Claimed vs Expired</CardDescription>
                  <CardTitle className="text-3xl">
                    {callStats.claimedCalls}/{callStats.expiredCalls}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <TrendingUp className="w-4 h-4" />
                    Success rate
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Claimed Calls</CardTitle>
              </CardHeader>
              <CardContent>
                {claimedCalls.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No claimed calls yet
                  </p>
                ) : (
                  <div className="space-y-3">
                    {claimedCalls.slice(0, 5).map((call) => (
                      <div
                        key={call.id}
                        className="flex items-center justify-between p-3 border border-border rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          {getCallIcon(call.type)}
                          <div>
                            <p className="font-medium">{call.title}</p>
                            <p className="text-sm text-muted-foreground">{call.location}</p>
                          </div>
                        </div>
                        <Badge variant="outline">+${call.bonus}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Active Calls Tab */}
          <TabsContent value="calls" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Active Calls</h2>
              {currentCompany.ownerId === userAccount.memberNumber && (
                <Button onClick={() => setShowCreateCall(!showCreateCall)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Call
                </Button>
              )}
            </div>

            {/* Create Call Form */}
            {showCreateCall && (
              <Card>
                <CardHeader>
                  <CardTitle>Create New Work Call</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-2">
                    <Button
                      variant={callType === 'emergency' ? 'destructive' : 'outline'}
                      onClick={() => setCallType('emergency')}
                      className="flex-1"
                    >
                      <Zap className="w-4 h-4 mr-2" />
                      Emergency
                    </Button>
                    <Button
                      variant={callType === 'daytime' ? 'default' : 'outline'}
                      onClick={() => setCallType('daytime')}
                      className="flex-1"
                    >
                      <Sun className="w-4 h-4 mr-2" />
                      Daytime
                    </Button>
                    <Button
                      variant={callType === 'scheduled' ? 'default' : 'outline'}
                      onClick={() => setCallType('scheduled')}
                      className="flex-1"
                    >
                      <Calendar className="w-4 h-4 mr-2" />
                      Scheduled
                    </Button>
                  </div>

                  <Input
                    placeholder="Title (e.g., Panel Replacement)"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <Input
                    placeholder="Description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <Input
                    placeholder="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                  />
                  <Input
                    placeholder="Customer Name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                  />
                  <Input
                    placeholder="Customer Phone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                  />

                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={handleCreateCall}>
                      Create Call
                    </Button>
                    <Button variant="outline" onClick={() => setShowCreateCall(false)}>
                      Cancel
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Active Calls List */}
            {activeCalls.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No active calls</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeCalls.map((call) => (
                  <Card
                    key={call.id}
                    className={`${getCallColor(call.type)} border-2 ${
                      call.expiresAt - Date.now() < 60000 ? 'animate-pulse' : ''
                    }`}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          {getCallIcon(call.type)}
                          <div>
                            <CardTitle className="text-lg">{call.title}</CardTitle>
                            <CardDescription>{call.location}</CardDescription>
                          </div>
                        </div>
                        <Badge variant={getCallBadgeColor(call.type)}>
                          +${call.bonus}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="space-y-1">
                        <p className="text-sm font-medium">{call.description}</p>
                        <p className="text-sm text-muted-foreground">
                          Customer: {call.customerName}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Phone: {call.customerPhone}
                        </p>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {formatTimeRemaining(call.expiresAt)}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">remaining</span>
                      </div>

                      {currentCompany.settings.bidMode === 'first-come' ? (
                        <Button
                          className="w-full"
                          onClick={() => handleClaimCall(call.id)}
                          disabled={!isOnCall}
                        >
                          {isOnCall ? 'Claim Call' : 'Go On-Call to Claim'}
                        </Button>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            <Input
                              placeholder="Arrival time (e.g., 15 min)"
                              value={bidTime}
                              onChange={(e) => setBidTime(e.target.value)}
                            />
                            <Button onClick={() => handlePlaceBid(call.id)} disabled={!isOnCall}>
                              Bid
                            </Button>
                          </div>
                          {call.bids && call.bids.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {call.bids.length} bid{call.bids.length !== 1 ? 's' : ''} placed
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Billing Tab */}
          <TabsContent value="billing" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Billing & Usage
                </CardTitle>
                <CardDescription>
                  Track your call activity and earnings
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Monthly Summary */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Current Month Summary</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-4 border border-border rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Calls Created</p>
                      <p className="text-2xl font-bold">{callStats.totalCalls}</p>
                    </div>
                    <div className="p-4 border border-border rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Calls Claimed</p>
                      <p className="text-2xl font-bold text-green-500">{callStats.claimedCalls}</p>
                    </div>
                    <div className="p-4 border border-border rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Calls Expired</p>
                      <p className="text-2xl font-bold text-red-500">{callStats.expiredCalls}</p>
                    </div>
                    <div className="p-4 border border-border rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Bonuses Earned</p>
                      <p className="text-2xl font-bold text-yellow-500">${callStats.totalBonusEarned}</p>
                    </div>
                  </div>
                </div>

                {/* Usage Details */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Usage Details</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div>
                        <p className="font-medium">Average Response Time</p>
                        <p className="text-sm text-muted-foreground">How quickly calls are claimed</p>
                      </div>
                      <Badge variant="outline">
                        {callStats.averageResponseTime > 0
                          ? `${callStats.averageResponseTime.toFixed(1)}s`
                          : 'N/A'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div>
                        <p className="font-medium">Success Rate</p>
                        <p className="text-sm text-muted-foreground">Claimed vs Total calls</p>
                      </div>
                      <Badge variant="outline">
                        {callStats.totalCalls > 0
                          ? `${((callStats.claimedCalls / callStats.totalCalls) * 100).toFixed(0)}%`
                          : '0%'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                      <div>
                        <p className="font-medium">Active Team Members</p>
                        <p className="text-sm text-muted-foreground">Currently on-call</p>
                      </div>
                      <Badge variant="outline">{isOnCall ? '1' : '0'}</Badge>
                    </div>
                  </div>
                </div>

                {/* Call Type Breakdown */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Call Type Breakdown</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 border border-red-500/30 bg-red-500/5 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Zap className="w-4 h-4 text-red-500" />
                        <p className="text-sm font-medium">Emergency</p>
                      </div>
                      <p className="text-2xl font-bold">
                        {workCalls.filter((c) => c.type === 'emergency').length}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        ${currentCompany?.settings.emergencyBonus || 0} each
                      </p>
                    </div>
                    <div className="p-4 border border-yellow-500/30 bg-yellow-500/5 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Sun className="w-4 h-4 text-yellow-500" />
                        <p className="text-sm font-medium">Daytime</p>
                      </div>
                      <p className="text-2xl font-bold">
                        {workCalls.filter((c) => c.type === 'daytime').length}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        ${currentCompany?.settings.daytimeBonus || 0} each
                      </p>
                    </div>
                    <div className="p-4 border border-blue-500/30 bg-blue-500/5 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="w-4 h-4 text-blue-500" />
                        <p className="text-sm font-medium">Scheduled</p>
                      </div>
                      <p className="text-2xl font-bold">
                        {workCalls.filter((c) => c.type === 'scheduled').length}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        ${currentCompany?.settings.scheduledBonus || 0} each
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Network Marketplace Tab */}
          <TabsContent value="network" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Company Network
                </CardTitle>
                <CardDescription>
                  Connect with other companies to share overflow work
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Your Network */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Your Linked Companies</h3>
                  {currentCompany && currentCompany.linkedCompanies.length > 0 ? (
                    <div className="space-y-2">
                      {currentCompany.linkedCompanies.map((code) => (
                        <div
                          key={code}
                          className="flex items-center justify-between p-3 border border-border rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Building2 className="w-5 h-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium">{code}</p>
                              <p className="text-sm text-muted-foreground">Linked company</p>
                            </div>
                          </div>
                          <Badge variant="outline">Connected</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 border border-dashed border-border rounded-lg">
                      <Building2 className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                      <p className="text-sm text-muted-foreground mb-4">
                        No linked companies yet
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Link companies to share overflow work and build your network
                      </p>
                    </div>
                  )}
                </div>

                {/* Network Stats */}
                <div>
                  <h3 className="text-sm font-medium mb-3">Network Overview</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 border border-border rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Network Size</p>
                      <p className="text-2xl font-bold">
                        {currentCompany?.linkedCompanies.length || 0}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">Companies linked</p>
                    </div>
                    <div className="p-4 border border-border rounded-lg">
                      <p className="text-xs text-muted-foreground mb-1">Total Members</p>
                      <p className="text-2xl font-bold">{currentCompany?.members.length || 0}</p>
                      <p className="text-xs text-muted-foreground mt-1">In your company</p>
                    </div>
                  </div>
                </div>

                {/* How It Works */}
                <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                  <h3 className="text-sm font-medium mb-2">How the Network Works</h3>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>
                        Share your company code with trusted contractors
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>
                        When you're overbooked, send calls to your network
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>
                        Network members can see and claim calls you share
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-0.5">•</span>
                      <span>Build an infinite network of connected companies</span>
                    </li>
                  </ul>
                </div>

                {/* Call to Action */}
                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    Your company code: <strong>{currentCompany?.code}</strong>
                  </p>
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (currentCompany?.code) {
                        navigator.clipboard.writeText(currentCompany.code)
                      }
                    }}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Company Code to Share
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            {currentCompany.ownerId === userAccount.memberNumber ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Company Settings
                  </CardTitle>
                  <CardDescription>
                    Configure bonuses and timeouts for {currentCompany.name}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Bidding Mode</label>
                    <div className="flex gap-2">
                      <Button
                        variant={currentCompany.settings.bidMode === 'first-come' ? 'default' : 'outline'}
                        onClick={() =>
                          updateCompanySettings(currentCompany.code, { bidMode: 'first-come' })
                        }
                        className="flex-1"
                      >
                        First-Come-First-Served
                      </Button>
                      <Button
                        variant={currentCompany.settings.bidMode === 'bidding' ? 'default' : 'outline'}
                        onClick={() =>
                          updateCompanySettings(currentCompany.code, { bidMode: 'bidding' })
                        }
                        className="flex-1"
                      >
                        Bidding Mode
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-red-500">Emergency Bonus</label>
                      <Input
                        type="number"
                        value={currentCompany.settings.emergencyBonus}
                        onChange={(e) =>
                          updateCompanySettings(currentCompany.code, {
                            emergencyBonus: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-red-500">Emergency Timeout (min)</label>
                      <Input
                        type="number"
                        value={currentCompany.settings.emergencyTimeout}
                        onChange={(e) =>
                          updateCompanySettings(currentCompany.code, {
                            emergencyTimeout: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-yellow-500">Daytime Bonus</label>
                      <Input
                        type="number"
                        value={currentCompany.settings.daytimeBonus}
                        onChange={(e) =>
                          updateCompanySettings(currentCompany.code, {
                            daytimeBonus: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-yellow-500">Daytime Timeout (min)</label>
                      <Input
                        type="number"
                        value={currentCompany.settings.daytimeTimeout}
                        onChange={(e) =>
                          updateCompanySettings(currentCompany.code, {
                            daytimeTimeout: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-blue-500">Scheduled Bonus</label>
                      <Input
                        type="number"
                        value={currentCompany.settings.scheduledBonus}
                        onChange={(e) =>
                          updateCompanySettings(currentCompany.code, {
                            scheduledBonus: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-blue-500">Scheduled Timeout (min)</label>
                      <Input
                        type="number"
                        value={currentCompany.settings.scheduledTimeout}
                        onChange={(e) =>
                          updateCompanySettings(currentCompany.code, {
                            scheduledTimeout: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">
                    Only the company owner can modify settings
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

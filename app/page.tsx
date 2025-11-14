'use client'

import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, Mic, BookOpen, Briefcase, Zap, DollarSign, Star, QrCode } from 'lucide-react'
import Image from 'next/image'
import VoiceInterface from '@/components/voice-interface'
import PhotoAnalysis from '@/components/photo-analysis'
import NECLookup from '@/components/nec-lookup'
import JobsBusiness from '@/components/jobs-business'
import Settings from '@/components/settings'
import GetPaidNow from '@/components/get-paid-now'
import GetReviewsNow from '@/components/get-reviews-now'
import MyContractors from '@/components/my-contractors'
import Estimates from '@/components/estimates'
import WorkOrders from '@/components/work-orders'
import Invoices from '@/components/invoices'
import OnCallIndicator from '@/components/on-call-indicator'
import AccountMenu from '@/components/account-menu'
import CallBidding from '@/components/call-bidding'
import BillingDashboard from '@/components/billing-dashboard'
import NetworkMarketplace from '@/components/network-marketplace'
import { useEffect } from 'react'

export default function Home() {
  const { currentSection, setCurrentSection, loadSettings, ownerSettings } = useAppStore()

  useEffect(() => {
    loadSettings()
  }, [])

  if (currentSection === 'voice') {
    return <VoiceInterface />
  }

  if (currentSection === 'photo') {
    return <PhotoAnalysis />
  }

  if (currentSection === 'nec') {
    return <NECLookup />
  }

  if (currentSection === 'jobs') {
    return <JobsBusiness />
  }

  if (currentSection === 'settings') {
    return <Settings />
  }

  if (currentSection === 'get-paid') {
    return <GetPaidNow />
  }

  if (currentSection === 'get-reviews') {
    return <GetReviewsNow />
  }

  if (currentSection === 'my-contractors') {
    return <MyContractors />
  }

  if (currentSection === 'estimates') {
    return <Estimates />
  }

  if (currentSection === 'work-orders') {
    return <WorkOrders />
  }

  if (currentSection === 'invoices') {
    return <Invoices />
  }

  if (currentSection === 'call-bidding') {
    return <CallBidding />
  }

  if (currentSection === 'billing') {
    return <BillingDashboard />
  }

  if (currentSection === 'network-marketplace') {
    return <NetworkMarketplace />
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 flex items-center justify-center">
                <Image
                  src="/icon.png"
                  alt="AppIo.AI Logo"
                  width={64}
                  height={64}
                  className="object-contain w-full h-full"
                  priority
                />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">AppIo.AI</h1>
                <p className="text-xs text-muted-foreground">Your expert construction assistant</p>
              </div>
            </div>

            {/* Account Menu in Top Right */}
            <AccountMenu />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Hero Section - Large Voice Button */}
        <div className="mb-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
            How can I help you today?
          </h2>
          <p className="text-muted-foreground mb-8">
            Talk to your AI assistant or use the tools below
          </p>

          <Button
            size="xl"
            onClick={() => setCurrentSection('voice')}
            className="w-full max-w-md h-20 text-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
          >
            <Mic className="w-8 h-8 mr-3" />
            Talk to AI Assistant
          </Button>
        </div>

        {/* On-Call Status Indicator - Only if enabled */}
        {ownerSettings.onCallFeatureEnabled && (
          <div className="mb-12">
            <OnCallIndicator />
          </div>
        )}

        {/* Get Paid & Get Reviews - Big Buttons */}
        <div className="mb-12 grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
          <Button
            size="xl"
            onClick={() => setCurrentSection('get-paid')}
            className="h-24 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 bg-green-600 hover:bg-green-700"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <DollarSign className="w-8 h-8" />
                <QrCode className="w-6 h-6" />
              </div>
              <span>Get Paid Now</span>
              <span className="text-xs font-normal opacity-90">Share payment links & QR codes</span>
            </div>
          </Button>

          <Button
            size="xl"
            onClick={() => setCurrentSection('get-reviews')}
            className="h-24 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 bg-yellow-600 hover:bg-yellow-700"
          >
            <div className="flex flex-col items-center gap-2">
              <div className="flex items-center gap-2">
                <Star className="w-8 h-8" />
                <QrCode className="w-6 h-6" />
              </div>
              <span>Get Review Now</span>
              <span className="text-xs font-normal opacity-90">Share review links & QR codes</span>
            </div>
          </Button>
        </div>

        {/* Quick Action Cards */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Photo Analysis Card */}
            <Card
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/50"
              onClick={() => setCurrentSection('photo')}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Camera className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Take Photo</CardTitle>
                    <CardDescription>Analyze electrical work</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Get instant analysis of wiring, panels, and code compliance
                </p>
              </CardContent>
            </Card>

            {/* NEC Lookup Card */}
            <Card
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/50"
              onClick={() => setCurrentSection('nec')}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">NEC Lookup</CardTitle>
                    <CardDescription>Search code references</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Quick access to National Electrical Code sections
                </p>
              </CardContent>
            </Card>

            {/* Jobs & Business Card */}
            <Card
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/50"
              onClick={() => setCurrentSection('jobs')}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Briefcase className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Jobs & Business</CardTitle>
                    <CardDescription>Manage your work</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Track jobs, customers, invoices, and subcontractors
                </p>
              </CardContent>
            </Card>

            {/* Call Bidding Card */}
            <Card
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-yellow-500/50 border-2 border-yellow-500/20 bg-yellow-500/5"
              onClick={() => setCurrentSection('call-bidding')}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-yellow-500 animate-pulse" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Work Call Bidding</CardTitle>
                    <CardDescription className="text-yellow-600 dark:text-yellow-400">
                      Uber-style work claims
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Claim incoming work calls, earn bonuses, and manage team availability
                </p>
              </CardContent>
            </Card>

            {/* Billing Dashboard Card */}
            <Card
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-green-500/50 border-2 border-green-500/20 bg-green-500/5"
              onClick={() => setCurrentSection('billing')}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                    <DollarSign className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Billing</CardTitle>
                    <CardDescription className="text-green-600 dark:text-green-400">
                      Usage & invoices
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Track your usage, fees, and billing history
                </p>
              </CardContent>
            </Card>

            {/* Network Marketplace Card */}
            <Card
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-blue-500/50 border-2 border-blue-500/20 bg-blue-500/5"
              onClick={() => setCurrentSection('network-marketplace')}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Network Marketplace</CardTitle>
                    <CardDescription className="text-blue-600 dark:text-blue-400">
                      Share work with partners
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Join networks and share overflow calls with other contractors
                </p>
              </CardContent>
            </Card>

            {/* Settings Card */}
            <Card
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-primary/50"
              onClick={() => setCurrentSection('settings')}
            >
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Settings</CardTitle>
                    <CardDescription>Configure API keys</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Manage API keys and integrations
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Info Banner */}
        <div className="mt-12 p-6 rounded-xl bg-primary/5 border border-primary/20">
          <h3 className="font-semibold text-foreground mb-2">
            🔧 Getting Started
          </h3>
          <p className="text-sm text-muted-foreground">
            This app uses VAPI for voice AI and Claude for visual analysis.
            You'll need to provide your API keys to enable full functionality.
            All processing happens securely and your keys are stored only in your browser session.
          </p>
        </div>
      </main>
    </div>
  )
}

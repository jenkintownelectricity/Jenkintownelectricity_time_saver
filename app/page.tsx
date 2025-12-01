'use client'
// Updated: 2025-11-19 - Lead sharing and integrations deployed

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
import CompanySwitcher from '@/components/company-switcher'
import CompanyManagement from '@/components/company-management'
import { useEffect } from 'react'
import { motion } from 'framer-motion'

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

  if (currentSection === 'company-management') {
    return <CompanyManagement />
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Gradient Mesh Background */}
      <div className="fixed inset-0 gradient-mesh opacity-40 pointer-events-none" />

      {/* Header with Glassmorphism */}
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="border-b border-border/50 glass-dark sticky top-0 z-10"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.div
              className="flex items-center gap-3"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
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
            </motion.div>

            <div className="flex items-center gap-3">
              {/* Company Switcher */}
              <CompanySwitcher />

              {/* Account Menu */}
              <AccountMenu />
            </div>
          </div>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-4xl relative z-1">
        {/* Hero Section - Large Voice Button */}
        <motion.div
          className="mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.h2
            className="text-2xl md:text-4xl font-bold text-foreground mb-3"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            How can I help you{' '}
            <span className="gradient-text">today</span>?
          </motion.h2>
          <motion.p
            className="text-muted-foreground mb-8 text-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Talk to your AI assistant or use the tools below
          </motion.p>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Button
              size="xl"
              onClick={() => setCurrentSection('voice')}
              className="w-full max-w-md h-20 text-xl font-semibold glass-card border-primary/30 hover:border-primary/50 glow-hover relative overflow-hidden group"
            >
              <motion.div
                className="absolute inset-0 gradient-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                initial={false}
              />
              <motion.div
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="relative z-10"
              >
                <Mic className="w-8 h-8 mr-3 inline" />
              </motion.div>
              <span className="relative z-10">Talk to AI Assistant</span>
            </Button>
          </motion.div>
        </motion.div>

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
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <motion.h3
            className="text-lg font-semibold text-foreground mb-4"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
          >
            Quick Actions
          </motion.h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Photo Analysis Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className="cursor-pointer glass-card border-primary/20 hover:border-primary/50 transition-all duration-300 glow-hover group h-full"
                onClick={() => setCurrentSection('photo')}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Camera className="w-6 h-6 text-primary-foreground" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">Take Photo</CardTitle>
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
            </motion.div>

            {/* NEC Lookup Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.9 }}
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className="cursor-pointer glass-card border-primary/20 hover:border-primary/50 transition-all duration-300 glow-hover group h-full"
                onClick={() => setCurrentSection('nec')}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <BookOpen className="w-6 h-6 text-primary-foreground" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">NEC Lookup</CardTitle>
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
            </motion.div>

            {/* Jobs & Business Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.0 }}
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className="cursor-pointer glass-card border-primary/20 hover:border-primary/50 transition-all duration-300 glow-hover group h-full"
                onClick={() => setCurrentSection('jobs')}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Briefcase className="w-6 h-6 text-primary-foreground" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">Jobs & Business</CardTitle>
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
            </motion.div>

            {/* Work Call Bidding Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.1 }}
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className="cursor-pointer glass-card border-yellow-500/30 hover:border-yellow-500/60 transition-all duration-300 hover:shadow-[0_0_30px_rgba(234,179,8,0.3)] group h-full"
                onClick={() => setCurrentSection('call-bidding')}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="w-12 h-12 rounded-lg bg-gradient-to-br from-yellow-500 to-orange-500 flex items-center justify-center"
                      animate={{
                        boxShadow: [
                          '0 0 20px rgba(234, 179, 8, 0.4)',
                          '0 0 40px rgba(234, 179, 8, 0.6)',
                          '0 0 20px rgba(234, 179, 8, 0.4)'
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Zap className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-lg group-hover:text-yellow-500 transition-colors">Work Call Bidding</CardTitle>
                      <CardDescription>Uber-style job claims</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Claim emergency, daytime & scheduled calls with bonuses
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Billing Dashboard Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.1 }}
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className="cursor-pointer glass-card border-green-500/20 hover:border-green-500/50 transition-all duration-300 glow-hover group h-full"
                onClick={() => setCurrentSection('billing')}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="w-12 h-12 rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center"
                      animate={{
                        boxShadow: [
                          '0 0 20px rgba(34, 197, 94, 0.4)',
                          '0 0 40px rgba(34, 197, 94, 0.6)',
                          '0 0 20px rgba(34, 197, 94, 0.4)'
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <DollarSign className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-lg group-hover:text-green-500 transition-colors">Billing</CardTitle>
                      <CardDescription>Usage & invoices</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Track your usage, fees, and billing history
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Network Marketplace Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.15 }}
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className="cursor-pointer glass-card border-blue-500/20 hover:border-blue-500/50 transition-all duration-300 glow-hover group h-full"
                onClick={() => setCurrentSection('network-marketplace')}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center"
                      animate={{
                        boxShadow: [
                          '0 0 20px rgba(59, 130, 246, 0.4)',
                          '0 0 40px rgba(59, 130, 246, 0.6)',
                          '0 0 20px rgba(59, 130, 246, 0.4)'
                        ]
                      }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Zap className="w-6 h-6 text-white" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-lg group-hover:text-blue-500 transition-colors">Network Marketplace</CardTitle>
                      <CardDescription>Share work with partners</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Join networks and share overflow calls with other contractors
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Settings Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.2 }}
              whileHover={{ scale: 1.03, y: -5 }}
              whileTap={{ scale: 0.98 }}
            >
              <Card
                className="cursor-pointer glass-card border-primary/20 hover:border-primary/50 transition-all duration-300 glow-hover group h-full"
                onClick={() => setCurrentSection('settings')}
              >
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <motion.div
                      className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.5 }}
                    >
                      <Zap className="w-6 h-6 text-primary-foreground" />
                    </motion.div>
                    <div>
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">Settings</CardTitle>
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
            </motion.div>
          </div>
        </motion.div>

        {/* Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.3 }}
          className="mt-12 p-6 rounded-xl glass-card border border-primary/20"
        >
          <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
            <motion.span
              animate={{ rotate: [0, 10, -10, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              🔧
            </motion.span>
            Getting Started
          </h3>
          <p className="text-sm text-muted-foreground">
            This app uses VAPI for voice AI and Claude for visual analysis.
            You'll need to provide your API keys to enable full functionality.
            All processing happens securely and your keys are stored only in your browser session.
          </p>
        </motion.div>
      </main>
    </div>
  )
}

'use client'

import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Camera, Mic, BookOpen, Briefcase, Zap } from 'lucide-react'
import VoiceInterface from '@/components/voice-interface'
import PhotoAnalysis from '@/components/photo-analysis'
import NECLookup from '@/components/nec-lookup'
import JobsBusiness from '@/components/jobs-business'
import Settings from '@/components/settings'
import WorkCallBidding from '@/components/work-call-bidding'
import AccountMenu from '@/components/account-menu'
import { useEffect } from 'react'
import { motion } from 'framer-motion'

export default function Home() {
  const { currentSection, setCurrentSection, loadSettings } = useAppStore()

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

  if (currentSection === 'work-calls') {
    return <WorkCallBidding />
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
              <motion.div
                className="w-10 h-10 rounded-lg gradient-primary flex items-center justify-center glow-primary"
                animate={{
                  boxShadow: [
                    '0 0 20px hsla(217, 91%, 60%, 0.4)',
                    '0 0 40px hsla(217, 91%, 60%, 0.6)',
                    '0 0 20px hsla(217, 91%, 60%, 0.4)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Zap className="w-6 h-6 text-primary-foreground" />
              </motion.div>
              <div>
                <h1 className="text-xl font-bold text-foreground">AppIo.AI</h1>
                <p className="text-xs text-muted-foreground">Your expert construction assistant</p>
              </div>
            </motion.div>
            <AccountMenu />
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
                onClick={() => setCurrentSection('work-calls')}
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

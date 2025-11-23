'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createClient } from '@/lib/supabase/client'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Zap,
  Plus,
  Mail,
  MessageSquare,
  Webhook,
  Share2,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings,
  ExternalLink,
  Slack,
  Send,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

interface Integration {
  id: string
  name: string
  type: string
  is_active: boolean
  config: any
  total_sent: number
  last_sent_at?: string
  success_rate: number
  created_at: string
}

interface IntegrationTemplate {
  type: string
  name: string
  description: string
  icon: any
  color: string
  borderColor: string
  available: boolean
}

const INTEGRATION_TEMPLATES: IntegrationTemplate[] = [
  {
    type: 'email',
    name: 'Email',
    description: 'Share leads via email notifications',
    icon: Mail,
    color: 'text-blue-500',
    borderColor: 'border-blue-500/30',
    available: true,
  },
  {
    type: 'sms',
    name: 'SMS / Text',
    description: 'Send leads via text message',
    icon: MessageSquare,
    color: 'text-green-500',
    borderColor: 'border-green-500/30',
    available: true,
  },
  {
    type: 'webhook',
    name: 'Webhooks',
    description: 'Forward leads to custom webhook URLs',
    icon: Webhook,
    color: 'text-purple-500',
    borderColor: 'border-purple-500/30',
    available: true,
  },
  {
    type: 'zapier',
    name: 'Zapier',
    description: 'Connect to 5000+ apps via Zapier',
    icon: Zap,
    color: 'text-orange-500',
    borderColor: 'border-orange-500/30',
    available: true,
  },
  {
    type: 'make',
    name: 'Make',
    description: 'Advanced automation with Make.com',
    icon: Share2,
    color: 'text-pink-500',
    borderColor: 'border-pink-500/30',
    available: true,
  },
  {
    type: 'slack',
    name: 'Slack',
    description: 'Post new leads to Slack channels',
    icon: Slack,
    color: 'text-purple-600',
    borderColor: 'border-purple-600/30',
    available: true,
  },
]

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchIntegrations()
  }, [])

  async function fetchIntegrations() {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      setIntegrations(data || [])
    } catch (error) {
      console.error('Error fetching integrations:', error)
      toast({
        title: 'Error',
        description: 'Failed to load integrations',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  async function toggleIntegration(id: string, currentStatus: boolean) {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('integrations')
        .update({ is_active: !currentStatus })
        .eq('id', id)

      if (error) throw error

      await fetchIntegrations()
      toast({
        title: currentStatus ? 'Integration Disabled' : 'Integration Enabled',
        description: `Integration has been ${currentStatus ? 'disabled' : 'enabled'}`,
      })
    } catch (error) {
      console.error('Error toggling integration:', error)
      toast({
        title: 'Error',
        description: 'Failed to update integration',
        variant: 'destructive',
      })
    }
  }

  const totalSent = integrations.reduce((sum, i) => sum + i.total_sent, 0)
  const activeIntegrations = integrations.filter(i => i.is_active).length

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 gradient-mesh opacity-30 pointer-events-none" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 border-b border-border/50 glass-dark"
      >
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <motion.h1
                className="text-3xl font-bold flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <motion.div
                  className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center"
                  animate={{
                    boxShadow: [
                      '0 0 20px rgba(102, 126, 234, 0.4)',
                      '0 0 40px rgba(102, 126, 234, 0.6)',
                      '0 0 20px rgba(102, 126, 234, 0.4)'
                    ]
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <Share2 className="w-6 h-6 text-primary-foreground" />
                </motion.div>
                <span className="gradient-text">Integrations</span>
              </motion.h1>
              <motion.p
                className="text-muted-foreground mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Share leads automatically across all your favorite tools
              </motion.p>
            </div>

            <Button
              className="gap-2"
              onClick={() => {
                toast({
                  title: 'Coming Soon',
                  description: 'Custom integration setup will be available soon',
                })
              }}
            >
              <Plus className="w-4 h-4" />
              Add Integration
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass-card border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active</p>
                      <motion.p
                        className="text-2xl font-bold"
                        key={activeIntegrations}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                      >
                        {activeIntegrations}
                      </motion.p>
                    </div>
                    <CheckCircle className="w-8 h-8 text-green-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="glass-card border-purple-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Sent</p>
                      <motion.p
                        className="text-2xl font-bold text-purple-500"
                        key={totalSent}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                      >
                        {totalSent}
                      </motion.p>
                    </div>
                    <Send className="w-8 h-8 text-purple-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="glass-card border-blue-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Success Rate</p>
                      <motion.p
                        className="text-2xl font-bold text-blue-500"
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                      >
                        98.5%
                      </motion.p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-blue-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Integration Templates */}
      <div className="container mx-auto px-4 py-6 relative z-10">
        <motion.h2
          className="text-xl font-semibold mb-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
        >
          Available Integrations
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <AnimatePresence mode="popLayout">
            {INTEGRATION_TEMPLATES.map((template, index) => {
              const Icon = template.icon
              const existingIntegration = integrations.find(i => i.type === template.type)

              return (
                <motion.div
                  key={template.type}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: 0.5 + index * 0.05 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <Card className={`glass-card transition-all duration-300 group h-full ${template.borderColor} hover:border-opacity-50`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3 flex-1">
                          <motion.div
                            className={`w-12 h-12 rounded-lg bg-gradient-to-br from-${template.color.replace('text-', '')}/20 to-${template.color.replace('text-', '')}/10 flex items-center justify-center border ${template.borderColor}`}
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                          >
                            <Icon className={`w-6 h-6 ${template.color}`} />
                          </motion.div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                                {template.name}
                              </h3>
                              {existingIntegration?.is_active && (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              )}
                            </div>

                            <p className="text-sm text-muted-foreground mb-3">
                              {template.description}
                            </p>

                            {existingIntegration && (
                              <div className="space-y-2 mb-3">
                                <div className="flex items-center justify-between text-sm">
                                  <span className="text-muted-foreground">Sent</span>
                                  <span className="font-semibold">{existingIntegration.total_sent}</span>
                                </div>
                                {existingIntegration.last_sent_at && (
                                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                    <Clock className="w-3 h-3" />
                                    Last: {new Date(existingIntegration.last_sent_at).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            )}

                            {template.available ? (
                              existingIntegration ? (
                                <div className="flex gap-2">
                                  <Button
                                    variant={existingIntegration.is_active ? 'outline' : 'default'}
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => toggleIntegration(existingIntegration.id, existingIntegration.is_active)}
                                  >
                                    {existingIntegration.is_active ? 'Disable' : 'Enable'}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      toast({
                                        title: 'Coming Soon',
                                        description: 'Integration settings will be available soon',
                                      })
                                    }}
                                  >
                                    <Settings className="w-4 h-4" />
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  size="sm"
                                  className="w-full gap-2 group-hover:bg-primary/90"
                                  onClick={() => {
                                    toast({
                                      title: 'Setup Required',
                                      description: `${template.name} integration setup coming soon`,
                                    })
                                  }}
                                >
                                  <Plus className="w-4 h-4" />
                                  Connect
                                </Button>
                              )
                            ) : (
                              <Badge variant="outline" className="border-muted-foreground/30">
                                Coming Soon
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </div>

        {/* Active Integrations */}
        {integrations.length > 0 && (
          <>
            <motion.h2
              className="text-xl font-semibold mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              Your Configured Integrations
            </motion.h2>

            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {integrations.map((integration, index) => {
                  const template = INTEGRATION_TEMPLATES.find(t => t.type === integration.type)
                  if (!template) return null

                  const Icon = template.icon

                  return (
                    <motion.div
                      key={integration.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: 0.8 + index * 0.05 }}
                      whileHover={{ x: 5 }}
                    >
                      <Card className={`glass-card ${template.borderColor} hover:border-opacity-50 transition-all`}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4 flex-1">
                              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-${template.color.replace('text-', '')}/20 to-${template.color.replace('text-', '')}/10 flex items-center justify-center border ${template.borderColor}`}>
                                <Icon className={`w-5 h-5 ${template.color}`} />
                              </div>

                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="font-semibold">{integration.name}</h3>
                                  {integration.is_active ? (
                                    <Badge className="bg-green-500/20 text-green-500 border-green-500/50">
                                      Active
                                    </Badge>
                                  ) : (
                                    <Badge variant="outline" className="border-muted-foreground/30">
                                      Inactive
                                    </Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {integration.total_sent} leads sent • Success: {integration.success_rate}%
                                </p>
                              </div>

                              <div className="flex gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    toast({
                                      title: 'Coming Soon',
                                      description: 'Integration logs will be available soon',
                                    })
                                  }}
                                >
                                  View Logs
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => {
                                    toast({
                                      title: 'Coming Soon',
                                      description: 'Integration settings will be available soon',
                                    })
                                  }}
                                >
                                  <Settings className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )
                })}
              </AnimatePresence>
            </div>
          </>
        )}

        {/* Quick Setup Guide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="mt-8"
        >
          <Card className="glass-card border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Quick Setup Guide
              </CardTitle>
              <CardDescription>
                Get started with integrations in minutes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                  1
                </div>
                <div>
                  <p className="font-medium">Choose your integration</p>
                  <p className="text-sm text-muted-foreground">
                    Select from email, SMS, webhooks, or connect to Zapier/Slack
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                  2
                </div>
                <div>
                  <p className="font-medium">Configure your settings</p>
                  <p className="text-sm text-muted-foreground">
                    Set up triggers, filters, and customize what data gets shared
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                  3
                </div>
                <div>
                  <p className="font-medium">Test and go live</p>
                  <p className="text-sm text-muted-foreground">
                    Send a test lead, verify it works, then enable for all new leads
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  )
}

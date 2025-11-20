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
  Phone,
  Plus,
  Settings,
  TrendingUp,
  Zap,
  Clock,
  Users,
  CheckCircle,
  AlertCircle,
  Copy,
  ExternalLink,
  Bot,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { useToast } from '@/components/ui/use-toast'
import { useAppStore } from '@/lib/store'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import Link from 'next/link'

interface PhoneNumber {
  id: string
  phone_number: string
  name: string
  description?: string
  department?: string
  assigned_to?: string
  is_active: boolean
  is_emergency_line: boolean
  total_calls: number
  total_leads_generated: number
  last_call_at?: string
  tags: string[]
}

const AGENT_INFO = {
  electrical: {
    name: 'Electrical/HVAC/Plumbing Specialist',
    emoji: '⚡',
    description: 'Expert diagnostics, instant pricing, safety-first protocols',
    bestFor: 'Service calls, emergencies, repairs',
  },
  restoration: {
    name: 'Home Restoration Specialist',
    emoji: '🏠',
    description: 'Empathetic crisis management, insurance navigation',
    bestFor: 'Water/fire damage, mold, storms',
  },
  office: {
    name: 'Office Assistant',
    emoji: '💼',
    description: 'Scheduling, billing, customer service',
    bestFor: 'General inquiries, appointments, follow-ups',
  },
  sales: {
    name: 'Sales Specialist',
    emoji: '💰',
    description: 'SPIN selling, objection handling, closing techniques',
    bestFor: 'High-value quotes, competitive situations',
  },
}

export default function HiVE215ConfigPage() {
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([])
  const [loading, setLoading] = useState(true)
  const [webhookUrl, setWebhookUrl] = useState('')
  const { toast } = useToast()
  const { apiKeys, setApiKey } = useAppStore()

  useEffect(() => {
    fetchPhoneNumbers()
    setWebhookUrl(window.location.origin + '/api/webhooks/hive215')
  }, [])

  async function fetchPhoneNumbers() {
    try {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('hive215_phone_numbers')
        .select('*')
        .order('is_emergency_line', { ascending: false })
        .order('created_at', { ascending: true })

      if (error) throw error

      setPhoneNumbers(data || [])
    } catch (error) {
      console.error('Error fetching phone numbers:', error)
      toast({
        title: 'Error',
        description: 'Failed to load phone numbers',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  function copyWebhookUrl() {
    navigator.clipboard.writeText(webhookUrl)
    toast({
      title: 'Copied!',
      description: 'Webhook URL copied to clipboard',
    })
  }

  const totalCalls = phoneNumbers.reduce((sum, pn) => sum + pn.total_calls, 0)
  const totalLeads = phoneNumbers.reduce((sum, pn) => sum + pn.total_leads_generated, 0)
  const activeNumbers = phoneNumbers.filter(pn => pn.is_active).length
  const emergencyLines = phoneNumbers.filter(pn => pn.is_emergency_line).length

  const currentAgent = apiKeys.vapiAgentType || 'electrical'
  const agentInfo = AGENT_INFO[currentAgent as keyof typeof AGENT_INFO]

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
                  <Phone className="w-6 h-6 text-primary-foreground" />
                </motion.div>
                <span className="gradient-text">HiVE215</span> Integration
              </motion.h1>
              <motion.p
                className="text-muted-foreground mt-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Manage your 10 phone numbers and call routing
              </motion.p>
            </div>

            <Button
              className="gap-2"
              onClick={() => {
                toast({
                  title: 'Coming Soon',
                  description: 'Phone number creation will be available soon',
                })
              }}
            >
              <Plus className="w-4 h-4" />
              Add Phone Number
            </Button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card className="glass-card border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Active Lines</p>
                      <motion.p
                        className="text-2xl font-bold"
                        key={activeNumbers}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                      >
                        {activeNumbers}/10
                      </motion.p>
                    </div>
                    <Phone className="w-8 h-8 text-primary opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card className="glass-card border-green-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Total Calls</p>
                      <motion.p
                        className="text-2xl font-bold text-green-500"
                        key={totalCalls}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                      >
                        {totalCalls}
                      </motion.p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-green-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="glass-card border-purple-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Leads Created</p>
                      <motion.p
                        className="text-2xl font-bold text-purple-500"
                        key={totalLeads}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                      >
                        {totalLeads}
                      </motion.p>
                    </div>
                    <Users className="w-8 h-8 text-purple-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="glass-card border-red-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Emergency</p>
                      <motion.p
                        className="text-2xl font-bold text-red-500"
                        key={emergencyLines}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                      >
                        {emergencyLines}
                      </motion.p>
                    </div>
                    <Zap className="w-8 h-8 text-red-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* AI Agent Configuration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-6"
          >
            <Card className="glass-card border-primary/20 bg-gradient-to-br from-blue-50/50 to-purple-50/50">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Bot className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Active AI Agent for HiVE215 Calls
                        {apiKeys.vapi && apiKeys.vapiAssistantId ? (
                          <Badge variant="default" className="gap-1">Connected</Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1">Not Configured</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        This agent handles all incoming calls from your HiVE215 phone numbers
                      </CardDescription>
                    </div>
                  </div>
                  <Link href="/settings?tab=api-keys">
                    <Button variant="outline" size="sm">
                      <Settings className="w-4 h-4 mr-2" />
                      Configure
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select AI Agent Type</label>
                  <Select
                    value={currentAgent}
                    onValueChange={(value) => setApiKey('vapiAgentType', value)}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="electrical">
                        ⚡ Electrical/HVAC/Plumbing Specialist
                      </SelectItem>
                      <SelectItem value="restoration">
                        🏠 Home Restoration Specialist
                      </SelectItem>
                      <SelectItem value="office">
                        💼 Office Assistant
                      </SelectItem>
                      <SelectItem value="sales">
                        💰 Sales Specialist
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {agentInfo && (
                  <div className="p-4 bg-white/50 rounded-lg border border-primary/10">
                    <div className="flex items-start gap-3">
                      <span className="text-3xl">{agentInfo.emoji}</span>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{agentInfo.name}</h4>
                        <p className="text-sm text-muted-foreground mb-2">
                          {agentInfo.description}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          <strong>Best for:</strong> {agentInfo.bestFor}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-2">
                  <Zap className="w-4 h-4 text-blue-500" />
                  <p className="text-xs text-muted-foreground">
                    Agent applies to all HiVE215 phone numbers. Configure VAPI settings in{' '}
                    <Link href="/settings?tab=api-keys" className="text-primary hover:underline">
                      Settings → API Keys
                    </Link>
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Webhook Configuration */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
          >
            <Card className="glass-card border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Webhook Configuration
                </CardTitle>
                <CardDescription>
                  Configure HiVE215 to send calls to this endpoint
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Webhook URL</label>
                  <div className="flex gap-2">
                    <Input
                      value={webhookUrl}
                      readOnly
                      className="glass-card border-primary/20 font-mono text-sm"
                    />
                    <Button variant="outline" size="icon" onClick={copyWebhookUrl}>
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => window.open(webhookUrl, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Integration Steps:
                  </h4>
                  <ol className="space-y-2 text-sm text-muted-foreground">
                    <li>1. Copy the webhook URL above</li>
                    <li>2. Go to HiVE215 settings → Integrations → Webhooks</li>
                    <li>3. Paste the URL and select events: call.completed, call.missed</li>
                    <li>4. Add header: x-hive215-secret with your secret key</li>
                    <li>5. Test the connection by making a test call</li>
                  </ol>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </motion.div>

      {/* Phone Numbers List */}
      <div className="container mx-auto px-4 py-6 relative z-10">
        <motion.h2
          className="text-xl font-semibold mb-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.7 }}
        >
          Your Phone Numbers
        </motion.h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.1 }}
              >
                <Card className="glass-card skeleton h-48" />
              </motion.div>
            ))}
          </div>
        ) : phoneNumbers.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <Card className="glass-card max-w-md mx-auto p-8">
              <Phone className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No phone numbers yet</h3>
              <p className="text-muted-foreground mb-4">
                Add your first phone number to start receiving calls
              </p>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Phone Number
              </Button>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence mode="popLayout">
              {phoneNumbers.map((phoneNumber, index) => (
                <motion.div
                  key={phoneNumber.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ scale: 1.02, y: -5 }}
                >
                  <Card className={`glass-card transition-all duration-300 group h-full ${
                    phoneNumber.is_emergency_line
                      ? 'border-red-500/30 hover:border-red-500/50'
                      : 'border-primary/20 hover:border-primary/40'
                  }`}>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-start gap-3 flex-1">
                          <motion.div
                            className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                              phoneNumber.is_emergency_line
                                ? 'bg-gradient-to-br from-red-500 to-orange-500'
                                : 'gradient-primary'
                            }`}
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.5 }}
                          >
                            {phoneNumber.is_emergency_line ? (
                              <Zap className="w-6 h-6 text-white" />
                            ) : (
                              <Phone className="w-6 h-6 text-primary-foreground" />
                            )}
                          </motion.div>

                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                                {phoneNumber.name}
                              </h3>
                              {phoneNumber.is_active ? (
                                <CheckCircle className="w-4 h-4 text-green-500" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-red-500" />
                              )}
                            </div>

                            <p className="text-sm font-mono text-muted-foreground mb-2">
                              {phoneNumber.phone_number}
                            </p>

                            {phoneNumber.description && (
                              <p className="text-sm text-muted-foreground mb-2">
                                {phoneNumber.description}
                              </p>
                            )}

                            <div className="flex flex-wrap gap-2 mb-3">
                              {phoneNumber.department && (
                                <Badge variant="outline" className="border-primary/30">
                                  {phoneNumber.department}
                                </Badge>
                              )}
                              {phoneNumber.is_emergency_line && (
                                <Badge className="bg-red-500/20 text-red-500 border-red-500/50">
                                  Emergency
                                </Badge>
                              )}
                              {phoneNumber.tags.map((tag) => (
                                <Badge key={tag} variant="outline" className="border-primary/20">
                                  {tag}
                                </Badge>
                              ))}
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Total Calls</p>
                                <p className="text-lg font-semibold">
                                  {phoneNumber.total_calls}
                                </p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Leads</p>
                                <p className="text-lg font-semibold text-purple-500">
                                  {phoneNumber.total_leads_generated}
                                </p>
                              </div>
                            </div>

                            {phoneNumber.last_call_at && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground mt-2">
                                <Clock className="w-4 h-4" />
                                Last call: {new Date(phoneNumber.last_call_at).toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2 group-hover:border-primary group-hover:bg-primary/10"
                        onClick={() => {
                          toast({
                            title: 'Coming Soon',
                            description: 'Phone number settings will be available soon',
                          })
                        }}
                      >
                        <Settings className="w-4 h-4" />
                        Configure
                      </Button>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  )
}

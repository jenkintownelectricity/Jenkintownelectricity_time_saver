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
  Mail,
  MapPin,
  Clock,
  TrendingUp,
  User,
  Zap,
  Filter,
  Search,
  ChevronRight,
  Star,
  Calendar,
  DollarSign,
  Tag,
  ExternalLink,
  Share2,
  Copy,
  MessageSquare,
  Webhook,
  Link2,
  X,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'

interface Lead {
  id: string
  full_name?: string
  email?: string
  phone?: string
  company_name?: string
  source: string
  status: string
  priority: string
  service_requested?: string
  project_description?: string
  estimated_budget?: number
  lead_score: number
  tags: string[]
  created_at: string
  vapi_call_id?: string
  webhook_source?: string
}

const priorityColors = {
  urgent: 'bg-red-500/20 text-red-500 border-red-500/50',
  high: 'bg-orange-500/20 text-orange-500 border-orange-500/50',
  medium: 'bg-blue-500/20 text-blue-500 border-blue-500/50',
  low: 'bg-gray-500/20 text-gray-500 border-gray-500/50',
}

const statusColors = {
  new: 'bg-green-500/20 text-green-500 border-green-500/50',
  contacted: 'bg-blue-500/20 text-blue-500 border-blue-500/50',
  qualified: 'bg-purple-500/20 text-purple-500 border-purple-500/50',
  quoted: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50',
  converted: 'bg-green-600/20 text-green-600 border-green-600/50',
  lost: 'bg-red-500/20 text-red-500 border-red-500/50',
  spam: 'bg-gray-500/20 text-gray-500 border-gray-500/50',
}

const sourceIcons = {
  webhook: ExternalLink,
  vapi_call: Phone,
  website_form: Mail,
  referral: User,
  manual: User,
  other: Star,
}

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [shareDialogOpen, setShareDialogOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [sharing, setSharing] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchLeads()
  }, [])

  async function fetchLeads() {
    try {
      const supabase = createClient()
      let query = supabase
        .from('leads')
        .select('*')
        .order('created_at', { ascending: false })

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      if (priorityFilter !== 'all') {
        query = query.eq('priority', priorityFilter)
      }

      if (sourceFilter !== 'all') {
        query = query.eq('source', sourceFilter)
      }

      const { data, error } = await query

      if (error) throw error

      setLeads(data || [])
    } catch (error) {
      console.error('Error fetching leads:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [statusFilter, priorityFilter, sourceFilter])

  async function shareLead(type: 'email' | 'sms' | 'webhook' | 'link', destination?: string) {
    if (!selectedLead) return

    setSharing(true)
    try {
      const payload: any = {
        type,
        includeFields: ['full_name', 'email', 'phone', 'service_requested', 'project_description', 'estimated_budget'],
      }

      if (destination) {
        payload.to = destination
      }

      const response = await fetch(`/api/leads/${selectedLead.id}/share`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (data.success) {
        toast({
          title: 'Lead Shared!',
          description: data.message || 'Lead has been shared successfully',
        })

        if (type === 'link' && data.share_url) {
          await navigator.clipboard.writeText(data.share_url)
          toast({
            title: 'Link Copied!',
            description: 'Share link has been copied to clipboard',
          })
        }

        setShareDialogOpen(false)
      } else {
        throw new Error(data.error || 'Failed to share lead')
      }
    } catch (error: any) {
      console.error('Error sharing lead:', error)
      toast({
        title: 'Error',
        description: error.message || 'Failed to share lead',
        variant: 'destructive',
      })
    } finally {
      setSharing(false)
    }
  }

  function openShareDialog(lead: Lead) {
    setSelectedLead(lead)
    setShareDialogOpen(true)
  }

  const filteredLeads = leads.filter(lead => {
    if (!searchQuery) return true
    const query = searchQuery.toLowerCase()
    return (
      lead.full_name?.toLowerCase().includes(query) ||
      lead.email?.toLowerCase().includes(query) ||
      lead.phone?.includes(query) ||
      lead.company_name?.toLowerCase().includes(query) ||
      lead.service_requested?.toLowerCase().includes(query)
    )
  })

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    urgent: leads.filter(l => l.priority === 'urgent').length,
    avgScore: leads.length > 0
      ? Math.round(leads.reduce((sum, l) => sum + l.lead_score, 0) / leads.length)
      : 0,
  }

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
                className="text-3xl font-bold"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                Lead <span className="gradient-text">Management</span>
              </motion.h1>
              <motion.p
                className="text-muted-foreground mt-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                Track and manage your leads from all sources
              </motion.p>
            </div>
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
                      <p className="text-sm text-muted-foreground">Total Leads</p>
                      <motion.p
                        className="text-2xl font-bold"
                        key={stats.total}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                      >
                        {stats.total}
                      </motion.p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-primary opacity-50" />
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
                      <p className="text-sm text-muted-foreground">New</p>
                      <motion.p
                        className="text-2xl font-bold text-green-500"
                        key={stats.new}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                      >
                        {stats.new}
                      </motion.p>
                    </div>
                    <Star className="w-8 h-8 text-green-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="glass-card border-red-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Urgent</p>
                      <motion.p
                        className="text-2xl font-bold text-red-500"
                        key={stats.urgent}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                      >
                        {stats.urgent}
                      </motion.p>
                    </div>
                    <Zap className="w-8 h-8 text-red-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="glass-card border-purple-500/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Avg Score</p>
                      <motion.p
                        className="text-2xl font-bold text-purple-500"
                        key={stats.avgScore}
                        initial={{ scale: 1.2 }}
                        animate={{ scale: 1 }}
                      >
                        {stats.avgScore}
                      </motion.p>
                    </div>
                    <TrendingUp className="w-8 h-8 text-purple-500 opacity-50" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Filters */}
          <motion.div
            className="flex flex-col md:flex-row gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 glass-card border-primary/20"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-40 glass-card border-primary/20">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="contacted">Contacted</SelectItem>
                <SelectItem value="qualified">Qualified</SelectItem>
                <SelectItem value="quoted">Quoted</SelectItem>
                <SelectItem value="converted">Converted</SelectItem>
                <SelectItem value="lost">Lost</SelectItem>
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger className="w-full md:w-40 glass-card border-primary/20">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="w-full md:w-40 glass-card border-primary/20">
                <SelectValue placeholder="Source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sources</SelectItem>
                <SelectItem value="webhook">Webhook</SelectItem>
                <SelectItem value="vapi_call">Phone Call</SelectItem>
                <SelectItem value="website_form">Website</SelectItem>
                <SelectItem value="referral">Referral</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
              </SelectContent>
            </Select>
          </motion.div>
        </div>
      </motion.div>

      {/* Leads List */}
      <div className="container mx-auto px-4 py-6 relative z-10">
        {loading ? (
          <div className="grid grid-cols-1 gap-4">
            {[1, 2, 3].map((i) => (
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
        ) : filteredLeads.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="text-center py-12"
          >
            <Card className="glass-card max-w-md mx-auto p-8">
              <Star className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-xl font-semibold mb-2">No leads yet</h3>
              <p className="text-muted-foreground">
                Leads from webhooks and phone calls will appear here
              </p>
            </Card>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <AnimatePresence mode="popLayout">
              {filteredLeads.map((lead, index) => {
                const SourceIcon = sourceIcons[lead.source as keyof typeof sourceIcons] || Star
                return (
                  <motion.div
                    key={lead.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ scale: 1.01, y: -2 }}
                  >
                    <Card className="glass-card border-primary/20 hover:border-primary/40 transition-all duration-300 cursor-pointer group">
                      <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                          {/* Lead Info */}
                          <div className="flex-1">
                            <div className="flex items-start gap-3 mb-3">
                              <motion.div
                                className="w-12 h-12 rounded-lg gradient-primary flex items-center justify-center"
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.5 }}
                              >
                                <SourceIcon className="w-6 h-6 text-primary-foreground" />
                              </motion.div>

                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                                    {lead.full_name || 'Unknown'}
                                  </h3>
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    className="flex items-center gap-1 px-2 py-1 rounded-full bg-purple-500/20 border border-purple-500/50"
                                  >
                                    <Star className="w-3 h-3 text-purple-500" />
                                    <span className="text-xs font-semibold text-purple-500">
                                      {lead.lead_score}
                                    </span>
                                  </motion.div>
                                </div>

                                {lead.company_name && (
                                  <p className="text-sm text-muted-foreground mb-2">
                                    {lead.company_name}
                                  </p>
                                )}

                                <div className="flex flex-wrap gap-2 mb-2">
                                  <Badge className={priorityColors[lead.priority as keyof typeof priorityColors]}>
                                    {lead.priority}
                                  </Badge>
                                  <Badge className={statusColors[lead.status as keyof typeof statusColors]}>
                                    {lead.status}
                                  </Badge>
                                  {lead.tags.map((tag) => (
                                    <Badge key={tag} variant="outline" className="border-primary/30">
                                      <Tag className="w-3 h-3 mr-1" />
                                      {tag}
                                    </Badge>
                                  ))}
                                </div>

                                <div className="flex flex-col sm:flex-row gap-3 text-sm text-muted-foreground">
                                  {lead.phone && (
                                    <div className="flex items-center gap-1">
                                      <Phone className="w-4 h-4" />
                                      {lead.phone}
                                    </div>
                                  )}
                                  {lead.email && (
                                    <div className="flex items-center gap-1">
                                      <Mail className="w-4 h-4" />
                                      {lead.email}
                                    </div>
                                  )}
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    {new Date(lead.created_at).toLocaleDateString()}
                                  </div>
                                </div>

                                {lead.project_description && (
                                  <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                    {lead.project_description}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col gap-2">
                            {lead.estimated_budget && (
                              <div className="flex items-center gap-2 text-green-500 font-semibold">
                                <DollarSign className="w-4 h-4" />
                                ${lead.estimated_budget.toLocaleString()}
                              </div>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2 group-hover:border-primary group-hover:bg-primary/10"
                              onClick={() => openShareDialog(lead)}
                            >
                              <Share2 className="w-4 h-4" />
                              Share
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2 group-hover:border-primary group-hover:bg-primary/10"
                            >
                              View Details
                              <ChevronRight className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              })}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Share Dialog */}
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="glass-card border-primary/20">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5 text-primary" />
              Share Lead
            </DialogTitle>
            <DialogDescription>
              Choose how you want to share {selectedLead?.full_name || 'this lead'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-4">
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                className="w-full justify-start gap-3 h-auto py-4"
                variant="outline"
                onClick={() => shareLead('link')}
                disabled={sharing}
              >
                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                  <Link2 className="w-5 h-5 text-blue-500" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold">Copy Share Link</p>
                  <p className="text-sm text-muted-foreground">
                    Generate a secure shareable link (expires in 7 days)
                  </p>
                </div>
                <Copy className="w-4 h-4 text-muted-foreground" />
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                className="w-full justify-start gap-3 h-auto py-4"
                variant="outline"
                onClick={() => {
                  const email = prompt('Enter email address:')
                  if (email) shareLead('email', email)
                }}
                disabled={sharing}
              >
                <div className="w-10 h-10 rounded-lg bg-purple-500/20 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-purple-500" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold">Share via Email</p>
                  <p className="text-sm text-muted-foreground">
                    Send lead details to an email address
                  </p>
                </div>
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                className="w-full justify-start gap-3 h-auto py-4"
                variant="outline"
                onClick={() => {
                  const phone = prompt('Enter phone number:')
                  if (phone) shareLead('sms', phone)
                }}
                disabled={sharing}
              >
                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-green-500" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold">Share via SMS</p>
                  <p className="text-sm text-muted-foreground">
                    Send lead summary via text message
                  </p>
                </div>
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Button
                className="w-full justify-start gap-3 h-auto py-4"
                variant="outline"
                onClick={() => {
                  const webhook = prompt('Enter webhook URL:')
                  if (webhook) shareLead('webhook', webhook)
                }}
                disabled={sharing}
              >
                <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                  <Webhook className="w-5 h-5 text-orange-500" />
                </div>
                <div className="flex-1 text-left">
                  <p className="font-semibold">Send to Webhook</p>
                  <p className="text-sm text-muted-foreground">
                    POST lead data to a webhook URL
                  </p>
                </div>
              </Button>
            </motion.div>
          </div>

          <div className="flex justify-end">
            <Button
              variant="ghost"
              onClick={() => setShareDialogOpen(false)}
              disabled={sharing}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

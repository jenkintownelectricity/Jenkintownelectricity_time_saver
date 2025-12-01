'use client'

/**
 * VAPI Calls Dashboard Page
 * Main page for managing VAPI calls
 */

import React, { useState } from 'react'
import { useVAPIStore } from '@/lib/stores/vapi-store'
import { useAppStore } from '@/lib/store'
import { CallList } from '@/components/vapi/call-list'
import { CallDetail } from '@/components/vapi/call-detail'
import { CallStats } from '@/components/vapi/call-stats'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Bot, Settings, ExternalLink, Zap } from 'lucide-react'
import Link from 'next/link'

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

export default function CallsPage() {
  const { selectedCall, setSelectedCall } = useVAPIStore()
  const { apiKeys, setApiKey } = useAppStore()
  const [activeTab, setActiveTab] = useState('calls')

  const currentAgent = apiKeys.vapiAgentType || 'electrical'
  const agentInfo = AGENT_INFO[currentAgent as keyof typeof AGENT_INFO]

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">VAPI Call Management</h1>
        <p className="text-gray-600">
          Manage incoming calls, view transcripts, and convert to appointments
        </p>
      </div>

      {/* AI Agent Configuration */}
      <Card className="mb-6 border-primary/20 bg-gradient-to-br from-blue-50/50 to-purple-50/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bot className="w-6 h-6 text-primary" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Active AI Agent
                  {apiKeys.vapi && apiKeys.vapiAssistantId ? (
                    <Badge variant="default" className="gap-1">Connected</Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1">Not Configured</Badge>
                  )}
                </CardTitle>
                <CardDescription>
                  This agent handles all incoming VAPI calls
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
              Agent configuration updates immediately. See{' '}
              <code className="bg-muted px-1 py-0.5 rounded">/app/ai-agents/README.md</code>{' '}
              for full agent details.
            </p>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="calls">All Calls</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>

        <TabsContent value="calls">
          <CallList />
        </TabsContent>

        <TabsContent value="stats">
          <CallStats />
        </TabsContent>
      </Tabs>

      {/* Call Detail Modal */}
      {selectedCall && (
        <CallDetail call={selectedCall} onClose={() => setSelectedCall(null)} />
      )}

      {/* Info Card */}
      <Card className="p-6 mt-8 bg-blue-50 border-blue-200">
        <h3 className="font-semibold mb-2 text-blue-900">VAPI Integration</h3>
        <p className="text-sm text-blue-800">
          VAPI calls are automatically processed and data is extracted from transcripts. You can
          review extracted information and convert calls to appointments with a single click.
        </p>
        <div className="mt-4 space-y-2 text-sm text-blue-700">
          <p>
            <strong>Webhook URL:</strong>{' '}
            <code className="bg-blue-100 px-2 py-1 rounded">
              {typeof window !== 'undefined' ? window.location.origin : ''}/api/vapi/webhook
            </code>
          </p>
          <p className="text-xs text-blue-600">
            Configure this URL in your VAPI dashboard to receive call events
          </p>
        </div>
      </Card>
    </div>
  )
}

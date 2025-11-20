'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Mic, Camera, Check, AlertCircle, TestTube, Zap, ExternalLink, Copy } from 'lucide-react'
import { useAppStore } from '@/lib/store'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'

export default function ApiKeysSettings() {
  const { apiKeys, setApiKey } = useAppStore()
  const { toast } = useToast()

  const testVapiConnection = async () => {
    if (!apiKeys.vapi || !apiKeys.vapiAssistantId) {
      toast({
        title: 'Missing Configuration',
        description: 'Please enter both VAPI API key and Assistant ID',
        variant: 'destructive',
      })
      return
    }

    toast({
      title: 'Testing Connection...',
      description: 'Verifying your VAPI credentials',
    })

    // Test connection by making a simple API call
    try {
      const response = await fetch('https://api.vapi.ai/assistant/' + apiKeys.vapiAssistantId, {
        headers: {
          'Authorization': `Bearer ${apiKeys.vapi}`,
        },
      })

      if (response.ok) {
        toast({
          title: 'Connection Successful! ✅',
          description: 'Your VAPI integration is ready to use',
        })
      } else {
        throw new Error('Invalid credentials')
      }
    } catch (error) {
      toast({
        title: 'Connection Failed',
        description: 'Please check your API key and Assistant ID',
        variant: 'destructive',
      })
    }
  }

  const testAnthropicConnection = async () => {
    if (!apiKeys.anthropic) {
      toast({
        title: 'API Key Required',
        description: 'Please enter your Anthropic API key',
        variant: 'destructive',
      })
      return
    }

    toast({
      title: 'Testing Connection...',
      description: 'Verifying your Anthropic credentials',
    })

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKeys.anthropic,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Hi' }],
        }),
      })

      if (response.ok) {
        toast({
          title: 'Connection Successful! ✅',
          description: 'Your Anthropic integration is ready to use',
        })
      } else {
        throw new Error('Invalid API key')
      }
    } catch (error) {
      toast({
        title: 'Connection Failed',
        description: 'Please check your API key',
        variant: 'destructive',
      })
    }
  }

  const copyAgentPrompt = (agentType: string) => {
    const agentFiles = {
      electrical: '/app/ai-agents/electrical-hvac-plumbing-agent.ts',
      restoration: '/app/ai-agents/home-restoration-agent.ts',
      office: '/app/ai-agents/office-assistant-agent.ts',
      sales: '/app/ai-agents/salesman-agent.ts',
    }

    toast({
      title: 'Agent Configuration Copied!',
      description: `Open ${agentFiles[agentType as keyof typeof agentFiles]} in your codebase to get the full system prompt`,
    })
  }

  return (
    <div className="space-y-6">
      {/* VAPI API Keys */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Mic className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>VAPI Voice AI</CardTitle>
              <CardDescription>Real-time voice conversation assistant</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vapi-key">
              Public API Key <span className="text-destructive">*</span>
            </Label>
            <Input
              id="vapi-key"
              type="password"
              placeholder="Enter your VAPI public key (required)"
              value={apiKeys.vapi || ''}
              onChange={(e) => setApiKey('vapi', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Required for voice calls. Get your key from{' '}
              <a href="https://vapi.ai" target="_blank" rel="noopener" className="text-primary hover:underline inline-flex items-center gap-1">
                vapi.ai <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="vapi-assistant">
              Assistant ID <span className="text-destructive">*</span>
            </Label>
            <Input
              id="vapi-assistant"
              type="text"
              placeholder="Enter your VAPI assistant ID (required)"
              value={apiKeys.vapiAssistantId || ''}
              onChange={(e) => setApiKey('vapiAssistantId', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Create your assistant at{' '}
              <a href="https://vapi.ai/dashboard" target="_blank" rel="noopener" className="text-primary hover:underline inline-flex items-center gap-1">
                vapi.ai/dashboard <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="agent-type">
              AI Agent Type <span className="text-muted-foreground text-xs">(Choose what this assistant does)</span>
            </Label>
            <Select
              value={apiKeys.vapiAgentType || 'electrical'}
              onValueChange={(value) => setApiKey('vapiAgentType', value)}
            >
              <SelectTrigger id="agent-type">
                <SelectValue placeholder="Select agent type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="electrical">⚡ Electrical/HVAC/Plumbing Specialist</SelectItem>
                <SelectItem value="restoration">🏠 Home Restoration Specialist</SelectItem>
                <SelectItem value="office">💼 Office Assistant</SelectItem>
                <SelectItem value="sales">💰 Sales Specialist</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Each agent has specialized knowledge and scripts. See{' '}
              <code className="bg-muted px-1 py-0.5 rounded text-xs">/app/ai-agents/README.md</code>{' '}
              for details
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            {apiKeys.vapi && apiKeys.vapiAssistantId ? (
              <Badge variant="default" className="gap-1">
                <Check className="w-3 h-3" />
                Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1">
                <AlertCircle className="w-3 h-3" />
                Keys Required
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={testVapiConnection}>
              <TestTube className="w-4 h-4 mr-2" />
              Test Connection
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick Setup Guide */}
      <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-500" />
            <CardTitle className="text-lg">Quick Setup for Tonight 🚀</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2 text-sm">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold shrink-0">1</div>
              <div>
                <p className="font-medium">Get VAPI API Key</p>
                <p className="text-xs text-muted-foreground">
                  Sign up at{' '}
                  <a href="https://vapi.ai" target="_blank" rel="noopener" className="text-blue-500 hover:underline">
                    vapi.ai
                  </a>{' '}
                  → Dashboard → API Keys → Copy Public Key
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold shrink-0">2</div>
              <div>
                <p className="font-medium">Create VAPI Assistant</p>
                <p className="text-xs text-muted-foreground">
                  Dashboard → Assistants → New Assistant → Copy the agent prompt from{' '}
                  <code className="bg-muted px-1 py-0.5 rounded">/app/ai-agents/</code>
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold shrink-0">3</div>
              <div>
                <p className="font-medium">Configure Voice & Model</p>
                <p className="text-xs text-muted-foreground">
                  Voice: ElevenLabs (Rachel for trades, Sarah for restoration, Adam for office, Liam for sales)
                  <br />
                  Model: GPT-4o or Claude 3.5 Sonnet
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-xs font-bold shrink-0">4</div>
              <div>
                <p className="font-medium">Get Assistant ID & Paste Here</p>
                <p className="text-xs text-muted-foreground">
                  Copy your Assistant ID from VAPI dashboard and paste it above
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center text-xs font-bold shrink-0">✓</div>
              <div>
                <p className="font-medium text-green-600">You're Live!</p>
                <p className="text-xs text-muted-foreground">
                  Calls will auto-create leads in{' '}
                  <a href="/leads" className="text-blue-500 hover:underline">/leads</a>{' '}
                  and send to{' '}
                  <a href="/hive215-config" className="text-blue-500 hover:underline">/hive215-config</a>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Anthropic Claude API */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Camera className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Anthropic Claude</CardTitle>
              <CardDescription>AI-powered photo and visual analysis</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="anthropic-key">API Key</Label>
            <Input
              id="anthropic-key"
              type="password"
              placeholder="Enter your Anthropic API key"
              value={apiKeys.anthropic || ''}
              onChange={(e) => setApiKey('anthropic', e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Get your key from{' '}
              <a href="https://console.anthropic.com" target="_blank" rel="noopener" className="text-primary hover:underline inline-flex items-center gap-1">
                console.anthropic.com <ExternalLink className="w-3 h-3" />
              </a>
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t">
            {apiKeys.anthropic ? (
              <Badge variant="default" className="gap-1">
                <Check className="w-3 h-3" />
                Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1">
                <AlertCircle className="w-3 h-3" />
                Not Configured
              </Badge>
            )}
            <Button variant="outline" size="sm" onClick={testAnthropicConnection}>
              <TestTube className="w-4 h-4 mr-2" />
              Test Connection
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-blue-500/10 border-blue-500/30">
        <CardContent className="p-6">
          <h3 className="font-semibold text-foreground mb-2">Why do I need API keys?</h3>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li>
              <strong>Control:</strong> You have full control over your usage and billing
            </li>
            <li>
              <strong>Privacy:</strong> Your data goes directly to the AI providers
            </li>
            <li>
              <strong>Customization:</strong> Configure your own assistants and models
            </li>
            <li>
              <strong>No Limits:</strong> No restrictions from third-party rate limiting
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

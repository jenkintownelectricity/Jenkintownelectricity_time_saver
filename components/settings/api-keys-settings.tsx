'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Mic, Camera, Check, AlertCircle, TestTube } from 'lucide-react'
import { useAppStore } from '@/lib/store'

export default function ApiKeysSettings() {
  const { apiKeys, setApiKey } = useAppStore()

  const testVapiConnection = () => {
    if (!apiKeys.vapi || !apiKeys.vapiAssistantId) {
      alert('Please enter both VAPI API key and Assistant ID')
      return
    }
    // TODO: Implement actual connection test
    alert('Testing VAPI connection...')
  }

  const testAnthropicConnection = () => {
    if (!apiKeys.anthropic) {
      alert('Please enter Anthropic API key')
      return
    }
    // TODO: Implement actual connection test
    alert('Testing Anthropic connection...')
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
              <a href="https://vapi.ai" target="_blank" rel="noopener" className="text-primary hover:underline">
                vapi.ai
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
              <a href="https://vapi.ai/dashboard" target="_blank" rel="noopener" className="text-primary hover:underline">
                vapi.ai/dashboard
              </a>
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
              <a href="https://console.anthropic.com" target="_blank" rel="noopener" className="text-primary hover:underline">
                console.anthropic.com
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

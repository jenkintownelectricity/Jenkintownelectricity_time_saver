'use client'

import { useEffect, useState } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import {
  ArrowLeft,
  Key,
  Plug,
  Check,
  AlertCircle,
  Mic,
  Camera,
  Mail,
  Workflow,
  Settings as SettingsIcon,
  Shield
} from 'lucide-react'
import QuickBooksConnector from './quickbooks-connector'

export default function Settings() {
  const { setCurrentSection, apiKeys, integrations, ownerSettings, setApiKey, setIntegration, setOwnerSetting, loadSettings } = useAppStore()
  const [activeTab, setActiveTab] = useState('api-keys')

  useEffect(() => {
    loadSettings()
  }, [])

  // API Keys Section
  const ApiKeysTab = () => (
    <div className="space-y-6">
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
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Public API Key <span className="text-red-500">*</span>
            </label>
            <Input
              type="password"
              placeholder="Enter your VAPI public key (required)"
              value={apiKeys.vapi || ''}
              onChange={(e) => setApiKey('vapi', e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Required for voice calls. Get your key from <a href="https://vapi.ai" target="_blank" rel="noopener" className="text-primary hover:underline">vapi.ai</a>
            </p>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Assistant ID <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              placeholder="Enter your VAPI assistant ID (required)"
              value={apiKeys.vapiAssistantId || ''}
              onChange={(e) => setApiKey('vapiAssistantId', e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Create your assistant at <a href="https://vapi.ai/dashboard" target="_blank" rel="noopener" className="text-primary hover:underline">vapi.ai/dashboard</a>
            </p>
          </div>
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
        </CardContent>
      </Card>

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
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              API Key
            </label>
            <Input
              type="password"
              placeholder="Enter your Anthropic API key"
              value={apiKeys.anthropic || ''}
              onChange={(e) => setApiKey('anthropic', e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">
              Get your key from <a href="https://console.anthropic.com" target="_blank" rel="noopener" className="text-primary hover:underline">console.anthropic.com</a>
            </p>
          </div>
          {apiKeys.anthropic && (
            <Badge variant="default" className="gap-1">
              <Check className="w-3 h-3" />
              Connected
            </Badge>
          )}
        </CardContent>
      </Card>
    </div>
  )

  // Integrations Section
  const IntegrationsTab = () => (
    <div className="space-y-6">
      {/* Microsoft Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#0078D4]/10 flex items-center justify-center">
                <svg className="w-6 h-6" viewBox="0 0 23 23" fill="none">
                  <path d="M0 0h11v11H0z" fill="#f25022"/>
                  <path d="M12 0h11v11H12z" fill="#00a4ef"/>
                  <path d="M0 12h11v11H0z" fill="#7fba00"/>
                  <path d="M12 12h11v11H12z" fill="#ffb900"/>
                </svg>
              </div>
              <div>
                <CardTitle>Microsoft 365</CardTitle>
                <CardDescription>Outlook, Teams, OneDrive, SharePoint</CardDescription>
              </div>
            </div>
            <Badge variant={integrations.microsoft.enabled ? "default" : "outline"}>
              {integrations.microsoft.enabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Client ID</label>
            <Input
              placeholder="Enter Microsoft Client ID"
              value={integrations.microsoft.clientId || ''}
              onChange={(e) => setIntegration('microsoft', { clientId: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Tenant ID</label>
            <Input
              placeholder="Enter Microsoft Tenant ID"
              value={integrations.microsoft.tenantId || ''}
              onChange={(e) => setIntegration('microsoft', { tenantId: e.target.value })}
            />
          </div>
          <Button
            variant={integrations.microsoft.enabled ? "outline" : "default"}
            onClick={() => setIntegration('microsoft', { enabled: !integrations.microsoft.enabled })}
          >
            {integrations.microsoft.enabled ? "Disable" : "Enable"} Integration
          </Button>
        </CardContent>
      </Card>

      {/* QuickBooks Integration */}
      <QuickBooksConnector />

      {/* TODO: Update integrations tab with research-based priorities
          - Phase 1: QuickBooks ✓, Google Calendar, Stripe, Gmail
          - Phase 2: Zapier, Mailchimp, Google Drive
          - Phase 3: Slack, MS Teams, NiceJob, Broadly
      */}

      {/* Zapier Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#FF4A00]/10 flex items-center justify-center">
                <Workflow className="w-5 h-5 text-[#FF4A00]" />
              </div>
              <div>
                <CardTitle>Zapier</CardTitle>
                <CardDescription>Connect 5000+ apps with automation</CardDescription>
              </div>
            </div>
            <Badge variant={integrations.zapier.enabled ? "default" : "outline"}>
              {integrations.zapier.enabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Webhook URL</label>
            <Input
              placeholder="https://hooks.zapier.com/..."
              value={integrations.zapier.webhookUrl || ''}
              onChange={(e) => setIntegration('zapier', { webhookUrl: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">API Key (Optional)</label>
            <Input
              type="password"
              placeholder="Enter Zapier API key"
              value={integrations.zapier.apiKey || ''}
              onChange={(e) => setIntegration('zapier', { apiKey: e.target.value })}
            />
          </div>
          <Button
            variant={integrations.zapier.enabled ? "outline" : "default"}
            onClick={() => setIntegration('zapier', { enabled: !integrations.zapier.enabled })}
          >
            {integrations.zapier.enabled ? "Disable" : "Enable"} Integration
          </Button>
        </CardContent>
      </Card>

      {/* Make (Integromat) Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#6D00CC]/10 flex items-center justify-center">
                <Workflow className="w-5 h-5 text-[#6D00CC]" />
              </div>
              <div>
                <CardTitle>Make</CardTitle>
                <CardDescription>Visual automation platform (formerly Integromat)</CardDescription>
              </div>
            </div>
            <Badge variant={integrations.make.enabled ? "default" : "outline"}>
              {integrations.make.enabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Webhook URL</label>
            <Input
              placeholder="https://hook.make.com/..."
              value={integrations.make.webhookUrl || ''}
              onChange={(e) => setIntegration('make', { webhookUrl: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">API Key (Optional)</label>
            <Input
              type="password"
              placeholder="Enter Make API key"
              value={integrations.make.apiKey || ''}
              onChange={(e) => setIntegration('make', { apiKey: e.target.value })}
            />
          </div>
          <Button
            variant={integrations.make.enabled ? "outline" : "default"}
            onClick={() => setIntegration('make', { enabled: !integrations.make.enabled })}
          >
            {integrations.make.enabled ? "Disable" : "Enable"} Integration
          </Button>
        </CardContent>
      </Card>

      {/* Slack Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#4A154B]/10 flex items-center justify-center">
                <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
                  <path d="M5.042 15.165a2.528 2.528 0 0 1-2.52 2.523A2.528 2.528 0 0 1 0 15.165a2.527 2.527 0 0 1 2.522-2.52h2.52v2.52zM6.313 15.165a2.527 2.527 0 0 1 2.521-2.52 2.527 2.527 0 0 1 2.521 2.52v6.313A2.528 2.528 0 0 1 8.834 24a2.528 2.528 0 0 1-2.521-2.522v-6.313zM8.834 5.042a2.528 2.528 0 0 1-2.521-2.52A2.528 2.528 0 0 1 8.834 0a2.528 2.528 0 0 1 2.521 2.522v2.52H8.834zM8.834 6.313a2.528 2.528 0 0 1 2.521 2.521 2.528 2.528 0 0 1-2.521 2.521H2.522A2.528 2.528 0 0 1 0 8.834a2.528 2.528 0 0 1 2.522-2.521h6.312zM18.956 8.834a2.528 2.528 0 0 1 2.522-2.521A2.528 2.528 0 0 1 24 8.834a2.528 2.528 0 0 1-2.522 2.521h-2.522V8.834zM17.688 8.834a2.528 2.528 0 0 1-2.523 2.521 2.527 2.527 0 0 1-2.52-2.521V2.522A2.527 2.527 0 0 1 15.165 0a2.528 2.528 0 0 1 2.523 2.522v6.312zM15.165 18.956a2.528 2.528 0 0 1 2.523 2.522A2.528 2.528 0 0 1 15.165 24a2.527 2.527 0 0 1-2.52-2.522v-2.522h2.52zM15.165 17.688a2.527 2.527 0 0 1-2.52-2.523 2.526 2.526 0 0 1 2.52-2.52h6.313A2.527 2.527 0 0 1 24 15.165a2.528 2.528 0 0 1-2.522 2.523h-6.313z" fill="#4A154B"/>
                </svg>
              </div>
              <div>
                <CardTitle>Slack</CardTitle>
                <CardDescription>Team communication and notifications</CardDescription>
              </div>
            </div>
            <Badge variant={integrations.slack.enabled ? "default" : "outline"}>
              {integrations.slack.enabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Webhook URL</label>
            <Input
              placeholder="https://hooks.slack.com/..."
              value={integrations.slack.webhookUrl || ''}
              onChange={(e) => setIntegration('slack', { webhookUrl: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Bot Token (Optional)</label>
            <Input
              type="password"
              placeholder="xoxb-..."
              value={integrations.slack.botToken || ''}
              onChange={(e) => setIntegration('slack', { botToken: e.target.value })}
            />
          </div>
          <Button
            variant={integrations.slack.enabled ? "outline" : "default"}
            onClick={() => setIntegration('slack', { enabled: !integrations.slack.enabled })}
          >
            {integrations.slack.enabled ? "Disable" : "Enable"} Integration
          </Button>
        </CardContent>
      </Card>

      {/* Email Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>Email (SMTP)</CardTitle>
                <CardDescription>Send reports and notifications via email</CardDescription>
              </div>
            </div>
            <Badge variant={integrations.email.enabled ? "default" : "outline"}>
              {integrations.email.enabled ? "Enabled" : "Disabled"}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">SMTP Host</label>
              <Input
                placeholder="smtp.gmail.com"
                value={integrations.email.smtpHost || ''}
                onChange={(e) => setIntegration('email', { smtpHost: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">Port</label>
              <Input
                placeholder="587"
                value={integrations.email.smtpPort || ''}
                onChange={(e) => setIntegration('email', { smtpPort: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">Username</label>
            <Input
              placeholder="your@email.com"
              value={integrations.email.username || ''}
              onChange={(e) => setIntegration('email', { username: e.target.value })}
            />
          </div>
          <Button
            variant={integrations.email.enabled ? "outline" : "default"}
            onClick={() => setIntegration('email', { enabled: !integrations.email.enabled })}
          >
            {integrations.email.enabled ? "Disable" : "Enable"} Integration
          </Button>
        </CardContent>
      </Card>
    </div>
  )

  // Admin/Owner Settings Tab
  const AdminTab = () => (
    <div className="space-y-6">
      <Card className="bg-orange-500/10 border-orange-500/30">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6 text-orange-500" />
            <div>
              <CardTitle>Owner/Admin Settings</CardTitle>
              <CardDescription>Control default API keys and billing model for your users</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between p-4 bg-background rounded-lg border">
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">Provide Default API Keys</h3>
              <p className="text-sm text-muted-foreground">
                When enabled, users without their own API keys will use your default keys (you pay for API usage).
                When disabled, users must provide their own API keys to use the service.
              </p>
            </div>
            <Button
              variant={ownerSettings.provideDefaultKeys ? "default" : "outline"}
              onClick={() => setOwnerSetting('provideDefaultKeys', !ownerSettings.provideDefaultKeys)}
              className="ml-4"
            >
              {ownerSettings.provideDefaultKeys ? "ON" : "OFF"}
            </Button>
          </div>

          {ownerSettings.provideDefaultKeys && (
            <div className="space-y-4 p-4 bg-background rounded-lg border">
              <h3 className="font-semibold text-foreground">Your Default API Keys</h3>
              <p className="text-sm text-muted-foreground mb-4">
                These keys will be used as fallback when users haven't configured their own.
              </p>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Default VAPI Public Key
                </label>
                <Input
                  type="password"
                  placeholder="Enter your VAPI public key"
                  value={ownerSettings.defaultVapiKey}
                  onChange={(e) => setOwnerSetting('defaultVapiKey', e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Default VAPI Assistant ID
                </label>
                <Input
                  type="text"
                  placeholder="Enter your VAPI assistant ID"
                  value={ownerSettings.defaultVapiAssistantId}
                  onChange={(e) => setOwnerSetting('defaultVapiAssistantId', e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Default Anthropic API Key (Optional)
                </label>
                <Input
                  type="password"
                  placeholder="Enter your Anthropic API key"
                  value={ownerSettings.defaultAnthropicKey}
                  onChange={(e) => setOwnerSetting('defaultAnthropicKey', e.target.value)}
                />
              </div>

              {ownerSettings.defaultVapiKey && ownerSettings.defaultVapiAssistantId && (
                <Badge variant="default" className="gap-1">
                  <Check className="w-3 h-3" />
                  Default Keys Configured
                </Badge>
              )}
            </div>
          )}

          <Card className="bg-blue-500/5 border-blue-500/20">
            <CardContent className="p-4">
              <h3 className="font-semibold text-foreground mb-2 text-sm">💡 Business Models</h3>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li><strong>ON:</strong> Freemium - You cover API costs for users. Charge subscription to offset.</li>
                <li><strong>OFF:</strong> BYOK (Bring Your Own Keys) - Users pay their own API bills.</li>
              </ul>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCurrentSection('home')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Settings</h1>
              <p className="text-xs text-muted-foreground">Configure API keys and integrations</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-8">
            <TabsTrigger value="api-keys" className="flex-1">
              <Key className="w-4 h-4 mr-2" />
              API Keys
            </TabsTrigger>
            <TabsTrigger value="integrations" className="flex-1">
              <Plug className="w-4 h-4 mr-2" />
              Integrations
            </TabsTrigger>
            <TabsTrigger value="admin" className="flex-1">
              <Shield className="w-4 h-4 mr-2" />
              Admin
            </TabsTrigger>
          </TabsList>

          <TabsContent value="api-keys">
            <ApiKeysTab />
          </TabsContent>

          <TabsContent value="integrations">
            <IntegrationsTab />
          </TabsContent>

          <TabsContent value="admin">
            <AdminTab />
          </TabsContent>
        </Tabs>

        <Card className="mt-8 bg-primary/5 border-primary/20">
          <CardContent className="p-6">
            <div className="flex gap-3">
              <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground mb-2">Security Note</h3>
                <p className="text-sm text-muted-foreground">
                  All API keys and credentials are stored locally in your browser. 
                  They are never sent to our servers. For production use, consider implementing 
                  proper authentication and storing credentials server-side.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

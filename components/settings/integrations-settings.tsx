'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Mail, Calendar, DollarSign, Workflow } from 'lucide-react'
import { useAppStore } from '@/lib/store'

export default function IntegrationsSettings() {
  const { integrations, setIntegration } = useAppStore()

  return (
    <div className="space-y-6">
      {/* Gmail Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#EA4335]/10 flex items-center justify-center">
                <Mail className="w-5 h-5 text-[#EA4335]" />
              </div>
              <div>
                <CardTitle>Gmail</CardTitle>
                <CardDescription>Email provider for notifications and reports</CardDescription>
              </div>
            </div>
            <Badge variant={integrations.gmail.enabled ? 'default' : 'outline'}>
              {integrations.gmail.enabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gmail-email">Email Address</Label>
            <Input
              id="gmail-email"
              placeholder="your@gmail.com"
              value={integrations.gmail.email || ''}
              onChange={(e) => setIntegration('gmail', { email: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gmail-api">API Key / OAuth Token</Label>
            <Input
              id="gmail-api"
              type="password"
              placeholder="Enter Gmail API key or OAuth token"
              value={integrations.gmail.apiKey || ''}
              onChange={(e) => setIntegration('gmail', { apiKey: e.target.value })}
            />
          </div>
          <Button
            variant={integrations.gmail.enabled ? 'outline' : 'default'}
            onClick={() => setIntegration('gmail', { enabled: !integrations.gmail.enabled })}
          >
            {integrations.gmail.enabled ? 'Disable' : 'Enable'} Integration
          </Button>
        </CardContent>
      </Card>

      {/* Google Calendar Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#4285F4]/10 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-[#4285F4]" />
              </div>
              <div>
                <CardTitle>Google Calendar</CardTitle>
                <CardDescription>Sync appointments and schedules</CardDescription>
              </div>
            </div>
            <Badge variant={integrations.googleCalendar.enabled ? 'default' : 'outline'}>
              {integrations.googleCalendar.enabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="gcal-id">Calendar ID</Label>
            <Input
              id="gcal-id"
              placeholder="primary or calendar@gmail.com"
              value={integrations.googleCalendar.calendarId || ''}
              onChange={(e) => setIntegration('googleCalendar', { calendarId: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gcal-api">API Key / OAuth Token</Label>
            <Input
              id="gcal-api"
              type="password"
              placeholder="Enter Google Calendar API credentials"
              value={integrations.googleCalendar.apiKey || ''}
              onChange={(e) => setIntegration('googleCalendar', { apiKey: e.target.value })}
            />
          </div>
          <Button
            variant={integrations.googleCalendar.enabled ? 'outline' : 'default'}
            onClick={() => setIntegration('googleCalendar', { enabled: !integrations.googleCalendar.enabled })}
          >
            {integrations.googleCalendar.enabled ? 'Disable' : 'Enable'} Integration
          </Button>
        </CardContent>
      </Card>

      {/* Stripe Integration */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-[#635BFF]/10 flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-[#635BFF]" />
              </div>
              <div>
                <CardTitle>Stripe</CardTitle>
                <CardDescription>Payment processing and invoicing</CardDescription>
              </div>
            </div>
            <Badge variant={integrations.stripe.enabled ? 'default' : 'outline'}>
              {integrations.stripe.enabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stripe-pub">Publishable Key</Label>
            <Input
              id="stripe-pub"
              placeholder="pk_live_..."
              value={integrations.stripe.publishableKey || ''}
              onChange={(e) => setIntegration('stripe', { publishableKey: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stripe-sec">Secret Key</Label>
            <Input
              id="stripe-sec"
              type="password"
              placeholder="sk_live_..."
              value={integrations.stripe.secretKey || ''}
              onChange={(e) => setIntegration('stripe', { secretKey: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="stripe-webhook">Webhook Secret</Label>
            <Input
              id="stripe-webhook"
              type="password"
              placeholder="whsec_..."
              value={integrations.stripe.webhookSecret || ''}
              onChange={(e) => setIntegration('stripe', { webhookSecret: e.target.value })}
            />
          </div>
          <Button
            variant={integrations.stripe.enabled ? 'outline' : 'default'}
            onClick={() => setIntegration('stripe', { enabled: !integrations.stripe.enabled })}
          >
            {integrations.stripe.enabled ? 'Disable' : 'Enable'} Integration
          </Button>
        </CardContent>
      </Card>

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
            <Badge variant={integrations.zapier.enabled ? 'default' : 'outline'}>
              {integrations.zapier.enabled ? 'Enabled' : 'Disabled'}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="zapier-webhook">Webhook URL</Label>
            <Input
              id="zapier-webhook"
              placeholder="https://hooks.zapier.com/..."
              value={integrations.zapier.webhookUrl || ''}
              onChange={(e) => setIntegration('zapier', { webhookUrl: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="zapier-api">API Key (Optional)</Label>
            <Input
              id="zapier-api"
              type="password"
              placeholder="Enter Zapier API key"
              value={integrations.zapier.apiKey || ''}
              onChange={(e) => setIntegration('zapier', { apiKey: e.target.value })}
            />
          </div>
          <Button
            variant={integrations.zapier.enabled ? 'outline' : 'default'}
            onClick={() => setIntegration('zapier', { enabled: !integrations.zapier.enabled })}
          >
            {integrations.zapier.enabled ? 'Disable' : 'Enable'} Integration
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

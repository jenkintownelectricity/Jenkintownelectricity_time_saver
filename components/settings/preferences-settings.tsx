'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Moon, Bell, Clock, DollarSign, Globe, Sun } from 'lucide-react'

export default function PreferencesSettings() {
  const [preferences, setPreferences] = useState({
    darkMode: false,
    emailNotifications: true,
    pushNotifications: false,
    smsNotifications: false,
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h',
    currency: 'USD',
    currencySymbol: '$',
    defaultTaxRate: '7.5',
    language: 'en',
  })

  const updatePreference = (key: string, value: string | boolean) => {
    setPreferences((prev) => ({ ...prev, [key]: value }))
  }

  return (
    <div className="space-y-6">
      {/* Appearance */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              {preferences.darkMode ? (
                <Moon className="w-5 h-5 text-primary" />
              ) : (
                <Sun className="w-5 h-5 text-primary" />
              )}
            </div>
            <div>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize the look and feel</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="dark-mode" className="text-base cursor-pointer">
                Dark Mode
              </Label>
              <p className="text-sm text-muted-foreground">
                Use dark theme throughout the application
              </p>
            </div>
            <Switch
              id="dark-mode"
              checked={preferences.darkMode}
              onCheckedChange={(checked) => updatePreference('darkMode', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Manage how you receive updates</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between pb-4 border-b">
            <div>
              <Label htmlFor="email-notif" className="text-base cursor-pointer">
                Email Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Receive updates and alerts via email
              </p>
            </div>
            <Switch
              id="email-notif"
              checked={preferences.emailNotifications}
              onCheckedChange={(checked) => updatePreference('emailNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between pb-4 border-b">
            <div>
              <Label htmlFor="push-notif" className="text-base cursor-pointer">
                Push Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Browser push notifications for urgent updates
              </p>
            </div>
            <Switch
              id="push-notif"
              checked={preferences.pushNotifications}
              onCheckedChange={(checked) => updatePreference('pushNotifications', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="sms-notif" className="text-base cursor-pointer">
                SMS Notifications
              </Label>
              <p className="text-sm text-muted-foreground">
                Text message alerts for critical items
              </p>
            </div>
            <Switch
              id="sms-notif"
              checked={preferences.smsNotifications}
              onCheckedChange={(checked) => updatePreference('smsNotifications', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Date & Time */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Clock className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Date & Time</CardTitle>
              <CardDescription>Format preferences for dates and times</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date-format">Date Format</Label>
              <select
                id="date-format"
                value={preferences.dateFormat}
                onChange={(e) => updatePreference('dateFormat', e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
                <option value="DD/MM/YYYY">DD/MM/YYYY (EU)</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time-format">Time Format</Label>
              <select
                id="time-format"
                value={preferences.timeFormat}
                onChange={(e) => updatePreference('timeFormat', e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                <option value="12h">12-hour (AM/PM)</option>
                <option value="24h">24-hour</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Currency & Tax */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Currency & Tax</CardTitle>
              <CardDescription>Financial display preferences</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <select
                id="currency"
                value={preferences.currency}
                onChange={(e) => updatePreference('currency', e.target.value)}
                className="w-full h-10 px-3 rounded-md border border-input bg-background"
              >
                <option value="USD">USD - US Dollar</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="CAD">CAD - Canadian Dollar</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tax-rate">Default Tax Rate (%)</Label>
              <Input
                id="tax-rate"
                type="number"
                step="0.1"
                value={preferences.defaultTaxRate}
                onChange={(e) => updatePreference('defaultTaxRate', e.target.value)}
                placeholder="7.5"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Language */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Globe className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle>Language</CardTitle>
              <CardDescription>Application language preference</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="language">Language</Label>
            <select
              id="language"
              value={preferences.language}
              onChange={(e) => updatePreference('language', e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background"
            >
              <option value="en">English</option>
              <option value="es">Español (Coming Soon)</option>
              <option value="fr">Français (Coming Soon)</option>
            </select>
            <p className="text-xs text-muted-foreground">
              Additional languages will be available in future updates
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

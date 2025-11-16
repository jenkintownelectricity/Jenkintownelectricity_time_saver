'use client'

import { ReactNode } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { User, Building2, Key, Plug, ToggleLeft, Settings, AlertCircle } from 'lucide-react'

interface SettingsLayoutProps {
  activeTab: string
  onTabChange: (tab: string) => void
  children: ReactNode
}

export default function SettingsLayout({ activeTab, onTabChange, children }: SettingsLayoutProps) {
  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="w-full grid grid-cols-2 md:grid-cols-6 h-auto gap-2 bg-transparent">
          <TabsTrigger value="profile" className="flex-col h-auto py-3">
            <User className="w-4 h-4 mb-1" />
            <span className="text-xs">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="company" className="flex-col h-auto py-3">
            <Building2 className="w-4 h-4 mb-1" />
            <span className="text-xs">Company</span>
          </TabsTrigger>
          <TabsTrigger value="api-keys" className="flex-col h-auto py-3">
            <Key className="w-4 h-4 mb-1" />
            <span className="text-xs">API Keys</span>
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex-col h-auto py-3">
            <Plug className="w-4 h-4 mb-1" />
            <span className="text-xs">Integrations</span>
          </TabsTrigger>
          <TabsTrigger value="features" className="flex-col h-auto py-3">
            <ToggleLeft className="w-4 h-4 mb-1" />
            <span className="text-xs">Features</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="flex-col h-auto py-3">
            <Settings className="w-4 h-4 mb-1" />
            <span className="text-xs">Preferences</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          {children}
        </div>
      </Tabs>

      {/* Security Notice */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <div className="flex gap-3">
            <AlertCircle className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-foreground mb-2">Security Note</h3>
              <p className="text-sm text-muted-foreground">
                All settings and credentials are stored locally in your browser.
                They are never sent to our servers. For production use, consider implementing
                proper authentication and storing credentials server-side.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/lib/store'
import SettingsLayout from '@/components/settings/settings-layout'
import ProfileSettings from '@/components/settings/profile-settings'
import CompanySettings from '@/components/settings/company-settings'
import ApiKeysSettings from '@/components/settings/api-keys-settings'
import IntegrationsSettings from '@/components/settings/integrations-settings'
import FeaturesSettings from '@/components/settings/features-settings'
import PreferencesSettings from '@/components/settings/preferences-settings'
import { TabsContent } from '@/components/ui/tabs'

export default function SettingsPage() {
  const router = useRouter()
  const { loadSettings } = useAppStore()
  const [activeTab, setActiveTab] = useState('profile')

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Settings</h1>
              <p className="text-xs text-muted-foreground">Manage your account and preferences</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <SettingsLayout activeTab={activeTab} onTabChange={setActiveTab}>
          <TabsContent value="profile">
            <ProfileSettings />
          </TabsContent>

          <TabsContent value="company">
            <CompanySettings />
          </TabsContent>

          <TabsContent value="api-keys">
            <ApiKeysSettings />
          </TabsContent>

          <TabsContent value="integrations">
            <IntegrationsSettings />
          </TabsContent>

          <TabsContent value="features">
            <FeaturesSettings />
          </TabsContent>

          <TabsContent value="preferences">
            <PreferencesSettings />
          </TabsContent>
        </SettingsLayout>
      </main>
    </div>
  )
}

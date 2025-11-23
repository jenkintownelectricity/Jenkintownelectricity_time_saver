'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Receipt, FileText, Users, Building2, Phone, Calendar, Camera, BookOpen, Mic, DollarSign, Wrench, FileSpreadsheet, TrendingUp, Globe } from 'lucide-react'
import { useAppStore } from '@/lib/store'

export default function FeaturesSettings() {
  const store = useAppStore()
  const features: any = {}  // Mock value
  const setFeature = (_name: string, _enabled: boolean) => {}  // Mock value

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Feature Toggles</CardTitle>
          <CardDescription>Enable or disable specific features</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Receipts Feature */}
          <div className="flex items-start justify-between gap-4 pb-6 border-b">
            <div className="flex gap-4 flex-1">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Receipt className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="receipts" className="text-base font-semibold cursor-pointer">
                    Receipt Management
                  </Label>
                  <Switch
                    id="receipts"
                    checked={features.receiptsEnabled}
                    onCheckedChange={(checked) => setFeature('receiptsEnabled', checked)}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Enable receipt scanning, categorization, and expense tracking. Upload photos of receipts
                  and automatically extract data for tax purposes.
                </p>
              </div>
            </div>
          </div>

          {/* Tax Compliance Feature */}
          <div className="flex items-start justify-between gap-4 pb-6 border-b">
            <div className="flex gap-4 flex-1">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="tax" className="text-base font-semibold cursor-pointer">
                    Tax Compliance
                  </Label>
                  <Switch
                    id="tax"
                    checked={features.taxComplianceEnabled}
                    onCheckedChange={(checked) => setFeature('taxComplianceEnabled', checked)}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Track quarterly tax obligations, estimated payments, and generate tax reports.
                  Helps you stay compliant with IRS requirements and deadlines.
                </p>
              </div>
            </div>
          </div>

          {/* Team Management Feature */}
          <div className="flex items-start justify-between gap-4 pb-6 border-b">
            <div className="flex gap-4 flex-1">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="team" className="text-base font-semibold cursor-pointer">
                    Team Management
                  </Label>
                  <Switch
                    id="team"
                    checked={features.teamManagementEnabled}
                    onCheckedChange={(checked) => setFeature('teamManagementEnabled', checked)}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Manage team members, assign roles, and track individual performance.
                </p>
              </div>
            </div>
          </div>

          {/* Company/DBA Management Feature */}
          <div className="flex items-start justify-between gap-4 pb-6 border-b">
            <div className="flex gap-4 flex-1">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="company" className="text-base font-semibold cursor-pointer">
                    Company/DBA Management
                  </Label>
                  <Switch
                    id="company"
                    checked={features.companyManagementEnabled}
                    onCheckedChange={(checked) => setFeature('companyManagementEnabled', checked)}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Manage multiple companies and DBAs with separate profiles and settings.
                </p>
              </div>
            </div>
          </div>

          {/* VAPI Call Handling Feature */}
          <div className="flex items-start justify-between gap-4 pb-6 border-b">
            <div className="flex gap-4 flex-1">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="vapi" className="text-base font-semibold cursor-pointer">
                    VAPI Call Handling
                  </Label>
                  <Switch
                    id="vapi"
                    checked={features.vapiCallsEnabled}
                    onCheckedChange={(checked) => setFeature('vapiCallsEnabled', checked)}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  AI-powered phone call handling and customer interaction management.
                </p>
              </div>
            </div>
          </div>

          {/* Appointment Scheduling Feature */}
          <div className="flex items-start justify-between gap-4 pb-6 border-b">
            <div className="flex gap-4 flex-1">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="appointments" className="text-base font-semibold cursor-pointer">
                    Appointment Scheduling
                  </Label>
                  <Switch
                    id="appointments"
                    checked={features.appointmentsEnabled}
                    onCheckedChange={(checked) => setFeature('appointmentsEnabled', checked)}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Schedule and manage customer appointments with calendar integration.
                </p>
              </div>
            </div>
          </div>

          {/* Photo Analysis Feature */}
          <div className="flex items-start justify-between gap-4 pb-6 border-b">
            <div className="flex gap-4 flex-1">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Camera className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="photo" className="text-base font-semibold cursor-pointer">
                    Photo Analysis
                  </Label>
                  <Switch
                    id="photo"
                    checked={features.photoAnalysisEnabled}
                    onCheckedChange={(checked) => setFeature('photoAnalysisEnabled', checked)}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  AI-powered analysis of job site photos and electrical work.
                </p>
              </div>
            </div>
          </div>

          {/* NEC Code Lookup Feature */}
          <div className="flex items-start justify-between gap-4 pb-6 border-b">
            <div className="flex gap-4 flex-1">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="nec" className="text-base font-semibold cursor-pointer">
                    NEC Code Lookup
                  </Label>
                  <Switch
                    id="nec"
                    checked={features.necLookupEnabled}
                    onCheckedChange={(checked) => setFeature('necLookupEnabled', checked)}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Quick access to National Electrical Code references and bookmarks.
                </p>
              </div>
            </div>
          </div>

          {/* Voice Assistant Feature */}
          <div className="flex items-start justify-between gap-4 pb-6 border-b">
            <div className="flex gap-4 flex-1">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Mic className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="voice" className="text-base font-semibold cursor-pointer">
                    Voice Assistant
                  </Label>
                  <Switch
                    id="voice"
                    checked={features.voiceAssistantEnabled}
                    onCheckedChange={(checked) => setFeature('voiceAssistantEnabled', checked)}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Voice-activated assistant for hands-free operation and note-taking.
                </p>
              </div>
            </div>
          </div>

          {/* Estimates Feature */}
          <div className="flex items-start justify-between gap-4 pb-6 border-b">
            <div className="flex gap-4 flex-1">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="estimates" className="text-base font-semibold cursor-pointer">
                    Estimates
                  </Label>
                  <Switch
                    id="estimates"
                    checked={features.estimatesEnabled}
                    onCheckedChange={(checked) => setFeature('estimatesEnabled', checked)}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Create and manage professional estimates for customer jobs.
                </p>
              </div>
            </div>
          </div>

          {/* Work Orders Feature */}
          <div className="flex items-start justify-between gap-4 pb-6 border-b">
            <div className="flex gap-4 flex-1">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Wrench className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="workorders" className="text-base font-semibold cursor-pointer">
                    Work Orders
                  </Label>
                  <Switch
                    id="workorders"
                    checked={features.workOrdersEnabled}
                    onCheckedChange={(checked) => setFeature('workOrdersEnabled', checked)}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Track active work orders and job progress from start to finish.
                </p>
              </div>
            </div>
          </div>

          {/* Invoices Feature */}
          <div className="flex items-start justify-between gap-4 pb-6 border-b">
            <div className="flex gap-4 flex-1">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <FileSpreadsheet className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="invoices" className="text-base font-semibold cursor-pointer">
                    Invoices
                  </Label>
                  <Switch
                    id="invoices"
                    checked={features.invoicesEnabled}
                    onCheckedChange={(checked) => setFeature('invoicesEnabled', checked)}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Generate and send professional invoices with payment tracking.
                </p>
              </div>
            </div>
          </div>

          {/* Advanced Analytics Feature */}
          <div className="flex items-start justify-between gap-4 pb-6 border-b">
            <div className="flex gap-4 flex-1">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="analytics" className="text-base font-semibold cursor-pointer">
                    Advanced Analytics
                  </Label>
                  <Switch
                    id="analytics"
                    checked={features.analyticsEnabled}
                    onCheckedChange={(checked) => setFeature('analyticsEnabled', checked)}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Get detailed insights into business performance, job profitability, and customer trends.
                </p>
              </div>
            </div>
          </div>

          {/* Customer Portal Feature */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex gap-4 flex-1">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Globe className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="portal" className="text-base font-semibold cursor-pointer">
                    Customer Portal
                  </Label>
                  <Switch
                    id="portal"
                    checked={features.customerPortalEnabled}
                    onCheckedChange={(checked) => setFeature('customerPortalEnabled', checked)}
                  />
                </div>
                <p className="text-sm text-muted-foreground">
                  Allow customers to view estimates, invoices, and schedule appointments online.
                  <span className="block mt-1 text-xs text-primary">Coming soon</span>
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6">
          <h3 className="font-semibold text-foreground mb-2">About Feature Management</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Toggle features on or off based on your business needs. Some advanced features require
            a paid plan and will be available in future updates.
          </p>
          <div className="flex gap-2 flex-wrap text-xs">
            <span className="px-2 py-1 bg-green-500/10 text-green-600 rounded">Free: Receipt & Tax</span>
            <span className="px-2 py-1 bg-blue-500/10 text-blue-600 rounded">Pro: Team & Analytics</span>
            <span className="px-2 py-1 bg-purple-500/10 text-purple-600 rounded">Enterprise: AI & Automation</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

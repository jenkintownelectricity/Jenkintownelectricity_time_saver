'use client'

/**
 * VAPI Calls Dashboard Page
 * Main page for managing VAPI calls
 */

import React, { useState } from 'react'
import { useVAPIStore } from '@/lib/stores/vapi-store'
import { CallList } from '@/components/vapi/call-list'
import { CallDetail } from '@/components/vapi/call-detail'
import { CallStats } from '@/components/vapi/call-stats'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card } from '@/components/ui/card'

export default function CallsPage() {
  const { selectedCall, setSelectedCall } = useVAPIStore()
  const [activeTab, setActiveTab] = useState('calls')

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">VAPI Call Management</h1>
        <p className="text-gray-600">
          Manage incoming calls, view transcripts, and convert to appointments
        </p>
      </div>

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

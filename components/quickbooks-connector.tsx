'use client'

import { useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Building2, CheckCircle, XCircle } from 'lucide-react'

export default function QuickBooksConnector() {
  const { integrations, setIntegration } = useAppStore()

  // Handle OAuth callback
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)

      // Check for successful OAuth callback
      if (params.get('qb_success') === 'true') {
        const accessToken = params.get('qb_access_token')
        const refreshToken = params.get('qb_refresh_token')
        const realmId = params.get('qb_realm_id')
        const expiresIn = params.get('qb_expires_in')

        if (accessToken && refreshToken && realmId) {
          // Store tokens in integration settings
          setIntegration('quickbooks', {
            enabled: true,
            accessToken,
            refreshToken,
            realmId,
            companyId: realmId
          })

          // Clean up URL
          window.history.replaceState({}, '', window.location.pathname)

          alert('QuickBooks connected successfully!')
        }
      } else if (params.get('qb_error')) {
        const error = params.get('qb_error')
        console.error('QuickBooks OAuth error:', error)
        alert(`QuickBooks connection failed: ${error}`)

        // Clean up URL
        window.history.replaceState({}, '', window.location.pathname)
      }
    }
  }, [setIntegration])

  const handleConnect = async () => {
    try {
      const response = await fetch('/api/quickbooks/auth')
      const data = await response.json()

      if (data.authUrl) {
        window.location.href = data.authUrl
      } else if (data.error) {
        alert(data.error)
      }
    } catch (error) {
      console.error('Error connecting to QuickBooks:', error)
      alert('Failed to connect to QuickBooks. Please try again.')
    }
  }

  const handleDisconnect = () => {
    if (confirm('Are you sure you want to disconnect from QuickBooks?')) {
      setIntegration('quickbooks', {
        enabled: false,
        accessToken: null,
        refreshToken: null,
        realmId: null,
        companyId: null
      })
      alert('QuickBooks disconnected successfully!')
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Building2 className="w-6 h-6" />
          <div>
            <CardTitle>QuickBooks Integration</CardTitle>
            <CardDescription>
              Seamlessly sync your estimates and invoices with QuickBooks
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {integrations.quickbooks.enabled ? (
              <>
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">Connected</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-gray-400" />
                <span className="text-sm text-gray-600">Not connected</span>
              </>
            )}
          </div>

          {integrations.quickbooks.enabled ? (
            <Button variant="outline" size="sm" onClick={handleDisconnect}>
              Disconnect
            </Button>
          ) : (
            <Button variant="default" size="sm" onClick={handleConnect}>
              Connect QuickBooks
            </Button>
          )}
        </div>

        {integrations.quickbooks.enabled && integrations.quickbooks.realmId && (
          <div className="text-xs text-gray-500">
            Company ID: {integrations.quickbooks.realmId}
          </div>
        )}

        <div className="text-sm text-gray-600 space-y-2">
          <p><strong>Features:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Sync estimates to QuickBooks</li>
            <li>Sync invoices to QuickBooks</li>
            <li>Automatically match customers</li>
            <li>Track payments and balances</li>
          </ul>
        </div>

        <div className="text-xs text-gray-500 border-t pt-3">
          <p><strong>Setup Instructions:</strong></p>
          <ol className="list-decimal list-inside space-y-1 ml-2 mt-1">
            <li>Add your QuickBooks credentials to .env.local</li>
            <li>Click "Connect QuickBooks" above</li>
            <li>Authorize access to your QuickBooks company</li>
            <li>Use the "Sync QB" button on estimates and invoices</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}

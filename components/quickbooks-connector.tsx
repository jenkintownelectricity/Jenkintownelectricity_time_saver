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
        // Show detailed setup instructions
        const setupMessage = `${data.error}

📋 Setup Required:

1. Create QuickBooks App:
   • Visit https://developer.intuit.com
   • Create a new app for QuickBooks Online
   • Copy your Client ID and Client Secret

2. Add to Vercel (Production):
   • Go to Vercel Dashboard → Project Settings → Environment Variables
   • Add: QUICKBOOKS_CLIENT_ID = (your client id)
   • Add: QUICKBOOKS_CLIENT_SECRET = (your client secret)
   • Add: NEXT_PUBLIC_APP_URL = (your vercel url)
   • REDEPLOY your app after adding variables

3. For Local Development:
   • Add the same variables to .env.local file
   • Restart your dev server

Need help? Check the detailed instructions below.`

        alert(setupMessage)
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

        <div className="text-xs text-gray-500 border-t pt-3 space-y-3">
          <div>
            <p className="font-semibold mb-2">📋 Setup Instructions:</p>
            <ol className="list-decimal list-inside space-y-2 ml-2">
              <li>
                <strong>Create QuickBooks App</strong>
                <ul className="list-disc list-inside ml-4 mt-1 text-gray-600">
                  <li>Go to <a href="https://developer.intuit.com" target="_blank" rel="noopener" className="text-blue-600 hover:underline">developer.intuit.com</a></li>
                  <li>Sign in and create a new app</li>
                  <li>Choose "QuickBooks Online" as the platform</li>
                </ul>
              </li>
              <li>
                <strong>Configure OAuth Settings</strong>
                <ul className="list-disc list-inside ml-4 mt-1 text-gray-600">
                  <li>Add redirect URI: <code className="bg-gray-100 px-1 rounded">https://your-app.vercel.app/api/quickbooks/callback</code></li>
                  <li>Copy your Client ID and Client Secret</li>
                </ul>
              </li>
              <li>
                <strong>Add Environment Variables (Vercel)</strong>
                <ul className="list-disc list-inside ml-4 mt-1 text-gray-600">
                  <li>Go to Vercel Dashboard → Your Project → Settings → Environment Variables</li>
                  <li>Add: <code className="bg-gray-100 px-1 rounded">QUICKBOOKS_CLIENT_ID</code></li>
                  <li>Add: <code className="bg-gray-100 px-1 rounded">QUICKBOOKS_CLIENT_SECRET</code></li>
                  <li>Add: <code className="bg-gray-100 px-1 rounded">NEXT_PUBLIC_APP_URL</code> = your Vercel URL</li>
                  <li>Redeploy your app after adding variables</li>
                </ul>
              </li>
              <li>Click "Connect QuickBooks" above to authorize</li>
              <li>Use "Sync QB" buttons on estimates and invoices</li>
            </ol>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
            <p className="font-semibold text-yellow-800">⚠️ Important:</p>
            <ul className="list-disc list-inside ml-2 text-yellow-700 mt-1">
              <li>Environment variables must be set in Vercel Dashboard</li>
              <li>Redeploy after adding variables for them to take effect</li>
              <li>For local development, add to <code className="bg-yellow-100 px-1 rounded">.env.local</code></li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const clientId = process.env.QUICKBOOKS_CLIENT_ID
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/quickbooks/callback`

    if (!clientId) {
      return NextResponse.json(
        { error: 'QuickBooks not configured. Please add QUICKBOOKS_CLIENT_ID to your environment variables.' },
        { status: 500 }
      )
    }

    // QuickBooks OAuth 2.0 authorization URL
    const authUrl = new URL('https://appcenter.intuit.com/connect/oauth2')
    authUrl.searchParams.append('client_id', clientId)
    authUrl.searchParams.append('redirect_uri', redirectUri)
    authUrl.searchParams.append('response_type', 'code')
    authUrl.searchParams.append('scope', 'com.intuit.quickbooks.accounting')
    authUrl.searchParams.append('state', generateRandomState())

    return NextResponse.json({ authUrl: authUrl.toString() })
  } catch (error) {
    console.error('Error generating QuickBooks auth URL:', error)
    return NextResponse.json(
      { error: 'Failed to generate authorization URL' },
      { status: 500 }
    )
  }
}

function generateRandomState(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

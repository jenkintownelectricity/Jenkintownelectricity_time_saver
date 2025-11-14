import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const code = searchParams.get('code')
    const realmId = searchParams.get('realmId')
    const error = searchParams.get('error')

    if (error) {
      return NextResponse.redirect(
        new URL(`/?qb_error=${encodeURIComponent(error)}`, request.url)
      )
    }

    if (!code || !realmId) {
      return NextResponse.redirect(
        new URL('/?qb_error=missing_code_or_realm', request.url)
      )
    }

    const clientId = process.env.QUICKBOOKS_CLIENT_ID
    const clientSecret = process.env.QUICKBOOKS_CLIENT_SECRET
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/quickbooks/callback`

    if (!clientId || !clientSecret) {
      return NextResponse.redirect(
        new URL('/?qb_error=missing_credentials', request.url)
      )
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirectUri
      })
    })

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text()
      console.error('Token exchange failed:', errorData)
      return NextResponse.redirect(
        new URL('/?qb_error=token_exchange_failed', request.url)
      )
    }

    const tokens = await tokenResponse.json()

    // Store tokens in localStorage via client-side redirect
    // In production, you'd store these securely in a database
    const successUrl = new URL('/', request.url)
    successUrl.searchParams.append('qb_success', 'true')
    successUrl.searchParams.append('qb_access_token', tokens.access_token)
    successUrl.searchParams.append('qb_refresh_token', tokens.refresh_token)
    successUrl.searchParams.append('qb_realm_id', realmId)
    successUrl.searchParams.append('qb_expires_in', tokens.expires_in.toString())

    return NextResponse.redirect(successUrl)
  } catch (error) {
    console.error('Error in QuickBooks callback:', error)
    return NextResponse.redirect(
      new URL('/?qb_error=callback_error', request.url)
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'

/**
 * Test Anthropic Connection
 * Tests whether the provided Anthropic API key is valid
 */
export async function POST(req: NextRequest) {
  try {
    const { apiKey } = await req.json()

    if (!apiKey) {
      return NextResponse.json(
        { success: false, error: 'Missing API key' },
        { status: 400 }
      )
    }

    // Test the connection by making a minimal API call
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hi' }],
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = 'Invalid API key'

      if (response.status === 401) {
        errorMessage = 'Invalid API key - authentication failed'
      } else if (response.status === 403) {
        errorMessage = 'Access denied - check your API key permissions'
      } else if (response.status === 429) {
        errorMessage = 'Rate limit exceeded - but your API key is valid!'
      }

      // Rate limit errors mean the key is actually valid
      if (response.status === 429) {
        return NextResponse.json({
          success: true,
          message: 'Connection successful! Your Anthropic API key is valid.',
          warning: 'Rate limit reached during test, but authentication succeeded.',
        })
      }

      return NextResponse.json(
        {
          success: false,
          error: errorMessage,
          details: errorText
        },
        { status: response.status }
      )
    }

    const data = await response.json()

    return NextResponse.json({
      success: true,
      message: 'Connection successful! Your Anthropic integration is ready to use.',
      model: data.model,
    })
  } catch (error: any) {
    console.error('Anthropic test connection error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Network error - unable to reach Anthropic servers',
        details: error.message
      },
      { status: 500 }
    )
  }
}

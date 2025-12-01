import { NextRequest, NextResponse } from 'next/server'

/**
 * Test VAPI Connection
 * Tests whether the provided VAPI credentials are valid
 */
export async function POST(req: NextRequest) {
  try {
    const { apiKey, assistantId } = await req.json()

    if (!apiKey || !assistantId) {
      return NextResponse.json(
        { success: false, error: 'Missing API key or Assistant ID' },
        { status: 400 }
      )
    }

    // Test the connection by fetching the assistant details
    const response = await fetch(`https://api.vapi.ai/assistant/${assistantId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      let errorMessage = 'Invalid credentials'

      if (response.status === 401) {
        errorMessage = 'Invalid API key'
      } else if (response.status === 404) {
        errorMessage = 'Assistant ID not found'
      } else if (response.status === 403) {
        errorMessage = 'Access denied - check your API key permissions'
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

    const assistantData = await response.json()

    return NextResponse.json({
      success: true,
      message: 'Connection successful! Your VAPI integration is ready to use.',
      assistant: {
        id: assistantData.id,
        name: assistantData.name,
        model: assistantData.model?.provider || 'unknown',
      },
    })
  } catch (error: any) {
    console.error('VAPI test connection error:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Network error - unable to reach VAPI servers',
        details: error.message
      },
      { status: 500 }
    )
  }
}

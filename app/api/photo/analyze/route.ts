import { NextRequest, NextResponse } from 'next/server'

/**
 * Photo Analysis API Route
 * Integrates with Anthropic Claude API to analyze construction photos
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageData, apiKey } = body

    if (!imageData) {
      return NextResponse.json(
        { error: 'Image data is required' },
        { status: 400 }
      )
    }

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Anthropic API key is required' },
        { status: 400 }
      )
    }

    // Extract base64 data and media type
    const matches = imageData.match(/^data:(.+);base64,(.+)$/)
    if (!matches) {
      return NextResponse.json(
        { error: 'Invalid image data format' },
        { status: 400 }
      )
    }

    const mediaType = matches[1]
    const base64Data = matches[2]

    // Call Anthropic Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: base64Data,
                },
              },
              {
                type: 'text',
                text: `You are an expert electrician and construction inspector. Analyze this photo and provide a detailed assessment covering:

1. **Wire Gauge Identification**: Identify any visible wire gauges and types
2. **Panel Reading**: Read any panel labels, breaker ratings, or specifications visible
3. **Code Compliance**: Check for any NEC (National Electrical Code) compliance issues
4. **Safety Concerns**: Identify any immediate safety hazards or concerns
5. **Installation Quality**: Assess the quality and workmanship of the installation
6. **Recommendations**: Provide specific recommendations for improvements or corrections

Be thorough, specific, and professional. If you cannot see certain details clearly, mention this limitation.`,
              },
            ],
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      return NextResponse.json(
        { error: errorData.error?.message || 'Failed to analyze image' },
        { status: response.status }
      )
    }

    const data = await response.json()
    const analysis = data.content?.[0]?.text || 'No analysis generated'

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error('Photo analysis error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * VAPI Process Endpoint
 * Extract data from call transcripts
 */

import { NextRequest, NextResponse } from 'next/server'
import { extractDataFromTranscript, validateExtractedData } from '@/lib/vapi/data-extractor'

export async function POST(request: NextRequest) {
  try {
    const { transcript, callId } = await request.json()

    if (!transcript) {
      return NextResponse.json(
        { success: false, error: 'Transcript is required' },
        { status: 400 }
      )
    }

    // Extract data from transcript
    const extractedData = extractDataFromTranscript(transcript)

    // Validate extracted data
    const validation = validateExtractedData(extractedData)

    return NextResponse.json({
      success: true,
      data: extractedData,
      validation: {
        isValid: validation.isValid,
        errors: validation.errors
      },
      callId
    })
  } catch (error) {
    console.error('Error processing transcript:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to process transcript' },
      { status: 500 }
    )
  }
}

/**
 * GET endpoint for testing
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'VAPI process endpoint is active',
    timestamp: new Date().toISOString()
  })
}

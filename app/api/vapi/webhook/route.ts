/**
 * VAPI Webhook Endpoint
 * Receives webhook events from VAPI for call events
 */

import { NextRequest, NextResponse } from 'next/server'
import { VAPIWebhookPayload, CallStatus } from '@/lib/types/vapi'

export async function POST(request: NextRequest) {
  try {
    const payload: VAPIWebhookPayload = await request.json()

    console.log('VAPI Webhook received:', payload.type)

    // Handle different webhook types
    switch (payload.type) {
      case 'call.started':
        return handleCallStarted(payload)

      case 'call.ended':
        return handleCallEnded(payload)

      case 'transcript.updated':
        return handleTranscriptUpdated(payload)

      case 'function.called':
        return handleFunctionCalled(payload)

      default:
        console.log('Unknown webhook type:', payload.type)
        return NextResponse.json({ success: true, message: 'Event received' })
    }
  } catch (error) {
    console.error('Error processing VAPI webhook:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

/**
 * Handle call started event
 */
async function handleCallStarted(payload: VAPIWebhookPayload) {
  console.log('Call started:', payload.call.id)

  // TODO: Save call to database when backend is ready
  // For now, this will be handled client-side with Zustand

  const callData = {
    callId: payload.call.id,
    phoneNumber: payload.call.phoneNumber,
    status: 'in_progress' as CallStatus,
    startedAt: payload.timestamp
  }

  return NextResponse.json({
    success: true,
    message: 'Call started event processed',
    data: callData
  })
}

/**
 * Handle call ended event
 */
async function handleCallEnded(payload: VAPIWebhookPayload) {
  console.log('Call ended:', payload.call.id)

  const callData = {
    callId: payload.call.id,
    duration: payload.call.duration,
    transcript: payload.call.transcript,
    recording: payload.call.recording,
    status: 'completed' as CallStatus,
    endedAt: payload.timestamp
  }

  // TODO: Update call in database when backend is ready
  // TODO: Trigger data extraction from transcript
  // TODO: Send notification to user

  return NextResponse.json({
    success: true,
    message: 'Call ended event processed',
    data: callData
  })
}

/**
 * Handle transcript updated event
 */
async function handleTranscriptUpdated(payload: VAPIWebhookPayload) {
  console.log('Transcript updated for call:', payload.call.id)

  // TODO: Update transcript in real-time
  // TODO: Trigger incremental data extraction

  return NextResponse.json({
    success: true,
    message: 'Transcript updated',
    transcript: payload.call.transcript
  })
}

/**
 * Handle function called event
 */
async function handleFunctionCalled(payload: VAPIWebhookPayload) {
  console.log('Function called:', payload.metadata)

  // TODO: Handle custom function calls from VAPI assistant
  // e.g., schedule_appointment, get_availability, etc.

  return NextResponse.json({
    success: true,
    message: 'Function call processed'
  })
}

/**
 * GET endpoint to verify webhook is working
 */
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'VAPI webhook endpoint is active',
    timestamp: new Date().toISOString()
  })
}

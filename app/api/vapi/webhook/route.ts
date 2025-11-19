/**
 * VAPI Webhook Endpoint
 * Receives webhook events from VAPI for call events
 * Automatically creates leads from phone calls
 */

import { NextRequest, NextResponse } from 'next/server'
import { VAPIWebhookPayload, CallStatus } from '@/lib/types/vapi'
import { createClient } from '@/lib/supabase/server'

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
 * Automatically creates a lead from the call
 */
async function handleCallEnded(payload: VAPIWebhookPayload) {
  console.log('Call ended:', payload.call.id)

  const callData: any = {
    callId: payload.call.id,
    duration: payload.call.duration,
    transcript: payload.call.transcript,
    recording: payload.call.recording,
    status: 'completed' as CallStatus,
    endedAt: payload.timestamp
  }

  // Extract lead information from the call
  const leadInfo = extractLeadFromCall(payload)

  // Create lead in database
  try {
    const supabase = await createClient()

    const { data: lead, error } = await supabase
      .from('leads')
      .insert(leadInfo)
      .select()
      .single()

    if (error) {
      console.error('Error creating lead from call:', error)
    } else {
      console.log('Lead created from call:', lead.id)
      callData.leadId = lead.id
    }
  } catch (error) {
    console.error('Failed to create lead from call:', error)
  }

  return NextResponse.json({
    success: true,
    message: 'Call ended event processed',
    data: callData
  })
}

/**
 * Extract lead information from VAPI call data
 */
function extractLeadFromCall(payload: VAPIWebhookPayload): any {
  const call = payload.call
  const transcript = call.transcript || ''
  const metadata = payload.metadata || {}

  // Basic lead data
  const leadData: any = {
    source: 'vapi_call',
    vapi_call_id: call.id,
    vapi_call_duration: call.duration,
    vapi_transcript: transcript,
    vapi_metadata: metadata,
    phone: call.phoneNumber || (call as any).customer?.number,
  }

  // Try to extract name from transcript or metadata
  const namePatterns = [
    /(?:my name is|i'm|i am|this is)\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i,
    /(?:call me|you can call me)\s+([A-Z][a-z]+)/i,
  ]

  for (const pattern of namePatterns) {
    const match = transcript.match(pattern)
    if (match) {
      leadData.full_name = match[1]
      break
    }
  }

  // Try to extract email from transcript
  const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
  const emailMatch = transcript.match(emailPattern)
  if (emailMatch) {
    leadData.email = emailMatch[0]
  }

  // Extract service type from transcript
  const serviceKeywords = {
    'electrical': ['electric', 'wiring', 'outlet', 'breaker', 'panel', 'circuit'],
    'emergency': ['emergency', 'urgent', 'asap', 'immediately', 'right now'],
    'installation': ['install', 'installation', 'new', 'add'],
    'repair': ['repair', 'fix', 'broken', 'not working'],
    'commercial': ['commercial', 'business', 'office', 'store'],
    'residential': ['home', 'house', 'residential'],
  }

  const tags: string[] = []
  let serviceRequested = ''

  for (const [service, keywords] of Object.entries(serviceKeywords)) {
    if (keywords.some(keyword => transcript.toLowerCase().includes(keyword))) {
      tags.push(service)
      if (!serviceRequested) {
        serviceRequested = service.charAt(0).toUpperCase() + service.slice(1)
      }
    }
  }

  leadData.service_requested = serviceRequested || 'Electrical Service'
  leadData.tags = tags

  // Auto-generate project description from transcript
  const summaryMatch = transcript.match(/(?:i need|looking for|help with|problem with)\s+(.{20,200})/i)
  if (summaryMatch) {
    leadData.project_description = summaryMatch[1].trim()
  } else if (transcript.length > 50) {
    // Use first meaningful chunk of transcript
    leadData.project_description = transcript.substring(0, 200) + '...'
  }

  // Determine priority based on urgency keywords
  const urgentKeywords = ['emergency', 'urgent', 'asap', 'immediately', 'right now', 'critical']
  const isUrgent = urgentKeywords.some(keyword =>
    transcript.toLowerCase().includes(keyword)
  )

  leadData.priority = isUrgent ? 'urgent' : 'medium'

  // Add VAPI summary if available
  if ((call as any).summary) {
    leadData.vapi_summary = (call as any).summary
  }

  // Preferred contact method (they called, so phone)
  leadData.preferred_contact_method = 'phone'

  // Add notes with call info
  leadData.notes = `Lead captured from VAPI phone call (${call.id})\nDuration: ${call.duration}s\n\nCall Summary: ${(call as any).summary || 'N/A'}`

  return leadData
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

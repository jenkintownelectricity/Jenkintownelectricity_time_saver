import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * HiVE215 Integration Webhook Endpoint
 *
 * Receives call data from HiVE215 system and creates leads
 * Supports multiple phone numbers (up to 10)
 *
 * POST /api/webhooks/hive215
 *
 * Expected payload formats:
 *
 * 1. Call completed:
 * {
 *   "event": "call.completed",
 *   "call_id": "hive215_123456",
 *   "phone_number": "+1-555-1234",
 *   "caller_number": "+1-555-5678",
 *   "duration": 300,
 *   "timestamp": "2025-01-19T10:30:00Z",
 *   "transcript": "Full call transcript...",
 *   "summary": "Customer needs electrical work...",
 *   "caller_name": "John Doe",
 *   "caller_email": "john@example.com",
 *   "service_type": "emergency",
 *   "metadata": {}
 * }
 *
 * 2. Simple format:
 * {
 *   "from": "+1-555-5678",
 *   "to": "+1-555-1234",
 *   "duration": 300,
 *   "recording_url": "https://...",
 *   "transcript": "..."
 * }
 */

interface HiVE215CallPayload {
  event?: string
  call_id?: string
  phone_number?: string
  caller_number?: string
  from?: string
  to?: string
  duration?: number
  timestamp?: string
  transcript?: string
  summary?: string
  caller_name?: string
  caller_email?: string
  service_type?: string
  priority?: string
  location?: string
  address?: string
  city?: string
  state?: string
  zip?: string
  budget?: number
  description?: string
  recording_url?: string
  metadata?: any
}

/**
 * Extract lead data from HiVE215 call payload
 */
function extractLeadFromHiVE215(payload: HiVE215CallPayload): any {
  const transcript = payload.transcript || ''

  const leadData: any = {
    source: 'webhook',
    webhook_source: 'hive215',
    source_details: {
      call_id: payload.call_id,
      phone_number_called: payload.phone_number || payload.to,
      hive215_event: payload.event,
    },
    webhook_payload: payload,
  }

  // Contact Information
  leadData.phone = payload.caller_number || payload.from
  leadData.full_name = payload.caller_name
  leadData.email = payload.caller_email

  // Call Details
  if (payload.call_id) {
    leadData.vapi_call_id = payload.call_id
  }

  if (payload.duration) {
    leadData.vapi_call_duration = payload.duration
  }

  if (transcript) {
    leadData.vapi_transcript = transcript

    // Try to extract additional info from transcript
    if (!leadData.full_name) {
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
    }

    // Extract email if not provided
    if (!leadData.email) {
      const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
      const emailMatch = transcript.match(emailPattern)
      if (emailMatch) {
        leadData.email = emailMatch[0]
      }
    }
  }

  if (payload.summary) {
    leadData.vapi_summary = payload.summary
  }

  // Service Details
  leadData.service_requested = payload.service_type || 'Electrical Service'

  // Determine priority
  if (payload.priority) {
    leadData.priority = payload.priority
  } else if (payload.service_type?.toLowerCase().includes('emergency')) {
    leadData.priority = 'urgent'
  } else {
    // Check transcript for urgency keywords
    const urgentKeywords = ['emergency', 'urgent', 'asap', 'immediately', 'right now', 'critical']
    const isUrgent = urgentKeywords.some(keyword =>
      transcript.toLowerCase().includes(keyword)
    )
    leadData.priority = isUrgent ? 'urgent' : 'medium'
  }

  // Project Description
  leadData.project_description =
    payload.description ||
    payload.summary ||
    (transcript.length > 50 ? transcript.substring(0, 200) + '...' : transcript)

  // Location
  if (payload.address || payload.location) {
    leadData.address = payload.address || payload.location
  }
  if (payload.city) leadData.city = payload.city
  if (payload.state) leadData.state = payload.state
  if (payload.zip) leadData.zip_code = payload.zip

  // Budget
  if (payload.budget) {
    leadData.estimated_budget = payload.budget
  }

  // Tags
  const tags: string[] = ['hive215']

  if (payload.service_type) {
    tags.push(payload.service_type.toLowerCase())
  }

  // Auto-tag from transcript
  if (transcript) {
    const serviceKeywords = {
      'emergency': ['emergency', 'urgent'],
      'installation': ['install', 'installation', 'new'],
      'repair': ['repair', 'fix', 'broken'],
      'commercial': ['commercial', 'business', 'office'],
      'residential': ['home', 'house', 'residential'],
    }

    for (const [tag, keywords] of Object.entries(serviceKeywords)) {
      if (keywords.some(keyword => transcript.toLowerCase().includes(keyword))) {
        tags.push(tag)
      }
    }
  }

  leadData.tags = tags

  // Preferred contact method (they called)
  leadData.preferred_contact_method = 'phone'

  // Notes
  const notes = []
  notes.push(`Lead captured from HiVE215 phone system`)
  if (payload.call_id) notes.push(`Call ID: ${payload.call_id}`)
  if (payload.duration) notes.push(`Duration: ${payload.duration}s`)
  if (payload.phone_number) notes.push(`Called Number: ${payload.phone_number}`)
  if (payload.recording_url) notes.push(`Recording: ${payload.recording_url}`)

  leadData.notes = notes.join('\n')

  return leadData
}

/**
 * POST endpoint - Receive call data from HiVE215
 */
export async function POST(request: NextRequest) {
  try {
    const payload: HiVE215CallPayload = await request.json()

    // Validate webhook secret if provided
    const providedSecret = request.headers.get('x-hive215-secret')
    // TODO: Validate against stored secret in database

    console.log('HiVE215 webhook received:', {
      event: payload.event,
      call_id: payload.call_id,
      from: payload.caller_number || payload.from,
    })

    // Extract lead data
    const leadData = extractLeadFromHiVE215(payload)

    // Create Supabase client
    const supabase = await createClient()

    // Check which phone number was called
    if (leadData.source_details.phone_number_called) {
      const { data: phoneConfig } = await supabase
        .from('hive215_phone_numbers')
        .select('*')
        .eq('phone_number', leadData.source_details.phone_number_called)
        .eq('is_active', true)
        .single()

      if (phoneConfig) {
        // Add phone number metadata to lead
        leadData.source_details.phone_config = {
          name: phoneConfig.name,
          department: phoneConfig.department,
          assigned_to: phoneConfig.assigned_to,
        }

        // Auto-assign lead if phone number has default assignee
        if (phoneConfig.assigned_to) {
          leadData.assigned_to = phoneConfig.assigned_to
          leadData.assigned_at = new Date().toISOString()
        }
      }
    }

    // Insert the lead
    const { data: lead, error: insertError } = await supabase
      .from('leads')
      .insert(leadData)
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting HiVE215 lead:', insertError)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create lead',
          details: insertError.message
        },
        { status: 500 }
      )
    }

    console.log('HiVE215 lead created:', lead.id)

    // Save call to hive215_call_logs table
    // This will automatically update phone number stats via database trigger
    try {
      // Find the phone number ID
      let phoneNumberId = null
      if (leadData.source_details.phone_number_called) {
        const { data: phoneNumber } = await supabase
          .from('hive215_phone_numbers')
          .select('id')
          .eq('phone_number', leadData.source_details.phone_number_called)
          .single()

        if (phoneNumber) {
          phoneNumberId = phoneNumber.id
        }
      }

      // Insert call log
      const { error: callLogError } = await supabase
        .from('hive215_call_logs')
        .insert({
          hive215_call_id: payload.call_id,
          phone_number_id: phoneNumberId,
          phone_number: payload.phone_number || payload.to,
          caller_number: payload.caller_number || payload.from,
          caller_name: payload.caller_name,
          caller_email: payload.caller_email,
          direction: 'inbound',
          status: payload.event?.includes('missed') ? 'missed' : 'completed',
          duration: payload.duration || 0,
          recording_url: payload.recording_url,
          transcript: payload.transcript,
          summary: payload.summary,
          lead_id: lead.id,
          lead_created: true,
          call_started_at: payload.timestamp || new Date().toISOString(),
          metadata: payload.metadata || {}
        })

      if (callLogError) {
        console.error('Error inserting call log:', callLogError)
        // Don't fail the whole request if call log fails
      } else {
        console.log('HiVE215 call log created')
      }
    } catch (callLogError) {
      console.error('Failed to create call log:', callLogError)
    }

    // TODO: Send notification to assigned user
    // TODO: Trigger automation workflows

    return NextResponse.json(
      {
        success: true,
        message: 'HiVE215 call processed successfully',
        lead_id: lead.id,
        lead_score: lead.lead_score,
      },
      { status: 201 }
    )

  } catch (error: any) {
    console.error('HiVE215 webhook error:', error)

    return NextResponse.json(
      {
        success: false,
        error: 'Invalid webhook payload',
        details: error.message,
      },
      { status: 400 }
    )
  }
}

/**
 * GET endpoint - Documentation and testing
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    endpoint: '/api/webhooks/hive215',
    method: 'POST',
    description: 'HiVE215 phone system integration webhook',
    authentication: 'Optional: Send x-hive215-secret header',
    webhook_url: `${request.nextUrl.origin}/api/webhooks/hive215`,
    example_payload: {
      event: 'call.completed',
      call_id: 'hive215_123456',
      phone_number: '+1-555-1234',
      caller_number: '+1-555-5678',
      caller_name: 'John Doe',
      caller_email: 'john@example.com',
      duration: 300,
      transcript: 'I need emergency electrical work...',
      summary: 'Customer needs emergency electrical repair',
      service_type: 'emergency',
      priority: 'urgent',
      address: '123 Main St',
      city: 'Philadelphia',
      state: 'PA',
      zip: '19104',
    },
    supported_events: [
      'call.completed',
      'call.missed',
      'voicemail.received',
    ],
    configuration: {
      step1: 'Configure HiVE215 to send webhooks to this endpoint',
      step2: 'Add x-hive215-secret header with your secret key',
      step3: 'Set up phone numbers in /hive215-config',
      step4: 'Test by sending a POST request with example payload',
    },
  })
}

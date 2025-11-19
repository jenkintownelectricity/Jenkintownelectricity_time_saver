import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Lead Capture Webhook Endpoint
 *
 * Accepts leads from external sources via webhook
 * Supports multiple formats and automatically maps fields
 *
 * POST /api/webhooks/leads
 *
 * Example payloads:
 *
 * 1. Simple format:
 * {
 *   "name": "John Doe",
 *   "email": "john@example.com",
 *   "phone": "555-1234",
 *   "message": "Need electrical work"
 * }
 *
 * 2. Detailed format:
 * {
 *   "fullName": "Jane Smith",
 *   "email": "jane@example.com",
 *   "phone": "+1-555-5678",
 *   "companyName": "ABC Corp",
 *   "serviceRequested": "Commercial Wiring",
 *   "projectDescription": "Office rewiring project",
 *   "estimatedBudget": 5000,
 *   "address": "123 Main St",
 *   "city": "Philadelphia",
 *   "state": "PA",
 *   "zipCode": "19104",
 *   "priority": "high",
 *   "preferredContactMethod": "phone"
 * }
 *
 * 3. With UTM tracking:
 * {
 *   "name": "Bob Johnson",
 *   "email": "bob@example.com",
 *   "phone": "555-9999",
 *   "utm_source": "google",
 *   "utm_medium": "cpc",
 *   "utm_campaign": "emergency_electrical"
 * }
 */

// Field mapping from various webhook formats to our schema
const FIELD_MAPPINGS: Record<string, string> = {
  // Name variations
  'name': 'full_name',
  'fullName': 'full_name',
  'full_name': 'full_name',
  'firstName': 'first_name_temp',
  'first_name': 'first_name_temp',
  'lastName': 'last_name_temp',
  'last_name': 'last_name_temp',

  // Contact variations
  'email': 'email',
  'emailAddress': 'email',
  'email_address': 'email',
  'phone': 'phone',
  'phoneNumber': 'phone',
  'phone_number': 'phone',
  'mobile': 'phone',

  // Company
  'company': 'company_name',
  'companyName': 'company_name',
  'company_name': 'company_name',

  // Project details
  'message': 'project_description',
  'description': 'project_description',
  'projectDescription': 'project_description',
  'project_description': 'project_description',
  'comments': 'project_description',
  'notes': 'notes',

  'service': 'service_requested',
  'serviceRequested': 'service_requested',
  'service_requested': 'service_requested',
  'serviceType': 'service_requested',

  'budget': 'estimated_budget',
  'estimatedBudget': 'estimated_budget',
  'estimated_budget': 'estimated_budget',

  // Address
  'address': 'address',
  'street': 'address',
  'streetAddress': 'address',
  'city': 'city',
  'state': 'state',
  'zipCode': 'zip_code',
  'zip_code': 'zip_code',
  'zip': 'zip_code',
  'postalCode': 'zip_code',

  // Priority
  'priority': 'priority',
  'urgency': 'priority',

  // Contact preference
  'preferredContact': 'preferred_contact_method',
  'preferredContactMethod': 'preferred_contact_method',
  'preferred_contact_method': 'preferred_contact_method',
  'contactMethod': 'preferred_contact_method',

  // UTM tracking
  'utm_source': 'utm_source',
  'utm_medium': 'utm_medium',
  'utm_campaign': 'utm_campaign',
  'utm_term': 'utm_term',
  'utm_content': 'utm_content',
  'referrer': 'referrer_url',
  'referrer_url': 'referrer_url',
}

function mapWebhookData(payload: any): any {
  const mapped: any = {
    source: 'webhook',
    source_details: {},
    webhook_payload: payload,
    tags: [],
  }

  // Map fields
  for (const [webhookField, value] of Object.entries(payload)) {
    const mappedField = FIELD_MAPPINGS[webhookField]
    if (mappedField) {
      if (mappedField === 'first_name_temp') {
        mapped.source_details.first_name = value
      } else if (mappedField === 'last_name_temp') {
        mapped.source_details.last_name = value
      } else {
        mapped[mappedField] = value
      }
    } else {
      // Store unmapped fields in source_details
      mapped.source_details[webhookField] = value
    }
  }

  // Combine first and last name if provided separately
  if (mapped.source_details.first_name || mapped.source_details.last_name) {
    mapped.full_name = [
      mapped.source_details.first_name,
      mapped.source_details.last_name
    ].filter(Boolean).join(' ')
  }

  // Determine priority if not set
  if (!mapped.priority) {
    // Auto-detect urgency from message
    const urgentKeywords = ['emergency', 'urgent', 'asap', 'immediately', 'right now']
    const description = (mapped.project_description || '').toLowerCase()

    if (urgentKeywords.some(keyword => description.includes(keyword))) {
      mapped.priority = 'urgent'
    } else if (mapped.estimated_budget && mapped.estimated_budget > 10000) {
      mapped.priority = 'high'
    } else {
      mapped.priority = 'medium'
    }
  }

  // Auto-tag based on content
  if (mapped.project_description) {
    const desc = mapped.project_description.toLowerCase()
    if (desc.includes('emergency')) mapped.tags.push('emergency')
    if (desc.includes('commercial')) mapped.tags.push('commercial')
    if (desc.includes('residential')) mapped.tags.push('residential')
    if (desc.includes('install')) mapped.tags.push('installation')
    if (desc.includes('repair')) mapped.tags.push('repair')
  }

  return mapped
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Get webhook source from headers or query params
    const webhookSource =
      request.headers.get('x-webhook-source') ||
      request.nextUrl.searchParams.get('source') ||
      'unknown'

    // Get webhook secret if provided
    const providedSecret =
      request.headers.get('x-webhook-secret') ||
      request.nextUrl.searchParams.get('secret')

    // TODO: Validate webhook secret against stored config
    // For now, we'll accept all webhooks

    // Map the webhook data to our lead schema
    const leadData = mapWebhookData(body)
    leadData.webhook_source = webhookSource

    // Create Supabase client
    const supabase = await createClient()

    // Insert the lead
    const { data: lead, error: insertError } = await supabase
      .from('leads')
      .insert(leadData)
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting lead:', insertError)
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create lead',
          details: insertError.message
        },
        { status: 500 }
      )
    }

    // Update webhook config stats if exists
    // TODO: Implement counter increment with RPC function
    /* await supabase
      .from('webhook_configs')
      .update({
        last_received_at: new Date().toISOString(),
      })
      .eq('name', webhookSource) */

    // TODO: Send notification to assigned user or admin
    // TODO: Trigger any automation workflows

    return NextResponse.json(
      {
        success: true,
        message: 'Lead captured successfully',
        lead_id: lead.id,
        lead_score: lead.lead_score,
      },
      { status: 201 }
    )

  } catch (error: any) {
    console.error('Webhook error:', error)

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

// GET endpoint for testing/documentation
export async function GET(request: NextRequest) {
  return NextResponse.json({
    endpoint: '/api/webhooks/leads',
    method: 'POST',
    description: 'Lead capture webhook endpoint',
    authentication: 'Optional webhook secret via x-webhook-secret header',
    example_payload: {
      name: 'John Doe',
      email: 'john@example.com',
      phone: '555-1234',
      message: 'Need electrical work',
      utm_source: 'google',
      utm_campaign: 'emergency_electrical',
    },
    supported_fields: [
      'name / fullName / full_name',
      'email / emailAddress',
      'phone / phoneNumber',
      'company / companyName',
      'message / description / projectDescription',
      'service / serviceRequested',
      'budget / estimatedBudget',
      'address / street',
      'city',
      'state',
      'zipCode / zip',
      'priority (low/medium/high/urgent)',
      'preferredContactMethod (phone/email/text/any)',
      'utm_source',
      'utm_medium',
      'utm_campaign',
      'utm_term',
      'utm_content',
    ],
    webhook_source: 'Set via x-webhook-source header or ?source= query param',
  })
}

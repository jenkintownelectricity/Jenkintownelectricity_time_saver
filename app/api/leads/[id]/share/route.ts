import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * Lead Sharing API
 *
 * Share a lead via email, SMS, webhook, or generate shareable link
 *
 * POST /api/leads/[id]/share
 *
 * Body:
 * {
 *   "type": "email" | "sms" | "webhook" | "link",
 *   "to": "email@example.com" | "+1234567890" | "https://webhook.url",
 *   "message": "Optional custom message",
 *   "includeFields": ["full_name", "email", "phone"]
 * }
 */

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: leadId } = await params
    const body = await request.json()
    const { type, to, message, includeFields } = body

    const supabase = await createClient()

    // Get the lead
    const { data: lead, error: leadError } = await supabase
      .from('leads')
      .select('*')
      .eq('id', leadId)
      .single()

    if (leadError || !lead) {
      return NextResponse.json(
        { success: false, error: 'Lead not found' },
        { status: 404 }
      )
    }

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()

    // Handle different share types
    let shareResult: any

    switch (type) {
      case 'email':
        shareResult = await shareViaEmail(supabase, lead, to, message, includeFields, user?.id)
        break

      case 'sms':
        shareResult = await shareViaSMS(supabase, lead, to, message, includeFields, user?.id)
        break

      case 'webhook':
        shareResult = await shareViaWebhook(supabase, lead, to, message, includeFields, user?.id)
        break

      case 'link':
        shareResult = await generateShareLink(supabase, lead, includeFields, user?.id)
        break

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid share type' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      ...shareResult
    })

  } catch (error: any) {
    console.error('Error sharing lead:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}

/**
 * Share lead via email
 */
async function shareViaEmail(
  supabase: any,
  lead: any,
  to: string,
  message: string | undefined,
  includeFields: string[],
  userId?: string
) {
  // Create share record
  const { data: share, error } = await supabase
    .from('lead_shares')
    .insert({
      lead_id: lead.id,
      share_type: 'email',
      shared_with: to,
      message,
      include_fields: includeFields,
      status: 'pending',
      shared_by: userId,
    })
    .select()
    .single()

  if (error) throw error

  // TODO: Send actual email using service like SendGrid, Resend, etc.
  // For now, just mark as sent
  const emailContent = formatLeadForEmail(lead, includeFields, message)

  console.log('Would send email to:', to)
  console.log('Email content:', emailContent)

  // Update share status
  await supabase
    .from('lead_shares')
    .update({ status: 'sent', sent_at: new Date().toISOString() })
    .eq('id', share.id)

  return {
    message: 'Lead shared via email (simulated)',
    share_id: share.id,
    email_preview: emailContent
  }
}

/**
 * Share lead via SMS
 */
async function shareViaSMS(
  supabase: any,
  lead: any,
  to: string,
  message: string | undefined,
  includeFields: string[],
  userId?: string
) {
  // Create share record
  const { data: share, error } = await supabase
    .from('lead_shares')
    .insert({
      lead_id: lead.id,
      share_type: 'sms',
      shared_with: to,
      message,
      include_fields: includeFields,
      status: 'pending',
      shared_by: userId,
    })
    .select()
    .single()

  if (error) throw error

  // TODO: Send actual SMS using Twilio, etc.
  const smsContent = formatLeadForSMS(lead, includeFields, message)

  console.log('Would send SMS to:', to)
  console.log('SMS content:', smsContent)

  // Update share status
  await supabase
    .from('lead_shares')
    .update({ status: 'sent', sent_at: new Date().toISOString() })
    .eq('id', share.id)

  return {
    message: 'Lead shared via SMS (simulated)',
    share_id: share.id,
    sms_preview: smsContent
  }
}

/**
 * Share lead via webhook
 */
async function shareViaWebhook(
  supabase: any,
  lead: any,
  webhookUrl: string,
  message: string | undefined,
  includeFields: string[],
  userId?: string
) {
  // Create share record
  const { data: share, error } = await supabase
    .from('lead_shares')
    .insert({
      lead_id: lead.id,
      share_type: 'webhook',
      shared_with: webhookUrl,
      message,
      include_fields: includeFields,
      status: 'pending',
      shared_by: userId,
    })
    .select()
    .single()

  if (error) throw error

  // Send webhook
  const payload = formatLeadForWebhook(lead, includeFields, message)

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'AppIo.AI Lead Share',
      },
      body: JSON.stringify(payload),
    })

    const responseData = await response.text()

    if (response.ok) {
      await supabase
        .from('lead_shares')
        .update({
          status: 'delivered',
          sent_at: new Date().toISOString(),
          delivered_at: new Date().toISOString(),
          response_data: { status: response.status, body: responseData },
        })
        .eq('id', share.id)

      return {
        message: 'Lead shared via webhook successfully',
        share_id: share.id,
        webhook_response: { status: response.status, body: responseData }
      }
    } else {
      await supabase
        .from('lead_shares')
        .update({
          status: 'failed',
          error_message: `HTTP ${response.status}: ${responseData}`,
        })
        .eq('id', share.id)

      throw new Error(`Webhook failed: HTTP ${response.status}`)
    }
  } catch (webhookError: any) {
    await supabase
      .from('lead_shares')
      .update({
        status: 'failed',
        error_message: webhookError.message,
      })
      .eq('id', share.id)

    throw webhookError
  }
}

/**
 * Generate shareable link
 */
async function generateShareLink(
  supabase: any,
  lead: any,
  includeFields: string[],
  userId?: string
) {
  // Generate unique token
  const token = generateToken()

  // Create share record
  const { data: share, error } = await supabase
    .from('lead_shares')
    .insert({
      lead_id: lead.id,
      share_type: 'link',
      share_token: token,
      include_fields: includeFields,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days
      status: 'sent',
      sent_at: new Date().toISOString(),
      shared_by: userId,
    })
    .select()
    .single()

  if (error) throw error

  const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/share/${token}`

  return {
    message: 'Shareable link generated',
    share_id: share.id,
    share_url: shareUrl,
    expires_at: share.expires_at
  }
}

/**
 * Helper functions
 */

function generateToken(): string {
  return Array.from({ length: 32 }, () =>
    Math.random().toString(36).charAt(2)
  ).join('')
}

function formatLeadForEmail(lead: any, fields: string[], message?: string): string {
  const fieldData = fields.map(field => {
    const value = lead[field]
    const label = field.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    return `${label}: ${value || 'N/A'}`
  }).join('\n')

  return `
${message ? message + '\n\n' : ''}
New Lead Information:
${fieldData}

Lead Score: ${lead.lead_score}/100
Priority: ${lead.priority}
Source: ${lead.source}

View full lead details in AppIo.AI
  `.trim()
}

function formatLeadForSMS(lead: any, fields: string[], message?: string): string {
  const name = lead.full_name || 'New Lead'
  const phone = lead.phone || 'No phone'
  const priority = lead.priority === 'urgent' ? '🚨 URGENT' : lead.priority.toUpperCase()

  return `
${message ? message + ' - ' : ''}${priority}: ${name}
Phone: ${phone}
Score: ${lead.lead_score}/100
  `.trim()
}

function formatLeadForWebhook(lead: any, fields: string[], message?: string): any {
  const filteredLead: any = {}

  fields.forEach(field => {
    if (lead[field] !== undefined) {
      filteredLead[field] = lead[field]
    }
  })

  return {
    event: 'lead.shared',
    timestamp: new Date().toISOString(),
    message,
    lead: {
      ...filteredLead,
      id: lead.id,
      lead_score: lead.lead_score,
      priority: lead.priority,
      status: lead.status,
      source: lead.source,
      created_at: lead.created_at,
    }
  }
}

import { createClient } from '@/lib/supabase/client'
import type { WorkCall, CallType, CallStatus } from './types'

/**
 * Get all work calls for the current user's company
 */
export async function getWorkCalls(companyId: string): Promise<WorkCall[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('work_calls')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching work calls:', error)
    return []
  }

  return data || []
}

/**
 * Get active work calls (including from linked companies for marketplace)
 */
export async function getActiveWorkCalls(companyId: string): Promise<WorkCall[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('work_calls')
    .select('*')
    .eq('status', 'active')
    .order('expires_at', { ascending: true })

  if (error) {
    console.error('Error fetching active work calls:', error)
    return []
  }

  return data || []
}

/**
 * Get work calls by status
 */
export async function getWorkCallsByStatus(
  companyId: string,
  status: CallStatus
): Promise<WorkCall[]> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('work_calls')
    .select('*')
    .eq('company_id', companyId)
    .eq('status', status)
    .order('created_at', { ascending: false })

  if (error) {
    console.error(`Error fetching ${status} work calls:`, error)
    return []
  }

  return data || []
}

/**
 * Get a single work call by ID
 */
export async function getWorkCallById(callId: string): Promise<WorkCall | null> {
  const supabase = createClient()

  const { data, error } = await supabase
    .from('work_calls')
    .select('*')
    .eq('id', callId)
    .single()

  if (error) {
    console.error('Error fetching work call:', error)
    return null
  }

  return data
}

/**
 * Create a new work call
 */
export async function createWorkCall(
  companyId: string,
  callData: {
    call_type: CallType
    title: string
    description?: string
    location?: string
    customer_name?: string
    customer_phone?: string
    customer_email?: string
    contact_id?: string
    bonus?: number
    scheduled_for?: string
  }
): Promise<WorkCall | null> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.error('No authenticated user')
    return null
  }

  // Calculate expiration time based on call type
  const now = new Date()
  let expiresAt: Date

  switch (callData.call_type) {
    case 'emergency':
      expiresAt = new Date(now.getTime() + 5 * 60 * 1000) // 5 minutes
      break
    case 'daytime':
      expiresAt = new Date(now.getTime() + 15 * 60 * 1000) // 15 minutes
      break
    case 'scheduled':
      expiresAt = new Date(now.getTime() + 15 * 60 * 1000) // 15 minutes
      break
  }

  const { data, error } = await supabase
    .from('work_calls')
    .insert({
      company_id: companyId,
      created_by_user_id: user.id,
      ...callData,
      expires_at: expiresAt.toISOString(),
      status: 'active',
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating work call:', error)
    return null
  }

  return data
}

/**
 * Claim a work call
 */
export async function claimWorkCall(callId: string): Promise<boolean> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.error('No authenticated user')
    return false
  }

  const { error } = await supabase
    .from('work_calls')
    .update({
      status: 'claimed',
      claimed_by_user_id: user.id,
      claimed_at: new Date().toISOString(),
    })
    .eq('id', callId)
    .eq('status', 'active') // Only allow claiming active calls

  if (error) {
    console.error('Error claiming work call:', error)
    return false
  }

  return true
}

/**
 * Update work call status
 */
export async function updateWorkCallStatus(
  callId: string,
  status: CallStatus,
  completionNotes?: string
): Promise<boolean> {
  const supabase = createClient()

  const updates: Partial<WorkCall> = { status }

  if (status === 'completed') {
    updates.completed_at = new Date().toISOString()
    if (completionNotes) {
      updates.completion_notes = completionNotes
    }
  }

  const { error } = await supabase
    .from('work_calls')
    .update(updates)
    .eq('id', callId)

  if (error) {
    console.error('Error updating work call status:', error)
    return false
  }

  return true
}

/**
 * Place a bid on a work call (for bidding mode)
 */
export async function placeBid(
  callId: string,
  amount: number
): Promise<boolean> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.error('No authenticated user')
    return false
  }

  // Get current work call
  const call = await getWorkCallById(callId)
  if (!call || call.bid_mode !== 'bidding') {
    console.error('Invalid work call or not in bidding mode')
    return false
  }

  // Add bid to bids array
  const bids = [...call.bids, {
    user_id: user.id,
    amount,
    timestamp: new Date().toISOString(),
  }]

  const { error } = await supabase
    .from('work_calls')
    .update({ bids })
    .eq('id', callId)

  if (error) {
    console.error('Error placing bid:', error)
    return false
  }

  return true
}

/**
 * Check and expire old work calls
 */
export async function expireOldWorkCalls(companyId: string): Promise<number> {
  const supabase = createClient()

  const now = new Date().toISOString()

  const { data, error } = await supabase
    .from('work_calls')
    .update({ status: 'expired' })
    .eq('company_id', companyId)
    .eq('status', 'active')
    .lt('expires_at', now)
    .select()

  if (error) {
    console.error('Error expiring work calls:', error)
    return 0
  }

  return data?.length || 0
}

/**
 * Get work calls claimed by the current user
 */
export async function getMyClaimedCalls(): Promise<WorkCall[]> {
  const supabase = createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('work_calls')
    .select('*')
    .eq('claimed_by_user_id', user.id)
    .in('status', ['claimed', 'in_progress'])
    .order('claimed_at', { ascending: false })

  if (error) {
    console.error('Error fetching my claimed calls:', error)
    return []
  }

  return data || []
}

/**
 * Cancel a work call
 */
export async function cancelWorkCall(callId: string): Promise<boolean> {
  return updateWorkCallStatus(callId, 'cancelled')
}

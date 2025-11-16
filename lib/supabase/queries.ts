import { supabase } from './client'

/**
 * Usage Quota Helpers
 * Check if user has exceeded their plan limits
 */

export async function checkUsageQuota(
  userId: string,
  featureKey: string,
  periodType: 'daily' | 'monthly' | 'yearly' = 'monthly'
): Promise<{
  limit: number | null
  current: number
  remaining: number
  exceeded: boolean
  percentUsed: number
}> {
  const { data, error } = await supabase.rpc('check_usage_quota', {
    p_user_id: userId,
    p_feature_key: featureKey,
    p_period_type: periodType,
  })

  if (error) {
    console.error('[Quota] Check failed:', error)
    throw error
  }

  return data
}

/**
 * Track usage for a feature
 */
export async function trackUsage(
  userId: string,
  companyId: string | null,
  featureKey: string,
  quantity: number = 1
) {
  const periodStart = new Date()
  periodStart.setDate(1) // First day of month
  periodStart.setHours(0, 0, 0, 0)

  const periodEnd = new Date(periodStart)
  periodEnd.setMonth(periodEnd.getMonth() + 1)
  periodEnd.setDate(0) // Last day of month

  const { error } = await supabase.from('usage_tracking').insert({
    user_id: userId,
    company_id: companyId,
    feature_key: featureKey,
    quantity,
    period_start: periodStart.toISOString().split('T')[0],
    period_end: periodEnd.toISOString().split('T')[0],
    period_type: 'monthly',
  })

  if (error) {
    console.error('[Usage] Track failed:', error)
    throw error
  }
}

/**
 * Check if user has access to a feature
 */
export async function checkFeatureAccess(
  userId: string,
  companyId: string | null,
  featureKey: string
): Promise<boolean> {
  const { data, error } = await supabase.rpc('check_feature_access', {
    p_user_id: userId,
    p_company_id: companyId,
    p_feature_key: featureKey,
  })

  if (error) {
    console.error('[Feature Access] Check failed:', error)
    return false
  }

  return data
}

/**
 * Get user's current subscription
 */
export async function getUserSubscription(userId: string) {
  const { data, error } = await supabase
    .from('user_subscriptions')
    .select(`
      *,
      plan:subscription_plans(*)
    `)
    .eq('user_id', userId)
    .eq('status', 'active')
    .single()

  if (error) {
    console.error('[Subscription] Get failed:', error)
    return null
  }

  return data
}

/**
 * Get all active subscription plans
 */
export async function getSubscriptionPlans() {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .eq('is_active', true)
    .eq('is_visible', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('[Plans] Get failed:', error)
    throw error
  }

  return data
}

/**
 * Create or update user preferences
 */
export async function upsertUserPreferences(
  userId: string,
  companyId: string | null,
  preferences: any
) {
  const { data, error } = await supabase
    .from('user_preferences')
    .upsert({
      user_id: userId,
      company_id: companyId,
      ...preferences,
    })
    .select()
    .single()

  if (error) {
    console.error('[Preferences] Upsert failed:', error)
    throw error
  }

  return data
}

/**
 * Get user preferences
 */
export async function getUserPreferences(userId: string, companyId: string | null) {
  const { data, error } = await supabase
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .eq('company_id', companyId || null)
    .single()

  if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
    console.error('[Preferences] Get failed:', error)
    throw error
  }

  return data
}

/**
 * Full-text search contacts
 */
export async function searchContacts(
  userId: string,
  searchTerm: string,
  options?: {
    isClient?: boolean
    isVendor?: boolean
    limit?: number
  }
) {
  let query = supabase
    .from('contacts')
    .select('*')
    .eq('user_id', userId)
    .textSearch('search_vector', searchTerm)

  if (options?.isClient !== undefined) {
    query = query.eq('is_client', options.isClient)
  }

  if (options?.isVendor !== undefined) {
    query = query.eq('is_vendor', options.isVendor)
  }

  query = query.limit(options?.limit || 50)

  const { data, error } = await query

  if (error) {
    console.error('[Search] Contacts search failed:', error)
    throw error
  }

  return data
}

/**
 * Full-text search financial documents
 */
export async function searchDocuments(
  userId: string,
  searchTerm: string,
  documentType?: string,
  limit: number = 50
) {
  let query = supabase
    .from('financial_documents')
    .select('*')
    .eq('user_id', userId)
    .textSearch('search_vector', searchTerm)

  if (documentType) {
    query = query.eq('document_type', documentType)
  }

  query = query.limit(limit)

  const { data, error } = await query

  if (error) {
    console.error('[Search] Documents search failed:', error)
    throw error
  }

  return data
}

/**
 * Get dashboard stats (using materialized view)
 */
export async function getDashboardStats(userId: string, companyId: string | null) {
  const { data, error } = await supabase
    .from('dashboard_stats')
    .select('*')
    .eq('user_id', userId)
    .eq('company_id', companyId || null)
    .single()

  if (error && error.code !== 'PGRST116') {
    console.error('[Dashboard] Get stats failed:', error)
    throw error
  }

  return data
}

/**
 * Create a notification
 */
export async function createNotification(notification: {
  user_id: string
  company_id?: string | null
  type: string
  title: string
  message?: string
  link?: string
  priority?: 'low' | 'normal' | 'high' | 'urgent'
}) {
  const { data, error } = await supabase
    .from('notifications')
    .insert(notification)
    .select()
    .single()

  if (error) {
    console.error('[Notifications] Create failed:', error)
    throw error
  }

  return data
}

/**
 * Mark notification as read
 */
export async function markNotificationRead(notificationId: string) {
  const { error } = await supabase
    .from('notifications')
    .update({ read: true, read_at: new Date().toISOString() })
    .eq('id', notificationId)

  if (error) {
    console.error('[Notifications] Mark read failed:', error)
    throw error
  }
}

/**
 * Get unread notifications count
 */
export async function getUnreadNotificationsCount(userId: string): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false)

  if (error) {
    console.error('[Notifications] Count failed:', error)
    return 0
  }

  return count || 0
}

/**
 * Log activity
 */
export async function logActivity(activity: {
  user_id: string
  company_id?: string | null
  action: string
  entity_type: string
  entity_id?: string
  description?: string
  changes?: any
}) {
  const { error } = await supabase
    .from('activity_log')
    .insert(activity)

  if (error) {
    console.error('[Activity] Log failed:', error)
    // Don't throw - activity logging should not break the app
  }
}

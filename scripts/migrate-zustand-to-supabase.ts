/**
 * Migration Script: Zustand Local Storage → Supabase Database
 *
 * This script migrates all data from localStorage (Zustand stores) to Supabase.
 * Run this once per user to move from client-side to server-side storage.
 */

import { createClient } from '@/lib/supabase/client'
import { logActivity } from '@/lib/supabase/queries'

interface MigrationResult {
  success: boolean
  entity: string
  count: number
  errors: string[]
}

/**
 * Main migration function
 */
export async function migrateZustandToSupabase(): Promise<{
  results: MigrationResult[]
  totalMigrated: number
  totalErrors: number
}> {
  const supabase = createClient()
  const results: MigrationResult[] = []
  let totalMigrated = 0
  let totalErrors = 0

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User must be logged in to migrate data')
  }

  console.log('[Migration] Starting migration for user:', user.id)

  try {
    // Load all Zustand data from localStorage
    const savedData = localStorage.getItem('appio-settings')
    if (!savedData) {
      console.log('[Migration] No data found in localStorage')
      return { results: [], totalMigrated: 0, totalErrors: 0 }
    }

    const parsed = JSON.parse(savedData)

    // 1. Migrate User Account → user_profiles
    if (parsed.userAccount) {
      const accountResult = await migrateUserAccount(supabase, user.id, parsed.userAccount)
      results.push(accountResult)
      if (accountResult.success) totalMigrated += accountResult.count
      else totalErrors += accountResult.errors.length
    }

    // 2. Migrate Companies → companies table
    if (parsed.companies && Array.isArray(parsed.companies)) {
      const companiesResult = await migrateCompanies(supabase, user.id, parsed.companies)
      results.push(companiesResult)
      if (companiesResult.success) totalMigrated += companiesResult.count
      else totalErrors += companiesResult.errors.length
    }

    // 3. Migrate Work Calls → work_calls table
    if (parsed.workCalls && Array.isArray(parsed.workCalls)) {
      const callsResult = await migrateWorkCalls(supabase, user.id, parsed.workCalls)
      results.push(callsResult)
      if (callsResult.success) totalMigrated += callsResult.count
      else totalErrors += callsResult.errors.length
    }

    // 4. Migrate Entities (contacts, documents, etc.) → respective tables
    if (parsed.entities && Array.isArray(parsed.entities)) {
      const entitiesResult = await migrateEntities(supabase, user.id, parsed.entities)
      results.push(entitiesResult)
      if (entitiesResult.success) totalMigrated += entitiesResult.count
      else totalErrors += entitiesResult.errors.length
    }

    // 5. Migrate User Preferences → user_preferences table
    if (parsed.features) {
      const prefsResult = await migrateUserPreferences(supabase, user.id, parsed)
      results.push(prefsResult)
      if (prefsResult.success) totalMigrated += prefsResult.count
      else totalErrors += prefsResult.errors.length
    }

    // Log migration completion
    await logActivity({
      user_id: user.id,
      action: 'migration_completed',
      entity_type: 'system',
      description: `Migrated ${totalMigrated} records from localStorage to Supabase`,
      changes: { results }
    })

    console.log('[Migration] Complete:', { totalMigrated, totalErrors })

    return { results, totalMigrated, totalErrors }

  } catch (error) {
    console.error('[Migration] Fatal error:', error)
    throw error
  }
}

/**
 * Migrate user account to user_profiles
 */
async function migrateUserAccount(supabase: any, userId: string, account: any): Promise<MigrationResult> {
  const errors: string[] = []

  try {
    const { error } = await supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        full_name: account.name,
        email: account.email,
        phone: account.phone,
        metadata: {
          member_number: account.memberNumber,
          job_title: account.jobTitle,
          migrated_from_zustand: true,
          migrated_at: new Date().toISOString()
        }
      })

    if (error) {
      errors.push(`User profile: ${error.message}`)
      return { success: false, entity: 'user_profiles', count: 0, errors }
    }

    console.log('[Migration] User profile migrated')
    return { success: true, entity: 'user_profiles', count: 1, errors: [] }

  } catch (error: any) {
    errors.push(`User profile: ${error.message}`)
    return { success: false, entity: 'user_profiles', count: 0, errors }
  }
}

/**
 * Migrate companies to companies table
 */
async function migrateCompanies(supabase: any, userId: string, companies: any[]): Promise<MigrationResult> {
  const errors: string[] = []
  let count = 0

  try {
    for (const company of companies) {
      const { error } = await supabase
        .from('companies')
        .upsert({
          code: company.code,
          name: company.name,
          owner_id: userId,
          settings: company.settings,
          linked_companies: company.linkedCompanies || [],
          metadata: {
            migrated_from_zustand: true,
            original_owner_id: company.ownerId
          }
        })

      if (error) {
        errors.push(`Company ${company.code}: ${error.message}`)
      } else {
        count++
      }
    }

    console.log(`[Migration] Migrated ${count}/${companies.length} companies`)
    return { success: errors.length === 0, entity: 'companies', count, errors }

  } catch (error: any) {
    errors.push(`Companies: ${error.message}`)
    return { success: false, entity: 'companies', count, errors }
  }
}

/**
 * Migrate work calls to work_calls table
 */
async function migrateWorkCalls(supabase: any, userId: string, workCalls: any[]): Promise<MigrationResult> {
  const errors: string[] = []
  let count = 0

  try {
    // Get user's companies to map company codes
    const { data: companies } = await supabase
      .from('companies')
      .select('id, code')
      .eq('owner_id', userId)

    const companyMap = new Map(companies?.map((c: any) => [c.code, c.id]) || [])

    for (const call of workCalls) {
      const companyId = companyMap.get(call.companyCode)
      if (!companyId) {
        errors.push(`Work call ${call.id}: Company ${call.companyCode} not found`)
        continue
      }

      const { error } = await supabase
        .from('work_calls')
        .insert({
          company_id: companyId,
          created_by_user_id: userId,
          call_type: call.type,
          title: call.title,
          description: call.description,
          location: call.location,
          customer_name: call.customerName,
          customer_phone: call.customerPhone,
          bonus: call.bonus,
          status: call.status,
          bid_mode: 'first-come',
          expires_at: new Date(call.expiresAt).toISOString(),
          created_at: new Date(call.createdAt).toISOString(),
          metadata: {
            migrated_from_zustand: true,
            original_id: call.id
          }
        })

      if (error) {
        errors.push(`Work call ${call.id}: ${error.message}`)
      } else {
        count++
      }
    }

    console.log(`[Migration] Migrated ${count}/${workCalls.length} work calls`)
    return { success: errors.length === 0, entity: 'work_calls', count, errors }

  } catch (error: any) {
    errors.push(`Work calls: ${error.message}`)
    return { success: false, entity: 'work_calls', count, errors }
  }
}

/**
 * Migrate entities (contacts, documents) to their respective tables
 */
async function migrateEntities(supabase: any, userId: string, entities: any[]): Promise<MigrationResult> {
  const errors: string[] = []
  let count = 0

  try {
    for (const entity of entities) {
      // Determine which table to insert into
      if (entity.entityType === 'contact') {
        const { error } = await supabase
          .from('contacts')
          .insert({
            user_id: userId,
            name: entity.data.name || 'Unknown',
            email: entity.data.email,
            phone: entity.data.phone,
            address: entity.data.address,
            city: entity.data.city,
            state: entity.data.state,
            zip: entity.data.zip,
            is_client: entity.data.type === 'client',
            is_vendor: entity.data.type === 'vendor',
            custom_fields: entity.data,
            created_at: new Date(entity.createdAt).toISOString()
          })

        if (error) {
          errors.push(`Contact ${entity.id}: ${error.message}`)
        } else {
          count++
        }
      }
      // Add more entity types as needed
    }

    console.log(`[Migration] Migrated ${count}/${entities.length} entities`)
    return { success: errors.length === 0, entity: 'entities', count, errors }

  } catch (error: any) {
    errors.push(`Entities: ${error.message}`)
    return { success: false, entity: 'entities', count, errors }
  }
}

/**
 * Migrate user preferences to user_preferences table
 */
async function migrateUserPreferences(supabase: any, userId: string, parsed: any): Promise<MigrationResult> {
  const errors: string[] = []

  try {
    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        company_id: null,
        feature_toggles: parsed.features || {},
        metadata: {
          migrated_from_zustand: true,
          api_keys: parsed.apiKeys || {},
          integrations: parsed.integrations || {}
        }
      })

    if (error) {
      errors.push(`Preferences: ${error.message}`)
      return { success: false, entity: 'user_preferences', count: 0, errors }
    }

    console.log('[Migration] User preferences migrated')
    return { success: true, entity: 'user_preferences', count: 1, errors: [] }

  } catch (error: any) {
    errors.push(`Preferences: ${error.message}`)
    return { success: false, entity: 'user_preferences', count: 0, errors }
  }
}

/**
 * Clear localStorage after successful migration
 */
export function clearLocalStorageAfterMigration() {
  const confirmed = confirm(
    'Migration complete! Clear localStorage?\n\n' +
    'This will remove all local data and force the app to use Supabase. ' +
    'Make sure migration was successful before proceeding.'
  )

  if (confirmed) {
    localStorage.removeItem('appio-settings')
    console.log('[Migration] localStorage cleared')
    window.location.reload()
  }
}

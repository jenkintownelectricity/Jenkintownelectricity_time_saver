import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAppStore } from '@/lib/store-new'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'

/**
 * Hook to set up real-time subscriptions for database changes
 * Call this in your root layout/component to enable live updates
 */
export function useRealtimeSubscriptions() {
  const {
    currentCompanyId,
    loadWorkCalls,
    loadMyClaimedCalls,
    loadContacts,
    loadCompanies,
  } = useAppStore()

  useEffect(() => {
    const supabase = createClient()

    // Subscribe to work calls changes
    const workCallsChannel = supabase
      .channel('work_calls_changes')
      .on<parameter name="file_path">('postgres_changes' as const, {
        event: '*',
        schema: 'public',
        table: 'work_calls',
      }, (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
        // Reload work calls when any change occurs
        loadWorkCalls()
        loadMyClaimedCalls()
      })
      .subscribe()

    // Subscribe to contacts changes
    const contactsChannel = supabase
      .channel('contacts_changes')
      .on('postgres_changes' as const, {
        event: '*',
        schema: 'public',
        table: 'contacts',
      }, (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
        loadContacts()
      })
      .subscribe()

    // Subscribe to companies changes
    const companiesChannel = supabase
      .channel('companies_changes')
      .on('postgres_changes' as const, {
        event: '*',
        schema: 'public',
        table: 'companies',
      }, (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
        loadCompanies()
      })
      .subscribe()

    // Subscribe to company_members changes (for on-call status)
    const membersChannel = supabase
      .channel('company_members_changes')
      .on('postgres_changes' as const, {
        event: '*',
        schema: 'public',
        table: 'company_members',
      }, (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
        // Could trigger a refresh of member data here
        loadCompanies()
      })
      .subscribe()

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(workCallsChannel)
      supabase.removeChannel(contactsChannel)
      supabase.removeChannel(companiesChannel)
      supabase.removeChannel(membersChannel)
    }
  }, [currentCompanyId, loadWorkCalls, loadMyClaimedCalls, loadContacts, loadCompanies])
}

/**
 * Hook to subscribe to a specific work call for live updates
 * Useful for watching a single call in detail
 */
export function useWorkCallSubscription(callId: string | null, onUpdate: (call: Record<string, unknown>) => void) {
  useEffect(() => {
    if (!callId) return

    const supabase = createClient()

    const channel = supabase
      .channel(`work_call_${callId}`)
      .on('postgres_changes' as const, {
        event: 'UPDATE',
        schema: 'public',
        table: 'work_calls',
        filter: `id=eq.${callId}`,
      }, (payload: RealtimePostgresChangesPayload<Record<string, unknown>>) => {
        if (payload.new) {
          onUpdate(payload.new)
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [callId, onUpdate])
}

/**
 * Hook to automatically expire old work calls
 * Runs every minute to check for expired calls
 */
export function useAutoExpireCalls() {
  const { currentCompanyId, loadWorkCalls } = useAppStore()

  useEffect(() => {
    if (!currentCompanyId) return

    const checkExpired = async () => {
      const { expireOldWorkCalls } = await import('@/lib/database/work-calls')
      const expiredCount = await expireOldWorkCalls(currentCompanyId)

      if (expiredCount > 0) {
        // Reload work calls if any were expired
        loadWorkCalls()
      }
    }

    // Check immediately
    checkExpired()

    // Then check every minute
    const interval = setInterval(checkExpired, 60 * 1000)

    return () => clearInterval(interval)
  }, [currentCompanyId, loadWorkCalls])
}

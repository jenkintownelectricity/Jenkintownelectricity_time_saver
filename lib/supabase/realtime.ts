import { supabase } from './client'
import { RealtimeChannel } from '@supabase/supabase-js'

/**
 * Subscribe to new work calls in real-time
 * Perfect for Uber-style instant notifications
 */
export function subscribeToWorkCalls(
  companyCode: string,
  onNewCall: (call: any) => void,
  onCallClaimed: (call: any) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`work_calls:${companyCode}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'work_calls',
        filter: `company_code=eq.${companyCode}`
      },
      (payload) => {
        console.log('[Realtime] New work call:', payload.new)
        onNewCall(payload.new)
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'work_calls',
        filter: `company_code=eq.${companyCode}`
      },
      (payload) => {
        // Check if call was claimed
        if (payload.new.status === 'claimed' && payload.old.status === 'active') {
          console.log('[Realtime] Work call claimed:', payload.new)
          onCallClaimed(payload.new)
        }
      }
    )
    .subscribe()

  return channel
}

/**
 * Subscribe to notifications for the current user
 */
export function subscribeToNotifications(
  userId: string,
  onNewNotification: (notification: any) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`notifications:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        console.log('[Realtime] New notification:', payload.new)
        onNewNotification(payload.new)
      }
    )
    .subscribe()

  return channel
}

/**
 * Subscribe to invoice payment status updates
 */
export function subscribeToInvoiceUpdates(
  userId: string,
  onInvoiceUpdate: (invoice: any) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`invoices:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'financial_documents',
        filter: `user_id=eq.${userId}`
      },
      (payload) => {
        if (payload.new.document_type === 'invoice') {
          console.log('[Realtime] Invoice updated:', payload.new)
          onInvoiceUpdate(payload.new)
        }
      }
    )
    .subscribe()

  return channel
}

/**
 * Subscribe to team presence (who's online/on-call)
 */
export function subscribeToTeamPresence(
  companyId: string,
  onPresenceUpdate: (presences: any) => void
): RealtimeChannel {
  const channel = supabase
    .channel(`presence:${companyId}`, {
      config: {
        presence: {
          key: companyId
        }
      }
    })
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState()
      onPresenceUpdate(state)
    })
    .subscribe()

  return channel
}

/**
 * Broadcast your online status to team
 */
export async function trackPresence(
  channel: RealtimeChannel,
  userId: string,
  isOnCall: boolean
) {
  await channel.track({
    user_id: userId,
    is_on_call: isOnCall,
    online_at: new Date().toISOString()
  })
}

/**
 * Unsubscribe from a channel
 */
export async function unsubscribe(channel: RealtimeChannel) {
  await supabase.removeChannel(channel)
}

/**
 * Unsubscribe from all channels
 */
export async function unsubscribeAll() {
  await supabase.removeAllChannels()
}

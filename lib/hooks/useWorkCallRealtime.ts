import { useEffect, useState } from 'react'
import { subscribeToWorkCalls, unsubscribe } from '@/lib/supabase/realtime'
import { createNotification } from '@/lib/supabase/queries'
import { RealtimeChannel } from '@supabase/supabase-js'

/**
 * Real-time Work Call Notifications Hook
 *
 * Subscribes to new work calls for a company and shows instant notifications.
 * Perfect for Uber-style job bidding system.
 *
 * Usage:
 * ```tsx
 * const { newCalls, claimedCalls } = useWorkCallRealtime('ELX-A3B', userId)
 * ```
 */
export function useWorkCallRealtime(
  companyCode: string | null,
  userId: string | null,
  isOnCall: boolean = false
) {
  const [newCalls, setNewCalls] = useState<any[]>([])
  const [claimedCalls, setClaimedCalls] = useState<any[]>([])
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  useEffect(() => {
    if (!companyCode || !userId || !isOnCall) {
      // Clean up existing subscription if user is offline
      if (channel) {
        unsubscribe(channel)
        setChannel(null)
      }
      return
    }

    console.log('[Realtime] Subscribing to work calls for', companyCode)

    // Subscribe to work calls
    const newChannel = subscribeToWorkCalls(
      companyCode,
      // On new call
      (call) => {
        console.log('[Realtime] New work call received:', call)

        // Add to new calls list
        setNewCalls((prev) => [...prev, call])

        // Show browser notification
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification('New Work Call Available!', {
            body: `${call.call_type.toUpperCase()}: ${call.title}\n$${call.bonus} bonus`,
            icon: '/icon.png',
            tag: call.id,
          })
        }

        // Play sound
        playNotificationSound()

        // Create in-app notification
        createNotification({
          user_id: userId,
          type: 'work_call_new',
          title: 'New Work Call',
          message: `${call.call_type.toUpperCase()}: ${call.title} ($${call.bonus} bonus)`,
          link: `/work-calls/${call.id}`,
          priority: call.call_type === 'emergency' ? 'urgent' : 'high',
        }).catch(console.error)
      },
      // On call claimed
      (call) => {
        console.log('[Realtime] Work call claimed:', call)

        // Remove from new calls
        setNewCalls((prev) => prev.filter((c) => c.id !== call.id))

        // Add to claimed calls
        setClaimedCalls((prev) => [...prev, call])
      }
    )

    setChannel(newChannel)

    // Request notification permission
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }

    // Cleanup on unmount
    return () => {
      console.log('[Realtime] Unsubscribing from work calls')
      unsubscribe(newChannel)
    }
  }, [companyCode, userId, isOnCall])

  return {
    newCalls,
    claimedCalls,
    clearNewCalls: () => setNewCalls([]),
    clearClaimedCalls: () => setClaimedCalls([]),
  }
}

/**
 * Play notification sound
 */
function playNotificationSound() {
  try {
    const audio = new Audio('/sounds/notification.mp3')
    audio.volume = 0.5
    audio.play().catch((e) => console.warn('Audio play failed:', e))
  } catch (error) {
    console.warn('Failed to play notification sound:', error)
  }
}

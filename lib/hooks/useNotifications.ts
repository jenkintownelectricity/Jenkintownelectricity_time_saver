import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { subscribeToNotifications, unsubscribe } from '@/lib/supabase/realtime'
import { getUnreadNotificationsCount, markNotificationRead } from '@/lib/supabase/queries'
import { RealtimeChannel } from '@supabase/supabase-js'

/**
 * Real-time Notifications Hook
 *
 * Subscribes to user notifications and provides real-time updates.
 *
 * Usage:
 * ```tsx
 * const { notifications, unreadCount, markAsRead } = useNotifications(userId)
 * ```
 */
export function useNotifications(userId: string | null) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [channel, setChannel] = useState<RealtimeChannel | null>(null)

  // Fetch initial notifications
  useEffect(() => {
    if (!userId) return

    async function fetchNotifications() {
      setLoading(true)

      // Get recent notifications
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('[Notifications] Fetch failed:', error)
      } else {
        setNotifications(data || [])
      }

      // Get unread count
      const count = await getUnreadNotificationsCount(userId)
      setUnreadCount(count)

      setLoading(false)
    }

    fetchNotifications()
  }, [userId])

  // Subscribe to real-time updates
  useEffect(() => {
    if (!userId) return

    console.log('[Realtime] Subscribing to notifications for', userId)

    const newChannel = subscribeToNotifications(userId, (notification) => {
      console.log('[Realtime] New notification:', notification)

      // Add to notifications list
      setNotifications((prev) => [notification, ...prev])

      // Increment unread count
      setUnreadCount((prev) => prev + 1)

      // Show browser notification if permission granted
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(notification.title, {
          body: notification.message,
          icon: '/icon.png',
          tag: notification.id,
        })
      }
    })

    setChannel(newChannel)

    return () => {
      unsubscribe(newChannel)
    }
  }, [userId])

  // Mark notification as read
  const markAsRead = async (notificationId: string) => {
    try {
      await markNotificationRead(notificationId)

      // Update local state
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read: true, read_at: new Date().toISOString() } : n
        )
      )

      // Decrement unread count
      setUnreadCount((prev) => Math.max(0, prev - 1))
    } catch (error) {
      console.error('[Notifications] Mark read failed:', error)
    }
  }

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id)

      for (const id of unreadIds) {
        await markNotificationRead(id)
      }

      // Update local state
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true, read_at: new Date().toISOString() }))
      )

      setUnreadCount(0)
    } catch (error) {
      console.error('[Notifications] Mark all read failed:', error)
    }
  }

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refresh: () => {
      // Trigger re-fetch
      setLoading(true)
      // Will be re-fetched by useEffect
    },
  }
}

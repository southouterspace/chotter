import { useEffect, useRef } from 'react'
import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export interface RealtimeSubscriptionOptions<T extends Record<string, any> = any> {
  table: string
  schema?: string
  filter?: string
  event?: 'INSERT' | 'UPDATE' | 'DELETE' | '*'
  onInsert?: (payload: RealtimePostgresChangesPayload<T>) => void
  onUpdate?: (payload: RealtimePostgresChangesPayload<T>) => void
  onDelete?: (payload: RealtimePostgresChangesPayload<T>) => void
  onChange?: (payload: RealtimePostgresChangesPayload<T>) => void
}

export function useRealtimeSubscription<T extends Record<string, any> = any>(
  channelName: string,
  options: RealtimeSubscriptionOptions<T>,
  enabled = true
) {
  const channelRef = useRef<RealtimeChannel | null>(null)
  const optionsRef = useRef(options)

  // Keep options ref updated
  useEffect(() => {
    optionsRef.current = options
  }, [options])

  useEffect(() => {
    if (!enabled) {
      return
    }

    const {
      table,
      schema = 'public',
      filter,
      event = '*',
      onInsert,
      onUpdate,
      onDelete,
      onChange,
    } = optionsRef.current

    // Create channel
    const channel = supabase.channel(channelName)

    // Configure subscription
    const config: any = {
      event,
      schema,
      table,
    }

    if (filter) {
      config.filter = filter
    }

    // Subscribe with callbacks
    channel.on('postgres_changes', config, (payload: RealtimePostgresChangesPayload<T>) => {
      // Call specific event handlers
      switch (payload.eventType) {
        case 'INSERT':
          onInsert?.(payload)
          break
        case 'UPDATE':
          onUpdate?.(payload)
          break
        case 'DELETE':
          onDelete?.(payload)
          break
      }

      // Call general change handler
      onChange?.(payload)
    })

    // Subscribe to channel
    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`[Realtime] Subscribed to ${channelName}`)
      } else if (status === 'CHANNEL_ERROR') {
        console.error(`[Realtime] Error subscribing to ${channelName}`)
      }
    })

    channelRef.current = channel

    // Cleanup
    return () => {
      console.log(`[Realtime] Unsubscribing from ${channelName}`)
      channel.unsubscribe()
      channelRef.current = null
    }
  }, [channelName, enabled])

  return channelRef
}

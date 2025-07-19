/**
 * Manages Supabase real-time subscriptions for video events
 */
import { Logger } from '../shared/logger.js'
import { STORAGE_KEYS } from '../shared/constants.js'
import { Utils } from '../shared/utils.js'

export class SubscriptionManager {
  constructor(supabase) {
    this.supabase = supabase
    this.logger = new Logger('SubscriptionManager')
    this.subscription = null
    this.currentRoomId = null
  }

  /**
   * Setup video event subscription for a room
   */
  async setupSubscription(roomId = null) {
    try {
      // Get room ID from parameter or storage
      if (!roomId) {
        const { currentRoom } = await Utils.safeStorageGet([STORAGE_KEYS.CURRENT_ROOM])
        if (!currentRoom) {
          this.logger.log('No current room found, skipping subscription setup')
          return false
        }
        roomId = currentRoom.id
      }

      // Don't recreate if already subscribed to the same room
      if (this.subscription && this.currentRoomId === roomId) {
        this.logger.log('Already subscribed to room:', roomId)
        return true
      }

      // Cleanup existing subscription
      await this.cleanup()

      this.logger.log('Setting up video event subscription for room:', roomId)
      this.currentRoomId = roomId

      this.subscription = this.supabase
        .channel('video-events')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'video_events',
            filter: `room_id=eq.${roomId}`
          },
          (payload) => {
            this.handleVideoEvent(payload.new)
          }
        )
        .subscribe((status) => {
          this.logger.log('Subscription status:', status)
        })

      // Store subscription reference
      await Utils.safeStorageSet({ 
        [STORAGE_KEYS.VIDEO_EVENT_SUBSCRIPTION]: {
          roomId,
          timestamp: Date.now()
        }
      })

      this.logger.log('Video event subscription created successfully')
      return true
    } catch (error) {
      this.logger.error('Error setting up video event subscription:', error)
      return false
    }
  }

  /**
   * Handle incoming video events
   */
  handleVideoEvent(eventData) {
    this.logger.log('Received video event from Supabase:', eventData)
    
    // Notify video sync manager about the event
    this.onVideoEvent?.(eventData)
  }

  /**
   * Cleanup subscription
   */
  async cleanup() {
    try {
      if (this.subscription) {
        this.supabase.removeChannel(this.subscription)
        this.subscription = null
        this.currentRoomId = null
        this.logger.log('Subscription cleaned up')
      }

      await Utils.safeStorageRemove([STORAGE_KEYS.VIDEO_EVENT_SUBSCRIPTION])
    } catch (error) {
      this.logger.error('Error cleaning up subscription:', error)
    }
  }

  /**
   * Cleanup all subscriptions
   */
  async cleanupAll() {
    try {
      this.supabase.removeAllChannels()
      this.subscription = null
      this.currentRoomId = null
      await Utils.safeStorageRemove([STORAGE_KEYS.VIDEO_EVENT_SUBSCRIPTION])
      this.logger.log('All subscriptions cleaned up')
    } catch (error) {
      this.logger.error('Error cleaning up all subscriptions:', error)
    }
  }

  /**
   * Set video event callback
   */
  setVideoEventCallback(callback) {
    this.onVideoEvent = callback
  }

  /**
   * Get current subscription status
   */
  getSubscriptionStatus() {
    return {
      isSubscribed: !!this.subscription,
      roomId: this.currentRoomId,
      hasCallback: !!this.onVideoEvent
    }
  }
}

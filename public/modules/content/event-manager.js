/**
 * Manages video event listeners and broadcasting
 */
import { Logger } from '../shared/logger.js'
import { VIDEO_EVENTS, MESSAGE_TYPES } from '../shared/constants.js'

export class EventManager {
  constructor() {
    this.logger = new Logger('EventManager')
    this.currentVideo = null
    this.eventListeners = new Map()
    this.isProcessingRemoteEvent = false
    this.roomId = null
  }

  /**
   * Set the room ID for event broadcasting
   */
  setRoomId(roomId) {
    this.roomId = roomId
    this.logger.log('Room ID set:', roomId)
  }

  /**
   * Setup event listeners on a video element
   */
  setupEventListeners(video) {
    if (!video) {
      this.logger.warn('Cannot setup event listeners on null video')
      return
    }

    // Remove existing listeners if switching videos
    this.removeEventListeners()

    this.currentVideo = video
    this.logger.log('Setting up event listeners on video element')

    // Create bound event handlers
    const playHandler = () => this.handleVideoEvent(VIDEO_EVENTS.PLAY)
    const pauseHandler = () => this.handleVideoEvent(VIDEO_EVENTS.PAUSE)
    const seekedHandler = () => this.handleVideoEvent(VIDEO_EVENTS.SEEKED)

    // Add event listeners
    video.addEventListener('play', playHandler)
    video.addEventListener('pause', pauseHandler)
    video.addEventListener('seeked', seekedHandler)

    // Store references for cleanup
    this.eventListeners.set('play', playHandler)
    this.eventListeners.set('pause', pauseHandler)
    this.eventListeners.set('seeked', seekedHandler)

    this.logger.log('Event listeners added successfully')
  }

  /**
   * Remove event listeners from current video
   */
  removeEventListeners() {
    if (!this.currentVideo) return

    this.logger.log('Removing event listeners from video element')

    // Remove all stored event listeners
    this.eventListeners.forEach((handler, eventType) => {
      this.currentVideo.removeEventListener(eventType, handler)
    })

    this.eventListeners.clear()
    this.currentVideo = null
  }

  /**
   * Handle video events and broadcast them
   */
  handleVideoEvent(eventType) {
    if (!this.roomId || !this.currentVideo) {
      this.logger.log('Cannot broadcast - missing room or video element')
      return
    }

    if (this.isProcessingRemoteEvent) {
      this.logger.log('Skipping broadcast - processing remote event')
      return
    }

    const eventData = {
      type: eventType,
      currentTime: this.currentVideo.currentTime,
      timestamp: Date.now(),
      roomId: this.roomId,
      senderId: chrome.runtime.id
    }

    this.logger.log(`Video ${eventType} event:`, eventData)
    this.broadcastEvent(eventData)
  }

  /**
   * Broadcast event to background script
   */
  async broadcastEvent(eventData) {
    try {
      await chrome.runtime.sendMessage({
        action: MESSAGE_TYPES.VIDEO.BROADCAST_EVENT,
        data: eventData
      })
    } catch (error) {
      this.logger.error('Error broadcasting event:', error)
    }
  }

  /**
   * Set remote event processing state
   */
  setProcessingRemoteEvent(isProcessing) {
    this.isProcessingRemoteEvent = isProcessing
    this.logger.debug('Remote event processing state:', isProcessing)
  }

  /**
   * Check if currently processing remote event
   */
  isProcessingRemote() {
    return this.isProcessingRemoteEvent
  }

  /**
   * Get current video element
   */
  getCurrentVideo() {
    return this.currentVideo
  }

  /**
   * Get event listener count (for debugging)
   */
  getListenerCount() {
    return this.eventListeners.size
  }

  /**
   * Cleanup all resources
   */
  cleanup() {
    this.removeEventListeners()
    this.roomId = null
    this.isProcessingRemoteEvent = false
    this.logger.log('EventManager cleaned up')
  }
}

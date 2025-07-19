/**
 * ReelRoom Content Script - Refactored
 * Main orchestrator for video sync on streaming platforms
 */
import { VideoDetector } from './modules/content/video-detector.js'
import { EventManager } from './modules/content/event-manager.js'
import { VideoController } from './modules/content/video-controller.js'
import { PlatformAdapter } from './modules/content/platform-adapter.js'
import { Logger } from './modules/shared/logger.js'
import { MESSAGE_TYPES, STORAGE_KEYS } from './modules/shared/constants.js'
import { Utils } from './modules/shared/utils.js'

class ReelRoomContentScript {
  constructor() {
    this.logger = new Logger('ContentScript')
    this.roomId = null
    this.initializeComponents()
    this.setupMessageListener()
    this.initialize()
  }

  /**
   * Initialize all content script components
   */
  initializeComponents() {
    this.logger.log('Initializing content script components on', window.location.hostname)

    // Initialize components
    this.platformAdapter = new PlatformAdapter()
    this.videoDetector = new VideoDetector()
    this.eventManager = new EventManager()
    this.videoController = new VideoController(this.eventManager)

    // Setup component interactions
    this.videoDetector.setOnVideoFound((video) => {
      this.handleVideoFound(video)
    })

    this.videoDetector.setOnVideoLost((video) => {
      this.handleVideoLost(video)
    })

    this.logger.log('Components initialized successfully')
  }

  /**
   * Setup Chrome runtime message listener
   */
  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message) => {
      this.handleMessage(message)
    })
  }

  /**
   * Initialize the content script
   */
  async initialize() {
    try {
      // Check if platform is supported
      if (!this.platformAdapter.isSupported()) {
        this.logger.log('Platform not supported, exiting')
        return
      }

      // Load room information
      await this.loadRoomInfo()

      if (!this.roomId) {
        this.logger.log('Not in a room, skipping video monitoring')
        return
      }

      // Start video monitoring
      this.startVideoMonitoring()

      this.logger.log('Content script initialization complete')
    } catch (error) {
      this.logger.error('Error during initialization:', error)
    }
  }

  /**
   * Load room information from storage
   */
  async loadRoomInfo() {
    try {
      const result = await Utils.safeStorageGet([STORAGE_KEYS.CURRENT_ROOM])
      
      if (result.currentRoom) {
        this.roomId = result.currentRoom.id
        this.eventManager.setRoomId(this.roomId)
        this.logger.log('Room ID loaded:', this.roomId)
      } else {
        this.logger.log('No room found in storage')
      }
    } catch (error) {
      this.logger.error('Error loading room info:', error)
    }
  }

  /**
   * Start video monitoring
   */
  startVideoMonitoring() {
    this.logger.log('Starting video monitoring')
    
    // Look for video immediately
    this.videoDetector.refresh()
    
    // Start continuous monitoring
    this.videoDetector.startMonitoring()
  }

  /**
   * Handle when a video element is found
   */
  handleVideoFound(video) {
    this.logger.log('Video element found, setting up event listeners')
    this.eventManager.setupEventListeners(video)
  }

  /**
   * Handle when a video element is lost
   */
  handleVideoLost() {
    this.logger.log('Video element lost, cleaning up event listeners')
    this.eventManager.removeEventListeners()
  }

  /**
   * Handle incoming messages from background script
   */
  async handleMessage(message) {
    this.logger.log('Received message:', message)

    try {
      switch (message.action) {
        case MESSAGE_TYPES.VIDEO.VIDEO_EVENT:
          await this.handleRemoteVideoEvent(message.data)
          break
        
        default:
          this.logger.log('Unknown message action:', message.action)
      }
    } catch (error) {
      this.logger.error('Error handling message:', error)
    }
  }

  /**
   * Handle remote video events
   */
  async handleRemoteVideoEvent(eventData) {
    this.logger.log('Processing remote video event:', eventData)

    // Use platform adapter for platform-specific handling if needed
    if (this.platformAdapter.usesKeyboardSimulation()) {
      await this.handlePlatformSpecificEvent(eventData)
    } else {
      await this.videoController.handleRemoteVideoEvent(eventData)
    }
  }

  /**
   * Handle platform-specific video events
   */
  async handlePlatformSpecificEvent(eventData) {
    const video = this.eventManager.getCurrentVideo()
    
    if (!video) {
      this.logger.log('No video element for platform-specific event')
      return
    }

    // Set processing state to prevent feedback
    this.eventManager.setProcessingRemoteEvent(true)

    try {
      const success = await this.platformAdapter.applyPlatformSync(
        video,
        eventData.event_type,
        eventData.video_time
      )

      this.logger.log('Platform-specific sync result:', success)
    } catch (error) {
      this.logger.error('Platform-specific sync error:', error)
    } finally {
      setTimeout(() => {
        this.eventManager.setProcessingRemoteEvent(false)
      }, this.platformAdapter.getSettings().cooldownDuration)
    }
  }

  /**
   * Get current state for debugging
   */
  getStatus() {
    return {
      roomId: this.roomId,
      platform: this.platformAdapter.getCurrentPlatform(),
      platformSettings: this.platformAdapter.getSettings(),
      hasVideo: !!this.eventManager.getCurrentVideo(),
      isMonitoring: this.videoDetector.isMonitoring(),
      listenerCount: this.eventManager.getListenerCount(),
      videoState: this.videoController.getVideoState()
    }
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    this.logger.log('Cleaning up content script')
    this.videoDetector.stopMonitoring()
    this.eventManager.cleanup()
  }
}

// Initialize the content script
const reelRoomContentScript = new ReelRoomContentScript()

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  reelRoomContentScript.cleanup()
})

// Export for debugging (optional)
if (typeof globalThis !== 'undefined') {
  globalThis.reelRoomContentScript = reelRoomContentScript
}

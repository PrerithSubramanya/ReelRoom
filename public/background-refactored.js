/**
 * ReelRoom Background Script - Refactored
 * Main orchestrator using modular components
 */
import { supabase as sb } from '../src/supabase.js'
import { AuthManager } from './modules/background/auth-manager.js'
import { MessageRouter } from './modules/background/message-router.js'
import { VideoSyncManager } from './modules/background/video-sync-manager.js'
import { SubscriptionManager } from './modules/background/subscription-manager.js'
import { PlatformDetector } from './modules/background/platform-detector.js'
import { Logger } from './modules/shared/logger.js'
import { MESSAGE_TYPES, CONFIG, STORAGE_KEYS } from './modules/shared/constants.js'

class ReelRoomBackground {
  constructor() {
    this.logger = new Logger('Background')
    this.initializeComponents()
    this.setupMessageHandlers()
    this.setupLifecycleHandlers()
  }

  /**
   * Initialize all background components
   */
  initializeComponents() {
    this.logger.log('Initializing ReelRoom background components')

    // Initialize core components
    this.platformDetector = new PlatformDetector()
    this.authManager = new AuthManager(sb)
    this.messageRouter = new MessageRouter()
    this.subscriptionManager = new SubscriptionManager(sb)
    this.videoSyncManager = new VideoSyncManager(sb, this.platformDetector)

    // Setup component interactions
    this.authManager.setAuthStateChangeCallback((event, session) => {
      this.handleAuthStateChange(event, session)
    })

    this.subscriptionManager.setVideoEventCallback((eventData) => {
      this.handleIncomingVideoEvent(eventData)
    })

    this.logger.log('All components initialized successfully')
  }

  /**
   * Setup message handlers for the message router
   */
  setupMessageHandlers() {
    const handlers = {
      // Authentication handlers
      [MESSAGE_TYPES.AUTH.LOGIN]: () => this.authManager.handleLogin(),
      [MESSAGE_TYPES.AUTH.LOGOUT]: () => this.authManager.handleLogout(),
      [MESSAGE_TYPES.AUTH.GET_AUTH_STATE]: () => this.authManager.getAuthState(),

      // Video sync handlers
      [MESSAGE_TYPES.VIDEO.BROADCAST_EVENT]: (message) => 
        this.videoSyncManager.broadcastVideoEvent(message.data),
      [MESSAGE_TYPES.VIDEO.SETUP_SUBSCRIPTION]: () => 
        this.subscriptionManager.setupSubscription(),
      [MESSAGE_TYPES.VIDEO.CLEANUP_SUBSCRIPTION]: () => 
        this.subscriptionManager.cleanup()
    }

    this.messageRouter.registerHandlers(handlers)
    this.logger.log('Message handlers registered')
  }

  /**
   * Setup lifecycle event handlers
   */
  setupLifecycleHandlers() {
    // Listen for storage changes (room changes)
    chrome.storage.onChanged.addListener((changes, areaName) => {
      this.handleStorageChange(changes, areaName)
    })

    // Check for existing session on startup
    this.handleStartup()

    this.logger.log('Lifecycle handlers setup complete')
  }

  /**
   * Handle authentication state changes
   */
  async handleAuthStateChange(event, session) {
    this.logger.log('Handling auth state change:', event)

    if (event === 'SIGNED_IN' && session) {
      this.logger.log('User signed in, setting up video subscription after delay')
      setTimeout(() => {
        this.subscriptionManager.setupSubscription()
      }, CONFIG.SUBSCRIPTION_SETUP_DELAY)
    }

    if (event === 'SIGNED_OUT') {
      this.logger.log('User signed out, cleaning up subscriptions')
      await this.subscriptionManager.cleanup()
    }
  }

  /**
   * Handle incoming video events from Supabase
   */
  async handleIncomingVideoEvent(eventData) {
    this.logger.log('Processing incoming video event from subscription')
    await this.videoSyncManager.handleIncomingVideoEvent(eventData)
  }

  /**
   * Handle storage changes (room joins/leaves)
   */
  async handleStorageChange(changes, areaName) {
    if (areaName !== 'local' || !changes[STORAGE_KEYS.CURRENT_ROOM]) {
      return
    }

    this.logger.log('Room storage changed, updating subscription')
    
    if (changes[STORAGE_KEYS.CURRENT_ROOM].newValue) {
      // Room was set, setup subscription
      setTimeout(() => {
        this.subscriptionManager.setupSubscription()
      }, CONFIG.ROOM_CHANGE_DELAY)
    } else {
      // Room was cleared, cleanup subscription
      await this.subscriptionManager.cleanup()
    }
  }

  /**
   * Handle application startup
   */
  async handleStartup() {
    this.logger.log('Handling application startup')

    try {
      const { data: { session } } = await sb.auth.getSession()
      
      if (session) {
        this.logger.log('Existing session found, setting up subscription after delay')
        setTimeout(() => {
          this.subscriptionManager.setupSubscription()
        }, CONFIG.STARTUP_SUBSCRIPTION_DELAY)
      }
    } catch (error) {
      this.logger.error('Error checking session on startup:', error)
    }
  }

  /**
   * Get application status for debugging
   */
  getStatus() {
    return {
      subscriptionStatus: this.subscriptionManager.getSubscriptionStatus(),
      registeredHandlers: this.messageRouter.getRegisteredHandlers(),
      platformDetector: !!this.platformDetector,
      authManager: !!this.authManager,
      videoSyncManager: !!this.videoSyncManager
    }
  }
}

// Initialize the background application
const reelRoomBackground = new ReelRoomBackground()

// Export for debugging (optional)
if (typeof globalThis !== 'undefined') {
  globalThis.reelRoomBackground = reelRoomBackground
}

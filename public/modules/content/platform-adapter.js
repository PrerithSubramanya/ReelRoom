/**
 * Platform-specific adaptations for video sync
 */
import { Logger } from '../shared/logger.js'
import { PLATFORMS, CONFIG } from '../shared/constants.js'
import { Utils } from '../shared/utils.js'

export class PlatformAdapter {
  constructor() {
    this.logger = new Logger('PlatformAdapter')
    this.currentPlatform = this.detectCurrentPlatform()
    this.settings = this.getPlatformSettings()
  }

  /**
   * Detect current platform from URL
   */
  detectCurrentPlatform() {
    const platform = Utils.detectPlatform(window.location.href)
    this.logger.log('Detected platform:', platform)
    return platform
  }

  /**
   * Get platform-specific settings
   */
  getPlatformSettings() {
    const allSettings = {
      [PLATFORMS.NETFLIX]: {
        requiresTimeSync: false,
        useKeyboardSimulation: false,
        syncThreshold: CONFIG.TIME_SYNC_THRESHOLD,
        cooldownDuration: CONFIG.COOLDOWN_DURATION,
        videoSelector: 'video',
        skipAds: true
      },
      [PLATFORMS.PRIMEVIDEO]: {
        requiresTimeSync: false,
        useKeyboardSimulation: false,
        syncThreshold: CONFIG.TIME_SYNC_THRESHOLD,
        cooldownDuration: CONFIG.COOLDOWN_DURATION,
        videoSelector: 'video',
        skipAds: true
      },
      [PLATFORMS.JIOHOTSTAR]: {
        requiresTimeSync: false,
        useKeyboardSimulation: false,
        syncThreshold: CONFIG.TIME_SYNC_THRESHOLD,
        cooldownDuration: CONFIG.COOLDOWN_DURATION,
        videoSelector: 'video',
        skipAds: true
      },
      [PLATFORMS.YOUTUBE]: {
        requiresTimeSync: false,
        useKeyboardSimulation: false,
        syncThreshold: CONFIG.TIME_SYNC_THRESHOLD,
        cooldownDuration: CONFIG.COOLDOWN_DURATION,
        videoSelector: 'video',
        skipAds: false
      }
    }

    const settings = allSettings[this.currentPlatform] || allSettings[PLATFORMS.UNKNOWN] || {
      requiresTimeSync: false,
      useKeyboardSimulation: false,
      syncThreshold: CONFIG.TIME_SYNC_THRESHOLD,
      cooldownDuration: CONFIG.COOLDOWN_DURATION,
      videoSelector: 'video',
      skipAds: false
    }

    this.logger.log('Platform settings:', settings)
    return settings
  }

  /**
   * Apply platform-specific video sync logic
   */
  async applyPlatformSync(video, command, targetTime) {
    const timeDiff = Math.abs(video.currentTime - targetTime)
    
    this.logger.log(`Applying ${this.currentPlatform} specific sync for ${command}`)

    switch (command) {
      case 'play':
        return await this.handlePlatformPlay(video, targetTime, timeDiff)
      case 'pause':
        return await this.handlePlatformPause(video, targetTime, timeDiff)
      case 'seeked':
        return await this.handlePlatformSeek(video, targetTime, timeDiff)
      default:
        this.logger.warn('Unknown command for platform sync:', command)
        return false
    }
  }

  /**
   * Handle platform-specific play logic
   */
  async handlePlatformPlay(video, targetTime, timeDiff) {
    if (video.paused) {
      // Pre-play time sync for platforms that need it
      if (this.settings.requiresTimeSync && timeDiff > this.settings.syncThreshold) {
        video.currentTime = targetTime
        this.logger.log(`${this.currentPlatform}: Time synced before play`)
      }

      if (this.settings.useKeyboardSimulation) {
        // Use keyboard simulation for problematic platforms
        this.simulateSpaceKey()
        this.logger.log(`${this.currentPlatform}: Used keyboard simulation for play`)
      } else {
        // Use standard video API
        await video.play()
        this.logger.log(`${this.currentPlatform}: Used video.play()`)
      }
      
      return true
    }
    
    return false
  }

  /**
   * Handle platform-specific pause logic
   */
  async handlePlatformPause(video, targetTime, timeDiff) {
    if (!video.paused) {
      if (this.settings.useKeyboardSimulation) {
        // Use keyboard simulation for problematic platforms
        this.simulateSpaceKey()
        this.logger.log(`${this.currentPlatform}: Used keyboard simulation for pause`)
      } else {
        // Use standard video API
        video.pause()
        this.logger.log(`${this.currentPlatform}: Used video.pause()`)
      }

      // Post-pause time sync for platforms that need it
      if (this.settings.requiresTimeSync && timeDiff > this.settings.syncThreshold) {
        setTimeout(() => {
          video.currentTime = targetTime
          this.logger.log(`${this.currentPlatform}: Time synced after pause`)
        }, 100)
      }
      
      return true
    }
    
    return false
  }

  /**
   * Handle platform-specific seek logic
   */
  async handlePlatformSeek(video, targetTime, timeDiff) {
    if (timeDiff > this.settings.syncThreshold) {
      video.currentTime = targetTime
      this.logger.log(`${this.currentPlatform}: Seek completed`)
      return true
    }
    
    return false
  }

  /**
   * Simulate spacebar key press for platforms that need it
   */
  simulateSpaceKey() {
    const spaceEvent = new KeyboardEvent('keydown', {
      code: 'Space',
      key: ' ',
      keyCode: 32,
      which: 32,
      bubbles: true
    })
    document.dispatchEvent(spaceEvent)
  }

  /**
   * Check if current platform is supported
   */
  isSupported() {
    return this.currentPlatform !== PLATFORMS.UNKNOWN
  }

  /**
   * Get current platform
   */
  getCurrentPlatform() {
    return this.currentPlatform
  }

  /**
   * Get platform settings
   */
  getSettings() {
    return this.settings
  }

  /**
   * Check if platform requires time synchronization
   */
  requiresTimeSync() {
    return this.settings.requiresTimeSync
  }

  /**
   * Check if platform uses keyboard simulation
   */
  usesKeyboardSimulation() {
    return this.settings.useKeyboardSimulation
  }
}

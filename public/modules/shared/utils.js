/**
 * Utility functions
 */
import { PLATFORMS, EXCLUDED_DOMAINS } from './constants.js'

export class Utils {
  /**
   * Detect platform from URL
   */
  static detectPlatform(url) {
    if (!url) return PLATFORMS.UNKNOWN
    
    if (url.includes('netflix.com')) return PLATFORMS.NETFLIX
    if (url.includes('primevideo.com') || url.includes('amazon.com')) return PLATFORMS.PRIMEVIDEO
    if (url.includes('hotstar.com') || url.includes('jiocinema.com')) return PLATFORMS.JIOHOTSTAR
    if (url.includes('youtube.com')) return PLATFORMS.YOUTUBE
    
    return PLATFORMS.UNKNOWN
  }

  /**
   * Check if URL should be excluded from video sync
   */
  static isExcludedDomain(url) {
    if (!url) return true
    return EXCLUDED_DOMAINS.some(domain => url.includes(domain))
  }

  /**
   * Generate all platform URL patterns
   */
  static getAllPlatformUrls() {
    return [
      '*://*.netflix.com/*',
      '*://*.primevideo.com/*',
      '*://*.amazon.com/*',
      '*://*.hotstar.com/*',
      '*://*.jiocinema.com/*',
      '*://*.youtube.com/*'
    ]
  }

  /**
   * Safe message sending with error handling
   */
  static async safeSendMessage(message) {
    try {
      await chrome.runtime.sendMessage(message)
    } catch (error) {
      if (!error.message.includes('Could not establish connection')) {
        throw error
      }
      // Ignore connection errors when popup is closed
    }
  }

  /**
   * Safe storage operations
   */
  static async safeStorageGet(keys) {
    try {
      return await chrome.storage.local.get(keys)
    } catch (error) {
      console.error('Storage get error:', error)
      return {}
    }
  }

  static async safeStorageSet(data) {
    try {
      await chrome.storage.local.set(data)
    } catch (error) {
      console.error('Storage set error:', error)
    }
  }

  static async safeStorageRemove(keys) {
    try {
      await chrome.storage.local.remove(keys)
    } catch (error) {
      console.error('Storage remove error:', error)
    }
  }
}

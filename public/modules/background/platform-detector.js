/**
 * Platform detection and management
 */
import { Logger } from '../shared/logger.js'
import { Utils } from '../shared/utils.js'

export class PlatformDetector {
  constructor() {
    this.logger = new Logger('PlatformDetector')
  }

  /**
   * Get current active platform from tabs
   */
  async getCurrentPlatform() {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
      const currentTab = tabs[0]
      
      if (!currentTab?.url) {
        this.logger.warn('No current tab URL found')
        return { platform: 'unknown', url: null, tab: null }
      }

      const platform = Utils.detectPlatform(currentTab.url)
      
      this.logger.log('Current platform detected:', platform, 'URL:', currentTab.url)
      
      return {
        platform,
        url: currentTab.url,
        tab: currentTab
      }
    } catch (error) {
      this.logger.error('Error detecting current platform:', error)
      return { platform: 'unknown', url: null, tab: null }
    }
  }

  /**
   * Get all streaming platform tabs
   */
  async getStreamingTabs() {
    try {
      const tabs = await chrome.tabs.query({ 
        url: Utils.getAllPlatformUrls()
      })
      
      // Filter out excluded domains
      const filteredTabs = tabs.filter(tab => 
        !Utils.isExcludedDomain(tab.url)
      )
      
      this.logger.log(`Found ${filteredTabs.length} streaming tabs out of ${tabs.length} total`)
      
      return filteredTabs.map(tab => ({
        id: tab.id,
        url: tab.url,
        platform: Utils.detectPlatform(tab.url)
      }))
    } catch (error) {
      this.logger.error('Error getting streaming tabs:', error)
      return []
    }
  }

  /**
   * Check if a URL is a supported streaming platform
   */
  isSupportedPlatform(url) {
    if (!url) return false
    if (Utils.isExcludedDomain(url)) return false
    
    const platform = Utils.detectPlatform(url)
    return platform !== 'unknown'
  }

  /**
   * Get platform-specific video sync settings
   */
  getPlatformSettings(platform) {
    const settings = {
      netflix: {
        requiresTimeSync: false,
        useKeyboardSimulation: false,
        syncThreshold: 1
      },
      primevideo: {
        requiresTimeSync: false,
        useKeyboardSimulation: false,
        syncThreshold: 1
      },
      jiohotstar: {
        requiresTimeSync: false,
        useKeyboardSimulation: false,
        syncThreshold: 1
      },
      youtube: {
        requiresTimeSync: false,
        useKeyboardSimulation: false,
        syncThreshold: 1
      }
    }
    
    return settings[platform] || settings.unknown || {
      requiresTimeSync: false,
      useKeyboardSimulation: false,
      syncThreshold: 1
    }
  }
}

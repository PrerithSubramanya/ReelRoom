/**
 * Detects and monitors video elements on the page
 */
import { Logger } from '../shared/logger.js'
import { CONFIG } from '../shared/constants.js'

export class VideoDetector {
  constructor() {
    this.logger = new Logger('VideoDetector')
    this.currentVideo = null
    this.monitoringInterval = null
    this.onVideoFound = null
    this.onVideoLost = null
  }

  /**
   * Find the best video element on the page
   */
  findMainVideoElement() {
    const videos = document.querySelectorAll('video')
    this.logger.log(`Found ${videos.length} video elements`)
    
    if (videos.length === 0) return null
    if (videos.length === 1) return videos[0]
    
    // Find the main video (largest, not muted, likely the main content)
    let bestVideo = null
    let bestScore = -1
    
    videos.forEach((video, index) => {
      const rect = video.getBoundingClientRect()
      const area = rect.width * rect.height
      const isVisible = rect.width > 0 && rect.height > 0 && !video.hidden
      const isMain = !video.muted && video.duration > 30 // Likely main content
      
      let score = area
      if (isMain) score += 1000000 // Heavily favor non-muted, longer videos
      if (isVisible) score += 100000
      
      this.logger.debug(`Video ${index}:`, {
        area,
        isVisible,
        isMain,
        muted: video.muted,
        duration: video.duration,
        score,
        src: video.src || video.currentSrc
      })
      
      if (score > bestScore) {
        bestScore = score
        bestVideo = video
      }
    })
    
    return bestVideo
  }

  /**
   * Start monitoring for video element changes
   */
  startMonitoring() {
    if (this.monitoringInterval) {
      this.logger.warn('Monitoring already started')
      return
    }

    this.logger.log('Starting video monitoring')
    
    this.monitoringInterval = setInterval(() => {
      this.checkForVideoChanges()
    }, CONFIG.VIDEO_CHECK_INTERVAL)
    
    // Check immediately
    this.checkForVideoChanges()
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
      this.stopMonitoring()
    })
  }

  /**
   * Stop monitoring for video elements
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
      this.logger.log('Video monitoring stopped')
    }
  }

  /**
   * Check for video element changes
   */
  checkForVideoChanges() {
    const newVideo = this.findMainVideoElement()
    
    if (newVideo && newVideo !== this.currentVideo) {
      this.logger.log('New video element detected')
      this.handleVideoFound(newVideo)
    } else if (!newVideo && this.currentVideo) {
      this.logger.log('Video element lost')
      this.handleVideoLost()
    }
  }

  /**
   * Handle when a video is found
   */
  handleVideoFound(video) {
    this.currentVideo = video
    
    this.logger.log('Video element found!', {
      paused: video.paused,
      currentTime: video.currentTime,
      readyState: video.readyState,
      src: video.src || video.currentSrc
    })
    
    if (this.onVideoFound) {
      this.onVideoFound(video)
    }
  }

  /**
   * Handle when a video is lost
   */
  handleVideoLost() {
    const previousVideo = this.currentVideo
    this.currentVideo = null
    
    if (this.onVideoLost) {
      this.onVideoLost(previousVideo)
    }
  }

  /**
   * Get current video element
   */
  getCurrentVideo() {
    return this.currentVideo
  }

  /**
   * Set callback for when video is found
   */
  setOnVideoFound(callback) {
    this.onVideoFound = callback
  }

  /**
   * Set callback for when video is lost
   */
  setOnVideoLost(callback) {
    this.onVideoLost = callback
  }

  /**
   * Check if currently monitoring
   */
  isMonitoring() {
    return !!this.monitoringInterval
  }

  /**
   * Force refresh video detection
   */
  refresh() {
    this.checkForVideoChanges()
  }
}

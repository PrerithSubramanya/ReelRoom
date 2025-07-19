/**
 * Controls video playback based on remote events
 */
import { Logger } from '../shared/logger.js'
import { VIDEO_EVENTS, CONFIG } from '../shared/constants.js'

export class VideoController {
  constructor(eventManager) {
    this.logger = new Logger('VideoController')
    this.eventManager = eventManager
  }

  /**
   * Handle remote video events
   */
  async handleRemoteVideoEvent(eventData) {
    const video = this.eventManager.getCurrentVideo()
    
    if (!video) {
      this.logger.log('No video element available for remote event')
      return false
    }

    if (this.eventManager.isProcessingRemote()) {
      this.logger.log('Already processing remote event, skipping')
      return false
    }

    this.logger.log('Handling remote event:', eventData)
    this.logger.debug('Current video state:', {
      paused: video.paused,
      currentTime: video.currentTime,
      readyState: video.readyState
    })
    
    // Set processing state to prevent feedback loops
    this.eventManager.setProcessingRemoteEvent(true)

    try {
      const success = await this.executeVideoCommand(video, eventData)
      return success
    } catch (error) {
      this.logger.error('Error handling remote event:', error)
      return false
    } finally {
      // Clear processing state after a delay
      setTimeout(() => {
        this.eventManager.setProcessingRemoteEvent(false)
        this.logger.debug('Remote event processing finished')
      }, CONFIG.COOLDOWN_DURATION)
    }
  }

  /**
   * Execute video command based on event data
   */
  async executeVideoCommand(video, eventData) {
    const command = eventData.event_type
    const targetTime = eventData.video_time
    const timeDiff = Math.abs(video.currentTime - targetTime)

    try {
      switch (command) {
        case VIDEO_EVENTS.PLAY:
          return await this.handlePlayCommand(video, targetTime, timeDiff)
        
        case VIDEO_EVENTS.PAUSE:
          return await this.handlePauseCommand(video, targetTime, timeDiff)
        
        case VIDEO_EVENTS.SEEKED:
          return await this.handleSeekCommand(video, targetTime, timeDiff)
        
        default:
          this.logger.warn('Unknown video command:', command)
          return false
      }
    } catch (error) {
      this.logger.error(`Error executing ${command} command:`, error)
      return false
    }
  }

  /**
   * Handle play command
   */
  async handlePlayCommand(video, targetTime, timeDiff) {
    this.logger.log('Syncing play event, time diff:', timeDiff)
    
    if (!video.paused) {
      this.logger.log('Video already playing')
      return true
    }

    // Sync time before playing if difference is significant
    if (timeDiff > CONFIG.TIME_SYNC_THRESHOLD) {
      this.logger.log('Syncing time before play')
      video.currentTime = targetTime
    }

    try {
      await video.play()
      this.logger.log('Play successful')
      return true
    } catch (error) {
      this.logger.error('Play failed:', error)
      
      // Retry after a short delay
      try {
        await new Promise(resolve => setTimeout(resolve, 100))
        await video.play()
        this.logger.log('Play retry successful')
        return true
      } catch (retryError) {
        this.logger.error('Play retry failed:', retryError)
        return false
      }
    }
  }

  /**
   * Handle pause command
   */
  async handlePauseCommand(video, targetTime, timeDiff) {
    this.logger.log('Syncing pause event, time diff:', timeDiff)
    
    if (video.paused) {
      this.logger.log('Video already paused')
      return true
    }

    try {
      video.pause()
      
      // Sync time after pausing if difference is significant
      if (timeDiff > CONFIG.TIME_SYNC_THRESHOLD) {
        this.logger.log('Syncing time after pause')
        video.currentTime = targetTime
      }
      
      this.logger.log('Pause successful')
      return true
    } catch (error) {
      this.logger.error('Pause failed:', error)
      return false
    }
  }

  /**
   * Handle seek command
   */
  async handleSeekCommand(video, targetTime, timeDiff) {
    this.logger.log('Syncing seek event, time diff:', timeDiff)
    
    // Only sync if difference is significant
    if (timeDiff > CONFIG.TIME_SYNC_THRESHOLD) {
      try {
        video.currentTime = targetTime
        this.logger.log('Seek successful')
        return true
      } catch (error) {
        this.logger.error('Seek failed:', error)
        return false
      }
    } else {
      this.logger.log('Time difference too small, skipping seek')
      return true
    }
  }

  /**
   * Get current video state
   */
  getVideoState() {
    const video = this.eventManager.getCurrentVideo()
    
    if (!video) {
      return null
    }

    return {
      paused: video.paused,
      currentTime: video.currentTime,
      duration: video.duration,
      readyState: video.readyState,
      src: video.src || video.currentSrc
    }
  }
}

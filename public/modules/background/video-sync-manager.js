/**
 * Manages video synchronization across tabs and platforms
 */
import { Logger } from '../shared/logger.js'

export class VideoSyncManager {
  constructor(supabase, platformDetector) {
    this.supabase = supabase
    this.platformDetector = platformDetector
    this.logger = new Logger('VideoSyncManager')
  }

  /**
   * Broadcast video event to room participants
   */
  async broadcastVideoEvent(eventData) {
    try {
      this.logger.log('Broadcasting video event:', eventData)
      
      const platformInfo = await this.platformDetector.getCurrentPlatform()
      
      const rpcParams = {
        room_uuid: eventData.roomId,
        event_type_param: eventData.type,
        video_time_param: eventData.currentTime,
        video_url_param: platformInfo.url,
        platform_param: platformInfo.platform,
        metadata_param: {
          client_timestamp: eventData.timestamp,
          userAgent: navigator.userAgent
        }
      }
      
      this.logger.log('Calling RPC with params:', rpcParams)

      const { data, error } = await this.supabase.rpc('broadcast_video_event', rpcParams)

      if (error) {
        this.logger.error('Error broadcasting video event:', error)
        return false
      }

      this.logger.log('Video event broadcasted successfully! Event ID:', data)
      return true
    } catch (error) {
      this.logger.error('Error in broadcastVideoEvent:', error)
      return false
    }
  }

  /**
   * Handle incoming video events and execute on appropriate tabs
   */
  async handleIncomingVideoEvent(eventData) {
    try {
      this.logger.log('Processing incoming video event:', eventData)
      
      const streamingTabs = await this.platformDetector.getStreamingTabs()
      
      if (streamingTabs.length === 0) {
        this.logger.log('No streaming tabs found to sync')
        return
      }

      this.logger.log(`Found ${streamingTabs.length} streaming tabs to notify`)

      const syncPromises = streamingTabs.map(tab => 
        this.syncVideoOnTab(tab, eventData)
      )

      await Promise.allSettled(syncPromises)
    } catch (error) {
      this.logger.error('Error handling incoming video event:', error)
    }
  }

  /**
   * Sync video on a specific tab
   */
  async syncVideoOnTab(tab, eventData) {
    try {
      this.logger.log(`Executing video command on tab ${tab.id} (${tab.url})`)
      
      const command = eventData.event_type
      const currentTime = eventData.video_time
      const platform = tab.platform
      const platformSettings = this.platformDetector.getPlatformSettings(platform)

      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: this.executeVideoCommand,
        args: [command, currentTime, platform, platformSettings]
      })

      this.logger.log(`Video command executed successfully on tab ${tab.id}`)
    } catch (error) {
      this.logger.log(`Could not execute video command on tab ${tab.id}:`, error)
    }
  }

  /**
   * Function injected into tabs to execute video commands
   * This function runs in the content script context
   */
  executeVideoCommand(command, currentTime, platform, platformSettings) {
    const video = document.querySelector('video')
    
    if (!video) {
      console.log('ReelRoom: No video element found for remote command')
      return
    }
    
    // Add cooldown to prevent rapid changes
    if (window.reelroomCooldown) {
      console.log('ReelRoom: Remote command blocked by cooldown')
      return
    }
    window.reelroomCooldown = true
    setTimeout(() => { window.reelroomCooldown = false }, 500)
    
    const hostname = window.location.hostname
    console.log(`ReelRoom: Executing remote ${command} on ${hostname}`)
    
    try {
      if (command === 'play') {
        if (video.paused) {
          // Sync time before playing for platforms that require it
          if (platformSettings.requiresTimeSync) {
            const timeDiff = Math.abs(video.currentTime - currentTime)
            if (timeDiff > platformSettings.syncThreshold) {
              video.currentTime = currentTime
              console.log(`ReelRoom: ${platform} time synced to ${currentTime}`)
            }
          }
          
          video.play()
          console.log(`ReelRoom: Remote video playing on ${hostname}`)
        }
      } else if (command === 'pause') {
        if (!video.paused) {
          video.pause()
          
          // Sync time after pausing for platforms that require it
          if (platformSettings.requiresTimeSync) {
            setTimeout(() => {
              const timeDiff = Math.abs(video.currentTime - currentTime)
              if (timeDiff > platformSettings.syncThreshold) {
                video.currentTime = currentTime
                console.log(`ReelRoom: ${platform} time synced to ${currentTime} after pause`)
              }
            }, 100)
          }
          
          console.log(`ReelRoom: Remote video paused on ${hostname}`)
        }
      }
    } catch (error) {
      console.error(`ReelRoom: Remote ${command} error:`, error)
    }
  }
}

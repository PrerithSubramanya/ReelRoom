import { supabase as sb } from '../src/supabase.js'

/**
 * Sends the current authentication state to all popup instances.
 * @param {object | null} session - The Supabase session object.
 */
async function sendAuthStateToPopups(session) {
  try {
    await chrome.runtime.sendMessage({
      type: 'AUTH_STATE_CHANGED',
      session: session,
    })
  } catch (error) {
    if (error.message.includes('Could not establish connection')) {
      // Popup not open, safe to ignore.
    } else {
      console.error('Error sending message:', error)
    }
  }
}

/**
 * Sends an error message to all popup instances.
 * @param {string} error - The error message to display.
 */
async function sendErrorToPopups(error) {
  try {
    await chrome.runtime.sendMessage({ type: 'ERROR', error: error })
  } catch {
    // Ignore if popup is not open
  }
}

/**
 * Handles the Google login flow using launchWebAuthFlow.
 */
async function handleLogin() {
  try {
    const manifest = chrome.runtime.getManifest()

    if (
      !manifest.oauth2 ||
      !manifest.oauth2.client_id ||
      manifest.oauth2.client_id === 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'
    ) {
      const errorMsg = 'Error: Missing or invalid "oauth2.client_id" in manifest.json.'
      sendErrorToPopups(errorMsg)
      console.error(errorMsg)
      return
    }

    // 1. Construct the Google Auth URL.
    const authUrl = new URL('https://accounts.google.com/o/oauth2/auth')
    const redirectUri = `https://${chrome.runtime.id}.chromiumapp.org`

    authUrl.searchParams.set('client_id', manifest.oauth2.client_id)
    authUrl.searchParams.set('response_type', 'id_token')
    authUrl.searchParams.set('redirect_uri', redirectUri)
    authUrl.searchParams.set('scope', manifest.oauth2.scopes.join(' '))
    // Nonce has been removed to prevent mismatch errors in this flow.

    // 2. Launch the web auth flow.
    chrome.identity.launchWebAuthFlow(
      {
        url: authUrl.href,
        interactive: true,
      },
      async (redirectedTo) => {
        if (chrome.runtime.lastError || !redirectedTo) {
          const errorMsg = chrome.runtime.lastError
            ? chrome.runtime.lastError.message
            : 'Login failed: The authentication process was cancelled.'
          console.error('Login failed:', errorMsg)
          sendErrorToPopups(errorMsg)
          return
        }

        try {
          // 3. Extract the ID token from the redirected URL.
          const url = new URL(redirectedTo)
          const params = new URLSearchParams(url.hash.substring(1))
          const id_token = params.get('id_token')

          if (!id_token) {
            const errorMsg = 'Login failed: ID token not found in redirect URL.'
            console.error(errorMsg)
            sendErrorToPopups(errorMsg)
            return
          }

          // 4. Sign in to Supabase with the ID token.
          // The nonce is not passed here, resolving the mismatch error.
          const { data, error } = await sb.auth.signInWithIdToken({
            provider: 'google',
            token: id_token,
          })

          if (error) {
            console.error('Supabase sign-in error:', error.message)
            sendErrorToPopups(`Supabase error: ${error.message}`)
            return
          }

          console.log('Successfully signed in:', data.session?.user?.email)
        } catch (e) {
          console.error('Error processing redirect URL:', e)
          sendErrorToPopups(`Login error: ${e.message}`)
        }
      },
    )
  } catch (err) {
    console.error('Login process setup error:', err.message)
    sendErrorToPopups(`Login setup failed: ${err.message}`)
  }
}

/**
 * Handles the logout flow.
 */
async function handleLogout() {
  const { error } = await sb.auth.signOut()
  if (error) {
    console.error('Supabase sign-out error:', error)
    sendErrorToPopups(`Logout failed: ${error.message}`)
  }
}

/**
 * Broadcasts a video event to room participants via Supabase
 */
async function broadcastVideoEvent(eventData) {
  try {
    console.log('🎬 ReelRoom: Broadcasting video event:', eventData)
    
    // Get current platform from URL
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true })
    const currentTab = tabs[0]
    let platform = 'unknown'
    
    console.log('🎬 ReelRoom: Current tab URL:', currentTab?.url)
    
    if (currentTab?.url) {
      if (currentTab.url.includes('netflix.com')) platform = 'netflix'
      else if (currentTab.url.includes('primevideo.com') || currentTab.url.includes('amazon.com')) platform = 'primevideo'
      else if (currentTab.url.includes('hotstar.com')) platform = 'hotstar'
      else if (currentTab.url.includes('jiocinema.com')) platform = 'jiocinema'
      else if (currentTab.url.includes('youtube.com')) platform = 'youtube'
    }
    
    console.log('🎬 ReelRoom: Detected platform:', platform)

    const rpcParams = {
      room_uuid: eventData.roomId,
      event_type_param: eventData.type,
      video_time_param: eventData.currentTime,
      video_url_param: currentTab?.url || null,
      platform_param: platform,
      metadata_param: {
        client_timestamp: eventData.timestamp,
        userAgent: navigator.userAgent
      }
    }
    
    console.log('🎬 ReelRoom: Calling RPC with params:', rpcParams)

    // Call Supabase function to broadcast event
    const { data, error } = await sb.rpc('broadcast_video_event', rpcParams)

    if (error) {
      console.error('🎬 ReelRoom: Error broadcasting video event:', error)
      return
    }

    console.log('🎬 ReelRoom: Video event broadcasted successfully! Event ID:', data)
  } catch (error) {
    console.error('🎬 ReelRoom: Error in broadcastVideoEvent:', error)
  }
}

/**
 * Sets up realtime subscription for video events
 */
async function setupVideoEventSubscription() {
  try {
    // Get current room info
    const { currentRoom } = await chrome.storage.local.get(['currentRoom'])
    if (!currentRoom) {
      console.log('🔄 ReelRoom: No current room found, skipping subscription setup')
      return
    }

    console.log('🔄 ReelRoom: Setting up video event subscription for room:', currentRoom.id)

    // Subscribe to video events for the current room
    const subscription = sb
      .channel('video-events')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'video_events',
          filter: `room_id=eq.${currentRoom.id}`
        },
        (payload) => {
          console.log('🔄 ReelRoom: Received video event from Supabase:', payload.new)
          
          // Forward event to content script
          chrome.tabs.query({ 
            url: ['*://*.netflix.com/*', '*://*.primevideo.com/*', '*://*.amazon.com/*', '*://*.hotstar.com/*', '*://*.jiocinema.com/*', '*://*.youtube.com/*']
          }, (tabs) => {
            // Filter out Google Meet and other excluded domains
            const filteredTabs = tabs.filter(tab => 
              !tab.url.includes('meet.google.com') && 
              !tab.url.includes('teams.microsoft.com') &&
              !tab.url.includes('zoom.us')
            )
            console.log(`🔄 ReelRoom: Found ${filteredTabs.length} streaming tabs to notify`)
            filteredTabs.forEach(async (tab) => {
              console.log(`🔄 ReelRoom: Executing video command on tab ${tab.id} (${tab.url})`)
              
              const eventData = payload.new
              const command = eventData.event_type
              const currentTime = eventData.video_time
              
              try {
                await chrome.scripting.executeScript({
                  target: { tabId: tab.id },
                  func: (command, currentTime) => {
                    // Simple execution - just find video and execute command
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
                    
                    if (command === 'play') {
                      if (video.paused) {
                        try {
                          // Sync time before playing for Hotstar only
                          if (hostname.includes('hotstar.com')) {
                            const timeDiff = Math.abs(video.currentTime - currentTime)
                            if (timeDiff > 1) {
                              video.currentTime = currentTime
                              console.log(`ReelRoom: Hotstar time synced to ${currentTime}`)
                            }
                          }
                          
                          video.play()
                          console.log(`ReelRoom: Remote video playing on ${hostname}`)
                        } catch (e) {
                          console.error('ReelRoom: Remote play error:', e)
                        }
                      }
                    } else if (command === 'pause') {
                      if (!video.paused) {
                        try {
                          video.pause()
                          
                          // Sync time after pausing for Hotstar only
                          if (hostname.includes('hotstar.com')) {
                            setTimeout(() => {
                              const timeDiff = Math.abs(video.currentTime - currentTime)
                              if (timeDiff > 1) {
                                video.currentTime = currentTime
                                console.log(`ReelRoom: Hotstar time synced to ${currentTime} after pause`)
                              }
                            }, 100)
                          }
                          
                          console.log(`ReelRoom: Remote video paused on ${hostname}`)
                        } catch (e) {
                          console.error('ReelRoom: Remote pause error:', e)
                        }
                      }
                    }
                  },
                  args: [command, currentTime]
                })
                console.log(`🔄 ReelRoom: Video command executed on tab ${tab.id}`)
              } catch (error) {
                console.log(`🔄 ReelRoom: Could not execute video command on tab ${tab.id}:`, error)
              }
            })
          })
        }
      )
      .subscribe((status) => {
        console.log('🔄 ReelRoom: Subscription status:', status)
      })

    console.log('🔄 ReelRoom: Video event subscription created:', subscription)

    // Store subscription reference
    chrome.storage.local.set({ videoEventSubscription: subscription })
  } catch (error) {
    console.error('🔄 ReelRoom: Error setting up video event subscription:', error)
  }
}

/**
 * Cleanup video event subscription
 */
async function cleanupVideoEventSubscription() {
  try {
    // Remove all channels with our specific name
    sb.removeAllChannels()
    chrome.storage.local.remove(['videoEventSubscription'])
    console.log('Video event subscription cleaned up successfully')
  } catch (error) {
    console.error('Error cleaning up video event subscription:', error)
  }
}

// --- Main Message Listener ---
chrome.runtime.onMessage.addListener((message) => {
  switch (message.type) {
    case 'LOGIN':
      handleLogin()
      break
    case 'LOGOUT':
      handleLogout()
      break
    case 'GET_AUTH_STATE':
      sb.auth.getSession().then(({ data }) => {
        sendAuthStateToPopups(data.session)
      })
      break
  }

  switch (message.action) {
    case 'broadcastVideoEvent':
      broadcastVideoEvent(message.data)
      break
    case 'setupVideoSubscription':
      setupVideoEventSubscription()
      break
    case 'cleanupVideoSubscription':
      cleanupVideoEventSubscription()
      break
  }
  // Don't return true since we're not sending a response
})

// --- Supabase Auth State Listener ---
sb.auth.onAuthStateChange((event, session) => {
  console.log('Supabase auth event:', event)
  sendAuthStateToPopups(session)
  
  // Set up video subscription when user logs in
  if (event === 'SIGNED_IN' && session) {
    console.log('🔄 User signed in, checking for room to set up video subscription...')
    setTimeout(() => {
      setupVideoEventSubscription()
    }, 2000) // Give time for room data to be set
  }
  
  // Clean up when user logs out
  if (event === 'SIGNED_OUT') {
    console.log('🔄 User signed out, cleaning up video subscription...')
    cleanupVideoEventSubscription()
  }
})

// Check for existing session and set up subscription on startup
sb.auth.getSession().then(({ data: { session } }) => {
  if (session) {
    console.log('🔄 Existing session found on startup, setting up video subscription...')
    setTimeout(() => {
      setupVideoEventSubscription()
    }, 3000)
  }
})

// Listen for storage changes to detect when user joins/creates a room
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.currentRoom) {
    console.log('🔄 Room storage changed, updating video subscription...')
    if (changes.currentRoom.newValue) {
      // Room was set, set up subscription
      setTimeout(() => {
        setupVideoEventSubscription()
      }, 1000)
    } else {
      // Room was cleared, clean up subscription
      cleanupVideoEventSubscription()
    }
  }
})

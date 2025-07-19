// ReelRoom Content Script - Simple Video Sync
console.log('ReelRoom: Simple content script loaded on', window.location.hostname);

let roomId = null;
let videoElement = null;
let isProcessingRemoteEvent = false;

// Get room info from storage
async function getRoomInfo() {
  try {
    const result = await chrome.storage.local.get(['currentRoom']);
    if (result.currentRoom) {
      roomId = result.currentRoom.id;
      console.log('ReelRoom: Room ID loaded:', roomId);
    } else {
      console.log('ReelRoom: No room found in storage');
    }
  } catch (error) {
    console.error('ReelRoom: Error getting room info:', error);
  }
}

// Broadcast video event
function broadcastVideoEvent(eventType) {
  if (!roomId || !videoElement) {
    console.log('ReelRoom: Cannot broadcast - missing room or video element');
    return;
  }

  if (isProcessingRemoteEvent) {
    console.log('ReelRoom: Skipping broadcast - processing remote event');
    return;
  }

  const eventData = {
    type: eventType,
    currentTime: videoElement.currentTime,
    timestamp: Date.now(),
    roomId: roomId,
    senderId: chrome.runtime.id // Add sender ID to prevent feedback loops
  };

  console.log('ReelRoom: Broadcasting event:', eventData);
  
  chrome.runtime.sendMessage({
    action: 'broadcastVideoEvent',
    data: eventData
  }).catch(error => {
    console.error('ReelRoom: Error broadcasting event:', error);
  });
}

// Handle remote video events
function handleRemoteVideoEvent(eventData) {
  if (!videoElement || isProcessingRemoteEvent) {
    console.log('ReelRoom: Skipping remote event - no video or processing', {
      hasVideo: !!videoElement,
      isProcessing: isProcessingRemoteEvent
    });
    return;
  }

  console.log('ReelRoom: Handling remote event:', eventData);
  console.log('ReelRoom: Current video state:', {
    paused: videoElement.paused,
    currentTime: videoElement.currentTime,
    readyState: videoElement.readyState
  });
  
  isProcessingRemoteEvent = true;

  try {
    const timeDiff = Math.abs(videoElement.currentTime - eventData.video_time);
    
    switch (eventData.event_type) {
      case 'play':
        console.log('ReelRoom: Syncing play event, time diff:', timeDiff);
        if (videoElement.paused) {
          if (timeDiff > 1) {
            console.log('ReelRoom: Syncing time before play');
            videoElement.currentTime = eventData.video_time;
          }
          videoElement.play().then(() => {
            console.log('ReelRoom: Play successful');
          }).catch(error => {
            console.error('ReelRoom: Play failed:', error);
            // Try again after a short delay
            setTimeout(() => {
              videoElement.play().catch(e => 
                console.error('ReelRoom: Play retry failed:', e)
              );
            }, 100);
          });
        } else {
          console.log('ReelRoom: Video already playing');
        }
        break;
      case 'pause':
        console.log('ReelRoom: Syncing pause event, time diff:', timeDiff);
        if (!videoElement.paused) {
          videoElement.pause();
          if (timeDiff > 1) {
            console.log('ReelRoom: Syncing time after pause');
            videoElement.currentTime = eventData.video_time;
          }
          console.log('ReelRoom: Pause successful');
        } else {
          console.log('ReelRoom: Video already paused');
        }
        break;
      case 'seeked':
        console.log('ReelRoom: Syncing seek event, time diff:', timeDiff);
        if (timeDiff > 1) {
          videoElement.currentTime = eventData.video_time;
          console.log('ReelRoom: Seek successful');
        }
        break;
    }
  } catch (error) {
    console.error('ReelRoom: Error handling remote event:', error);
  } finally {
    setTimeout(() => {
      isProcessingRemoteEvent = false;
      console.log('ReelRoom: Remote event processing finished');
    }, 500);
  }
}

// Setup video monitoring
function setupVideoMonitoring(video) {
  // Remove existing listeners if video element changes
  if (videoElement && videoElement !== video) {
    console.log('ReelRoom: Switching to new video element');
  }
  
  videoElement = video;
  console.log('ReelRoom: Video element found!', {
    paused: video.paused,
    currentTime: video.currentTime,
    readyState: video.readyState,
    src: video.src || video.currentSrc
  });
  
  video.addEventListener('play', () => {
    console.log('ReelRoom: Video is playing');
    broadcastVideoEvent('play');
  });

  video.addEventListener('pause', () => {
    console.log('ReelRoom: Video is paused');
    broadcastVideoEvent('pause');
  });

  video.addEventListener('seeked', () => {
    console.log('ReelRoom: Video seeked to new position');
    broadcastVideoEvent('seeked');
  });

  console.log('ReelRoom: Event listeners added to video element');
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message) => {
  console.log('ReelRoom: Received message:', message);
  
  if (message.action === 'videoEvent') {
    handleRemoteVideoEvent(message.data);
  }
});

// Find the best video element (largest, not muted, not hidden)
function findMainVideoElement() {
  const videos = document.querySelectorAll('video');
  console.log(`ReelRoom: Found ${videos.length} video elements`);
  
  if (videos.length === 0) return null;
  if (videos.length === 1) return videos[0];
  
  // Find the main video (largest, not muted, likely the main content)
  let bestVideo = null;
  let bestScore = -1;
  
  videos.forEach((video, index) => {
    const rect = video.getBoundingClientRect();
    const area = rect.width * rect.height;
    const isVisible = rect.width > 0 && rect.height > 0 && !video.hidden;
    const isMain = !video.muted && video.duration > 30; // Likely main content
    
    let score = area;
    if (isMain) score += 1000000; // Heavily favor non-muted, longer videos
    if (isVisible) score += 100000;
    
    console.log(`ReelRoom: Video ${index}:`, {
      area,
      isVisible,
      isMain,
      muted: video.muted,
      duration: video.duration,
      score,
      src: video.src || video.currentSrc
    });
    
    if (score > bestScore) {
      bestScore = score;
      bestVideo = video;
    }
  });
  
  return bestVideo;
}

// Continuously monitor for video element changes
function startVideoMonitoring() {
  const checkInterval = setInterval(() => {
    if (!roomId) return; // Don't monitor if not in a room
    
    const currentVideo = findMainVideoElement();
    
    if (currentVideo && currentVideo !== videoElement) {
      console.log('ReelRoom: New video element detected, setting up monitoring');
      setupVideoMonitoring(currentVideo);
    } else if (!currentVideo && videoElement) {
      console.log('ReelRoom: Video element lost');
      videoElement = null;
    }
  }, 2000); // Check every 2 seconds
  
  // Clear interval when leaving page
  window.addEventListener('beforeunload', () => {
    clearInterval(checkInterval);
  });
}

// Initialize
async function init() {
  await getRoomInfo();
  
  if (!roomId) {
    console.log('ReelRoom: Not in a room, skipping video monitoring');
    return;
  }
  
  // Look for video element immediately
  const video = findMainVideoElement();
  if (video) {
    setupVideoMonitoring(video);
  } else {
    console.log('ReelRoom: No video element found initially, will keep checking');
  }
  
  // Start continuous monitoring for video changes
  startVideoMonitoring();
}

init();

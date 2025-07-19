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
    return;
  }

  console.log('ReelRoom: Handling remote event:', eventData);
  isProcessingRemoteEvent = true;

  try {
    const timeDiff = Math.abs(videoElement.currentTime - eventData.video_time);
    
    switch (eventData.event_type) {
      case 'play':
        console.log('ReelRoom: Syncing play event');
        if (videoElement.paused) {
          if (timeDiff > 1) {
            videoElement.currentTime = eventData.video_time;
          }
          videoElement.play();
        }
        break;
      case 'pause':
        console.log('ReelRoom: Syncing pause event');
        if (!videoElement.paused) {
          videoElement.pause();
          if (timeDiff > 1) {
            videoElement.currentTime = eventData.video_time;
          }
        }
        break;
      case 'seeked':
        console.log('ReelRoom: Syncing seek event');
        if (timeDiff > 1) {
          videoElement.currentTime = eventData.video_time;
        }
        break;
    }
  } catch (error) {
    console.error('ReelRoom: Error handling remote event:', error);
  } finally {
    setTimeout(() => {
      isProcessingRemoteEvent = false;
    }, 500);
  }
}

// Setup video monitoring
function setupVideoMonitoring(video) {
  videoElement = video;
  console.log('ReelRoom: Video element found!', video);
  
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

// Initialize
async function init() {
  await getRoomInfo();
  
  // Look for video element
  const video = document.querySelector('video');
  if (video) {
    setupVideoMonitoring(video);
  } else {
    console.error('ReelRoom: Could not find a video element on the page');
    
    // Try again after a delay
    setTimeout(() => {
      const delayedVideo = document.querySelector('video');
      if (delayedVideo) {
        console.log('ReelRoom: Video element found after delay!');
        setupVideoMonitoring(delayedVideo);
      } else {
        console.error('ReelRoom: Still no video element found after delay');
      }
    }, 3000);
  }
}

init();

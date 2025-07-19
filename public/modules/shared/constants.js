/**
 * Application constants
 */
export const PLATFORMS = {
  NETFLIX: 'netflix',
  PRIMEVIDEO: 'primevideo',
  JIOHOTSTAR: 'jiohotstar',
  YOUTUBE: 'youtube',
  UNKNOWN: 'unknown'
}

export const VIDEO_EVENTS = {
  PLAY: 'play',
  PAUSE: 'pause',
  SEEKED: 'seeked'
}

export const MESSAGE_TYPES = {
  AUTH: {
    LOGIN: 'LOGIN',
    LOGOUT: 'LOGOUT',
    GET_AUTH_STATE: 'GET_AUTH_STATE',
    AUTH_STATE_CHANGED: 'AUTH_STATE_CHANGED'
  },
  VIDEO: {
    BROADCAST_EVENT: 'broadcastVideoEvent',
    SETUP_SUBSCRIPTION: 'setupVideoSubscription',
    CLEANUP_SUBSCRIPTION: 'cleanupVideoSubscription',
    VIDEO_EVENT: 'videoEvent'
  },
  ERROR: 'ERROR'
}

export const STORAGE_KEYS = {
  CURRENT_ROOM: 'currentRoom',
  VIDEO_EVENT_SUBSCRIPTION: 'videoEventSubscription'
}

export const PLATFORM_URLS = {
  [PLATFORMS.NETFLIX]: ['*://*.netflix.com/*'],
  [PLATFORMS.PRIMEVIDEO]: ['*://*.primevideo.com/*', '*://*.amazon.com/*'],
  [PLATFORMS.JIOHOTSTAR]: ['*://*.hotstar.com/*', '*://*.jiocinema.com/*'],
  [PLATFORMS.YOUTUBE]: ['*://*.youtube.com/*']
}

export const EXCLUDED_DOMAINS = [
  'meet.google.com',
  'teams.microsoft.com',
  'zoom.us'
]

export const CONFIG = {
  COOLDOWN_DURATION: 500,
  VIDEO_CHECK_INTERVAL: 2000,
  SUBSCRIPTION_SETUP_DELAY: 2000,
  STARTUP_SUBSCRIPTION_DELAY: 3000,
  ROOM_CHANGE_DELAY: 1000,
  TIME_SYNC_THRESHOLD: 1
}

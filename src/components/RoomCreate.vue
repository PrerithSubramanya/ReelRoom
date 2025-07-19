<template>
  <div class="flex flex-col h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100">
    <!-- Header -->
    <div class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 rounded-lg flex items-center justify-center overflow-hidden">
          <img src="/src/components/icons/ext-logo-32.png" alt="ReelRoom Logo" class="w-full h-full object-contain" />
        </div>
        <h1 class="text-lg font-semibold">ReelRoom</h1>
      </div>
      
      <div class="flex items-center gap-2">
        <!-- Leave Room button (only show when viewing existing room and user is not the host) -->
        <button
          v-if="isViewingExisting && !isCurrentUserHost"
          @click="leaveRoom"
          class="flex items-center gap-1 px-3 py-1.5 rounded-lg transition-colors text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 text-sm font-medium"
          title="Leave room"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013 3v1" />
          </svg>
          Leave Room
        </button>
        
        <!-- Back button -->
        <button
          @click="goBack"
          class="flex items-center gap-1 p-2 rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          title="Go back"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <main class="flex-1 py-4 px-4">
      <div class="max-w-sm mx-auto">
        
        <!-- Loading State: Checking existing room -->
        <div v-if="isInitialLoading" class="space-y-6">
          <div class="text-center">
            <div class="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <svg class="w-8 h-8 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            <h2 class="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
              Loading your room...
            </h2>
            <p class="text-sm text-gray-600 dark:text-gray-300">
              Please wait while we load your room details
            </p>
          </div>
        </div>

        <!-- Room Creation Form -->
        <div v-else-if="!roomCreated" class="space-y-6">
          <!-- Welcome Section -->
          <div class="text-center mb-6">
            <h2 class="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
              Create a New Room
            </h2>
            <p class="text-sm text-gray-600 dark:text-gray-300">
              Give your room a name and start watching together
            </p>
          </div>

          <!-- Room Creation Card -->
          <div class="rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
            <form @submit.prevent="createRoom" class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2" for="room-name">
                  Room Name
                </label>
                <input
                  v-model="roomName"
                  class="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 dark:text-gray-100"
                  id="room-name"
                  placeholder="Enter room name (e.g., Movie Night)"
                  type="text"
                  required
                  :disabled="isLoading"
                />
              </div>

              <button
                type="submit"
                :disabled="isLoading || !roomName.trim()"
                class="w-full border border-primary-200 dark:border-primary-700 bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white py-3 px-4 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200"
              >
                <svg v-if="isLoading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{{ isLoading ? 'Creating Room...' : 'Create Room' }}</span>
              </button>
            </form>

            <!-- Error message -->
            <div v-if="errorMsg" class="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div class="flex items-center gap-2">
                <svg class="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
                </svg>
                <p class="text-sm text-red-700 dark:text-red-300">{{ errorMsg }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Room Created Success -->
        <div v-else class="space-y-6">
          <!-- Success Section -->
          <div class="text-center mb-6">
            <div class="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <h2 class="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
              {{ isViewingExisting ? 'Your Room' : 'Room Created Successfully!' }}
            </h2>
            <p class="text-sm text-gray-600 dark:text-gray-300">
              {{ isViewingExisting ? 'Manage your room and see participants' : 'Share this room ID with others to join' }}
            </p>
          </div>

          <!-- Room ID Display -->
          <div class="rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20">
            <div class="text-center mb-4">
              <label class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                Room ID
              </label>
              <div class="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 font-mono text-sm break-all">
                {{ createdRoomId }}
              </div>
            </div>
            
            <button
              @click="copyToClipboard"
              class="w-full py-2.5 px-4 border border-green-200 dark:border-green-700 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 flex items-center justify-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              {{ copyText }}
            </button>
          </div>

          <!-- Participants Section -->
          <div class="rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Participants
              </h3>
              <span class="text-sm bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full">
                {{ participants.length }} {{ participants.length === 1 ? 'person' : 'people' }}
              </span>
            </div>

            <div v-if="participants.length === 1" class="text-center py-4">
              <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg class="w-6 h-6 text-white animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
                </svg>
              </div>
              <p class="text-sm text-gray-600 dark:text-gray-400">
                Waiting for others to join...
              </p>
            </div>

            <div v-else class="space-y-2">
              <div v-for="participant in participants" :key="participant.user_id" class="flex items-center gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg">
                <div class="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                  <span class="text-white text-sm font-medium">{{ getInitials(participant.full_name) }}</span>
                </div>
                <div class="flex-1">
                  <div class="flex items-center gap-2">
                    <span class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ participant.full_name }}</span>
                    <span v-if="participant.is_host" class="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 px-2 py-0.5 rounded-full font-medium">
                      Host
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { supabase } from '../supabase'

const router = useRouter()
const route = useRoute()

// Reactive state
const roomName = ref('')
const isLoading = ref(false)
const errorMsg = ref('')
const roomCreated = ref(false)
const createdRoomId = ref('')
const copyText = ref('Copy to Clipboard')
const participants = ref([])
const isViewingExisting = ref(false)
const existingRoom = ref(null)
const isCurrentUserHost = ref(false)
// Check if we have a roomId parameter to determine initial loading state
const isInitialLoading = ref(!!route.params.roomId)

// Realtime subscription
let subscription = null

const goBack = () => {
  // Clean up video subscription
  chrome.runtime.sendMessage({ action: 'cleanupVideoSubscription' })
  router.push({ name: 'Home' })
}

const leaveRoom = async () => {
  if (!existingRoom.value) return
  
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    
    // Remove user from room participants
    const { error } = await supabase
      .from('room_participants')
      .delete()
      .eq('room_id', existingRoom.value.id)
      .eq('user_id', user.id)
    
    if (error) {
      console.error('Error leaving room:', error)
      return
    }
    
    // Clean up local storage
    chrome.storage.local.remove(['currentRoom'])
    
    // Clean up video subscription
    chrome.runtime.sendMessage({ action: 'cleanupVideoSubscription' })
    
    // Navigate back to home
    router.push({ name: 'Home' })
    
  } catch (error) {
    console.error('Error leaving room:', error)
  }
}

const generateRoomId = (name) => {
  const cleanName = name.trim().replace(/\s+/g, '-').toLowerCase()
  const uuid = crypto.randomUUID().split('-')[0] // Use first part of UUID
  return `${cleanName}-${uuid}`
}

const createRoom = async () => {
  if (!roomName.value.trim()) {
    errorMsg.value = 'Room name is required'
    return
  }

  isLoading.value = true
  errorMsg.value = ''

  try {
    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      errorMsg.value = 'You must be logged in to create a room'
      return
    }

    // Check if user already has an active room (they created)
    const { data: existingRooms } = await supabase
      .from('rooms')
      .select('*')
      .eq('creator_id', user.id)
      .eq('is_active', true)

    if (existingRooms && existingRooms.length > 0) {
      errorMsg.value = 'You already have an active room. Please close it first.'
      return
    }

    // Generate room ID
    const roomId = generateRoomId(roomName.value)

    // Create room
    const { data: room, error: roomError } = await supabase
      .from('rooms')
      .insert({
        name: roomName.value.trim(),
        room_id: roomId,
        creator_id: user.id,
        is_active: true
      })
      .select()
      .single()

    if (roomError) {
      errorMsg.value = roomError.message
      return
    }

    // Add creator as participant
    const { error: participantError } = await supabase
      .from('room_participants')
      .insert({
        room_id: room.id,
        user_id: user.id,
        is_active: true
      })

    if (participantError) {
      errorMsg.value = participantError.message
      return
    }

    // Room created successfully - no need to update user profile as we removed that table

    // Set success state
    roomCreated.value = true
    createdRoomId.value = roomId
    isCurrentUserHost.value = true // Creator is always the host

    // Store room info in local storage for persistence
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    console.log('ReelRoom: Storing created room info in storage:', room)
    chrome.storage.local.set({ 
      currentRoom: room,
      userProfile: currentUser 
    })
    console.log('ReelRoom: Created room info stored successfully')

    // Load initial participants
    await loadParticipants(room.id)

    // Subscribe to realtime updates
    subscribeToParticipants(room.id)
    
    // Video subscription will be set up automatically by background script

  } catch (error) {
    errorMsg.value = error.message || 'Failed to create room'
  } finally {
    isLoading.value = false
  }
}

const loadParticipants = async (roomId) => {
  try {
    // Get room data to know who the host is
    const { data: roomInfo } = await supabase
      .from('rooms')
      .select('creator_id')
      .eq('id', roomId)
      .single()

    // Get room participants
    const { data: participantData } = await supabase
      .from('room_participants')
      .select('user_id, joined_at')
      .eq('room_id', roomId)
      .eq('is_active', true)

    if (!participantData || participantData.length === 0) {
      participants.value = []
      return
    }

    // Get user data for each participant using secure function
    const userIds = participantData.map(p => p.user_id)
    const { data: userData } = await supabase
      .rpc('get_visible_users', { user_ids: userIds })

    // Combine participant and user data with role information
    participants.value = participantData.map(p => {
      const user = userData?.find(u => u.id === p.user_id)
      const isHost = p.user_id === roomInfo?.creator_id
      return {
        user_id: p.user_id,
        joined_at: p.joined_at,
        full_name: user?.full_name || `${user?.first_name} ${user?.last_name}`.trim() || 'Unknown User',
        is_host: isHost,
        role: isHost ? 'Host' : 'Participant'
      }
    }).sort((a, b) => {
      // Sort by role (host first) then by join time
      if (a.is_host && !b.is_host) return -1
      if (!a.is_host && b.is_host) return 1
      return new Date(a.joined_at) - new Date(b.joined_at)
    })
  } catch (error) {
    console.error('Error loading participants:', error)
    participants.value = []
  }
}

const subscribeToParticipants = (roomId) => {
  subscription = supabase
    .channel('room-participants')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'room_participants',
        filter: `room_id=eq.${roomId}`
      },
      (payload) => {
        console.log('Participant change:', payload)
        // Reload participants when changes occur
        loadParticipants(roomId)
      }
    )
    .subscribe()
}

const copyToClipboard = async () => {
  try {
    await navigator.clipboard.writeText(createdRoomId.value)
    copyText.value = 'Copied!'
    setTimeout(() => {
      copyText.value = 'Copy to Clipboard'
    }, 2000)
  } catch (error) {
    console.error('Failed to copy:', error)
    copyText.value = 'Copy Failed'
    setTimeout(() => {
      copyText.value = 'Copy to Clipboard'
    }, 2000)
  }
}

const getInitials = (name) => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const loadExistingRoom = async (roomId) => {
  try {
    // Load room data
    const { data: roomData, error: roomError } = await supabase
      .from('rooms')
      .select('*')
      .eq('room_id', roomId)
      .eq('is_active', true)
      .single()
    
    if (roomError) {
      console.error('Error loading room:', roomError)
      errorMsg.value = 'Room not found or no longer active'
      return
    }
    
    existingRoom.value = roomData
    createdRoomId.value = roomData.room_id
    roomCreated.value = true
    isViewingExisting.value = true
    
    // Check if current user is the host
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    isCurrentUserHost.value = roomData.creator_id === currentUser?.id
    
    // Load participants and start subscription
    await loadParticipants(roomData.id)
    subscribeToParticipants(roomData.id)
    
    // Video subscription will be set up automatically by background script
    
  } catch (error) {
    console.error('Error loading existing room:', error)
    errorMsg.value = 'Failed to load room'
  }
}

onMounted(async () => {
  // Check if we're viewing an existing room
  const roomId = route.params.roomId
  if (roomId) {
    await loadExistingRoom(roomId)
    isInitialLoading.value = false
  }
})

onUnmounted(() => {
  // Clean up subscription
  if (subscription) {
    subscription.unsubscribe()
  }
  // Clean up video subscription
  chrome.runtime.sendMessage({ action: 'cleanupVideoSubscription' })
})
</script>

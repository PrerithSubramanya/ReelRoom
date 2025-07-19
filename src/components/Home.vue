<template>
  <div
    class="flex flex-col h-full text-gray-900 dark:text-gray-100 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800"
  >
    <!-- Header -->
    <header
      class="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700"
    >
      <div class="flex items-center gap-2">
        <div
          class="w-7 h-7 rounded-lg flex items-center justify-center overflow-hidden"
        >
          <img src="/src/components/icons/ext-logo-32.png" alt="ReelRoom Logo" class="w-full h-full object-contain" />
        </div>
        <h1 class="text-lg font-semibold">ReelRoom</h1>
      </div>

      <div class="flex items-center gap-2">
        <!-- Logout button -->
        <button
          @click="handleLogout"
          class="flex items-center gap-2 p-2 rounded-lg transition-colors text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
          title="Click to logout"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
        </button>
      </div>
    </header>

    <!-- Main Content -->
    <main class="flex-1 py-4 px-4">
      <div class="max-w-sm mx-auto">
        <!-- Welcome Section -->
        <div class="text-center mb-6">
          <h2 class="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
            {{ existingRoom ? 'Your Watch Room' : 'Ready to watch together?' }}
          </h2>
          <p class="text-sm text-gray-600 dark:text-gray-300">
            {{ existingRoom ? 'Manage your room or join others' : 'Create or join a room to sync your viewing experience' }}
          </p>
        </div>

        <!-- Loading State -->
        <div v-if="isCheckingRooms" class="space-y-4">
          <div class="rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700 bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900">
            <div class="flex items-center justify-center py-8">
              <div class="text-center">
                <div class="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg class="w-6 h-6 text-white animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </div>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  Checking for existing rooms...
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Cards -->
        <div v-else class="space-y-4">
          <!-- Existing Room Card -->
          <div
            v-if="existingRoom"
            class="rounded-xl p-4 shadow-md border border-gray-200 dark:border-gray-700 transition-shadow hover:shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20"
          >
            <div class="flex items-center gap-3 mb-3">
              <div
                class="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-green-500 to-emerald-600"
              >
                <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 class="font-medium text-gray-900 dark:text-gray-100">Your Room</h3>
                <p class="text-xs text-gray-600 dark:text-gray-400">Room ID: {{ existingRoom.room_id }}</p>
              </div>
            </div>
            
            <div class="space-y-2">
              <div class="text-sm text-gray-600 dark:text-gray-400">
                Created: {{ new Date(existingRoom.created_at).toLocaleDateString() }}
              </div>
              
              <div class="flex gap-2">
                <button
                  @click="router.push({ name: 'RoomCreate', params: { roomId: existingRoom.room_id } })"
                  class="flex-1 py-2 px-3 border border-green-200 dark:border-green-700 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 bg-white dark:bg-gray-800 text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                >
                  View Room
                </button>
                <button
                  @click="confirmDelete"
                  class="px-3 py-2 border border-red-200 dark:border-red-700 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>

          <!-- Create Room Card -->
          <div
            v-else
            class="rounded-xl p-4 shadow-md border border-gray-200 dark:border-gray-700 transition-shadow hover:shadow-lg bg-gradient-to-br from-primary-50 to-primary-100 dark:from-primary-900/20 dark:to-primary-800/20"
          >
            <div class="flex items-center gap-3 mb-3">
              <div
                class="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-600"
              >
                <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fill-rule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clip-rule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h3 class="font-medium text-gray-900 dark:text-gray-100">Create Room</h3>
                <p class="text-xs text-gray-600 dark:text-gray-400">Start a new watch party</p>
              </div>
            </div>
            <button
              @click="createServer"
              class="w-full py-2.5 px-4 border border-primary-200 dark:border-primary-700 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 hover:bg-primary-50 dark:hover:bg-primary-900/20"
            >
              Create New Room
            </button>
          </div>

          <!-- Divider -->
          <div class="relative py-2">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-200 dark:border-gray-700"></div>
            </div>
            <div class="relative flex justify-center">
              <span
                class="px-3 text-xs bg-gray-50 dark:bg-gray-900 text-gray-500 dark:text-gray-400"
                >OR</span
              >
            </div>
          </div>

          <!-- Join Room Card -->
          <div
            class="rounded-xl p-4 shadow-md border border-gray-200 dark:border-gray-700 transition-shadow hover:shadow-lg bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20"
          >
            <div class="flex items-center gap-3 mb-4">
              <div
                class="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-500"
              >
                <svg class="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 class="font-medium text-gray-900 dark:text-gray-100">Join Room</h3>
                <p class="text-xs text-gray-600 dark:text-gray-400">
                  Enter an existing room ID
                </p>
              </div>
            </div>

            <form @submit.prevent="joinServer" class="space-y-3">
              <div>
                <label class="sr-only" for="room-id">Room ID</label>
                <input
                  v-model="roomId"
                  class="w-full px-3 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  id="room-id"
                  name="room-id"
                  placeholder="Enter Room ID (e.g., ABC123)"
                  required
                  type="text"
                />
              </div>
              <button
                type="submit"
                class="w-full py-2.5 px-4 border border-amber-200 dark:border-amber-700 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 bg-white dark:bg-gray-800 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20"
              >
                Join Room
              </button>
            </form>
          </div>
        </div>
      </div>
    </main>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteConfirmation"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      @click="cancelDelete"
    >
      <div
        class="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm mx-4 shadow-xl"
        @click.stop
      >
        <div class="flex items-center gap-3 mb-4">
          <div class="w-8 h-8 rounded-lg flex items-center justify-center bg-red-100 dark:bg-red-900/20">
            <svg class="w-4 h-4 text-red-600 dark:text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" clip-rule="evenodd" />
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
            </svg>
          </div>
          <h3 class="text-lg font-semibold text-gray-900 dark:text-gray-100">Delete Room</h3>
        </div>
        
        <p class="text-sm text-gray-600 dark:text-gray-400 mb-6">
          Are you sure you want to delete your room? This action cannot be undone.
        </p>
        
        <div class="flex gap-3">
          <button
            @click="cancelDelete"
            class="flex-1 py-2 px-4 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button
            @click="deleteRoom"
            class="flex-1 py-2 px-4 border border-red-200 dark:border-red-700 rounded-lg text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'

const router = useRouter()
const user = ref(null)
const roomId = ref('')
const existingRoom = ref(null)
const showDeleteConfirmation = ref(false)
const isCheckingRooms = ref(true)

const handleLogout = () => {
  chrome.runtime.sendMessage({ source: 'vue-app', type: 'LOGOUT' })
}

const createServer = () => {
  router.push({ name: 'RoomCreate' })
}

const joinServer = async () => {
  if (!roomId.value.trim()) {
    console.error('Room ID is required.')
    return
  }
  
  const roomIdToJoin = roomId.value.trim()
  
  try {
    // Try to find room using secure function first (bypasses RLS)
    let finalRoomData = null
    
    try {
      const { data: roomFromFunction } = await supabase
        .rpc('find_room_by_id', { room_id_param: roomIdToJoin })
      
      if (roomFromFunction && roomFromFunction.length > 0) {
        finalRoomData = roomFromFunction[0]
      }
    } catch {
      // Function doesn't exist, fall back to direct queries
      console.log('find_room_by_id function not available, using fallback')
    }
    
    // Fallback: Try multiple search strategies if function failed
    if (!finalRoomData) {
      // Strategy 1: Exact match with is_active
      const { data: roomExact } = await supabase
        .from('rooms')
        .select('*')
        .eq('room_id', roomIdToJoin)
        .eq('is_active', true)
        .single()
      
      if (roomExact) {
        finalRoomData = roomExact
      } else {
        // Strategy 2: Case insensitive match with is_active
        const { data: roomIlike } = await supabase
          .from('rooms')
          .select('*')
          .ilike('room_id', roomIdToJoin)
          .eq('is_active', true)
          .single()
        
        if (roomIlike) {
          finalRoomData = roomIlike
        }
      }
    }
    
    // Check if room was found
    if (!finalRoomData) {
      alert('Room not found or no longer active. Please check the Room ID.')
      return
    }
    
    // Check if user is already in the room
    const { data: existingParticipant } = await supabase
      .from('room_participants')
      .select('*')
      .eq('room_id', finalRoomData.id)
      .eq('user_id', user.value.id)
      .eq('is_active', true)
      .single()
    
    if (existingParticipant) {
      // User is already in room, just navigate there
      router.push({ name: 'RoomCreate', params: { roomId: finalRoomData.room_id } })
      return
    }
    
    // Add user to room
    const { error: joinError } = await supabase
      .from('room_participants')
      .insert({
        room_id: finalRoomData.id,
        user_id: user.value.id,
        is_active: true
      })
    
    if (joinError) {
      console.error('Error joining room:', joinError)
      alert('Failed to join room. Please try again.')
      return
    }
    
    // Store room info in local storage for persistence
    console.log('ReelRoom: Storing room info in storage:', finalRoomData)
    chrome.storage.local.set({ 
      currentRoom: finalRoomData,
      userProfile: user.value 
    })
    console.log('ReelRoom: Room info stored successfully')
    
    // Video subscription will be set up automatically by background script
    
    // Navigate to the room
    router.push({ name: 'RoomCreate', params: { roomId: finalRoomData.room_id } })
    
  } catch (error) {
    console.error('Error joining room:', error)
    alert('An error occurred while joining the room. Please try again.')
  }
}

const checkExistingRoom = async () => {
  if (!user.value) {
    isCheckingRooms.value = false
    return
  }
  
  try {
    // First try the RPC function
    const { data, error } = await supabase.rpc('get_user_rooms', {
      user_id: user.value.id
    })
    
    if (error) {
      // The get_user_rooms function doesn't exist yet, which is expected
      // Fall back to direct table query
      const { data: roomData, error: roomError } = await supabase
        .from('rooms')
        .select('*')
        .eq('creator_id', user.value.id)
        .eq('is_active', true)
        .limit(1)
      
      if (roomError) {
        console.error('Error loading user rooms:', roomError)
        isCheckingRooms.value = false
        return
      }
      
      if (roomData && roomData.length > 0) {
        existingRoom.value = roomData[0]
      }
      isCheckingRooms.value = false
      return
    }
    
    if (data && data.length > 0) {
      existingRoom.value = data[0]
    }
    isCheckingRooms.value = false
  } catch (error) {
    console.error('Error checking existing room:', {
      message: error.message,
      name: error.name,
      stack: error.stack
    })
    isCheckingRooms.value = false
  }
}

const deleteRoom = async () => {
  if (!existingRoom.value) return
  
  try {
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', existingRoom.value.id)
    
    if (error) {
      console.error('Error deleting room:', error)
      return
    }
    
    existingRoom.value = null
    showDeleteConfirmation.value = false
  } catch (error) {
    console.error('Error deleting room:', error)
  }
}

const confirmDelete = () => {
  showDeleteConfirmation.value = true
}

const cancelDelete = () => {
  showDeleteConfirmation.value = false
}

onMounted(async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (session) {
    user.value = session.user
    console.log('🏠 Home: Component mounted, loading existing room data...')
    await checkExistingRoom()
  }
})
</script>

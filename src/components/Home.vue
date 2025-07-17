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
            Ready to watch together?
          </h2>
          <p class="text-sm text-gray-600 dark:text-gray-300">
            Create or join a room to sync your viewing experience
          </p>
        </div>

        <!-- Action Cards -->
        <div class="space-y-4">
          <!-- Create Room Card -->
          <div
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
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'

const user = ref(null)
const roomId = ref('')

const handleLogout = () => {
  chrome.runtime.sendMessage({ source: 'vue-app', type: 'LOGOUT' })
}

const createServer = () => {
  console.log('Create server clicked')
  // You can add room creation logic here
}

const joinServer = () => {
  if (!roomId.value.trim()) {
    console.error('Room ID is required.')
    return
  }
  console.log('Joining server with Room ID:', roomId.value.trim())
  // You can add room joining logic here
}

onMounted(async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (session) {
    user.value = session.user
  }
})
</script>

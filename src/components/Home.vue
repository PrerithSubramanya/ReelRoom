<template>
  <div class="flex flex-col h-full bg-[var(--background-color)] text-[var(--text-primary)] p-6">
    <header class="flex items-center justify-between mb-4">
      <div class="flex items-center gap-2">
        <div class="w-7 h-7 text-[var(--primary-color)]">
          <svg fill="none" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M16.5 12L12 16.5L7.5 12"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
            ></path>
            <path
              d="M12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3Z"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
            ></path>
            <path
              d="M12 7.5V16.5"
              stroke="currentColor"
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="1.5"
            ></path>
          </svg>
        </div>
        <h1 class="text-lg font-bold">StreamSync</h1>
      </div>
      <div class="flex items-center gap-3">
        <button
          aria-label="User profile"
          @click="handleLogout"
          title="Click to logout"
          class="focus:outline-none"
        >
          <div
            v-if="user"
            class="h-8 w-8 rounded-full bg-cover bg-center border-2 border-[var(--accent-color)]"
            :style="{ 'background-image': 'url(' + user.user_metadata.avatar_url + ')' }"
          ></div>
        </button>
      </div>
    </header>
    <main class="flex-grow flex flex-col justify-center">
      <div class="w-full max-w-sm mx-auto space-y-6">
        <div class="text-center">
          <h2 class="text-xl font-bold tracking-tight text-white">
            Start watching together
          </h2>
          <p class="mt-1 text-xs text-[var(--text-secondary)]">
            Create or join a room to sync your viewing experience.
          </p>
        </div>
        <div class="space-y-4">
          <button
            @click="createServer"
            class="flex w-full items-center justify-center rounded-full bg-[var(--primary-color)] px-4 py-2.5 text-sm font-bold text-[var(--background-color)] transition-transform hover:scale-105"
          >
            <svg
              class="mr-2"
              fill="currentColor"
              height="18"
              viewBox="0 0 256 256"
              width="18"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z"
              ></path>
            </svg>
            Create a Room
          </button>
          <div class="relative">
            <div aria-hidden="true" class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-[var(--accent-color)]"></div>
            </div>
            <div class="relative flex justify-center">
              <span class="bg-[var(--background-color)] px-2 text-xs text-white">OR</span>
            </div>
          </div>
          <form @submit.prevent="joinServer" class="space-y-3">
            <h3 class="text-center text-base font-semibold text-white">Join a Room</h3>
            <div>
              <label class="sr-only" for="room-id">Room ID</label>
              <input
                v-model="roomId"
                class="form-input h-10 w-full resize-none rounded-full border-2 border-[var(--secondary-color)] bg-[var(--secondary-color)] px-4 text-sm text-white placeholder:text-[var(--text-secondary)] transition-colors focus:border-[var(--primary-color)] focus:outline-none focus:ring-0"
                id="room-id"
                name="room-id"
                placeholder="Enter Room ID"
                required
                type="text"
              />
            </div>
            <button
              class="flex w-full items-center justify-center rounded-full bg-transparent border-2 border-[var(--primary-color)] px-4 py-2.5 text-sm font-bold text-[var(--primary-color)] transition-colors hover:bg-[var(--primary-color)] hover:text-[var(--background-color)]"
              type="submit"
            >
              Join Room
            </button>
          </form>
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
}

const joinServer = () => {
  if (!roomId.value) {
    console.error('Room ID is required.')
    return
  }
  console.log('Joining server with Room ID:', roomId.value)
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

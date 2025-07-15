<template>
  <div class="flex flex-col h-full p-6">
    <div class="flex-grow">
      <h1 class="text-2xl font-bold text-gray-800 mb-2">Welcome, {{ displayName }}!</h1>
      <p class="text-gray-600">You are now logged into ReelRoom.</p>
      <!-- Your main extension content goes here -->
    </div>
    <button
      @click="handleLogout"
      class="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-200"
    >
      Sign Out
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '../supabase'

const displayName = ref('User')

const handleLogout = () => {
  chrome.runtime.sendMessage({ source: 'vue-app', type: 'LOGOUT' })
}

onMounted(async () => {
  const {
    data: { session },
  } = await supabase.auth.getSession()
  if (session) {
    displayName.value = session.user?.user_metadata?.display_name || 'User'
  }
})
</script>

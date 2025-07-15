<template>
  <div class="w-full h-full bg-gray-50">
    <router-view />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from './supabase'

const router = useRouter()

onMounted(() => {
  // Listen for auth state changes from the background script
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === 'AUTH_STATE_CHANGED') {
      const session = message.session
      if (session) {
        // User is logged in. Check if they need onboarding.
        const userDisplayName = session.user?.user_metadata?.display_name
        if (userDisplayName) {
          router.push({ name: 'Home' })
        } else {
          router.push({ name: 'Onboarding' })
        }
      } else {
        // User is logged out.
        router.push({ name: 'Login' })
      }
    }
  })

  // Also check the initial session state when the popup opens
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      const userDisplayName = session.user?.user_metadata?.display_name
      if (userDisplayName) {
        router.push({ name: 'Home' })
      } else {
        router.push({ name: 'Onboarding' })
      }
    } else {
      router.push({ name: 'Login' })
    }
  })
})
</script>

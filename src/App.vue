<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from './supabase'

const router = useRouter()

const handleAuthChange = (session) => {
  if (session) {
    if (session.user?.user_metadata?.onboarding_completed) {
      router.push({ name: 'Home' })
    } else {
      router.push({ name: 'Onboarding' })
    }
  } else {
    router.push({ name: 'Login' })
  }
}

onMounted(() => {
  // Listen for auth state changes from the background script
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'AUTH_STATE_CHANGED') {
      handleAuthChange(message.session)
    }
    return true
  })

  // Check the initial session state
  supabase.auth.getSession().then(({ data: { session } }) => {
    handleAuthChange(session)
  })
})
</script>

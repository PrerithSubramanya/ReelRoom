<template>
  <div class="flex flex-col h-full bg-[var(--background-color)] text-[var(--text-primary)] p-6 justify-center">
    <main class="flex-grow flex flex-col justify-center">
      <div class="w-full max-w-sm mx-auto text-center">
        <div class="flex flex-col items-center space-y-6">
          <div class="size-12 logo-icon text-[var(--primary-color)]">
            <svg fill="currentColor" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <g clip-path="url(#clip0_6_535)">
                <path
                  clip-rule="evenodd"
                  d="M47.2426 24L24 47.2426L0.757355 24L24 0.757355L47.2426 24ZM12.2426 21H35.7574L24 9.24264L12.2426 21Z"
                  fill-rule="evenodd"
                ></path>
              </g>
            </svg>
          </div>
          <div class="space-y-2">
            <h2
              class="text-3xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[var(--primary-color)] to-green-300"
            >
              Welcome Back
            </h2>
            <p class="text-sm text-[var(--text-secondary)]">Sign in to sync your next movie night.</p>
          </div>
          <button
            @click="handleLogin"
            class="flex w-full items-center justify-center gap-3 rounded-full h-11 bg-[var(--surface-color)] text-[var(--text-primary)] text-sm font-bold tracking-wide transition-colors duration-300 hover:bg-opacity-80"
          >
            <div data-icon="GoogleLogo" data-size="20px" data-weight="bold">
              <svg
                fill="currentColor"
                height="20px"
                viewBox="0 0 256 256"
                width="20px"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M224,128a96,96,0,1,1-21.95-61.09,8,8,0,1,1-12.33,10.18A80,80,0,1,0,207.6,136H128a8,8,0,0,1,0-16h88A8,8,0,0,1,224,128Z"
                ></path>
              </svg>
            </div>
            <span class="truncate">Continue with Google</span>
          </button>
          <p v-if="errorMsg" class="text-red-500 text-xs text-center">{{ errorMsg }}</p>
          <p class="text-xs text-[var(--text-secondary)] max-w-xs px-4">
            By continuing, you agree to our
            <a class="underline hover:text-[var(--text-primary)]" href="#">Terms of Service</a> and
            <a class="underline hover:text-[var(--text-primary)]" href="#">Privacy Policy</a>.
          </p>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const errorMsg = ref('')

const handleLogin = () => {
  errorMsg.value = ''
  chrome.runtime.sendMessage({ source: 'vue-app', type: 'LOGIN' })
}

onMounted(() => {
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'AUTH_ERROR') {
      errorMsg.value = message.error
    }
    return true
  })
})
</script>

<style scoped>
.logo-icon path {
  fill: var(--primary-color);
}
</style>

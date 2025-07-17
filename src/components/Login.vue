<template>
  <div class="flex flex-col h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100">
    <!-- Header -->
    <div class="flex items-center justify-center pt-4 pb-4">
      <div class="flex items-center gap-2">
        <div
          class="w-8 h-8 rounded-lg flex items-center justify-center overflow-hidden"
        >
          <img src="/src/components/icons/ext-logo-32.png" alt="ReelRoom Logo" class="w-full h-full object-contain" />
        </div>
        <span class="text-lg font-semibold">ReelRoom</span>
      </div>
    </div>

    <!-- Main Content -->
    <main class="flex-1 flex items-center justify-center px-4 py-4">
      <div class="w-full max-w-sm">
        <div
          class="bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 rounded-xl p-6 shadow-lg border border-gray-200 dark:border-gray-700"
        >
          <!-- Welcome text -->
          <div class="text-center mb-6">
            <h1 class="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
              Welcome to ReelRoom
            </h1>
            <p class="text-sm text-gray-600 dark:text-gray-300">
              Sign in to start watching with friends
            </p>
          </div>

          <!-- Sign in button -->
          <button
            @click="handleLogin"
            :disabled="isLoading"
            class="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg v-if="!isLoading" class="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <svg
              v-else
              class="w-5 h-5 animate-spin text-primary-500"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                class="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                stroke-width="4"
              ></circle>
              <path
                class="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <span class="text-sm font-medium text-gray-900 dark:text-gray-100">
              {{ isLoading ? 'Signing in...' : 'Continue with Google' }}
            </span>
          </button>

          <!-- Error message -->
          <div v-if="errorMsg" class="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fill-rule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clip-rule="evenodd"
                />
              </svg>
              <p class="text-sm text-red-700 dark:text-red-300">{{ errorMsg }}</p>
            </div>
          </div>

          <!-- Footer -->
          <div class="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p class="text-xs text-gray-500 dark:text-gray-400 text-center leading-relaxed">
              By continuing, you agree to our
              <a href="#" class="text-primary-500 hover:underline">Terms</a>
              and
              <a href="#" class="text-primary-500 hover:underline">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

const errorMsg = ref('')
const isLoading = ref(false)

const handleLogin = () => {
  errorMsg.value = ''
  isLoading.value = true

  chrome.runtime.sendMessage({ source: 'vue-app', type: 'LOGIN' })

  // Reset loading state after a timeout (in case of errors)
  setTimeout(() => {
    isLoading.value = false
  }, 5000)
}

onMounted(() => {
  chrome.runtime.onMessage.addListener((message) => {
    if (message.type === 'AUTH_ERROR') {
      errorMsg.value = message.error
      isLoading.value = false
    } else if (message.type === 'AUTH_STATE_CHANGED') {
      isLoading.value = false
    }
    // Don't return true since we're not sending a response
  })
})
</script>

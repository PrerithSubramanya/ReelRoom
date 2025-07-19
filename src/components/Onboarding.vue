<template>
  <div class="flex flex-col h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 text-gray-900 dark:text-gray-100">
    <!-- Header -->
    <div class="flex items-center justify-center pt-4 pb-3">
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
            <div
              class="w-12 h-12 bg-gradient-to-br from-primary-500 via-primary-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4"
            >
              <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
            </div>
            <h1 class="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Complete your profile
            </h1>
            <p class="text-sm text-gray-600 dark:text-gray-300">
              Help others recognize you in watch parties
            </p>
          </div>

          <!-- Form -->
          <form @submit.prevent="updateProfile" class="space-y-4">
            <div class="space-y-4">
              <div>
                <label
                  class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2"
                  for="first-name"
                >
                  First Name
                </label>
                <input
                  v-model="firstName"
                  class="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-gray-900 dark:text-gray-100"
                  id="first-name"
                  placeholder="Enter your first name"
                  type="text"
                  required
                />
              </div>

              <div>
                <label
                  class="block text-sm font-medium text-gray-900 dark:text-gray-100 mb-2"
                  for="last-name"
                >
                  Last Name
                </label>
                <input
                  v-model="lastName"
                  class="w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-sm placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-gray-900 dark:text-gray-100"
                  id="last-name"
                  placeholder="Enter your last name"
                  type="text"
                  required
                />
              </div>
            </div>

            <!-- Submit button -->
            <div class="pt-2">
              <button
                type="submit"
                :disabled="loading || !firstName.trim() || !lastName.trim()"
                class="w-full border border-primary-200 dark:border-primary-700 bg-gradient-to-br from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white py-3 px-4 rounded-lg text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-200"
              >
                <svg v-if="loading" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
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
                <span>{{ loading ? 'Saving...' : 'Continue' }}</span>
              </button>
            </div>
          </form>

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


        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'

const router = useRouter()
const firstName = ref('')
const lastName = ref('')
const loading = ref(false)
const errorMsg = ref('')

const updateProfile = async () => {
  if (!firstName.value.trim() || !lastName.value.trim()) {
    errorMsg.value = 'All fields are required.'
    return
  }

  loading.value = true
  errorMsg.value = ''

  try {
    // Update user metadata
    const { error: authError } = await supabase.auth.updateUser({
      data: {
        full_name: `${firstName.value.trim()} ${lastName.value.trim()}`,
        first_name: firstName.value.trim(),
        last_name: lastName.value.trim(),
        onboarding_completed: true,
      },
    })

    if (authError) {
      errorMsg.value = authError.message
      return
    }

    // User data is already stored in auth.users.raw_user_meta_data by updateUser above

    router.push({ name: 'Home' })
  } catch {
    errorMsg.value = 'An unexpected error occurred. Please try again.'
  } finally {
    loading.value = false
  }
}
</script>

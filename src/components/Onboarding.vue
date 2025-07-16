<template>
  <div class="flex flex-col h-full bg-[var(--background-color)] text-[var(--text-primary)] p-6">
    <main class="flex-grow flex flex-col justify-center">
      <div class="w-full max-w-md mx-auto">
        <div class="text-center mb-6">
          <h2 class="text-2xl font-bold tracking-tight mb-1">Welcome aboard!</h2>
          <p class="text-[var(--text-secondary)] text-sm">Let's get your profile set up.</p>
        </div>
        <div class="bg-[var(--surface-color)] p-6 rounded-lg shadow-lg">
          <form @submit.prevent="updateProfile" id="onboarding-form" class="space-y-4">
            <div>
              <label
                class="block text-xs font-medium text-[var(--text-secondary)] mb-1"
                for="first-name"
                >First Name</label
              >
              <input
                v-model="firstName"
                class="form-input w-full rounded-md bg-[var(--secondary-color)] border-0 h-10 px-3 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-[var(--primary-color)] text-sm"
                id="first-name"
                placeholder="Enter your first name"
                type="text"
                required
              />
            </div>
            <div>
              <label
                class="block text-xs font-medium text-[var(--text-secondary)] mb-1"
                for="last-name"
                >Last Name</label
              >
              <input
                v-model="lastName"
                class="form-input w-full rounded-md bg-[var(--secondary-color)] border-0 h-10 px-3 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-[var(--primary-color)] text-sm"
                id="last-name"
                placeholder="Enter your last name"
                type="text"
                required
              />
            </div>
            <div class="pt-2">
              <button
                class="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-full shadow-sm text-sm font-bold text-[var(--background-color)] bg-[var(--primary-color)] hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[var(--surface-color)] focus:ring-[var(--primary-color)] transition-transform duration-200 ease-in-out hover:scale-105"
                type="submit"
                :disabled="loading"
              >
                {{ loading ? 'Saving...' : 'Save and Continue' }}
              </button>
            </div>
          </form>
          <p v-if="errorMsg" class="text-red-500 text-xs mt-3 text-center">{{ errorMsg }}</p>
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
  if (!firstName.value || !lastName.value) {
    errorMsg.value = 'All fields are required.'
    return
  }
  loading.value = true
  errorMsg.value = ''

  const { data, error } = await supabase.auth.updateUser({
    data: {
      full_name: `${firstName.value} ${lastName.value}`,
      first_name: firstName.value,
      last_name: lastName.value,
      onboarding_completed: true,
    },
  })

  if (error) {
    errorMsg.value = error.message
    loading.value = false
  } else {
    router.push({ name: 'Home' })
  }
}
</script>

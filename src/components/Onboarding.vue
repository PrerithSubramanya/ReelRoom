<template>
  <div class="flex flex-col h-full p-6">
    <h1 class="text-2xl font-bold text-gray-800 mb-2">Complete Your Profile</h1>
    <p class="text-gray-500 mb-6">Let's get your account set up.</p>
    <form @submit.prevent="updateProfile">
      <div class="mb-4">
        <label for="firstName" class="block text-sm font-medium text-gray-700">First Name</label>
        <input
          type="text"
          v-model="firstName"
          id="firstName"
          class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
        />
      </div>
      <div class="mb-4">
        <label for="lastName" class="block text-sm font-medium text-gray-700">Last Name</label>
        <input
          type="text"
          v-model="lastName"
          id="lastName"
          class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
        />
      </div>
      <div class="mb-6">
        <label for="dob" class="block text-sm font-medium text-gray-700">Date of Birth</label>
        <input
          type="date"
          v-model="dob"
          id="dob"
          class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          required
        />
      </div>
      <button
        type="submit"
        :disabled="loading"
        class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
      >
        {{ loading ? 'Saving...' : 'Save and Continue' }}
      </button>
      <p v-if="errorMsg" class="text-red-500 text-sm mt-4 text-center">{{ errorMsg }}</p>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase'

const router = useRouter()
const firstName = ref('')
const lastName = ref('')
const dob = ref('')
const loading = ref(false)
const errorMsg = ref('')

const updateProfile = async () => {
  if (!firstName.value || !lastName.value || !dob.value) {
    errorMsg.value = 'All fields are required.'
    return
  }
  loading.value = true
  errorMsg.value = ''

  const { error } = await supabase.auth.updateUser({
    data: {
      display_name: `${firstName.value} ${lastName.value}`,
      first_name: firstName.value,
      last_name: lastName.value,
      date_of_birth: dob.value,
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

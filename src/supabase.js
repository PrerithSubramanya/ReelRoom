import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'supabase url'
const SUPABASE_ANON_KEY = 'supabase anon key'
// A custom storage adapter for Chrome's asynchronous storage API.
const chromeStorageAdapter = {
  getItem: async (key) => {
    const data = await chrome.storage.local.get(key)
    return data[key] ?? null
  },
  setItem: async (key, value) => {
    await chrome.storage.local.set({ [key]: value })
  },
  removeItem: async (key) => {
    await chrome.storage.local.remove(key)
  },
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: chromeStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

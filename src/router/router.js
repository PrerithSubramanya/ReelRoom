import { createRouter, createWebHashHistory } from 'vue-router'
import { supabase } from '../supabase'
import Home from '../components/Home.vue'
import Login from '../components/Login.vue'
import Onboarding from '../components/Onboarding.vue'
import RoomCreate from '../components/RoomCreate.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
  },
  {
    path: '/onboarding',
    name: 'Onboarding',
    component: Onboarding,
    meta: { requiresAuth: true },
  },
  {
    path: '/room/create/:roomId?',
    name: 'RoomCreate',
    component: RoomCreate,
    meta: { requiresAuth: true },
  },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

  if (requiresAuth && !session) {
    next({ name: 'Login' })
    return
  }
  
  if (session && to.name === 'Login') {
    next({ name: 'Home' })
    return
  }
  
  if (session && !session.user?.user_metadata?.onboarding_completed && to.name !== 'Onboarding') {
    next({ name: 'Onboarding' })
    return
  }
  
  if (session && session.user?.user_metadata?.onboarding_completed && to.name === 'Onboarding') {
    next({ name: 'Home' })
    return
  }

  // Check for active room only when navigating to Home
  if (session && to.name === 'Home' && from.name !== 'RoomCreate') {
    try {
      console.log('🏠 Router: Checking for active room before showing Home...')
      
      // Check storage for current room
      const { currentRoom } = await chrome.storage.local.get(['currentRoom'])
      console.log('🏠 Router: Current room from storage:', currentRoom)
      
      if (currentRoom) {
        // Verify the room is still active and user is still a participant
        const { data: participantData, error: participantError } = await supabase
          .from('room_participants')
          .select('*')
          .eq('room_id', currentRoom.id)
          .eq('user_id', session.user.id)
          .eq('is_active', true)
          .single()
        
        console.log('🏠 Router: Participant check result:', { participantData, participantError })
        
        if (participantData) {
          // User is still in the room, navigate directly there
          console.log('🏠 Router: Redirecting directly to active room:', currentRoom.room_id)
          next({ name: 'RoomCreate', params: { roomId: currentRoom.room_id } })
          return
        } else {
          // Room is no longer active or user was removed, clean up storage
          console.log('🏠 Router: Room no longer active, cleaning up storage')
          chrome.storage.local.remove(['currentRoom'])
        }
      }
    } catch (error) {
      console.error('🏠 Router: Error checking active room:', error)
    }
  }
  
  next()
})

export default router

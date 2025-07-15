import { createRouter, createWebHashHistory } from 'vue-router'
import { supabase as sb } from '../supabase'
import Login from '../components/Login.vue'
import Home from '../components/Home.vue'
import Onboarding from '../components/Onboarding.vue'

const routes = [
  { path: '/', name: 'Login', component: Login },
  { path: '/home', name: 'Home', component: Home, meta: { requiresAuth: true } },
  { path: '/onboarding', name: 'Onboarding', component: Onboarding, meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const {
    data: { session },
  } = await sb.auth.getSession()

  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)

  if (requiresAuth && !session) {
    // Needs to be logged in, but isn't. Redirect to login.
    next({ name: 'Login' })
  } else if (!requiresAuth && session) {
    // Trying to access login page while already logged in.
    const userDisplayName = session.user?.user_metadata?.display_name
    if (userDisplayName) {
      next({ name: 'Home' })
    } else {
      next({ name: 'Onboarding' })
    }
  } else {
    // All other cases, proceed.
    next()
  }
})

export default router

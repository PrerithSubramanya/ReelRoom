import { createRouter, createWebHashHistory } from 'vue-router'
import { supabase } from '../supabase'
import Home from '../components/Home.vue'
import Login from '../components/Login.vue'
import Onboarding from '../components/Onboarding.vue'

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
  } else if (session && to.name === 'Login') {
    next({ name: 'Home' })
  } else if (session && !session.user?.user_metadata?.onboarding_completed && to.name !== 'Onboarding') {
    next({ name: 'Onboarding' })
  } else if (session && session.user?.user_metadata?.onboarding_completed && to.name === 'Onboarding') {
    next({ name: 'Home' })
  }
  else {
    next()
  }
})

export default router

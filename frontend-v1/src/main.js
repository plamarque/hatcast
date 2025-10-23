import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './assets/main.css'

// Import des stores
import { useAuthStore } from './stores/authStore'

// Import des vues
import LoginView from './views/LoginView.vue'
import DashboardView from './views/DashboardView.vue'
import SeasonsView from './views/SeasonsView.vue'
import SeasonDetailView from './views/SeasonDetailView.vue'
import ShowsView from './views/ShowsView.vue'
import ShowDetailView from './views/ShowDetailView.vue'
import ProfileView from './views/ProfileView.vue'
import AdminView from './views/AdminView.vue'

// Configuration des routes
const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresAuth: false }
  },
  {
    path: '/',
    name: 'dashboard',
    component: DashboardView,
    meta: { requiresAuth: true }
  },
  {
    path: '/seasons',
    name: 'seasons',
    component: SeasonsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/seasons/:id',
    name: 'season-detail',
    component: SeasonDetailView,
    meta: { requiresAuth: true }
  },
  {
    path: '/shows',
    name: 'shows',
    component: ShowsView,
    meta: { requiresAuth: true }
  },
  {
    path: '/shows/:id',
    name: 'show-detail',
    component: ShowDetailView,
    meta: { requiresAuth: true }
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminView,
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Garde de navigation pour l'authentification
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next('/login')
  } else if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next('/')
  } else if (to.path === '/login' && authStore.isAuthenticated) {
    next('/')
  } else {
    next()
  }
})

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Initialiser l'authentification
const authStore = useAuthStore()
authStore.initializeAuth()

app.mount('#app')
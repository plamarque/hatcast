import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import Home from './Home.vue'
import GridBoard from './components/GridBoard.vue'
import PasswordReset from './views/PasswordReset.vue'
import MagicLink from './views/MagicLink.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/season/:slug', component: GridBoard, props: true },
  { path: '/season/:slug/event/:eventId', component: GridBoard, props: true },
  { path: '/reset-password', component: PasswordReset },
  { path: '/magic', component: MagicLink }
]

const router = createRouter({
  history: createWebHistory('/'),
  routes
})

createApp(App).use(router).mount('#app')
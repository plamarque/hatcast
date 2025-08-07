import './assets/main.css'
import { createApp } from 'vue'
import App from './App.vue'
import { createRouter, createWebHistory } from 'vue-router'
import Home from './Home.vue'
import GridBoard from './components/GridBoard.vue'
import PasswordReset from './views/PasswordReset.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/season/:slug', component: GridBoard, props: true },
  { path: '/reset-password', component: PasswordReset }
]

const router = createRouter({
  history: createWebHistory('/impro-selector/'),
  routes
})

createApp(App).use(router).mount('#app')
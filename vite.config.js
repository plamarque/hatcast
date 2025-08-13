import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import fs from 'fs'

const CERT_PATH = process.env.VITE_HTTPS_CERT_PATH
const KEY_PATH = process.env.VITE_HTTPS_KEY_PATH
const httpsConfig = (CERT_PATH && KEY_PATH && fs.existsSync(CERT_PATH) && fs.existsSync(KEY_PATH))
  ? { cert: fs.readFileSync(CERT_PATH), key: fs.readFileSync(KEY_PATH) }
  : false

export default defineConfig({
  base: '/',
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      strategies: 'injectManifest',
      srcDir: 'src',
      filename: 'service-worker.js',
      workbox: {
        navigateFallback: '/',
      },
      manifest: {
        name: 'HatCast',
        short_name: 'HatCast',
        description: "HatCast est l'application pour organiser vos spectacles d'improvisation.",
        start_url: '/',
        scope: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#0ea5e9',
        icons: [
          { src: '/icons/manifest-icon-192.maskable.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/manifest-icon-192.maskable.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/icons/manifest-icon-512.maskable.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/manifest-icon-512.maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      }
    })
  ],
  server: {
    host: true,
    allowedHosts: true,
    https: httpsConfig || false
  },
  preview: {
    host: true,
    // Autoriser tous les hôtes (utile pour tunnels dynamiques comme trycloudflare)
    allowedHosts: true,
    https: httpsConfig || false
  }
})
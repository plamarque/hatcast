import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'
import fs from 'fs'

const CERT_PATH = process.env.VITE_HTTPS_CERT_PATH
const KEY_PATH = process.env.VITE_HTTPS_KEY_PATH
const FORCE_HTTPS = process.env.VITE_FORCE_HTTPS === 'true'

const httpsConfig = (CERT_PATH && KEY_PATH && fs.existsSync(CERT_PATH) && fs.existsSync(KEY_PATH) && FORCE_HTTPS)
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
        name: 'HatCast - Composition d\'équipes d\'impro',
        short_name: 'HatCast',
        id: '/hatcast-app',
        description: 'Facilite la composition d\'équipes de joueurs d\'impro. Laissez chacun indiquer ses disponibilités et le hasard choisit équitablement qui sera sur scène !',
        start_url: '/?source=pwa',
        scope: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#0ea5e9',
        orientation: 'portrait-primary',
        lang: 'fr',
        version: '3.0.0',
        icons: [
          { src: '/icons/manifest-icon-192.maskable.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/manifest-icon-192.maskable.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: '/icons/manifest-icon-512.maskable.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/icons/manifest-icon-512.maskable.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ],
        categories: ['productivity', 'utilities', 'entertainment'],
        prefer_related_applications: false,
        screenshots: [
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            form_factor: 'wide'
          }
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
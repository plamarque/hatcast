import { defineConfig, devices } from '@playwright/test'
import base from './playwright.config'

if (process.env.PLAYWRIGHT_STAGING_E2E || process.env.PLAYWRIGHT_PROXY_CONFIG || process.env.PLAYWRIGHT_SAFE_REMINDER_E2E === '1') {
  throw new Error('Local multi-season fixture requires the default local proxy')
}
for (const value of [process.env.PLAYWRIGHT_BASE_URL, process.env.PLAYWRIGHT_API_BASE_URL, process.env.PLAYWRIGHT_API_HEALTH_URL]) {
  if (value && !['localhost', '127.0.0.1', '[::1]'].includes(new URL(value).hostname)) {
    throw new Error('Local multi-season fixture refuses non-local URLs')
  }
}
if ((process.env.PLAYWRIGHT_API_PORT && process.env.PLAYWRIGHT_API_PORT !== '8080') ||
    (process.env.PLAYWRIGHT_API_BASE_URL && process.env.PLAYWRIGHT_API_BASE_URL !== 'http://127.0.0.1:8080') ||
    (process.env.PLAYWRIGHT_API_HEALTH_URL && process.env.PLAYWRIGHT_API_HEALTH_URL !== 'http://127.0.0.1:8080/actuator/health')) {
  throw new Error('Local multi-season fixture requires the default API and proxy on 127.0.0.1:8080')
}
export default defineConfig({
  ...base,
  webServer: Array.isArray(base.webServer) ? base.webServer.map(server => ({ ...server, reuseExistingServer: false })) : base.webServer,
  testMatch: /hub-multiseason\.local\.spec\.ts/,
  projects: [{ name: 'local-mobile-multiseason', use: { ...devices['Pixel 5'] } }],
})

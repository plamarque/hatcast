import { readFileSync } from 'node:fs'
import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'https://localhost:4200'
const apiHealthUrl = process.env.PLAYWRIGHT_API_HEALTH_URL ?? 'http://127.0.0.1:8080/actuator/health'
/** Local: reuse servers on 4200/8080 when start-dev is already up. CI: always boot fresh. Force off: PLAYWRIGHT_REUSE_SERVERS=0 */
const safeReminderE2e = process.env.PLAYWRIGHT_SAFE_REMINDER_E2E === '1'
const apiPort = Number(process.env.PLAYWRIGHT_API_PORT ?? 8080)
const webPort = Number(process.env.PLAYWRIGHT_WEB_PORT ?? 4200)
if (!Number.isInteger(webPort) || webPort < 1 || webPort > 65535) throw new Error('Invalid Playwright web port')
if (!Number.isInteger(apiPort) || apiPort < 1 || apiPort > 65535) throw new Error('Invalid Playwright API port')
const proxyConfig = process.env.PLAYWRIGHT_PROXY_CONFIG
if (proxyConfig && !/^[A-Za-z0-9_./-]+$/.test(proxyConfig)) throw new Error('Invalid Playwright proxy config path')
const reuseServers = !safeReminderE2e && (
  process.env.PLAYWRIGHT_REUSE_SERVERS === '1' ||
  (!process.env.CI && process.env.PLAYWRIGHT_REUSE_SERVERS !== '0'))
const isStagingTarget = !!process.env.PLAYWRIGHT_STAGING_E2E
if (safeReminderE2e && (isStagingTarget || baseURL !== `https://localhost:${webPort}` || apiHealthUrl !== `http://127.0.0.1:${apiPort}/actuator/health`)) {
  throw new Error('Isolated reminder E2E requires local front and API servers')
}
if (safeReminderE2e) {
  if (!proxyConfig) throw new Error('Isolated reminder E2E requires a proxy config')
  const proxy = JSON.parse(readFileSync(proxyConfig, 'utf8')) as Record<string, { target?: string }>
  if (proxy['/v1']?.target !== `http://127.0.0.1:${apiPort}`) {
    throw new Error('Isolated reminder E2E proxy must target its local API')
  }
}

export default defineConfig({
  testDir: './e2e',
  timeout: 60_000,
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : 1,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['html', { open: 'on-failure' }]],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: safeReminderE2e ? 'on' : 'retain-on-failure',
    ignoreHTTPSErrors: true,
  },
  projects: [
    {
      name: 'chromium-5-10-member',
      testMatch: /story-5-10-member\.spec\.ts/,
      use: { ...devices['Pixel 5'], storageState: 'e2e/.auth/member.json' },
      dependencies: ['setup-member'],
    },
    {
      name: 'chromium-5-10-organizer',
      testMatch: /story-5-10-organizer\.spec\.ts/,
      use: { ...devices['Pixel 5'], storageState: 'e2e/.auth/admin.json' },
      dependencies: ['setup-admin', 'setup-member'],
    },
    {
      name: 'chromium-5-10-desktop-member',
      testMatch: /story-5-10-member\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], storageState: 'e2e/.auth/member.json' },
      dependencies: ['setup-member'],
    },
    {
      name: 'chromium-5-10-desktop-organizer',
      testMatch: /story-5-10-organizer\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], storageState: 'e2e/.auth/admin.json' },
      dependencies: ['setup-admin'],
    },
    {
      name: 'chromium-5-10-scoped-organizer',
      testMatch: /story-5-10-organizer\.spec\.ts/,
      use: { ...devices['Desktop Chrome'], storageState: 'e2e/.auth/reminder-organizer.json' },
      dependencies: ['setup-reminder-organizer'],
    },
    { name: 'chromium-advent-answer', testMatch: /advent-(answer|member)\.spec\.ts/, use: { ...devices['Desktop Chrome'] } },
    {
      name: 'chromium-accueil-feedback',
      testMatch: /accueil-feedback\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'setup-admin',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'setup-member',
      testMatch: /auth-member\.setup\.ts/,
      dependencies: isStagingTarget ? ['setup-admin'] : [],
    },
    {
      name: 'setup-reminder-organizer',
      testMatch: /auth-reminder-organizer\.setup\.ts/,
      dependencies: ['setup-admin'],
    },
    {
      name: 'e1-mobile-member',
      testMatch: /e1\/.*\.mobile\.spec\.ts/,
      testIgnore: /e1\/orga-availability-reminder\.mobile\.spec\.ts/,
      use: {
        ...devices['Pixel 5'],
        storageState: 'e2e/.auth/member.json',
      },
      dependencies: ['setup-member'],
    },
    {
      name: 'e1-desktop-orga',
      testMatch: /e1\/.*\.desktop\.spec\.ts/,
      testIgnore: /e1\/reminder-organizer\.desktop\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/admin.json',
      },
      dependencies: ['setup-admin'],
    },
    {
      name: 'e1-desktop-reminder-organizer',
      testMatch: /e1\/reminder-organizer\.desktop\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/reminder-organizer.json',
      },
      dependencies: ['setup-reminder-organizer'],
    },
    {
      name: 'e1-mobile-orga',
      testMatch: /e1\/orga-availability-reminder\.mobile\.spec\.ts/,
      use: {
        ...devices['Pixel 5'],
        storageState: 'e2e/.auth/admin.json',
      },
      dependencies: ['setup-admin'],
    },
    {
      name: 'migration-mobile-member',
      testMatch: /migration\/.*\.mobile\.spec\.ts/,
      use: {
        ...devices['Pixel 5'],
        storageState: 'e2e/.auth/member.json',
      },
      dependencies: ['setup-member'],
    },
    {
      name: 'migration-desktop-orga',
      testMatch: /migration\/.*\.desktop\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/admin.json',
      },
      dependencies: ['setup-admin'],
    },
    {
      name: 'chromium-3-19',
      testMatch: /recette-3\.19\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/admin.json',
      },
      dependencies: ['setup-admin'],
    },
    {
      name: 'chromium-3-8d',
      testMatch: /recette-3\.8d\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/admin.json',
      },
      dependencies: ['setup-admin'],
    },
    {
      name: 'chromium-3-25',
      testMatch: /recette-3-25\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'chromium-agenda-participation',
      testMatch: /recette-agenda-participation-cell\.spec\.ts/,
      use: {
        ...devices['Pixel 5'],
        storageState: 'e2e/.auth/member.json',
      },
      dependencies: ['setup-member'],
    },
    {
      name: 'chromium-1-8',
      testMatch: /recette-1-8\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'chromium-19-19c',
      testMatch: /recette-19-19c\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/admin.json',
      },
      dependencies: ['setup-admin', 'setup-member'],
    },
    {
      name: 'chromium-19-20',
      testMatch: /recette-19-20\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/admin.json',
      },
      dependencies: ['setup-admin'],
    },
    {
      name: 'chromium-19-21',
      testMatch: /draw-formula-choice\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/admin.json',
      },
      dependencies: ['setup-admin'],
    },
  ],
  webServer: isStagingTarget
    ? undefined
    : [
        {
          command:
            `cd ../../services/api && env -u HATCAST_DATASOURCE_URL -u HATCAST_DATASOURCE_USERNAME -u HATCAST_DATASOURCE_PASSWORD -u SPRING_DATASOURCE_URL -u SPRING_DATASOURCE_USERNAME -u SPRING_DATASOURCE_PASSWORD -u SPRING_APPLICATION_JSON SPRING_PROFILES_ACTIVE=e2e HATCAST_NOTIFICATION_EMAIL_ENABLED=false HATCAST_WEB_PUSH_VAPID_PUBLIC_KEY= HATCAST_WEB_PUSH_VAPID_PRIVATE_KEY= HATCAST_SPRING_PROFILE=e2e ${safeReminderE2e ? `HATCAST_CORS_ALLOWED_ORIGINS=https://localhost:${webPort}` : ""} HATCAST_SERVER_PORT=${apiPort} SERVER_PORT=${apiPort} ./gradlew bootRun --no-daemon`,
          url: apiHealthUrl,
          reuseExistingServer: reuseServers,
          timeout: 240_000,
        },
        {
          command: `npm run dev -- --port ${webPort} --host 127.0.0.1${proxyConfig ? ` --proxy-config ${proxyConfig}` : ''}`,
          url: baseURL,
          reuseExistingServer: reuseServers,
          timeout: 180_000,
          ignoreHTTPSErrors: true,
        },
      ],
})

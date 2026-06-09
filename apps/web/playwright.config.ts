import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'https://localhost:4200'
const apiHealthUrl = process.env.PLAYWRIGHT_API_HEALTH_URL ?? 'http://127.0.0.1:8080/actuator/health'
/** Local: reuse servers on 4200/8080 when start-dev is already up. CI: always boot fresh. Force off: PLAYWRIGHT_REUSE_SERVERS=0 */
const reuseServers =
  process.env.PLAYWRIGHT_REUSE_SERVERS === '1' ||
  (!process.env.CI && process.env.PLAYWRIGHT_REUSE_SERVERS !== '0')
const isStagingTarget = !!process.env.PLAYWRIGHT_STAGING_E2E

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
    video: 'retain-on-failure',
    ignoreHTTPSErrors: true,
  },
  projects: [
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
      name: 'e1-mobile-member',
      testMatch: /e1\/.*\.mobile\.spec\.ts/,
      use: {
        ...devices['Pixel 5'],
        storageState: 'e2e/.auth/member.json',
      },
      dependencies: ['setup-member'],
    },
    {
      name: 'e1-desktop-orga',
      testMatch: /e1\/.*\.desktop\.spec\.ts/,
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
  ],
  webServer: isStagingTarget
    ? undefined
    : [
        {
          command:
            'cd ../../services/api && env -u HATCAST_DATASOURCE_URL -u HATCAST_DATASOURCE_USERNAME -u HATCAST_DATASOURCE_PASSWORD HATCAST_SPRING_PROFILE=e2e ./gradlew bootRun --no-daemon',
          url: apiHealthUrl,
          reuseExistingServer: reuseServers,
          timeout: 240_000,
        },
        {
          command: 'npm run dev -- --port 4200 --host 127.0.0.1',
          url: baseURL,
          reuseExistingServer: reuseServers,
          timeout: 180_000,
          ignoreHTTPSErrors: true,
        },
      ],
})

import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'https://localhost:4200'
const apiHealthUrl = process.env.PLAYWRIGHT_API_HEALTH_URL ?? 'http://127.0.0.1:8080/actuator/health'

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
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
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'e2e/.auth/admin.json',
      },
      dependencies: ['setup'],
    },
  ],
  webServer: [
    {
      command:
        'cd ../../services/api && env -u HATCAST_DATASOURCE_URL -u HATCAST_DATASOURCE_USERNAME -u HATCAST_DATASOURCE_PASSWORD HATCAST_SPRING_PROFILE=e2e ./gradlew bootRun --no-daemon',
      url: apiHealthUrl,
      reuseExistingServer: process.env.PLAYWRIGHT_REUSE_SERVERS === '1',
      timeout: 240_000,
    },
    {
      command: 'npm run dev -- --port 4200 --host 127.0.0.1',
      url: baseURL,
      reuseExistingServer: process.env.PLAYWRIGHT_REUSE_SERVERS === '1',
      timeout: 180_000,
      ignoreHTTPSErrors: true,
    },
  ],
})

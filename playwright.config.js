// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

/**
 * Configuration de l'URL de base pour les tests
 * Charge la configuration locale si elle existe, sinon utilise les valeurs par défaut
 */
let LOCAL_CONFIG = {};
const localConfigPath = path.join(__dirname, 'playwright.config.local.js');

if (fs.existsSync(localConfigPath)) {
  try {
    LOCAL_CONFIG = require('./playwright.config.local.js');
    console.log('📁 Configuration locale chargée');
  } catch (error) {
    console.log('⚠️ Erreur lors du chargement de la configuration locale:', error.message);
  }
}

const BASE_URL = process.env.BASE_URL || LOCAL_CONFIG.baseURL || 'http://localhost:5173';
const SKIP_WEBSERVER = process.env.SKIP_WEBSERVER === '1' || process.env.SKIP_WEBSERVER === 'true';

/**
 * @see https://playwright.dev/docs/test-configuration
 */
module.exports = defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: [['html', { outputFolder: 'test-output/playwright-report' }]],
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Output directory for test artifacts */
    outputDir: 'test-output/test-results',
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: BASE_URL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Take screenshot on failure */
    screenshot: 'only-on-failure',
    
    /* Record video on failure */
    video: 'retain-on-failure',
    
    /* Ignore HTTPS errors for local development */
    ignoreHTTPSErrors: true,
  },

  /* Global setup and teardown */
  globalSetup: require.resolve('./tests/global-setup.js'),
  globalTeardown: require.resolve('./tests/global-teardown.js'),

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },

    /* Test against mobile viewports. */
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  /* Run your local dev server before starting the tests (désactivé si SKIP_WEBSERVER=1) */
  ...(SKIP_WEBSERVER ? {} : {
    webServer: {
      command: 'npm run dev -- --host',
      url: BASE_URL,
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000,
      ignoreHTTPSErrors: true,
    },
  }),
});

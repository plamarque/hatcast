import { expect, test as setup } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

import { E2E_ADMIN_ID_TOKEN } from './fixtures/e1-cutover.constants'
import { isStagingE2e } from './helpers/e1-staging'
import { prepareE2ePage } from './helpers/e1.ui'
import { resetE1CutoverFixture, resetStory319Fixture, signInWithE2eToken } from './helpers/e2e-api'
import { ensureStagingCsrfToken } from './helpers/staging-csrf'
import { signInWithEmailPassword } from './helpers/staging-auth'

const authFile = path.join(__dirname, '.auth', 'admin.json')

setup('authenticate e2e admin + reset fixtures', async ({ page, request, baseURL }) => {
  fs.mkdirSync(path.dirname(authFile), { recursive: true })

  if (!isStagingE2e()) {
    await resetStory319Fixture(request)
    await resetE1CutoverFixture(request)
  }

  await prepareE2ePage(page)
  if (isStagingE2e()) {
    const email = process.env.HATCAST_E2E_ORGA_EMAIL
    const password = process.env.HATCAST_E2E_ORGA_PASSWORD
    if (!email || !password) {
      throw new Error('Missing HATCAST_E2E_ORGA_EMAIL / HATCAST_E2E_ORGA_PASSWORD for staging E2E')
    }
    await signInWithEmailPassword(page, email, password)
  } else {
    await page.goto('/connexion')
    await signInWithE2eToken(page.request, E2E_ADMIN_ID_TOKEN, baseURL!)
  }

  if (isStagingE2e()) {
    await ensureStagingCsrfToken(page)
  } else {
    await page.goto('/agenda')
    await expect(page).not.toHaveURL(/\/connexion/)
  }

  await page.context().storageState({ path: authFile })
})

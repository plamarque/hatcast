import { expect, test as setup } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

import { E2E_ADMIN_ID_TOKEN } from './fixtures/story-3-19.constants'
import { resetStory319Fixture, signInWithE2eToken } from './helpers/e2e-api'

const authFile = path.join(__dirname, '.auth', 'admin.json')

setup('authenticate e2e admin + reset story 3.19 fixture', async ({ page, request, baseURL }) => {
  fs.mkdirSync(path.dirname(authFile), { recursive: true })

  await resetStory319Fixture(request)

  await page.goto('/login')
  await signInWithE2eToken(page.request, E2E_ADMIN_ID_TOKEN, baseURL!)

  await page.goto('/')
  await expect(page).not.toHaveURL(/\/login/)

  await page.context().storageState({ path: authFile })
})

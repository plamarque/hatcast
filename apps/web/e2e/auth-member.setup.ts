import { expect, test as setup } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

import { E2E_MEMBER_ID_TOKEN } from './fixtures/e1-cutover.constants'
import { isStagingE2e } from './helpers/e1-staging'
import { prepareE2ePage } from './helpers/e1.ui'
import { resetE1CutoverFixture, signInWithE2eToken } from './helpers/e2e-api'
import { ensureStagingE2eMemberReady } from './helpers/staging-member-bootstrap'

const authFile = path.join(__dirname, '.auth', 'member.json')

setup('authenticate e2e member + reset E1 fixture', async ({ page, request, baseURL }) => {
  fs.mkdirSync(path.dirname(authFile), { recursive: true })

  if (!isStagingE2e()) {
    await resetE1CutoverFixture(request)
  }

  await prepareE2ePage(page)
  if (isStagingE2e()) {
    await ensureStagingE2eMemberReady(page)
  } else {
    await page.goto('/connexion')
    await signInWithE2eToken(page.request, E2E_MEMBER_ID_TOKEN, baseURL!)
  }

  await page.goto('/agenda')
  await expect(page).not.toHaveURL(/\/connexion/)

  await page.context().storageState({ path: authFile })
})

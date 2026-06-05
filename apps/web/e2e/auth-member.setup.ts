import { expect, test as setup } from '@playwright/test'
import fs from 'node:fs'
import path from 'node:path'

import { E2E_MEMBER_ID_TOKEN } from './fixtures/e1-cutover.constants'
import { isStagingE2e } from './helpers/e1-staging'
import { prepareE2ePage } from './helpers/e1.ui'
import { resetE1CutoverFixture, signInWithE2eToken } from './helpers/e2e-api'
import {
  reactivateStagingE2eMemberAsOrga,
  signInStagingE2eMember,
} from './helpers/staging-member-bootstrap'

const authDir = path.join(__dirname, '.auth')
const authFile = path.join(authDir, 'member.json')
const adminAuthFile = path.join(authDir, 'admin.json')

setup('authenticate e2e member + reset E1 fixture', async ({ page, request, baseURL }) => {
  fs.mkdirSync(authDir, { recursive: true })

  if (!isStagingE2e()) {
    await resetE1CutoverFixture(request)
  }

  await prepareE2ePage(page)
  if (isStagingE2e()) {
    if (!fs.existsSync(adminAuthFile)) {
      throw new Error(
        'Missing e2e/.auth/admin.json — setup-admin must run before setup-member on staging',
      )
    }
    const browser = page.context().browser()
    if (!browser) {
      throw new Error('Browser not available for staging orga reactivation context')
    }
    const orgaContext = await browser.newContext({
      storageState: adminAuthFile,
      baseURL,
      ignoreHTTPSErrors: true,
    })
    const orgaPage = await orgaContext.newPage()
    await prepareE2ePage(orgaPage)
    await reactivateStagingE2eMemberAsOrga(orgaPage)
    await orgaContext.close()

    await signInStagingE2eMember(page)
  } else {
    await page.goto('/connexion')
    await signInWithE2eToken(page.request, E2E_MEMBER_ID_TOKEN, baseURL!)
  }

  await page.goto('/agenda')
  await expect(page).not.toHaveURL(/\/connexion/)

  await page.context().storageState({ path: authFile })
})

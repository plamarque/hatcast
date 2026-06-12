import { expect, type Page, type Response } from '@playwright/test'

/** Same as apps/web/src/app/core/http/hatcast-csrf.ts */
export async function readBrowserCsrfToken(page: Page): Promise<string | null> {
  const url = page.url()
  if (!url.startsWith('http')) {
    return null
  }
  try {
    return await page.evaluate(() => {
      const prefix = 'XSRF-TOKEN='
      const row = document.cookie.split('; ').find((c) => c.startsWith(prefix))
      return row ? decodeURIComponent(row.slice(prefix.length)) : null
    })
  } catch {
    return null
  }
}

export async function readContextCsrfToken(page: Page): Promise<string | null> {
  const cookies = await page.context().cookies()
  const xsrf = cookies.find((c) => c.name === 'XSRF-TOKEN')?.value
  return xsrf ? decodeURIComponent(xsrf) : null
}

export function parseCsrfFromSetCookieHeader(raw: string | null | undefined): string | null {
  if (!raw) {
    return null
  }
  const match = raw.match(/XSRF-TOKEN=([^;,\s]+)/)
  return match ? decodeURIComponent(match[1]) : null
}

export async function readCsrfFromResponse(response: Response): Promise<string | null> {
  const headers = await response.allHeaders()
  const combined = Object.entries(headers)
    .filter(([name]) => name.toLowerCase() === 'set-cookie')
    .map(([, value]) => value)
    .join('\n')
  return parseCsrfFromSetCookieHeader(combined)
}

export async function readAnyCsrfToken(page: Page): Promise<string | null> {
  return (await readBrowserCsrfToken(page)) ?? (await readContextCsrfToken(page))
}

export async function waitForCsrfToken(page: Page, timeoutMs = 30_000): Promise<string> {
  const deadline = Date.now() + timeoutMs
  while (Date.now() < deadline) {
    const token = await readAnyCsrfToken(page)
    if (token) {
      return token
    }
    await page.waitForTimeout(250)
  }
  throw new Error('Timed out waiting for XSRF-TOKEN (staging CSRF bootstrap)')
}

/** Headers for staging mutating API calls (PUT/PATCH/POST/DELETE). */
export async function stagingMutateRequestHeaders(page: Page): Promise<Record<string, string>> {
  const csrf = (await readContextCsrfToken(page)) ?? (await ensureStagingCsrfToken(page))
  return {
    'Content-Type': 'application/json',
    'X-XSRF-TOKEN': csrf,
  }
}

/**
 * Ensure Spring CSRF is available (storageState, Set-Cookie on /v1, or document.cookie).
 * Call before saving admin.json and before orga PATCH/POST in staging bootstrap.
 */
export async function ensureStagingCsrfToken(page: Page): Promise<string> {
  const existing = await readAnyCsrfToken(page)
  if (existing) {
    return existing
  }

  let fromNetwork: string | null = null
  const apiReady = page.waitForResponse(
    async (res) => {
      if (res.request().method() !== 'GET' || !/\/v1\//.test(res.url()) || !res.ok()) {
        return false
      }
      fromNetwork = (await readCsrfFromResponse(res)) ?? fromNetwork
      return true
    },
    { timeout: 45_000 },
  )

  await page.goto('/agenda')
  await expect(page).not.toHaveURL(/\/connexion/, { timeout: 30_000 })
  await apiReady

  if (fromNetwork) {
    return fromNetwork
  }

  await expect(page.locator('app-user-agenda')).toBeVisible({ timeout: 30_000 })
  return waitForCsrfToken(page, 30_000)
}

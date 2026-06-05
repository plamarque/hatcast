import { expect, type Page } from '@playwright/test'

const MOBILE_MAX_WIDTH = 480

export async function assertMobileViewport(page: Page): Promise<void> {
  const size = page.viewportSize()
  expect(size).not.toBeNull()
  expect(size!.width).toBeLessThanOrEqual(MOBILE_MAX_WIDTH)
}

export async function assertNoHorizontalOverflow(page: Page): Promise<void> {
  const overflow = await page.evaluate(() => {
    const el = document.documentElement
    return el.scrollWidth > el.clientWidth + 2
  })
  expect(overflow).toBe(false)
}

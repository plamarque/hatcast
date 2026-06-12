import { expect, type Locator, type Page } from '@playwright/test'

/** Shell member bottom bar / rail tab labels (story 17.41 — four tabs). */
export const MEMBER_SHELL_TAB = {
  accueil: 'Accueil',
  agenda: 'Mon agenda',
  troupe: 'Ma troupe',
  stats: 'Mes stats',
} as const

export type MemberShellTabLabel = (typeof MEMBER_SHELL_TAB)[keyof typeof MEMBER_SHELL_TAB]

export function memberShellTab(page: Page, label: MemberShellTabLabel): Locator {
  return page.getByRole('tab', { name: label, exact: true })
}

export async function expectMemberShellTabsVisible(page: Page): Promise<void> {
  for (const label of Object.values(MEMBER_SHELL_TAB)) {
    await expect(memberShellTab(page, label)).toBeVisible({ timeout: 30_000 })
  }
}

export async function clearLastVisitedTroupeSlug(page: Page): Promise<void> {
  await page.evaluate(() => localStorage.removeItem('lastVisitedTroupeSlug'))
}

export async function seedLastVisitedTroupeSlug(page: Page, troupeSlug: string): Promise<void> {
  await page.evaluate((slug) => localStorage.setItem('lastVisitedTroupeSlug', slug), troupeSlug)
}

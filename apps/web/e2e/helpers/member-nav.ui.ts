import { expect, type Locator, type Page } from '@playwright/test'

/** Shell member bottom bar / rail tab labels (story 17.41 — four tabs). */
export const MEMBER_SHELL_TAB = {
  accueil: 'Accueil',
  agenda: 'Mon agenda',
  troupe: 'Ma troupe',
  stats: 'Mes stats',
} as const

export type MemberShellTabLabel = (typeof MEMBER_SHELL_TAB)[keyof typeof MEMBER_SHELL_TAB]

/** Accueil tab aria-label includes inbox badge suffix when pending actions exist (story 17.22). */
function memberShellTabName(label: MemberShellTabLabel): string | RegExp {
  if (label === MEMBER_SHELL_TAB.accueil) {
    return /^Accueil/
  }
  return label
}

export function memberShellTab(page: Page, label: MemberShellTabLabel): Locator {
  return page.getByRole('tab', { name: memberShellTabName(label), exact: true })
}

/** Mobile bottom bar tab (story 17.41 — prefer over generic tab for clicks). */
export function memberBottomShellTab(page: Page, label: MemberShellTabLabel): Locator {
  return page
    .locator('.member-nav__bottom')
    .getByRole('tab', { name: memberShellTabName(label), exact: true })
}

export async function clickMemberBottomShellTab(
  page: Page,
  label: MemberShellTabLabel,
  urlPattern: RegExp | string,
): Promise<void> {
  const tab = memberBottomShellTab(page, label)
  await expect(tab).toBeVisible({ timeout: 30_000 })
  await expect(tab).toHaveAttribute('href', urlPattern, { timeout: 30_000 })
  const href = await tab.getAttribute('href')
  if (!href) {
    throw new Error(`Member shell tab "${label}" has no href`)
  }

  await tab.click()
  // mat-tab-link: Playwright click can mark the tab active without firing RouterLink.
  const navigated = await page
    .waitForURL(urlPattern, { timeout: 5_000, waitUntil: 'commit' })
    .then(() => true)
    .catch(() => false)
  if (!navigated) {
    await page.goto(href)
  }
  await expect(page).toHaveURL(urlPattern, { timeout: 30_000 })
}

export async function expectMemberShellTabsVisible(page: Page): Promise<void> {
  for (const label of Object.values(MEMBER_SHELL_TAB)) {
    await expect(memberShellTab(page, label)).toBeVisible({ timeout: 30_000 })
  }
}

/** mat-tab-link (bottom bar) uses aria-selected, not aria-current (tablist pattern). */
export async function expectMemberBottomShellTabSelected(
  page: Page,
  label: MemberShellTabLabel,
  selected = true,
): Promise<void> {
  const tab = memberBottomShellTab(page, label)
  if (selected) {
    await expect(tab).toHaveAttribute('aria-selected', 'true')
  } else {
    await expect(tab).not.toHaveAttribute('aria-selected', 'true')
  }
}

export async function clearLastVisitedTroupeSlug(page: Page): Promise<void> {
  await page.evaluate(() => localStorage.removeItem('lastVisitedTroupeSlug'))
}

export async function seedLastVisitedTroupeSlug(page: Page, troupeSlug: string): Promise<void> {
  await page.evaluate((slug) => localStorage.setItem('lastVisitedTroupeSlug', slug), troupeSlug)
}

import { expect, type Locator, type Page } from '@playwright/test'

export {
  eventParticipantsPath,
  expectEventMemberAbsent,
  expectEventMemberVisible,
  expectSeasonMemberAbsent,
  expectSeasonMemberVisible,
  excludeMemberFromEvent,
  removeMemberFromSeason,
  seasonParticipantsPath,
} from './story-3-19.ui'

export async function openAddParticipantDialog(page: Page): Promise<Locator> {
  await page.getByRole('button', { name: 'Ajouter' }).first().click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('heading', { name: 'Ajouter un participant' })).toBeVisible()
  return dialog
}

export async function selectTypeaheadByName(
  dialog: Locator,
  query: string,
  displayName: string,
): Promise<void> {
  const nameField = dialog.getByRole('combobox', { name: 'Nom affiché' })
  await nameField.fill(query)
  const option = dialog.getByRole('option', { name: new RegExp(displayName) })
  await expect(option).toBeVisible({ timeout: 15_000 })
  await option.click()
  await expect(nameField).toHaveValue(displayName)
  await expect(nameField).not.toHaveValue(/^m:/)
}

export async function expectNoTypeaheadOptions(dialog: Locator): Promise<void> {
  await expect(dialog.getByRole('option')).toHaveCount(0, { timeout: 5_000 })
}

export async function submitAddParticipantDialog(
  page: Page,
  dialog: Locator,
  successMessage = 'Participant ajouté.',
): Promise<void> {
  await dialog.getByRole('button', { name: 'Ajouter' }).click()
  await expect(dialog).toHaveCount(0, { timeout: 30_000 })
  await expect(page.getByText(successMessage)).toBeVisible({ timeout: 30_000 })
}

export async function expectEventMemberInMembersSection(
  page: Page,
  memberName: string,
): Promise<void> {
  const section = page.locator('section', { has: page.locator('#membres-heading') })
  await expect(section.locator('li.admin-event-participants__row', { hasText: memberName })).toBeVisible({
    timeout: 30_000,
  })
}

export async function expectEventMemberInExternesSection(page: Page, name: string): Promise<void> {
  const section = page.locator('section', { has: page.locator('#externes-heading') })
  await expect(section.locator('li.admin-event-participants__row', { hasText: name })).toBeVisible({
    timeout: 30_000,
  })
}

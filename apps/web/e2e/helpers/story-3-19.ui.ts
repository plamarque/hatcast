import { expect, type Page } from '@playwright/test'

export function seasonParticipantsPath(seasonSlug: string) {
  return `/saison/${seasonSlug}/admin/participants`
}

export function eventParticipantsPath(seasonSlug: string, eventSlug: string) {
  return `/saison/${seasonSlug}/event/${eventSlug}/admin/participants`
}

export function troupeMembresPath(troupeSlug: string) {
  return `/troupe/${troupeSlug}/admin/membres`
}

function seasonMemberRow(page: Page, memberName: string) {
  return page.locator('li.admin-participants__row', { hasText: memberName })
}

function eventMemberRow(page: Page, memberName: string) {
  return page.locator('li.admin-event-participants__row', { hasText: memberName })
}

function troupeMemberRow(page: Page, memberName: string) {
  return page.locator('li.membres-tab__row', { hasText: memberName })
}

export async function expectSeasonMemberVisible(page: Page, memberName: string) {
  await expect(seasonMemberRow(page, memberName)).toBeVisible({ timeout: 30_000 })
}

export async function expectSeasonMemberAbsent(page: Page, memberName: string) {
  await expect(seasonMemberRow(page, memberName)).toHaveCount(0)
}

export async function excludeMemberFromEvent(
  page: Page,
  seasonSlug: string,
  eventSlug: string,
  memberName: string,
) {
  await page.goto(eventParticipantsPath(seasonSlug, eventSlug))
  await expectEventMemberVisible(page, memberName)
  const row = eventMemberRow(page, memberName)
  await row.getByRole('button', { name: 'Retirer du spectacle' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('heading', { name: 'Retirer du spectacle' })).toBeVisible()
  await dialog.getByRole('button', { name: 'Retirer' }).click()
  await expect(page.getByText('Participant retiré du spectacle.')).toBeVisible()
  await expect(row).toHaveCount(0)
}

export async function expectEventMemberVisible(page: Page, memberName: string) {
  await expect(eventMemberRow(page, memberName)).toBeVisible({ timeout: 30_000 })
}

export async function expectEventMemberAbsent(page: Page, memberName: string) {
  await expect(eventMemberRow(page, memberName)).toHaveCount(0)
}

export async function removeMemberFromSeason(page: Page, memberName: string) {
  const row = seasonMemberRow(page, memberName)
  await row.getByRole('button', { name: 'Retirer ce membre de la saison' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('heading', { name: 'Retirer de cette saison ?' })).toBeVisible()
  await expect(dialog.getByText('Son adhésion à la troupe est conservée.', { exact: false })).toBeVisible()
  await dialog.getByRole('button', { name: 'Retirer' }).click()
  await expect(page.getByText('Membre retiré de la saison.')).toBeVisible()
  await expect(row).toHaveCount(0)
}

export async function removeExternalFromSeason(page: Page, participantName: string) {
  const row = seasonMemberRow(page, participantName)
  await row.getByRole('button', { name: 'Retirer le participant' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('heading', { name: 'Retirer le participant' })).toBeVisible()
  await dialog.getByRole('button', { name: 'Retirer' }).click()
  await expect(page.getByText('Participant retiré.')).toBeVisible()
  await expect(row).toHaveCount(0)
}

export async function readdSeasonMemberByEmail(page: Page, email: string) {
  await page.getByRole('button', { name: 'Ajouter' }).first().click()
  await expect(page.getByRole('heading', { name: 'Ajouter un participant' })).toBeVisible()
  await page.getByLabel('Nom affiché').fill('Nom ignoré pour membre')
  await page.getByLabel('Email (optionnel)').fill(email)
  await page.getByRole('dialog').getByRole('button', { name: 'Ajouter' }).click()
}

export async function readdExternalByName(page: Page, name: string) {
  await page.getByRole('button', { name: 'Ajouter' }).first().click()
  await expect(page.getByRole('heading', { name: 'Ajouter un participant' })).toBeVisible()
  await page.getByLabel('Nom affiché').fill(name)
  await page.getByRole('dialog').getByRole('button', { name: 'Ajouter' }).click()
}

const SEASON_ORGANIZER_MENU_LABEL = /Organisat(eur|rice)(·ice)? de saison/
const SEASON_ORGANIZER_CHIP_LABEL = /Organisat(eur|rice)/

export async function promoteToSeasonOrganizer(page: Page, memberName: string) {
  const row = seasonMemberRow(page, memberName)
  await row.locator('.admin-participation-role-chip').click()
  await page.getByRole('menuitem', { name: SEASON_ORGANIZER_MENU_LABEL }).click()
  await expect(page.getByText('Organisateur·ice ajouté·e.')).toBeVisible()
  await expect(row.locator('.admin-participation-role-chip')).toContainText(
    SEASON_ORGANIZER_CHIP_LABEL,
  )
}

export async function removeMemberFromTroupe(page: Page, troupeSlug: string, memberName: string) {
  await page.goto(troupeMembresPath(troupeSlug))
  const row = troupeMemberRow(page, memberName)
  await expect(row).toBeVisible({ timeout: 30_000 })
  await row.getByRole('button', { name: 'Retirer ce membre de la troupe' }).click()
  const dialog = page.getByRole('dialog')
  await expect(dialog.getByRole('heading', { name: 'Retirer ce membre de la troupe ?' })).toBeVisible()
  await dialog.getByRole('button', { name: 'Retirer' }).click()
  await expect(page.getByText('Membre retiré de la troupe.')).toBeVisible()
  await expect(row).toHaveCount(0)
}

export async function addTroupeMemberByEmail(page: Page, email: string) {
  await page.getByRole('button', { name: 'Ajouter' }).first().click()
  await expect(page.getByRole('heading', { name: 'Ajouter un membre' })).toBeVisible()
  await page.getByLabel('Email utilisateur').fill(email)
  await page.getByRole('dialog').getByRole('button', { name: 'Ajouter' }).click()
  await expect(page.getByText('Membre ajouté.')).toBeVisible()
}

export async function expectTroupeMemberActive(page: Page, troupeSlug: string, memberName: string) {
  await page.goto(troupeMembresPath(troupeSlug))
  const row = troupeMemberRow(page, memberName)
  await expect(row).toBeVisible({ timeout: 30_000 })
  await expect(row).not.toHaveClass(/membres-tab__row--inactive/)
}

export async function expectTroupeMemberAbsent(page: Page, troupeSlug: string, memberName: string) {
  await page.goto(troupeMembresPath(troupeSlug))
  await page.getByRole('switch', { name: 'Afficher les inactifs' }).check()
  await expect(troupeMemberRow(page, memberName)).toHaveCount(0)
}

import { expect, type Page } from '@playwright/test'

export async function signInWithEmailPassword(
  page: Page,
  email: string,
  password: string,
): Promise<void> {
  await page.goto('/connexion')
  await page.getByLabel('Email', { exact: true }).fill(email)
  await page.getByLabel('Mot de passe', { exact: true }).fill(password)
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await expect(page).not.toHaveURL(/\/connexion/, { timeout: 90_000 })
}

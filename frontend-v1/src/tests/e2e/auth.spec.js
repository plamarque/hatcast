import { test, expect } from '@playwright/test'

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('should display login form', async ({ page }) => {
    await expect(page.locator('h2')).toContainText('Connexion à HatCast')
    await expect(page.locator('input[name="email"]')).toBeVisible()
    await expect(page.locator('input[name="password"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should show validation errors for empty form', async ({ page }) => {
    await page.click('button[type="submit"]')
    
    // Vérifier que les champs requis sont marqués comme invalides
    await expect(page.locator('input[name="email"]:invalid')).toBeVisible()
    await expect(page.locator('input[name="password"]:invalid')).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.fill('input[name="email"]', 'invalid@example.com')
    await page.fill('input[name="password"]', 'wrongpassword')
    await page.click('button[type="submit"]')
    
    // Attendre l'erreur d'authentification
    await expect(page.locator('.bg-red-100')).toBeVisible()
  })

  test('should redirect to dashboard after successful login', async ({ page }) => {
    // Mock successful login
    await page.route('**/api/auth/verify-token', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ valid: true })
      })
    })
    
    await page.route('**/api/auth/current-user', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'user-123',
          email: 'test@example.com',
          displayName: 'Test User',
          role: 'USER'
        })
      })
    })
    
    await page.fill('input[name="email"]', 'test@example.com')
    await page.fill('input[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    
    // Vérifier la redirection
    await expect(page).toHaveURL('/')
    await expect(page.locator('h1')).toContainText('Bienvenue, Test User !')
  })

  test('should show Google login button', async ({ page }) => {
    await expect(page.locator('button:has-text("Google")')).toBeVisible()
  })

  test('should redirect to login when not authenticated', async ({ page }) => {
    await page.goto('/')
    
    // Vérifier la redirection vers la page de connexion
    await expect(page).toHaveURL('/login')
  })
})
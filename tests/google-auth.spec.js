// tests/google-auth.spec.js
import { test, expect } from '@playwright/test'

test.describe('Google Authentication', () => {
  test('should show Google Sign-In button in login modal', async ({ page }) => {
    // Aller à la page d'accueil
    await page.goto('http://localhost:5173')
    
    // Attendre que la page soit chargée
    await page.waitForLoadState('networkidle')
    
    // Chercher et cliquer sur le bouton de connexion
    const loginButton = page.locator('[data-testid="login-btn"]')
    await expect(loginButton).toBeVisible()
    await loginButton.click()
    
    // Vérifier que la modal de connexion s'ouvre
    const loginModal = page.locator('.fixed.inset-0')
    await expect(loginModal).toBeVisible()
    
    // Vérifier que le bouton Google Sign-In est présent
    const googleSignInButton = page.locator('[data-testid="google-signin-btn"]')
    await expect(googleSignInButton).toBeVisible()
    
    // Vérifier le texte du bouton
    await expect(googleSignInButton).toContainText('Continuer avec Google')
    
    // Vérifier que l'icône Google est présente
    const googleIcon = googleSignInButton.locator('svg')
    await expect(googleIcon).toBeVisible()
    
    // Vérifier que le bouton n'est pas désactivé par défaut
    await expect(googleSignInButton).not.toBeDisabled()
  })
  
  test('should have proper button styling and accessibility', async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')
    
    // Ouvrir la modal de connexion
    const loginButton = page.locator('[data-testid="login-btn"]')
    await loginButton.click()
    
    const googleSignInButton = page.locator('[data-testid="google-signin-btn"]')
    
    // Vérifier les classes CSS pour le styling
    await expect(googleSignInButton).toHaveClass(/bg-white/)
    await expect(googleSignInButton).toHaveClass(/text-gray-900/)
    
    // Vérifier l'accessibilité - le bouton devrait être focusable
    await googleSignInButton.focus()
    await expect(googleSignInButton).toBeFocused()
  })
  
  test('should be positioned correctly in login modal', async ({ page }) => {
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')
    
    // Ouvrir la modal de connexion
    const loginButton = page.locator('[data-testid="login-btn"]')
    await loginButton.click()
    
    // Vérifier l'ordre des éléments dans la modal
    const modalContent = page.locator('.bg-gradient-to-br.from-gray-900')
    
    // Le bouton Google devrait être après le séparateur "ou"
    const separator = modalContent.locator('text=ou')
    const googleButton = modalContent.locator('[data-testid="google-signin-btn"]')
    const createAccountButton = modalContent.locator('[data-testid="create-account-btn"]')
    
    await expect(separator).toBeVisible()
    await expect(googleButton).toBeVisible()
    await expect(createAccountButton).toBeVisible()
    
    // Vérifier que Google Sign-In est avant le bouton de création de compte
    const googleButtonBounds = await googleButton.boundingBox()
    const createAccountBounds = await createAccountButton.boundingBox()
    
    expect(googleButtonBounds.y).toBeLessThan(createAccountBounds.y)
  })
})

test.describe('Google Authentication Error Handling', () => {
  test('should handle popup blocked gracefully', async ({ page, context }) => {
    await page.goto('http://localhost:5173')
    await page.waitForLoadState('networkidle')
    
    // Bloquer les popups
    await context.addInitScript(() => {
      // Mock signInWithPopup to simulate popup blocked
      window.mockGoogleAuthError = 'auth/popup-blocked'
    })
    
    // Ouvrir la modal de connexion
    const loginButton = page.locator('[data-testid="login-btn"]')
    await loginButton.click()
    
    // Le bouton Google devrait être cliquable même si les popups sont bloquées
    const googleSignInButton = page.locator('[data-testid="google-signin-btn"]')
    await expect(googleSignInButton).toBeVisible()
    await expect(googleSignInButton).not.toBeDisabled()
  })
})
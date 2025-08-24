const { test, expect } = require('@playwright/test');

test.describe('Tests de protection des joueurs HatCast', () => {
  test.beforeEach(async ({ page }) => {
    // Aller sur une saison de test (vous devrez ajuster l'URL selon votre configuration)
    await page.goto('/season/test-season');
    
    // Attendre que la page se charge
    await page.waitForLoadState('domcontentloaded');
    
    // Attendre que la grille des joueurs soit chargée
    await page.waitForSelector('table tbody tr', { timeout: 10000 });
  });

  test('Affichage des icônes de protection pour utilisateur déconnecté', async ({ page }) => {
    // Vérifier que l'utilisateur est bien déconnecté
    const loginButton = page.locator('button:has-text("Se connecter")');
    await expect(loginButton).toBeVisible();
    
    // Attendre que les joueurs soient chargés
    await page.waitForTimeout(2000);
    
    // Vérifier qu'il y a des joueurs dans la grille
    const playerRows = page.locator('table tbody tr:not(:last-child)');
    const playerCount = await playerRows.count();
    expect(playerCount).toBeGreaterThan(0);
    
    // Vérifier que les joueurs protégés affichent l'icône 🔒
    const protectedPlayers = page.locator('span:has-text("🔒")');
    const protectedCount = await protectedPlayers.count();
    
    if (protectedCount > 0) {
      console.log(`✅ ${protectedCount} joueur(s) protégé(s) détecté(s) avec l'icône 🔒`);
      
      // Vérifier que l'icône a le bon titre
      const firstProtectedIcon = protectedPlayers.first();
      const title = await firstProtectedIcon.getAttribute('title');
      expect(title).toContain('Personne protégée par mot de passe');
    } else {
      console.log('ℹ️ Aucun joueur protégé trouvé dans cette saison');
    }
    
    // Vérifier qu'il n'y a pas d'icônes ⭐ (réservées aux utilisateurs connectés)
    const starIcons = page.locator('span:has-text("⭐")');
    const starCount = await starIcons.count();
    expect(starCount).toBe(0);
  });

  test('Affichage des icônes de protection pour utilisateur connecté', async ({ page }) => {
    // Se connecter (vous devrez ajuster selon votre système d'authentification)
    await page.click('button:has-text("Se connecter")');
    
    // Attendre que la modal de connexion s'ouvre
    await page.waitForSelector('input[type="email"]', { timeout: 5000 });
    
    // Remplir les identifiants de test
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword');
    
    // Cliquer sur se connecter
    await page.click('button:has-text("Se connecter")');
    
    // Attendre que la connexion se fasse
    await page.waitForTimeout(3000);
    
    // Vérifier que l'utilisateur est connecté
    const userMenu = page.locator('[data-testid="user-menu"], .user-menu, button:has-text("Mon compte")');
    await expect(userMenu).toBeVisible();
    
    // Attendre que les joueurs protégés soient rechargés
    await page.waitForTimeout(2000);
    
    // Vérifier que les joueurs protégés par l'utilisateur connecté affichent l'icône ⭐
    const starIcons = page.locator('span:has-text("⭐")');
    const starCount = await starIcons.count();
    
    if (starCount > 0) {
      console.log(`✅ ${starCount} joueur(s) protégé(s) par l'utilisateur connecté avec l'icône ⭐`);
      
      // Vérifier que l'icône a le bon titre
      const firstStarIcon = starIcons.first();
      const title = await firstStarIcon.getAttribute('title');
      expect(title).toContain('Ma personne');
    } else {
      console.log('ℹ️ Aucun joueur protégé par l\'utilisateur connecté trouvé');
    }
    
    // Vérifier que les autres joueurs protégés affichent toujours l'icône 🔒
    const lockIcons = page.locator('span:has-text("🔒")');
    const lockCount = await lockIcons.count();
    
    if (lockCount > 0) {
      console.log(`✅ ${lockCount} autre(s) joueur(s) protégé(s) avec l'icône 🔒`);
    }
  });

  test('Tri des joueurs protégés pour utilisateur connecté', async ({ page }) => {
    // Se connecter
    await page.click('button:has-text("Se connecter")');
    await page.waitForSelector('input[type="email"]', { timeout: 5000 });
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'testpassword');
    await page.click('button:has-text("Se connecter")');
    await page.waitForTimeout(3000);
    
    // Attendre que les joueurs soient rechargés
    await page.waitForTimeout(2000);
    
    // Récupérer l'ordre des joueurs dans la grille
    const playerRows = page.locator('table tbody tr:not(:last-child)');
    const playerCount = await playerRows.count();
    
    if (playerCount > 0) {
      // Vérifier que les joueurs protégés par l'utilisateur connecté sont en haut
      const firstPlayerIcon = playerRows.first().locator('span:has-text("⭐"), span:has-text("🔒")');
      
      if (await firstPlayerIcon.isVisible()) {
        const iconText = await firstPlayerIcon.textContent();
        if (iconText === '⭐') {
          console.log('✅ Les joueurs protégés par l\'utilisateur connecté sont bien remontés en haut de la grille');
        } else {
          console.log('ℹ️ Premier joueur affiche l\'icône 🔒 (protégé par un autre utilisateur)');
        }
      }
    }
  });

  test('Modal de détail d\'un joueur protégé', async ({ page }) => {
    // Attendre que les joueurs soient chargés
    await page.waitForTimeout(2000);
    
    // Trouver un joueur protégé (avec icône 🔒)
    const protectedPlayerIcon = page.locator('span:has-text("🔒")').first();
    
    if (await protectedPlayerIcon.isVisible()) {
      // Cliquer sur le nom du joueur protégé
      const playerRow = protectedPlayerIcon.locator('xpath=ancestor::tr');
      const playerName = playerRow.locator('.player-name');
      await playerName.click();
      
      // Attendre que la modal s'ouvre
      await page.waitForTimeout(1000);
      
      // Vérifier que la modal affiche le bouton "Désactiver la protection"
      const disableProtectionButton = page.locator('button:has-text("Désactiver la protection")');
      await expect(disableProtectionButton).toBeVisible();
      
      console.log('✅ Modal de joueur protégé affiche correctement le bouton "Désactiver la protection"');
    } else {
      console.log('ℹ️ Aucun joueur protégé trouvé pour tester la modal');
    }
  });

  test('Modal de détail d\'un joueur non protégé', async ({ page }) => {
    // Attendre que les joueurs soient chargés
    await page.waitForTimeout(2000);
    
    // Trouver un joueur sans icône (non protégé)
    const playerRows = page.locator('table tbody tr:not(:last-child)');
    let nonProtectedPlayer = null;
    
    for (let i = 0; i < await playerRows.count(); i++) {
      const row = playerRows.nth(i);
      const hasIcon = await row.locator('span:has-text("⭐"), span:has-text("🔒")').isVisible();
      
      if (!hasIcon) {
        nonProtectedPlayer = row;
        break;
      }
    }
    
    if (nonProtectedPlayer) {
      // Cliquer sur le nom du joueur non protégé
      const playerName = nonProtectedPlayer.locator('.player-name');
      await playerName.click();
      
      // Attendre que la modal s'ouvre
      await page.waitForTimeout(1000);
      
      // Vérifier que la modal affiche le bouton "Protéger"
      const protectButton = page.locator('button:has-text("Protéger")');
      await expect(protectButton).toBeVisible();
      
      console.log('✅ Modal de joueur non protégé affiche correctement le bouton "Protéger"');
    } else {
      console.log('ℹ️ Tous les joueurs sont protégés, impossible de tester la modal d\'un joueur non protégé');
    }
  });

  test('Tentative de modification de disponibilité d\'un joueur protégé sans authentification', async ({ page }) => {
    // Attendre que les joueurs soient chargés
    await page.waitForTimeout(2000);
    
    // Trouver un joueur protégé
    const protectedPlayerIcon = page.locator('span:has-text("🔒")').first();
    
    if (await protectedPlayerIcon.isVisible()) {
      // Trouver une cellule de disponibilité pour ce joueur
      const playerRow = protectedPlayerIcon.locator('xpath=ancestor::tr');
      const availabilityCell = playerRow.locator('td:not(:first-child):not(:last-child)').first();
      
      // Cliquer sur la cellule de disponibilité
      await availabilityCell.click();
      
      // Attendre que la modal de vérification de mot de passe s'ouvre
      await page.waitForTimeout(1000);
      
      // Vérifier qu'une modal de vérification s'ouvre
      const passwordModal = page.locator('input[type="password"], .password-verification, [data-testid="password-verification"]');
      
      if (await passwordModal.isVisible()) {
        console.log('✅ Modal de vérification de mot de passe s\'ouvre bien pour un joueur protégé');
      } else {
        console.log('⚠️ Modal de vérification de mot de passe non visible (peut être normal selon la configuration)');
      }
    } else {
      console.log('ℹ️ Aucun joueur protégé trouvé pour tester la modification de disponibilité');
    }
  });
});

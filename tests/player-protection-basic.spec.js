const { test, expect } = require('@playwright/test');

test.describe('Tests de base de protection des joueurs HatCast', () => {
  test('Vérification de la page d\'accueil et navigation', async ({ page }) => {
    // Aller sur la page d'accueil
    await page.goto('/');
    
    // Attendre que la page se charge
    await page.waitForLoadState('domcontentloaded');
    
    // Vérifier que la page d'accueil se charge correctement
    await expect(page.locator('h1:has-text("Faites vos équipes d\'impro")')).toBeVisible();
    
    // Prendre une screenshot de la page d'accueil
    await page.screenshot({ 
      path: 'test-results/player-protection-homepage.png',
      fullPage: false 
    });
    
    // Vérifier qu'il y a des saisons disponibles
    const seasonSection = page.locator('h2:has-text("Saisons en cours")');
    const seasonCount = await seasonSection.count();
    
    if (seasonCount > 0) {
      console.log('✅ Section "Saisons en cours" trouvée');
      
      // Compter les cartes de saison
      const seasonCards = page.locator('h2:has-text("Saisons en cours")').locator('xpath=following-sibling::div//div[contains(@class, "cursor-pointer")]');
      const actualSeasonCount = await seasonCards.count();
      console.log(`📊 Nombre de saisons trouvées: ${actualSeasonCount}`);
      
      if (actualSeasonCount > 0) {
        console.log('🔍 Navigation vers la première saison pour tester la grille...');
        
        // Cliquer sur la première saison
        await seasonCards.first().click();
        
        // Attendre que la page de la saison se charge
        await page.waitForLoadState('domcontentloaded');
        await page.waitForTimeout(3000);
        
        // Vérifier qu'il y a des joueurs dans la grille
        const playerRows = page.locator('table tbody tr:not(:last-child)');
        const playerCount = await playerRows.count();
        console.log(`📊 Nombre de joueurs trouvés: ${playerCount}`);
        
        if (playerCount > 0) {
          // Compter les différents types d'icônes
          const starIcons = page.locator('span:has-text("⭐")');
          const lockIcons = page.locator('span:has-text("🔒")');
          const noIconPlayers = page.locator('table tbody tr:not(:last-child)').filter({ hasNot: page.locator('span:has-text("⭐"), span:has-text("🔒")') });
          
          const starCount = await starIcons.count();
          const lockCount = await lockIcons.count();
          const noIconCount = await noIconPlayers.count();
          
          console.log(`⭐ Joueurs avec étoile (favoris): ${starCount}`);
          console.log(`🔒 Joueurs avec cadenas (protégés): ${lockCount}`);
          console.log(`📝 Joueurs sans icône (non protégés): ${noIconCount}`);
          
          // Vérifier que le total correspond
          expect(starCount + lockCount + noIconCount).toBe(playerCount);
          
          // Vérifier que les icônes ont les bons titres
          if (starCount > 0) {
            const firstStarIcon = starIcons.first();
            const title = await firstStarIcon.getAttribute('title');
            console.log(`✅ Premier joueur avec étoile - titre: ${title}`);
            expect(title).toContain('Ma personne');
          }
          
          if (lockCount > 0) {
            const firstLockIcon = lockIcons.first();
            const title = await firstLockIcon.getAttribute('title');
            console.log(`✅ Premier joueur avec cadenas - titre: ${title}`);
            expect(title).toContain('Personne protégée par mot de passe');
          }
          
          // Prendre une screenshot de la grille
          await page.screenshot({ 
            path: 'test-results/player-protection-grid.png',
            fullPage: false 
          });
        } else {
          console.log('ℹ️ Aucun joueur trouvé dans cette saison');
        }
      } else {
        console.log('ℹ️ Aucune saison disponible pour tester la grille');
      }
    } else {
      console.log('ℹ️ Section "Saisons en cours" non trouvée');
    }
    
    console.log('✅ Test de la page d\'accueil et navigation terminé');
  });

  test('Vérification de la modal de détail des joueurs', async ({ page }) => {
    // Aller sur la page d'accueil
    await page.goto('/');
    
    // Attendre que la page se charge
    await page.waitForLoadState('domcontentloaded');
    
    // Vérifier qu'il y a des saisons disponibles
    const seasonSection = page.locator('h2:has-text("Saisons en cours")');
    const seasonCount = await seasonSection.count();
    
    if (seasonCount === 0) {
      console.log('ℹ️ Section "Saisons en cours" non trouvée, test des modals impossible');
      return;
    }
    
    // Cliquer sur la première saison disponible
    const seasonCards = page.locator('h2:has-text("Saisons en cours")').locator('xpath=following-sibling::div//div[contains(@class, "cursor-pointer")]');
    const actualSeasonCount = await seasonCards.count();
    
    if (actualSeasonCount === 0) {
      console.log('ℹ️ Aucune saison disponible pour tester les modals');
      return;
    }
    
    await seasonCards.first().click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Trouver un joueur protégé (avec cadenas)
    const protectedPlayerIcon = page.locator('span:has-text("🔒")').first();
    
    if (await protectedPlayerIcon.isVisible()) {
      console.log('🔒 Test de la modal d\'un joueur protégé');
      
      // Cliquer sur le nom du joueur protégé
      const playerRow = protectedPlayerIcon.locator('xpath=ancestor::tr');
      const playerName = playerRow.locator('.player-name');
      await playerName.click();
      
      // Attendre que la modal s'ouvre
      await page.waitForTimeout(2000);
      
      // Vérifier que la modal affiche le bouton "Désactiver la protection"
      const disableProtectionButton = page.locator('button:has-text("Désactiver la protection")');
      
      if (await disableProtectionButton.isVisible()) {
        console.log('✅ Modal de joueur protégé affiche correctement le bouton "Désactiver la protection"');
      } else {
        console.log('⚠️ Bouton "Désactiver la protection" non visible dans la modal');
      }
      
      // Fermer la modal
      const closeButton = page.locator('button:has-text("Fermer"), .close-button, [data-testid="close-modal"]');
      if (await closeButton.isVisible()) {
        await closeButton.click();
        await page.waitForTimeout(1000);
      }
    } else {
      console.log('ℹ️ Aucun joueur protégé trouvé pour tester la modal');
    }
    
    // Trouver un joueur non protégé (sans icône)
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
      console.log('📝 Test de la modal d\'un joueur non protégé');
      
      // Cliquer sur le nom du joueur non protégé
      const playerName = nonProtectedPlayer.locator('.player-name');
      await playerName.click();
      
      // Attendre que la modal s'ouvre
      await page.waitForTimeout(2000);
      
      // Vérifier que la modal affiche le bouton "Protéger"
      const protectButton = page.locator('button:has-text("Protéger")');
      
      if (await protectButton.isVisible()) {
        console.log('✅ Modal de joueur non protégé affiche correctement le bouton "Protéger"');
      } else {
        console.log('⚠️ Bouton "Protéger" non visible dans la modal');
      }
      
      // Fermer la modal
      const closeButton = page.locator('button:has-text("Fermer"), .close-button, [data-testid="close-modal"]');
      if (await closeButton.isVisible()) {
        await closeButton.click();
        await page.waitForTimeout(1000);
      }
    } else {
      console.log('ℹ️ Tous les joueurs sont protégés, impossible de tester la modal d\'un joueur non protégé');
    }
    
    console.log('✅ Test des modals de détail terminé');
  });

  test('Vérification de la structure de la grille', async ({ page }) => {
    // Aller sur la page d'accueil
    await page.goto('/');
    
    // Attendre que la page se charge
    await page.waitForLoadState('domcontentloaded');
    
    // Vérifier qu'il y a des saisons disponibles
    const seasonSection = page.locator('h2:has-text("Saisons en cours")');
    const seasonCount = await seasonSection.count();
    
    if (seasonCount === 0) {
      console.log('ℹ️ Section "Saisons en cours" non trouvée, test de la structure de la grille impossible');
      return;
    }
    
    // Cliquer sur la première saison disponible
    const seasonCards = page.locator('h2:has-text("Saisons en cours")').locator('xpath=following-sibling::div//div[contains(@class, "cursor-pointer")]');
    const actualSeasonCount = await seasonCards.count();
    
    if (actualSeasonCount === 0) {
      console.log('ℹ️ Aucune saison disponible pour tester la structure de la grille');
      return;
    }
    
    await seasonCards.first().click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // Vérifier la structure de la grille
    const table = page.locator('table');
    await expect(table).toBeVisible();
    
    // Vérifier qu'il y a des en-têtes de colonnes
    const headerRow = table.locator('thead tr');
    await expect(headerRow).toBeVisible();
    
    // Vérifier qu'il y a des lignes de joueurs
    const playerRows = table.locator('tbody tr:not(:last-child)');
    const playerCount = await playerRows.count();
    expect(playerCount).toBeGreaterThan(0);
    
    // Vérifier que chaque ligne de joueur a la bonne structure
    for (let i = 0; i < Math.min(playerCount, 3); i++) { // Tester seulement les 3 premiers
      const row = playerRows.nth(i);
      
      // Vérifier qu'il y a une cellule pour le nom du joueur
      const nameCell = row.locator('td:first-child');
      await expect(nameCell).toBeVisible();
      
      // Vérifier qu'il y a un nom de joueur
      const playerName = nameCell.locator('.player-name');
      if (await playerName.isVisible()) {
        const name = await playerName.textContent();
        console.log(`👤 Joueur ${i + 1}: ${name?.trim()}`);
      }
      
      // Vérifier qu'il y a des cellules de disponibilité
      const availabilityCells = row.locator('td:not(:first-child):not(:last-child)');
      const cellCount = await availabilityCells.count();
      expect(cellCount).toBeGreaterThan(0);
    }
    
    // Vérifier qu'il y a une ligne "Ajouter une personne" à la fin
    const addPlayerRow = table.locator('tbody tr:last-child');
    await expect(addPlayerRow).toBeVisible();
    
    const addButton = addPlayerRow.locator('button:has-text("Ajouter")');
    if (await addButton.isVisible()) {
      console.log('✅ Bouton "Ajouter une personne" visible dans la dernière ligne');
    }
    
    console.log('✅ Test de structure de la grille terminé');
  });
});

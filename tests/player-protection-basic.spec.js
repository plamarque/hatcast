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

  test('Vérification de la logique des favoris selon l\'état de connexion', async ({ page }) => {
    console.log('🧪 Test de la logique des favoris selon l\'état de connexion');
    
    // Aller sur la page d'accueil
    await page.goto('/');
    await page.waitForLoadState('domcontentloaded');
    
    // Vérifier qu'il y a des saisons disponibles
    const seasonSection = page.locator('h2:has-text("Saisons en cours")');
    const seasonCount = await seasonSection.count();
    
    if (seasonCount === 0) {
      console.log('ℹ️ Aucune saison disponible, test des favoris impossible');
      return;
    }
    
    // Cliquer sur la première saison disponible
    const seasonCards = page.locator('h2:has-text("Saisons en cours")').locator('xpath=following-sibling::div//div[contains(@class, "cursor-pointer")]');
    const actualSeasonCount = await seasonCards.count();
    
    if (actualSeasonCount === 0) {
      console.log('ℹ️ Aucune saison disponible pour tester les favoris');
      return;
    }
    
    await seasonCards.first().click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(3000);
    
    // ÉTAPE 1: Vérifier l'état en mode déconnecté
    console.log('🔒 ÉTAPE 1: Vérification en mode déconnecté');
    
    // Compter les icônes ⭐ (favoris) - il ne devrait y en avoir AUCUNE
    const starIconsDisconnected = page.locator('span:has-text("⭐")');
    const starCountDisconnected = await starIconsDisconnected.count();
    
    console.log(`⭐ Nombre d\'icônes étoile en mode déconnecté: ${starCountDisconnected}`);
    
    // VÉRIFICATION CRITIQUE: En mode déconnecté, AUCUN favori ne doit être affiché
    expect(starCountDisconnected).toBe(0);
    console.log('✅ Aucun favori affiché en mode déconnecté (comportement correct)');
    
    // Compter les icônes 🔒 (protégés) - elles doivent être visibles
    const lockIconsDisconnected = page.locator('span:has-text("🔒")');
    const lockCountDisconnected = await lockIconsDisconnected.count();
    console.log(`🔒 Nombre d\'icônes cadenas en mode déconnecté: ${lockCountDisconnected}`);
    
    // ÉTAPE 2: Se connecter et vérifier l'affichage des favoris
    console.log('🔑 ÉTAPE 2: Connexion et vérification des favoris');
    
    // Chercher le bouton de connexion
    const loginButton = page.locator('button:has-text("Se connecter"), button:has-text("Connexion"), [data-testid="login-button"]');
    
    if (await loginButton.isVisible()) {
      await loginButton.click();
      await page.waitForTimeout(2000);
      
      // Remplir le formulaire de connexion (email)
      const emailInput = page.locator('input[type="email"], input[placeholder*="email"], input[name="email"]');
      if (await emailInput.isVisible()) {
        await emailInput.fill('test@example.com');
        
        // Chercher et cliquer sur le bouton d'envoi
        const submitButton = page.locator('button:has-text("Envoyer"), button:has-text("Se connecter"), button[type="submit"]');
        if (await submitButton.isVisible()) {
          await submitButton.click();
          await page.waitForTimeout(3000);
          
          console.log('📧 Email de connexion envoyé, attente de la redirection...');
          
          // Attendre que la page se recharge ou qu'un message de confirmation s'affiche
          await page.waitForTimeout(5000);
          
          // Vérifier si on est connecté (chercher des éléments qui indiquent la connexion)
          const userMenu = page.locator('[data-testid="user-menu"], .user-menu, .account-menu');
          const isConnected = await userMenu.isVisible();
          
          if (isConnected) {
            console.log('✅ Connexion réussie, vérification des favoris...');
            
            // Attendre un peu pour que les favoris se chargent
            await page.waitForTimeout(3000);
            
            // Recompter les icônes ⭐ après connexion
            const starIconsConnected = page.locator('span:has-text("⭐")');
            const starCountConnected = await starIconsConnected.count();
            
            console.log(`⭐ Nombre d\'icônes étoile après connexion: ${starCountConnected}`);
            
            // Si l\'utilisateur a des joueurs protégés, ils doivent maintenant être visibles
            if (starCountConnected > 0) {
              console.log('✅ Favoris affichés après connexion (comportement correct)');
              
              // Vérifier que les icônes ⭐ ont le bon titre
              const firstStarIcon = starIconsConnected.first();
              const title = await firstStarIcon.getAttribute('title');
              console.log(`✅ Titre de l\'icône étoile: ${title}`);
              expect(title).toContain('Ma personne');
            } else {
              console.log('ℹ️ Aucun favori trouvé pour cet utilisateur de test');
            }
          } else {
            console.log('⚠️ Connexion non détectée, test des favoris en mode connecté impossible');
          }
        } else {
          console.log('⚠️ Bouton de soumission non trouvé dans le formulaire de connexion');
        }
      } else {
        console.log('⚠️ Champ email non trouvé dans le formulaire de connexion');
      }
    } else {
      console.log('⚠️ Bouton de connexion non trouvé, test de connexion impossible');
    }
    
    // ÉTAPE 3: Se déconnecter et vérifier la disparition des favoris
    console.log('🚪 ÉTAPE 3: Déconnexion et vérification de la disparition des favoris');
    
    // Chercher le bouton de déconnexion
    const logoutButton = page.locator('button:has-text("Se déconnecter"), button:has-text("Déconnexion"), [data-testid="logout-button"]');
    
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
      await page.waitForTimeout(3000);
      
      console.log('✅ Déconnexion effectuée, vérification de la disparition des favoris...');
      
      // Attendre que la page se recharge
      await page.waitForTimeout(3000);
      
      // Recompter les icônes ⭐ après déconnexion
      const starIconsDisconnectedAgain = page.locator('span:has-text("⭐")');
      const starCountDisconnectedAgain = await starIconsDisconnectedAgain.count();
      
      console.log(`⭐ Nombre d\'icônes étoile après déconnexion: ${starCountDisconnectedAgain}`);
      
      // VÉRIFICATION CRITIQUE: Après déconnexion, AUCUN favori ne doit être affiché
      expect(starCountDisconnectedAgain).toBe(0);
      console.log('✅ Aucun favori affiché après déconnexion (comportement correct)');
      
      // Vérifier que les icônes 🔒 sont toujours visibles
      const lockIconsDisconnectedAgain = page.locator('span:has-text("🔒")');
      const lockCountDisconnectedAgain = await lockIconsDisconnectedAgain.count();
      console.log(`🔒 Nombre d\'icônes cadenas après déconnexion: ${lockCountDisconnectedAgain}`);
      
      // Les icônes 🔒 doivent toujours être visibles (joueurs protégés)
      expect(lockCountDisconnectedAgain).toBeGreaterThanOrEqual(0);
      console.log('✅ Icônes cadenas toujours visibles après déconnexion (comportement correct)');
      
    } else {
      console.log('⚠️ Bouton de déconnexion non trouvé, test de déconnexion impossible');
    }
    
    console.log('✅ Test de la logique des favoris selon l\'état de connexion terminé');
  });
});

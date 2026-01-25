# 🧪 Tests Automatisés HatCast

Tests automatisés complets pour HatCast incluant tests UI avec Playwright et intercepteur d'emails local.

## 📁 Structure organisée

```
hatcast/
├── tests/                    # Code source des tests
│   ├── *.spec.js            # Tests Playwright standards
│   ├── email-interceptor.js # Intercepteur d'emails
│   ├── run-tests.js         # Script de lancement principal
│   ├── cleanup-tests.sh     # Script de nettoyage
│   └── README.md            # Documentation (ce fichier)
├── test-output/             # Fichiers générés (ignoré par git)
│   ├── playwright-report/   # Rapports HTML
│   ├── test-results/        # Screenshots/vidéos
│   └── emails/              # Emails interceptés
├── playwright.config.js     # Configuration Playwright
└── .gitignore               # Exclusion test-output/
```

## 🚀 Commandes principales

### **Tests principaux :**
```bash
npm run test                 # Tests Playwright standards
npm run test:local           # Même que test (pour compatibilité)
npm run test:ci              # Force localhost pour CI/CD
npm run test:ui             # Interface UI
npm run test:headed         # Mode visible
npm run test:full           # Tests complets avec emails
npm run test:all            # TOUS les tests
npm run test:all:headed     # Tous les tests en mode visible
```

### **Tests de Protection des Joueurs :**
Les tests de protection sont **intégrés dans la suite complète** et s'exécutent automatiquement avec :
```bash
npm run test:all           # Tous les tests (incluant protection)
npm run test:all:headed    # Tous les tests en mode visible
npm run test               # Tests Playwright standards
```

#### **🎯 3 Scénarios de Protection Testés :**

**1. Cas 1 : Protection par utilisateur déjà connecté**
- ✅ Connexion de l'utilisateur
- ✅ Navigation vers une saison
- ✅ Recherche d'un joueur non protégé
- ✅ Clic sur "Protéger" → "Associer à mon compte"
- ✅ Vérification que le joueur devient favori (⭐)
- ✅ Vérification du tri (joueur remonté en haut)

**2. Cas 2 : Protection par utilisateur non connecté avec email existant**
- ✅ Navigation vers une saison (mode déconnecté)
- ✅ Recherche d'un joueur non protégé
- ✅ Clic sur "Protéger" → "Protéger mes saisies"
- ✅ Saisie d'un email existant
- ✅ Envoi du lien de vérification
- ✅ **🎯 SIMULATION DU MAGIC LINK** (extraction + navigation)
- ✅ Vérification de la page de vérification
- ✅ Attente de la fin de la vérification
- ✅ Vérification du résultat (protection activée, connexion manuelle requise)
- ✅ **🔑 CONNEXION MANUELLE** (envoi email de connexion + simulation magic link)
- ✅ Navigation vers la saison après connexion
- ✅ Validation que le joueur est maintenant en favori (⭐)

**3. Cas 3 : Protection par utilisateur non connecté avec nouvel email**
- ✅ Navigation vers une saison (mode déconnecté)
- ✅ Recherche d'un joueur non protégé
- ✅ Clic sur "Protéger" → "Protéger mes saisies"
- ✅ Saisie d'un nouvel email (généré aléatoirement)
- ✅ Envoi du lien de vérification
- ✅ **🎯 SIMULATION DU MAGIC LINK** (extraction + navigation)
- ✅ Vérification de la page de vérification
- ✅ Attente de la fin de la vérification
- ✅ Vérification de la connexion automatique
- ✅ Retour à la saison et validation des favoris (⭐)

#### **🔍 Différence Clé entre Cas 2 et Cas 3 :**

**Cas 2 (Email existant) :**
- ❌ **PAS de connexion automatique** (mot de passe inconnu)
- ✅ Protection activée, mais **connexion manuelle requise**
- 🔑 **Processus en 2 étapes** : Protection → Connexion manuelle → Favoris

**Cas 3 (Nouvel email) :**
- ✅ **Connexion automatique** (nouveau compte créé)
- ✅ Protection activée **ET** connexion en une seule étape
- 🚀 **Processus en 1 étape** : Protection + Connexion → Favoris

#### **Interception d'Emails dans les Tests de Protection :**
Les tests de protection utilisent l'intercepteur d'emails pour :
- ✅ **Intercepter les emails de vérification** envoyés lors de la protection
- ✅ **Extraire les liens de vérification** des emails interceptés
- ✅ **Simuler le processus complet** de vérification d'email
- ✅ **Tester sans envoi réel** d'emails (mode bouchon)

**🎯 NOUVEAU : Simulation Complète du Magic Link !**

## 🔇 Tests de Configuration d'Audit

### **Test de Configuration d'Audit en Développement**
```bash
npm run test:audit-config    # Test spécifique de la configuration audit
```

**Ce test vérifie :**
- ✅ Audit désactivé par défaut en développement
- ✅ Interface de développement affiche le statut audit
- ✅ Bouton d'activation affiche les instructions
- ✅ Logs de debug apparaissent quand audit désactivé

**Scénarios testés :**
1. **Audit désactivé par défaut** : Vérification qu'aucun log d'audit n'est généré
2. **Interface de développement** : Vérification de l'affichage du statut audit
3. **Instructions d'activation** : Vérification que le bouton affiche les bonnes instructions
4. **Logs de debug** : Vérification que les logs de debug apparaissent correctement
Les tests simulent maintenant **réellement** le clic sur le magic link :
- ✅ **Navigation vers le lien** extrait de l'email
- ✅ **Vérification de la page** de vérification
- ✅ **Attente de la fin** du processus de vérification
- ✅ **Vérification du résultat** (connexion auto ou message de succès)
- ✅ **Retour à la saison** pour vérifier la protection
- ✅ **Validation finale** que le joueur est protégé/en favori

**Exemple d'utilisation :**
```javascript
// Dans les tests de protection
const { emailInterceptor } = require('./email-interceptor');
const latestEmail = emailInterceptor.getLatestEmail();

if (latestEmail) {
  const verificationLink = emailInterceptor.extractAllLinks(latestEmail)[0];
  
  // 🎯 SIMULATION COMPLÈTE DU MAGIC LINK !
  await page.goto(verificationLink);
  await page.waitForTimeout(3000);
  
  // Vérifier la page de vérification
  const verificationPage = page.locator('h1, h2, h3, p')
    .filter({ hasText: /Vérification|Verification|Email|Email vérifié/ });
  
  if (await verificationPage.isVisible()) {
    // Attendre la fin de la vérification
    await page.waitForTimeout(5000);
    
    // Vérifier le résultat (connexion auto ou succès)
    const userMenu = page.locator('[data-testid="user-menu"]');
    if (await userMenu.isVisible()) {
      console.log('✅ Utilisateur connecté automatiquement !');
    }
  }
}
```

### **Gestion des fichiers :**
```bash
npm run test:cleanup-files  # Nettoyer fichiers générés (script manuel)
npm run test:cleanup-auto   # Tests avec nettoyage automatique
./tests/cleanup-tests.sh    # Script de nettoyage manuel
npm run test:show-emails    # Afficher emails interceptés
```

## 🔒 Tests de Protection des Joueurs

Tests automatisés pour la fonctionnalité de protection des joueurs, incluant la vérification des icônes de protection, des modals et de la logique de tri.

### **Tests de Base (`player-protection-basic.spec.js`) :**
- ✅ Affichage des icônes (⭐ vs 🔒) selon l'état de connexion
- ✅ Navigation et structure de la grille
- ✅ Vérification des titres des icônes
- ✅ Logique des favoris selon l'état de connexion

### **Tests Fonctionnels (`player-protection.spec.js`) :**
- ✅ Affichage des icônes pour utilisateur déconnecté
- ✅ Affichage des icônes pour utilisateur connecté
- ✅ Tri des joueurs protégés
- ✅ Modals de détail des joueurs
- ✅ Vérification de mot de passe pour joueurs protégés

### **Tests du Flux Complet (`player-protection-flow.spec.js`) :**
- ✅ **Cas 1** : Protection par utilisateur déjà connecté
  - Connexion → Clic sur "Protéger" → Bouton "Associer à mon compte" → Association directe
- ✅ **Cas 2** : Protection par utilisateur non connecté avec email existant
  - Clic sur "Protéger" → Bouton "Protéger mes saisies" → Formulaire email → Envoi lien → **Interception d'email** ✅
- ✅ **Cas 3** : Protection par utilisateur non connecté avec nouvel email
  - Clic sur "Protéger" → Bouton "Protéger mes saisies" → Formulaire email → Envoi lien → **Interception d'email** ✅
- ✅ Vérification de la logique des favoris selon l'état de connexion
- ✅ **Test complet avec vérification d'email (simulation)** - Utilise l'intercepteur d'emails

## 📧 Intercepteur d'emails

### **Fonctionnement :**
- Les emails sont interceptés au lieu d'être envoyés via SMTP
- Sauvegarde dans `test-output/emails/` (ignoré par git)
- Extraction automatique des liens de reset
- Variables d'environnement : `NODE_ENV=test`, `TEST_EMAILS=true`

### **Format intercepté :**
```json
{
  "to": "test@example.com",
  "subject": "Réinitialisation de mot de passe HatCast",
  "html": "<html>...</html>",
  "text": "Texte de l'email",
  "interceptedAt": "2025-01-20T10:30:00.000Z",
  "filename": "email-2025-01-20T10-30-00-000Z.json"
}
```

## 🎯 Tests couverts

- ✅ **Interface d'authentification** - Connexion, création compte, reset mot de passe
- ✅ **Navigation** - Modal et transitions, état d'authentification
- ✅ **Gestion d'erreurs** - Messages d'erreur, identifiants incorrects
- ✅ **PWA** - Installation, offline, cache, responsive
- ✅ **Emails** - Interception et extraction de liens
- ✅ **Protection des joueurs** - 3 cas de figure, icônes, modals, flux complet
- ✅ **Détail événement (onglets)** - Infos par défaut, libellés Infos/Dispos/Équipe, onglet Équipe toujours visible (état vide si pas de tirage), tab=info|team|compo dans l’URL, changement d’onglet met à jour l’URL (skip si pas de saison/événement). Slice 14 : test « declined badge toggles Personnes ayant décliné » (skip si aucun événement avec joueurs déclinés dans l'env).
- ✅ **Permissions composition (onglet Équipe)** - Cohérence Tirage/Simuler (event-details-tabs). Avec `TEST_PARTICIPANT_EMAIL` et `TEST_PARTICIPANT_PASSWORD` dans `.env`, les tests `composition-permissions.spec.js` vérifient : (1) participant non-admin : pas de Tirage/Simuler, slots vides non éditables, clic slot autre n'ouvre pas la modale, clic sur son slot l'ouvre si dans la composition ; (2) utilisateur anonyme : pas de boutons d'action (Tirage, Simuler), slots vides non cliquables, clic sur slots remplis n'ouvre pas la modale de confirmation.

## 🔧 Configuration

### **Configuration de l'URL de base :**

La configuration de l'URL de base suit cette hiérarchie :
1. **Variable d'environnement** `BASE_URL` (priorité maximale)
2. **Configuration locale** `playwright.config.local.js` (si elle existe)
3. **Valeur par défaut** `http://localhost:5173`

### **Configuration locale (recommandée) :**

Pour une configuration personnelle (IP différente, etc.) :

```bash
# Copier le fichier d'exemple
cp playwright.config.local.example.js playwright.config.local.js

# Éditer avec ta configuration
# Exemple :
# baseURL: 'https://votre-ip-locale:5173'
```

Le fichier `playwright.config.local.js` est automatiquement ignoré par Git.

### **Variables d'environnement :**
- `BASE_URL` : URL de base pour les tests
- `NODE_ENV=test` : Active le mode test
- `TEST_EMAILS=true` : Active l'intercepteur d'emails
- `PLAYWRIGHT_HEADLESS=false` : Affiche les tests en cours

### **Scripts npm disponibles :**
```bash
npm run test                 # Utilise la configuration locale ou localhost
npm run test:local           # Même que test (pour compatibilité)
npm run test:ci              # Force localhost pour CI/CD
```

### **Navigateurs testés :**
Chrome, Firefox, Safari (Desktop + Mobile)

### **Mécanisme de chargement de la configuration :**

```javascript
// Dans playwright.config.js
const BASE_URL = process.env.BASE_URL || LOCAL_CONFIG.baseURL || 'http://localhost:5173';
```

**Ordre de priorité :**
1. `process.env.BASE_URL` (variable d'environnement)
2. `LOCAL_CONFIG.baseURL` (fichier local si il existe)
3. `'http://localhost:5173'` (valeur par défaut)

**Exemple de configuration locale :**
```javascript
// playwright.config.local.js
const LOCAL_CONFIG = {
  baseURL: 'https://votre-ip-locale:5173', // Votre IP locale
};
```

## 📁 Fichiers de test

```
tests/
├── auth.spec.js             # Tests d'authentification
├── basic.spec.js            # Tests de base
├── composition-permissions.spec.js # Permissions composition (participant non-admin) – squelettes à activer avec fixture
├── event-details-tabs.spec.js # Onglets détail événement (Infos, Dispos, Équipe) et URL
├── pwa.spec.js              # Tests PWA
├── summary.spec.js          # Test de vérification complète
├── email-interceptor.js     # Intercepteur d'emails
└── run-tests.js             # Script de lancement
```

## 🏷️ Attributs data-testid

Tests basés sur des attributs dédiés dans les composants Vue :

```html
<!-- Exemples utilisés -->
<div data-testid="app-header">...</div>
<button data-testid="login-btn">...</button>
<input data-testid="email-input" />
<button data-testid="submit-btn">...</button>
<div data-testid="success-message">...</div>
<div data-testid="error-message">...</div>
```

## 📊 Résultats et rapports

- **`test-output/playwright-report/`** - Rapports HTML détaillés
- **`test-output/test-results/`** - Screenshots et vidéos
- **`test-output/emails/`** - Emails interceptés

## 🧹 Nettoyage automatique

### **Mécanisme natif Playwright :**
- **Setup global** : Crée automatiquement les dossiers de sortie
- **Teardown global** : Nettoyage intelligent selon les résultats
- **Rapports HTML** : Toujours conservés pour inspection
- **Artefacts de diagnostic** : Conservés en cas d'échec de tests

### **Modes de nettoyage :**
```bash
# Tests normaux (fichiers conservés)
npm run test

# Tests avec nettoyage automatique
npm run test:cleanup-auto

# Nettoyage manuel complet
npm run test:cleanup-files
```

### **Comportement du nettoyage automatique :**

**Si tous les tests réussissent :**
- ✅ Screenshots/vidéos supprimés
- ✅ Emails supprimés
- ✅ Rapports HTML conservés

**Si des tests échouent :**
- ⚠️ Screenshots/vidéos conservés (pour diagnostic)
- ⚠️ Emails conservés (pour diagnostic)
- ✅ Rapports HTML conservés

### **Avant commit :**
```bash
# Option 1 : Tests avec nettoyage intelligent
npm run test:cleanup-auto

# Option 2 : Tests normaux puis nettoyage manuel
npm run test
npm run test:cleanup-files
```

## 🚨 Dépannage

### **Tests qui échouent :**
1. Vérifier que `npm run dev -- --host` est lancé
2. Consulter les screenshots dans `test-output/test-results/`
3. Vérifier les attributs `data-testid` dans les composants

### **Emails non interceptés :**
1. Vérifier les variables `NODE_ENV=test` et `TEST_EMAILS=true`
2. Consulter `test-output/emails/` pour les fichiers générés

### **Nettoyage :**
```bash
npm run test:cleanup-files  # Supprime test-output/
```

## 🔄 Intégration CI/CD

```yaml
# GitHub Actions
- name: Tests automatisés
  run: npm run test
  env:
    NODE_ENV: test
    TEST_EMAILS: true
```

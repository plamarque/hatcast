# 🧪 Tests Automatisés HatCast

Tests automatisés complets pour HatCast incluant tests UI avec Playwright et intercepteur d'emails local.

## 📁 Structure organisée

```
hatcast/
├── tests/                    # Code source des tests
│   ├── *.spec.js            # Tests Playwright
│   ├── email-interceptor.js # Intercepteur d'emails
│   ├── run-tests.js         # Script de lancement
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
npm run test                 # Tous les tests (configuration locale ou localhost)
npm run test:local           # Même que test (pour compatibilité)
npm run test:ci              # Force localhost pour CI/CD
npm run test:ui             # Interface UI
npm run test:headed         # Mode visible
npm run test:full           # Tests complets avec emails
```

### **Gestion des fichiers :**
```bash
npm run test:cleanup-files  # Nettoyer fichiers générés (script manuel)
npm run test:cleanup-auto   # Tests avec nettoyage automatique
./tests/cleanup-tests.sh    # Script de nettoyage manuel
npm run test:show-emails    # Afficher emails interceptés
```

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
# baseURL: 'https://192.168.1.134:5173'
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
  baseURL: 'https://192.168.1.134:5173', // Ton IP personnelle
};
```

## 📁 Fichiers de test

```
tests/
├── auth.spec.js             # Tests d'authentification
├── basic.spec.js            # Tests de base
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

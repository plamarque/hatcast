# Scripts HatCast

Ce dossier contient les scripts utiles pour les migrations, le déploiement, la PWA et le débogage.

## Scripts disponibles

### 🔄 Migration de base de données
- **`restore-development-db.sh`** : Restaure la base de données development à son état original
- **`verify-db-import.sh`** : Vérifie que l'import des données s'est bien passé
- **`DATABASE_MIGRATION.md`** : Documentation complète de la migration

### 🧪 Tests et développement
- **`test-dev-server.sh`** : Lance le serveur de développement et vérifie qu'il fonctionne

### 📦 Gestion des versions
- **`release-version.sh`** : Script principal pour créer de nouvelles versions
- **`generate-changelog.js`** : Génère le changelog automatiquement

### 📱 PWA et déploiement
- **`deploy-pwa.sh`** : Préparation et vérification du déploiement PWA (build optionnel, vérification des assets). Usage : `./scripts/deploy-pwa.sh` depuis la racine.
- **`check-pwa.sh`** : Vérification de la PWA en production (HTTPS, manifest, service worker). Usage : `./scripts/check-pwa.sh` depuis la racine.
- **`deploy-simple.sh`** : Script de déploiement simplifié.

### 🖼️ Icônes
- **`generate-icons.sh`** : Génère les icônes PWA à partir d’une source.
- **`cleanup-icons.sh`** : Nettoyage des icônes générées.

### 🔍 Debug (scripts de test manuels)
Le sous-dossier **`debug/`** contient des scripts de diagnostic exécutables à la main (hors suite Playwright dans `tests/`) :
- **`run-all-tests.js`** : Lance une série de scripts de debug (CORS, email, auth, etc.). Usage : `node scripts/debug/run-all-tests.js` depuis la racine.
- **`test-cors-config.js`**, **`test-email-system.js`**, **`test-general-config.js`**, **`test-production-token.js`**, **`test-firebase-imports.js`**, **`test-cloud-functions.js`**, **`test-authentication.js`**, **`test-push-notifications.js`**, **`test-push-local.js`**, **`test-audit-logs.js`**, **`test-ethereal.js`** : Tests ciblés (Firebase, email, push, config).
- **`monitor-password-reset-errors.js`**, **`reproduce-password-reset-issue.js`** : Diagnostic password reset.

## Utilisation rapide

### Reproduire la situation de production en local
```bash
# 1. Les données de production sont déjà importées dans development
# 2. Lancer l'app
./scripts/test-dev-server.sh

# 3. Ouvrir https://localhost:5173
# 4. Vérifier que les données de production sont présentes
```

### Restaurer l'état original
```bash
./scripts/restore-development-db.sh
```

### Vérifier l'état des bases de données
```bash
./scripts/verify-db-import.sh
```

## Structure des bases de données

- **`(default)`** : Production (données réelles)
- **`staging`** : Staging (données de test)
- **`development`** : Development (actuellement = données de production)

## Backups disponibles

Tous les backups sont stockés dans `gs://impro-selector-backups/` :
- `development_backup_*` : Backups de la base development
- `production_*` : Exports de la base production

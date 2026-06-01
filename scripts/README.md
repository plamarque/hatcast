# Scripts HatCast

Ce dossier contient les scripts utiles pour les migrations, le déploiement, la PWA et le débogage.

## Scripts disponibles

### 🔄 Migration de base de données
- **`migrate-from-v1.sh`** : **Point d'entrée unique** V1 Firestore prod → V2 Neon staging (orchestrateur MIG-5/6). Usage : `./scripts/migrate-from-v1.sh` depuis la racine. Voir `docs/v2/migration/preprod-reset-and-migrate.md`.
- **`v1-export-troupe-members-csv.js`** : Exporte les membres d'une saison V1 (Firestore) vers le CSV d'import troupe V2. Voir `docs/v2/migration/v1-troupe-members-csv-recipe.md`.
- **`restore-development-db.sh`** : Restaure la base de données development à son état original
- **`verify-db-import.sh`** : Vérifie que l'import des données s'est bien passé
- **`DATABASE_MIGRATION.md`** : Documentation complète de la migration

### 🧪 Tests et développement
- **`start-dev.sh`** : Démarre la stack **V2** en local (API Spring sur 8080 + Angular sur 4200, `ng serve --host`). **`tailscale up`** si le VPN est coupé, puis **Tailscale Serve** vers `:4200` si absent (accès mobile MagicDNS). **`--no-tailscale`** ou **`HATCAST_SKIP_TAILSCALE_SERVE=1`** pour ignorer. Si **`HATCAST_NOTIFICATION_EMAIL_ENABLED=true`** dans `.env` : démarre **Mailpit** (Docker, SMTP `:1025`, UI `:8025`), force le SMTP local pour l’API, arrête Mailpit à la fin. **`--with-push`** (alias `--push-test`, env `HATCAST_START_DEV_WITH_PUSH=1`) : front **`ng serve --configuration=production`** pour activer le service worker (recette push story 8.3) — cumulable avec Mailpit ; requiert `HATCAST_WEB_PUSH_VAPID_*` dans `.env`. Option **`./scripts/start-dev.sh --legacy`** pour l’ancien flux (seul le client V1 / Vite). Charge **`.env`** à la racine via **`load-dotenv.sh`** (toutes les variables reconnues).
- **`run-tests.sh`** : Lance les tests **V2** (`./gradlew test` dans `services/api`, puis `ng test` dans `apps/web`). Charge aussi **`.env`** comme `start-dev.sh`.
- **`load-dotenv.sh`** : Bibliothèque sourcée par les scripts ci-dessus (format `KEY=value`, `#`, `export` optionnel).
- **`test-dev-server.sh`** : Lance le serveur de développement V1 et vérifie qu’il démarre (port 5173 ; utile surtout pour le scénario décrit ci-dessous avec la V1).

### 📦 Gestion des versions
- **`release-version.sh`** : Release **V1** (Firebase) depuis la branche `staging` → `main`
- **`generate-changelog.js`** : Génère le changelog automatiquement (V1)

### ☁️ Déploiement V2 (Cloud Run)
- **`v2/branches.env`** : Noms de branches Git V2 (`v2`, `staging-v2`, `production-v2`) — voir `v2/branches.env.example`
- **`v2/lib/git-branches.sh`** : Helpers Git partagés (fetch, arbre propre, branche courante)
- **`v2/promote-to-staging.sh`** : Merge `origin/v2` → `staging-v2` + push (CI staging)
- **`v2/release-production.sh`** : Release prod V2 depuis `staging-v2` (version, changelog, tag, merge → `production-v2`)
- **`lib/version-changelog.sh`** : Fonctions semver / CHANGELOG (usage opt-in V2)

Documentation : [docs/v2/technical/DEPLOYMENT_WORKFLOW.md](../docs/v2/technical/DEPLOYMENT_WORKFLOW.md)

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

### Développement V2 (API + Angular)
```bash
./scripts/start-dev.sh
# Puis ouvrir https://localhost:4200 (API : http://127.0.0.1:8080)

# Push + email (story 8.3) : VAPID_* + HATCAST_NOTIFICATION_EMAIL_ENABLED=true dans .env
./scripts/start-dev.sh --with-push
```

### Reproduire la situation de production en local (V1 / legacy)
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

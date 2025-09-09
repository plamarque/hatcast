# Scripts de gestion de la base de données

Ce dossier contient les scripts utiles pour gérer les migrations et les opérations sur les bases de données Firebase.

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

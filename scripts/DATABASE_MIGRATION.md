# Migration de la base de données Development

## Résumé
Les données de production (base `(default)`) ont été importées dans la base de données `development` pour reproduire une situation de production en local.

## Opérations effectuées

### 1. Backup de l'état initial
- **Backup development original** : `gs://impro-selector-backups/development_backup_20250909_230337/`
- **Backup production** : `gs://impro-selector-backups/production_20250909_230200/`

### 2. Import des données
- Les données de la base `(default)` (production) ont été importées dans la base `development`
- L'opération a été effectuée le 2025-09-09 à 21:04 UTC

### 3. Scripts créés
- `scripts/restore-development-db.sh` : Script pour restaurer l'état original de development
- `scripts/verify-db-import.sh` : Script pour vérifier l'import (limité)
- `scripts/test-dev-server.sh` : Script pour tester le serveur de développement

## Comment utiliser

### Vérifier l'import
1. Lancer l'application : `./scripts/test-dev-server.sh` ou `npm run dev -- --host`
2. Ouvrir https://localhost:5173 (ou le port affiché)
3. Vérifier que les données de production sont présentes

### Restaurer l'état original
```bash
./scripts/restore-development-db.sh
```

### Vérifier les backups disponibles
```bash
gsutil ls gs://impro-selector-backups/
```

## Structure des bases de données

### Avant la migration
- **Production** : `(default)` - Données de production
- **Staging** : `staging` - Données de staging  
- **Development** : `development` - Données de développement

### Après la migration
- **Production** : `(default)` - Données de production (inchangées)
- **Staging** : `staging` - Données de staging (inchangées)
- **Development** : `development` - **Données de production** (copiées)

## Notes importantes
- Les backups sont stockés dans `gs://impro-selector-backups/`
- La base development contient maintenant les données de production
- Pour revenir à l'état original, utiliser le script de restauration
- Les données de production restent intactes dans la base `(default)`

## Nettoyage (optionnel)
Une fois les tests terminés, tu peux nettoyer les backups :
```bash
# Supprimer les backups (ATTENTION: irréversible)
gsutil rm -r gs://impro-selector-backups/development_backup_*
gsutil rm -r gs://impro-selector-backups/production_*
```

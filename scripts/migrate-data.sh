#!/bin/bash

# Script de migration des données HatCast V1.0
# Ce script migre les données de l'ancienne version vers la nouvelle architecture

set -e

# Variables
PROJECT_ID=${GCP_PROJECT_ID:-"hatcast-prod"}
SOURCE_DB=${SOURCE_DB:-"hatcast-old"}
TARGET_DB=${TARGET_DB:-"hatcast-v1"}

echo "🔄 Migration des données HatCast V1.0"

# 1. Sauvegarde des données existantes
echo "💾 Sauvegarde des données existantes..."

# Export des données Firestore
echo "📤 Export des données Firestore..."
gcloud firestore export gs://$PROJECT_ID-backup/firestore-export-$(date +%Y%m%d-%H%M%S) \
  --project=$PROJECT_ID

# 2. Migration des utilisateurs
echo "👥 Migration des utilisateurs..."

# Script de migration des utilisateurs
node scripts/migrate-users.js --source=$SOURCE_DB --target=$TARGET_DB

# 3. Migration des saisons
echo "📅 Migration des saisons..."

# Script de migration des saisons
node scripts/migrate-seasons.js --source=$SOURCE_DB --target=$TARGET_DB

# 4. Migration des spectacles
echo "🎭 Migration des spectacles..."

# Script de migration des spectacles
node scripts/migrate-shows.js --source=$SOURCE_DB --target=$TARGET_DB

# 5. Migration des castings
echo "🎪 Migration des castings..."

# Script de migration des castings
node scripts/migrate-castings.js --source=$SOURCE_DB --target=$TARGET_DB

# 6. Migration des disponibilités
echo "✅ Migration des disponibilités..."

# Script de migration des disponibilités
node scripts/migrate-availabilities.js --source=$SOURCE_DB --target=$TARGET_DB

# 7. Migration des notifications
echo "📧 Migration des notifications..."

# Script de migration des notifications
node scripts/migrate-notifications.js --source=$SOURCE_DB --target=$TARGET_DB

# 8. Validation de la migration
echo "🔍 Validation de la migration..."

# Vérification des comptes
echo "📊 Vérification des comptes..."
node scripts/validate-migration.js --target=$TARGET_DB

# 9. Tests de cohérence
echo "🧪 Tests de cohérence..."

# Test des relations entre entités
node scripts/test-data-integrity.js --target=$TARGET_DB

# 10. Rapport de migration
echo "📋 Génération du rapport de migration..."

# Génération du rapport
node scripts/generate-migration-report.js \
  --source=$SOURCE_DB \
  --target=$TARGET_DB \
  --output=migration-report-$(date +%Y%m%d-%H%M%S).json

echo "✅ Migration des données terminée avec succès !"
echo "📊 Résumé de la migration:"
echo "  - Source: $SOURCE_DB"
echo "  - Cible: $TARGET_DB"
echo "  - Rapport: migration-report-$(date +%Y%m%d-%H%M%S).json"
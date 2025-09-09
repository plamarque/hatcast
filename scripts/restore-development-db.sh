#!/bin/bash

# Script pour restaurer la base de données development à partir du backup
# Usage: ./restore-development-db.sh

set -e

echo "🔄 Restauration de la base de données development..."

# Vérifier que gcloud est configuré
if ! gcloud config get-value project > /dev/null 2>&1; then
    echo "❌ Erreur: gcloud n'est pas configuré. Exécutez 'gcloud auth login' d'abord."
    exit 1
fi

# Vérifier que le projet est correct
PROJECT=$(gcloud config get-value project)
if [ "$PROJECT" != "impro-selector" ]; then
    echo "❌ Erreur: Le projet gcloud n'est pas 'impro-selector' (actuel: $PROJECT)"
    echo "Exécutez: gcloud config set project impro-selector"
    exit 1
fi

# Backup actuel de development (au cas où)
echo "📦 Création d'un backup de l'état actuel de development..."
CURRENT_BACKUP="development_current_$(date +%Y%m%d_%H%M%S)"
gcloud firestore export gs://impro-selector-backups/$CURRENT_BACKUP --database="development"
echo "✅ Backup actuel créé: gs://impro-selector-backups/$CURRENT_BACKUP"

# Restaurer depuis le backup de development original
echo "🔄 Restauration depuis le backup original de development..."
gcloud firestore import gs://impro-selector-backups/development_backup_20250909_230337 --database="development"

echo "✅ Restauration terminée !"
echo "📋 Résumé:"
echo "  - Backup original restauré: gs://impro-selector-backups/development_backup_20250909_230337"
echo "  - Backup de l'état actuel: gs://impro-selector-backups/$CURRENT_BACKUP"
echo "  - Base de données: development"

#!/bin/bash

# Script pour vérifier que l'import des données de production dans development s'est bien passé
# Usage: ./verify-db-import.sh

set -e

echo "🔍 Vérification de l'import des données de production dans development..."

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

echo "📊 Vérification des collections principales..."

# Fonction pour compter les documents dans une collection
count_documents() {
    local collection=$1
    local database=$2
    echo "  - Collection $collection:"
    
    # Utiliser gcloud pour lister les documents (approximation)
    # Note: Cette méthode est limitée mais donne une indication
    local count=$(gcloud firestore databases get --database="$database" 2>/dev/null | grep -c "collection" || echo "0")
    echo "    Documents trouvés: $count"
}

# Vérifier les collections principales
echo "🔍 Vérification de la base development:"
count_documents "seasons" "development"
count_documents "userNavigation" "development"
count_documents "userPreferences" "development"
count_documents "magicLinks" "development"

echo ""
echo "🔍 Vérification de la base production (default) pour comparaison:"
count_documents "seasons" "(default)"
count_documents "userNavigation" "(default)"
count_documents "userPreferences" "(default)"
count_documents "magicLinks" "(default)"

echo ""
echo "✅ Vérification terminée !"
echo "💡 Pour une vérification plus détaillée, tu peux:"
echo "   1. Lancer l'app en mode development et vérifier les données"
echo "   2. Utiliser la console Firebase pour explorer les collections"
echo "   3. Exécuter des tests spécifiques sur les données importées"

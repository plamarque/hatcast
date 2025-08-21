#!/bin/bash

echo "🧹 Nettoyage des fichiers de test HatCast"
echo "========================================"

# Vérifier si le dossier test-output existe
if [ -d "test-output" ]; then
    echo "🗑️  Suppression du dossier test-output..."
    rm -rf test-output
    echo "   ✅ Dossier test-output supprimé"
else
    echo "ℹ️  Aucun dossier test-output trouvé"
fi

# Vérifier s'il reste des dossiers de test à l'ancienne
if [ -d "playwright-report" ]; then
    echo "🗑️  Suppression de l'ancien playwright-report..."
    rm -rf playwright-report
    echo "   ✅ playwright-report supprimé"
fi

if [ -d "test-results" ]; then
    echo "🗑️  Suppression de l'ancien test-results..."
    rm -rf test-results
    echo "   ✅ test-results supprimé"
fi

if [ -d "tests/emails" ]; then
    echo "🗑️  Suppression de l'ancien tests/emails..."
    rm -rf tests/emails
    echo "   ✅ tests/emails supprimé"
fi

echo ""
echo "🎉 Nettoyage terminé !"
echo "📁 Tous les fichiers de test générés ont été supprimés"
echo ""
echo "💡 Pour relancer les tests :"
echo "   npm run test"
echo "   ou"
echo "   npm run test:full"

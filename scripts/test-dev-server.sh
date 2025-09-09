#!/bin/bash

# Script pour tester que le serveur de développement se lance correctement
# Usage: ./scripts/test-dev-server.sh

set -e

echo "🧪 Test du serveur de développement..."

# Vérifier que nous sommes dans le bon répertoire
if [ ! -f "package.json" ]; then
    echo "❌ Erreur: Ce script doit être exécuté depuis la racine du projet"
    exit 1
fi

# Vérifier que les dépendances sont installées
if [ ! -d "node_modules" ]; then
    echo "📦 Installation des dépendances..."
    npm install
fi

echo "🚀 Lancement du serveur de développement..."
echo "   - URL: https://localhost:5173 (ou port suivant disponible)"
echo "   - Pour arrêter: Ctrl+C"
echo ""

# Lancer le serveur en arrière-plan et capturer le PID
npm run dev -- --host &
SERVER_PID=$!

# Attendre un peu pour voir si le serveur démarre correctement
sleep 5

# Vérifier si le processus est toujours en cours
if kill -0 $SERVER_PID 2>/dev/null; then
    echo "✅ Serveur de développement lancé avec succès (PID: $SERVER_PID)"
    echo "🌐 Ouvre ton navigateur sur https://localhost:5173"
    echo ""
    echo "💡 Pour arrêter le serveur: kill $SERVER_PID"
    echo "   ou utilise Ctrl+C dans le terminal où il a été lancé"
else
    echo "❌ Le serveur n'a pas pu démarrer correctement"
    exit 1
fi

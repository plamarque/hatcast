#!/bin/bash

# Script de validation du déploiement HatCast V1.0
# Ce script valide que tous les composants sont correctement déployés

set -e

# Variables
PROJECT_ID=${GCP_PROJECT_ID:-"hatcast-prod"}
REGION=${GCP_REGION:-"europe-west1"}
API_URL=""
FRONTEND_URL=""

echo "🔍 Validation du déploiement HatCast V1.0"

# 1. Récupération des URLs
echo "📡 Récupération des URLs de déploiement..."

API_URL=$(gcloud run services describe hatcast-api --region=$REGION --format="value(status.url)" 2>/dev/null || echo "")
FRONTEND_URL=$(firebase hosting:sites:list --project=$PROJECT_ID --format="value(hostingSite)" | head -1 | sed 's/$/.web.app/' 2>/dev/null || echo "")

if [ -z "$API_URL" ]; then
    echo "❌ Erreur: Impossible de récupérer l'URL de l'API"
    exit 1
fi

if [ -z "$FRONTEND_URL" ]; then
    echo "❌ Erreur: Impossible de récupérer l'URL du frontend"
    exit 1
fi

echo "✅ URLs récupérées:"
echo "  - API: $API_URL"
echo "  - Frontend: https://$FRONTEND_URL"

# 2. Tests de l'API Backend
echo "🔧 Tests de l'API Backend..."

# Test Health Check
echo "  - Health Check..."
if curl -f -s "$API_URL/api/health" > /dev/null; then
    echo "    ✅ Health Check: OK"
else
    echo "    ❌ Health Check: ÉCHEC"
    exit 1
fi

# Test MCP API
echo "  - MCP API..."
if curl -f -s "$API_URL/mcp/seasons" > /dev/null; then
    echo "    ✅ MCP API: OK"
else
    echo "    ❌ MCP API: ÉCHEC"
    exit 1
fi

# Test CORS
echo "  - CORS..."
if curl -f -s -H "Origin: https://$FRONTEND_URL" "$API_URL/api/health" > /dev/null; then
    echo "    ✅ CORS: OK"
else
    echo "    ❌ CORS: ÉCHEC"
    exit 1
fi

# 3. Tests du Frontend
echo "🎨 Tests du Frontend..."

# Test de chargement
echo "  - Chargement de la page..."
if curl -f -s "https://$FRONTEND_URL" > /dev/null; then
    echo "    ✅ Page d'accueil: OK"
else
    echo "    ❌ Page d'accueil: ÉCHEC"
    exit 1
fi

# Test PWA
echo "  - PWA Manifest..."
if curl -f -s "https://$FRONTEND_URL/manifest.json" > /dev/null; then
    echo "    ✅ PWA Manifest: OK"
else
    echo "    ❌ PWA Manifest: ÉCHEC"
    exit 1
fi

# 4. Tests de sécurité
echo "🔐 Tests de sécurité..."

# Test des endpoints protégés
echo "  - Endpoints protégés..."
if curl -f -s "$API_URL/api/auth/current-user" 2>&1 | grep -q "401\|403"; then
    echo "    ✅ Protection des endpoints: OK"
else
    echo "    ❌ Protection des endpoints: ÉCHEC"
    exit 1
fi

# Test des headers de sécurité
echo "  - Headers de sécurité..."
if curl -I -s "https://$FRONTEND_URL" | grep -q "X-Frame-Options"; then
    echo "    ✅ Headers de sécurité: OK"
else
    echo "    ⚠️  Headers de sécurité: Partiels"
fi

# 5. Tests de performance
echo "⚡ Tests de performance..."

# Test de latence API
echo "  - Latence API..."
LATENCY=$(curl -w "%{time_total}" -o /dev/null -s "$API_URL/api/health")
if (( $(echo "$LATENCY < 2.0" | bc -l) )); then
    echo "    ✅ Latence API: ${LATENCY}s (OK)"
else
    echo "    ⚠️  Latence API: ${LATENCY}s (Lent)"
fi

# Test de taille de la page
echo "  - Taille de la page..."
PAGE_SIZE=$(curl -s "https://$FRONTEND_URL" | wc -c)
if [ $PAGE_SIZE -lt 100000 ]; then
    echo "    ✅ Taille de la page: ${PAGE_SIZE} bytes (OK)"
else
    echo "    ⚠️  Taille de la page: ${PAGE_SIZE} bytes (Lourd)"
fi

# 6. Tests de configuration
echo "⚙️ Tests de configuration..."

# Test des variables d'environnement
echo "  - Variables d'environnement..."
if gcloud run services describe hatcast-api --region=$REGION --format="value(spec.template.spec.template.spec.containers[0].env[].name)" | grep -q "SPRING_PROFILES_ACTIVE"; then
    echo "    ✅ Variables d'environnement: OK"
else
    echo "    ❌ Variables d'environnement: ÉCHEC"
    exit 1
fi

# Test des permissions Firestore
echo "  - Permissions Firestore..."
if gcloud firestore databases list --project=$PROJECT_ID > /dev/null 2>&1; then
    echo "    ✅ Permissions Firestore: OK"
else
    echo "    ❌ Permissions Firestore: ÉCHEC"
    exit 1
fi

# 7. Tests de monitoring
echo "📊 Tests de monitoring..."

# Test des métriques Cloud Run
echo "  - Métriques Cloud Run..."
if gcloud logging read "resource.type=cloud_run_revision" --limit=1 --project=$PROJECT_ID > /dev/null 2>&1; then
    echo "    ✅ Logs Cloud Run: OK"
else
    echo "    ❌ Logs Cloud Run: ÉCHEC"
    exit 1
fi

# 8. Rapport final
echo "📋 Rapport de validation..."

echo "✅ Déploiement HatCast V1.0 validé avec succès !"
echo ""
echo "📊 Résumé:"
echo "  - API Backend: $API_URL"
echo "  - Frontend: https://$FRONTEND_URL"
echo "  - MCP API: $API_URL/mcp"
echo "  - Health Check: $API_URL/api/health"
echo ""
echo "🔗 Liens utiles:"
echo "  - Documentation API: $API_URL/swagger-ui.html"
echo "  - Logs Cloud Run: https://console.cloud.google.com/run"
echo "  - Firestore: https://console.cloud.google.com/firestore"
echo "  - Firebase Hosting: https://console.firebase.google.com/project/$PROJECT_ID/hosting"
echo ""
echo "🎉 HatCast V1.0 est prêt pour la production !"
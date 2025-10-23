#!/bin/bash

# Script de rollback HatCast V1.0
# Ce script permet de revenir à la version précédente en cas de problème

set -e

# Variables
PROJECT_ID=${GCP_PROJECT_ID:-"hatcast-prod"}
REGION=${GCP_REGION:-"europe-west1"}
ROLLBACK_REASON=${1:-"Problème critique détecté"}

echo "🔄 Rollback HatCast V1.0"
echo "📝 Raison: $ROLLBACK_REASON"

# 1. Confirmation du rollback
echo "⚠️  ATTENTION: Cette action va revenir à la version précédente de HatCast"
read -p "Êtes-vous sûr de vouloir continuer ? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Rollback annulé"
    exit 1
fi

# 2. Rollback du backend (Cloud Run)
echo "🔧 Rollback du backend..."

# Lister les révisions disponibles
echo "📋 Révisions disponibles:"
gcloud run revisions list --service=hatcast-api --region=$REGION --format="table(metadata.name,status.conditions[0].lastTransitionTime,spec.template.spec.containers[0].image)"

# Demander la révision cible
read -p "Entrez le nom de la révision cible (ou appuyez sur Entrée pour la plus récente): " TARGET_REVISION

if [ -z "$TARGET_REVISION" ]; then
    # Utiliser la révision la plus récente
    TARGET_REVISION=$(gcloud run revisions list --service=hatcast-api --region=$REGION --format="value(metadata.name)" | head -1)
fi

echo "🎯 Rollback vers la révision: $TARGET_REVISION"

# Effectuer le rollback
gcloud run services update-traffic hatcast-api \
  --region=$REGION \
  --to-revisions=$TARGET_REVISION=100

echo "✅ Backend rollback terminé"

# 3. Rollback du frontend (Firebase Hosting)
echo "🎨 Rollback du frontend..."

# Lister les déploiements disponibles
echo "📋 Déploiements disponibles:"
firebase hosting:releases --project=$PROJECT_ID

# Demander le déploiement cible
read -p "Entrez l'ID du déploiement cible (ou appuyez sur Entrée pour le plus récent): " TARGET_DEPLOYMENT

if [ -z "$TARGET_DEPLOYMENT" ]; then
    # Utiliser le déploiement le plus récent
    TARGET_DEPLOYMENT=$(firebase hosting:releases --project=$PROJECT_ID --format="value(id)" | head -1)
fi

echo "🎯 Rollback vers le déploiement: $TARGET_DEPLOYMENT"

# Effectuer le rollback
firebase hosting:rollback $TARGET_DEPLOYMENT --project=$PROJECT_ID

echo "✅ Frontend rollback terminé"

# 4. Vérification du rollback
echo "🔍 Vérification du rollback..."

# Attendre que les services soient stables
echo "⏳ Attente de la stabilisation des services..."
sleep 30

# Test de l'API
API_URL=$(gcloud run services describe hatcast-api --region=$REGION --format="value(status.url)")
if curl -f -s "$API_URL/api/health" > /dev/null; then
    echo "✅ API: Fonctionnelle"
else
    echo "❌ API: Problème détecté"
fi

# Test du frontend
FRONTEND_URL=$(firebase hosting:sites:list --project=$PROJECT_ID --format="value(hostingSite)" | head -1 | sed 's/$/.web.app/')
if curl -f -s "https://$FRONTEND_URL" > /dev/null; then
    echo "✅ Frontend: Fonctionnel"
else
    echo "❌ Frontend: Problème détecté"
fi

# 5. Notification du rollback
echo "📢 Notification du rollback..."

# Envoyer une notification (exemple avec webhook)
if [ ! -z "$WEBHOOK_URL" ]; then
    curl -X POST "$WEBHOOK_URL" \
      -H "Content-Type: application/json" \
      -d "{
        \"text\": \"🔄 Rollback HatCast V1.0 effectué\",
        \"attachments\": [{
          \"color\": \"warning\",
          \"fields\": [{
            \"title\": \"Raison\",
            \"value\": \"$ROLLBACK_REASON\",
            \"short\": true
          }, {
            \"title\": \"Révision Backend\",
            \"value\": \"$TARGET_REVISION\",
            \"short\": true
          }, {
            \"title\": \"Déploiement Frontend\",
            \"value\": \"$TARGET_DEPLOYMENT\",
            \"short\": true
          }]
        }]
      }"
fi

# 6. Rapport de rollback
echo "📋 Rapport de rollback..."

echo "🔄 Rollback HatCast V1.0 terminé"
echo ""
echo "📊 Résumé:"
echo "  - Raison: $ROLLBACK_REASON"
echo "  - Révision Backend: $TARGET_REVISION"
echo "  - Déploiement Frontend: $TARGET_DEPLOYMENT"
echo "  - API: $API_URL"
echo "  - Frontend: https://$FRONTEND_URL"
echo ""
echo "🔗 Liens de vérification:"
echo "  - Health Check: $API_URL/api/health"
echo "  - Frontend: https://$FRONTEND_URL"
echo "  - Logs Cloud Run: https://console.cloud.google.com/run"
echo ""
echo "⚠️  Actions recommandées:"
echo "  1. Vérifier les logs pour identifier la cause du problème"
echo "  2. Tester les fonctionnalités critiques"
echo "  3. Planifier une correction et un nouveau déploiement"
echo "  4. Informer les utilisateurs si nécessaire"
#!/bin/bash

# Script de déploiement HatCast V1.0
# Ce script déploie l'application complète selon le plan de migration

set -e

# Variables
PROJECT_ID=${GCP_PROJECT_ID:-"hatcast-prod"}
REGION=${GCP_REGION:-"europe-west1"}
ENVIRONMENT=${ENVIRONMENT:-"production"}

echo "🚀 Déploiement HatCast V1.0 - Environnement: $ENVIRONMENT"

# 1. Vérification des prérequis
echo "📋 Vérification des prérequis..."

# Vérifier que gcloud est configuré
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" | grep -q .; then
    echo "❌ Erreur: gcloud n'est pas authentifié"
    exit 1
fi

# Vérifier que le projet est configuré
if ! gcloud config get-value project | grep -q "$PROJECT_ID"; then
    echo "❌ Erreur: Projet GCP incorrect. Attendu: $PROJECT_ID"
    exit 1
fi

echo "✅ Prérequis validés"

# 2. Déploiement du backend Spring Boot
echo "🔧 Déploiement du backend Spring Boot..."

cd backend

# Build du projet
echo "📦 Build du projet Spring Boot..."
./mvnw clean package -DskipTests

# Build et push de l'image Docker
echo "🐳 Build et push de l'image Docker..."
gcloud builds submit --config cloudbuild.yaml .

# Déploiement sur Cloud Run
echo "☁️ Déploiement sur Cloud Run..."
gcloud run deploy hatcast-api \
  --image=gcr.io/$PROJECT_ID/hatcast-api:latest \
  --region=$REGION \
  --platform=managed \
  --allow-unauthenticated \
  --memory=512Mi \
  --cpu=1 \
  --max-instances=10 \
  --set-env-vars=SPRING_PROFILES_ACTIVE=$ENVIRONMENT

cd ..

# 3. Déploiement du frontend Vue.js
echo "🎨 Déploiement du frontend Vue.js..."

cd frontend-v1

# Installation des dépendances
echo "📦 Installation des dépendances..."
npm install

# Build de production
echo "🏗️ Build de production..."
npm run build

# Déploiement sur Firebase Hosting
echo "🔥 Déploiement sur Firebase Hosting..."
firebase deploy --only hosting

cd ..

# 4. Configuration des services externes
echo "⚙️ Configuration des services externes..."

# Configuration Cloud Scheduler
echo "⏰ Configuration Cloud Scheduler..."
chmod +x scripts/cloud-scheduler-setup.sh
./scripts/cloud-scheduler-setup.sh

# 5. Tests de validation
echo "🧪 Tests de validation..."

# Test de l'API
API_URL=$(gcloud run services describe hatcast-api --region=$REGION --format="value(status.url)")
echo "🔍 Test de l'API: $API_URL"

# Test de santé
if curl -f "$API_URL/api/health" > /dev/null 2>&1; then
    echo "✅ API Health Check: OK"
else
    echo "❌ API Health Check: ÉCHEC"
    exit 1
fi

# Test MCP
if curl -f "$API_URL/mcp/seasons" > /dev/null 2>&1; then
    echo "✅ MCP API: OK"
else
    echo "❌ MCP API: ÉCHEC"
    exit 1
fi

# 6. Mise à jour de la documentation
echo "📚 Mise à jour de la documentation..."

# Génération du changelog
echo "📝 Génération du changelog..."
node scripts/generate-changelog.js --version=1.0.0 --environment=$ENVIRONMENT

# 7. Notification de déploiement
echo "📢 Notification de déploiement..."

# Envoyer une notification (exemple avec webhook)
if [ ! -z "$WEBHOOK_URL" ]; then
    curl -X POST "$WEBHOOK_URL" \
      -H "Content-Type: application/json" \
      -d "{
        \"text\": \"🚀 HatCast V1.0 déployé avec succès !\",
        \"attachments\": [{
          \"color\": \"good\",
          \"fields\": [{
            \"title\": \"Environnement\",
            \"value\": \"$ENVIRONMENT\",
            \"short\": true
          }, {
            \"title\": \"API URL\",
            \"value\": \"$API_URL\",
            \"short\": true
          }]
        }]
      }"
fi

echo "🎉 Déploiement HatCast V1.0 terminé avec succès !"
echo "📊 Résumé:"
echo "  - Backend API: $API_URL"
echo "  - Frontend: https://hatcast-prod.web.app"
echo "  - MCP API: $API_URL/mcp"
echo "  - Environnement: $ENVIRONMENT"
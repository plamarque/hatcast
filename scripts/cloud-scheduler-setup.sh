#!/bin/bash

# Configuration Cloud Scheduler pour HatCast
# Ce script configure les jobs Cloud Scheduler pour les tâches automatiques

set -e

# Variables
PROJECT_ID=${GCP_PROJECT_ID:-"hatcast-prod"}
REGION=${GCP_REGION:-"europe-west1"}
SERVICE_URL=${SERVICE_URL:-"https://hatcast-api-xxx.run.app"}
SERVICE_ACCOUNT=${SERVICE_ACCOUNT:-"hatcast-scheduler@hatcast-prod.iam.gserviceaccount.com"}

echo "Setting up Cloud Scheduler for HatCast..."

# 1. Rappel quotidien (9h00)
echo "Creating daily reminder job..."
gcloud scheduler jobs create http daily-reminder \
  --project=$PROJECT_ID \
  --location=$REGION \
  --schedule="0 9 * * *" \
  --time-zone="Europe/Paris" \
  --uri="$SERVICE_URL/api/cron/daily-reminder" \
  --http-method=POST \
  --headers="Content-Type=application/json" \
  --oidc-service-account-email=$SERVICE_ACCOUNT \
  --oidc-token-audience=$SERVICE_URL \
  --description="Daily reminder for casting availability"

# 2. Tirage automatique (dimanche 20h00)
echo "Creating auto draw job..."
gcloud scheduler jobs create http auto-draw \
  --project=$PROJECT_ID \
  --location=$REGION \
  --schedule="0 20 * * 0" \
  --time-zone="Europe/Paris" \
  --uri="$SERVICE_URL/api/cron/auto-draw" \
  --http-method=POST \
  --headers="Content-Type=application/json" \
  --oidc-service-account-email=$SERVICE_ACCOUNT \
  --oidc-token-audience=$SERVICE_URL \
  --description="Automatic casting draw every Sunday"

# 3. Nettoyage mensuel (1er du mois à 2h00)
echo "Creating monthly cleanup job..."
gcloud scheduler jobs create http monthly-cleanup \
  --project=$PROJECT_ID \
  --location=$REGION \
  --schedule="0 2 1 * *" \
  --time-zone="Europe/Paris" \
  --uri="$SERVICE_URL/api/cron/monthly-cleanup" \
  --http-method=POST \
  --headers="Content-Type=application/json" \
  --oidc-service-account-email=$SERVICE_ACCOUNT \
  --oidc-token-audience=$SERVICE_URL \
  --description="Monthly data cleanup"

echo "Cloud Scheduler jobs created successfully!"

# Lister les jobs créés
echo "Listing created jobs..."
gcloud scheduler jobs list --project=$PROJECT_ID --location=$REGION

echo "Setup complete!"
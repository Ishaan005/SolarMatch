#!/bin/bash

# Fix Secret Manager Permissions for Cloud Run
# This grants the Cloud Run service account access to secrets

set -e

PROJECT_ID="bgn-ie-hack25dub-704"
PROJECT_NUMBER="544749824273"
SERVICE_ACCOUNT="${PROJECT_NUMBER}-compute@developer.gserviceaccount.com"

echo "🔐 Granting Secret Manager permissions to Cloud Run service account"
echo ""
echo "Project: $PROJECT_ID"
echo "Service Account: $SERVICE_ACCOUNT"
echo ""

# Grant Secret Manager Secret Accessor role for google-solar-api-key
echo "Granting access to google-solar-api-key..."
gcloud secrets add-iam-policy-binding google-solar-api-key \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/secretmanager.secretAccessor" \
    --project="${PROJECT_ID}"

echo "✓ google-solar-api-key access granted"
echo ""

# Grant Secret Manager Secret Accessor role for database-url
echo "Granting access to database-url..."
gcloud secrets add-iam-policy-binding database-url \
    --member="serviceAccount:${SERVICE_ACCOUNT}" \
    --role="roles/secretmanager.secretAccessor" \
    --project="${PROJECT_ID}"

echo "✓ database-url access granted"
echo ""

echo "✅ All secret permissions configured!"
echo ""
echo "Now you can deploy again:"
echo "  export GCP_PROJECT_ID=\"bgn-ie-hack25dub-704\""
echo "  export GCP_REGION=\"europe-west1\""
echo "  ./deploy.sh"

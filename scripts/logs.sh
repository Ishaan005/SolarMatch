#!/bin/bash

# View logs from Cloud Run services
# Usage: ./logs.sh [backend|frontend] [lines]

SERVICE=${1:-backend}
LINES=${2:-50}
REGION=${GCP_REGION:-europe-west1}

case $SERVICE in
    backend|back|b)
        SERVICE_NAME="solarmatch-backend"
        ;;
    frontend|front|f)
        SERVICE_NAME="solarmatch-frontend"
        ;;
    *)
        echo "Usage: $0 [backend|frontend] [lines]"
        exit 1
        ;;
esac

echo "📋 Fetching logs for $SERVICE_NAME (last $LINES lines)..."
echo ""

gcloud run services logs read $SERVICE_NAME \
    --region=$REGION \
    --limit=$LINES \
    --format="table(timestamp,severity,textPayload)"

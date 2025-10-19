#!/bin/bash

# SolarMatch GCP Deployment Script
# This script deploys the application to Google Cloud Platform

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}SolarMatch GCP Deployment${NC}\n"

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ Error: gcloud CLI is not installed${NC}"
    echo "Please install it from: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# Get current project or use environment variable
CURRENT_PROJECT=$(gcloud config get-value project 2>/dev/null)
PROJECT_ID="${GCP_PROJECT_ID:-$CURRENT_PROJECT}"

# If still no project, prompt user
if [ -z "$PROJECT_ID" ]; then
    echo -e "${YELLOW}No GCP project configured.${NC}"
    read -p "Enter your GCP Project ID: " PROJECT_ID
    if [ -z "$PROJECT_ID" ]; then
        echo -e "${RED}❌ Error: Project ID is required${NC}"
        exit 1
    fi
fi

# Configuration variables
REGION="${GCP_REGION:-europe-west1}"
BACKEND_SERVICE="solarmatch-backend"
FRONTEND_SERVICE="solarmatch-frontend"

echo -e "${YELLOW}Configuration:${NC}"
echo "  Project ID: $PROJECT_ID"
echo "  Region: $REGION"
echo ""

# Prompt for confirmation
read -p "Deploy to production? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi

# Set the project
echo -e "\n${YELLOW}Setting GCP project...${NC}"
gcloud config set project $PROJECT_ID

# Enable required APIs
echo -e "\n${YELLOW}Enabling required GCP APIs...${NC}"
gcloud services enable \
    run.googleapis.com \
    cloudbuild.googleapis.com \
    artifactregistry.googleapis.com \
    sqladmin.googleapis.com \
    secretmanager.googleapis.com

# Create Artifact Registry repository if it doesn't exist
echo -e "\n${YELLOW}Setting up Artifact Registry...${NC}"
if ! gcloud artifacts repositories describe solarmatch --location=$REGION &> /dev/null; then
    gcloud artifacts repositories create solarmatch \
        --repository-format=docker \
        --location=$REGION \
        --description="SolarMatch container images"
    echo -e "${GREEN}✓ Artifact Registry repository created${NC}"
else
    echo -e "${GREEN}✓ Artifact Registry repository already exists${NC}"
fi

# Configure Docker authentication
gcloud auth configure-docker ${REGION}-docker.pkg.dev

# Build and push backend
echo -e "\n${YELLOW}Building and pushing backend image...${NC}"
cd backend
BACKEND_IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/solarmatch/${BACKEND_SERVICE}:latest"
gcloud builds submit --tag $BACKEND_IMAGE
cd ..

# Deploy backend to Cloud Run FIRST (so we know its URL)
# We'll deploy it twice: once to get the URL, then again with proper CORS
echo -e "\n${YELLOW}Deploying backend to Cloud Run (initial)...${NC}"

# Check if GEMINI_API_KEY secret exists (optional for chatbot)
GEMINI_SECRET_EXISTS=$(gcloud secrets describe gemini-api-key --project=$PROJECT_ID 2>/dev/null && echo "true" || echo "false")

if [ "$GEMINI_SECRET_EXISTS" = "true" ]; then
    echo -e "${GREEN}✓ GEMINI_API_KEY secret found - chatbot will be enabled${NC}"
    SECRETS_ARG="GOOGLE_SOLAR_API_KEY=google-solar-api-key:latest,DATABASE_URL=database-url:latest,GEMINI_API_KEY=gemini-api-key:latest"
else
    echo -e "${YELLOW}⚠ GEMINI_API_KEY secret not found - chatbot will be disabled${NC}"
    echo -e "${YELLOW}  To enable chatbot, add gemini-api-key to Secret Manager${NC}"
    SECRETS_ARG="GOOGLE_SOLAR_API_KEY=google-solar-api-key:latest,DATABASE_URL=database-url:latest"
fi

gcloud run deploy $BACKEND_SERVICE \
    --image $BACKEND_IMAGE \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --memory 2Gi \
    --cpu 2 \
    --min-instances 0 \
    --max-instances 10 \
    --timeout 300 \
    --port 8000 \
    --set-env-vars "DEBUG=False,ALLOWED_ORIGINS=http://localhost:3000" \
    --set-secrets "$SECRETS_ARG"

# Get backend URL
BACKEND_URL=$(gcloud run services describe $BACKEND_SERVICE --region $REGION --format 'value(status.url)')
echo -e "${GREEN}✓ Backend deployed at: $BACKEND_URL${NC}"

# NOW build and push frontend with the correct backend URL
echo -e "\n${YELLOW}Building and pushing frontend image...${NC}"
FRONTEND_IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/solarmatch/${FRONTEND_SERVICE}:latest"

# Get the Google Maps API key from Secret Manager
echo -e "${YELLOW}Retrieving Google Maps API key from Secret Manager...${NC}"
GOOGLE_MAPS_API_KEY=$(gcloud secrets versions access latest --secret="google-maps-api-key" --project=$PROJECT_ID)

# Build with the API key and backend URL as build args using cloudbuild.yaml
gcloud builds submit \
    --config=cloudbuild.yaml \
    --substitutions="_GOOGLE_MAPS_API_KEY=${GOOGLE_MAPS_API_KEY},_BACKEND_URL=${BACKEND_URL},_IMAGE_NAME=${FRONTEND_IMAGE}"

# Deploy frontend to Cloud Run
echo -e "\n${YELLOW}Deploying frontend to Cloud Run...${NC}"
gcloud run deploy $FRONTEND_SERVICE \
    --image $FRONTEND_IMAGE \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --memory 1Gi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 10 \
    --timeout 60 \
    --set-env-vars "NEXT_PUBLIC_BACKEND_URL=${BACKEND_URL}"

# Note: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is baked into the image at build time

# Get frontend URL
FRONTEND_URL=$(gcloud run services describe $FRONTEND_SERVICE --region $REGION --format 'value(status.url)')
echo -e "${GREEN}✓ Frontend deployed at: $FRONTEND_URL${NC}"

# Redeploy backend with updated CORS to include frontend URL
echo -e "\n${YELLOW}Updating backend CORS configuration...${NC}"
# Create a temporary env vars file to avoid gcloud comma parsing issues
cat > /tmp/backend-env-vars.yaml <<EOF
DEBUG: "False"
ALLOWED_ORIGINS: "${FRONTEND_URL},http://localhost:3000"
EOF

gcloud run deploy $BACKEND_SERVICE \
    --image $BACKEND_IMAGE \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --memory 2Gi \
    --cpu 2 \
    --min-instances 0 \
    --max-instances 10 \
    --timeout 300 \
    --port 8000 \
    --env-vars-file /tmp/backend-env-vars.yaml \
    --set-secrets "$SECRETS_ARG"

# Clean up temp file
rm /tmp/backend-env-vars.yaml

echo -e "${GREEN}✓ CORS updated to allow: $FRONTEND_URL and localhost${NC}"

# Summary
echo -e "\n${GREEN}Deployment Complete!${NC}"
echo -e "\n${GREEN}Access your application at:${NC}"
echo -e "  Frontend: ${GREEN}$FRONTEND_URL${NC}"
echo -e "  Backend:  ${GREEN}$BACKEND_URL${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "  1. Update CORS in backend/main.py with the frontend URL"
echo "  2. Configure custom domain (optional)"
echo "  3. Set up Cloud CDN for frontend (optional)"
echo "  4. Configure monitoring and alerts"
echo ""

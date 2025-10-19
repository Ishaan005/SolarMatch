#!/bin/bash

# Quick setup script for GCP secrets
# Run this after initial GCP project setup

echo "🔐 Setting up GCP Secrets for SolarMatch"
echo ""

# Check if gcloud is installed
if ! command -v gcloud &> /dev/null; then
    echo "❌ Error: gcloud CLI is not installed"
    exit 1
fi

# Get current project
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
    echo "❌ Error: No GCP project set"
    echo "Please run: gcloud config set project YOUR_PROJECT_ID"
    exit 1
fi
echo "Current project: $PROJECT_ID"
echo ""

# Enable Secret Manager API
echo "Enabling Secret Manager API..."
gcloud services enable secretmanager.googleapis.com --project=$PROJECT_ID
echo "✓ Secret Manager API enabled"
echo ""

# Prompt for Google Solar API Key
read -p "Enter Google Solar API Key: " SOLAR_API_KEY
echo ""

# Prompt for Google Maps API Key
read -p "Enter Google Maps API Key: " MAPS_API_KEY
echo ""

# Prompt for Database URL
echo "Enter Database URL (format: postgresql://user:pass@host:port/dbname)"
read -p "Database URL: " DATABASE_URL
echo ""

# Create secrets
echo "Creating secrets in Secret Manager..."
echo ""

# Google Solar API Key
echo "Setting up google-solar-api-key..."
if gcloud secrets describe google-solar-api-key --project=$PROJECT_ID &>/dev/null; then
    echo "  Secret exists, adding new version..."
    echo -n "$SOLAR_API_KEY" | gcloud secrets versions add google-solar-api-key \
        --data-file=- \
        --project=$PROJECT_ID
else
    echo "  Creating new secret..."
    echo -n "$SOLAR_API_KEY" | gcloud secrets create google-solar-api-key \
        --data-file=- \
        --replication-policy="automatic" \
        --project=$PROJECT_ID
fi
echo "✓ google-solar-api-key created/updated"
echo ""

# Google Maps API Key
echo "Setting up google-maps-api-key..."
if gcloud secrets describe google-maps-api-key --project=$PROJECT_ID &>/dev/null; then
    echo "  Secret exists, adding new version..."
    echo -n "$MAPS_API_KEY" | gcloud secrets versions add google-maps-api-key \
        --data-file=- \
        --project=$PROJECT_ID
else
    echo "  Creating new secret..."
    echo -n "$MAPS_API_KEY" | gcloud secrets create google-maps-api-key \
        --data-file=- \
        --replication-policy="automatic" \
        --project=$PROJECT_ID
fi
echo "✓ google-maps-api-key created/updated"
echo ""

# Database URL
echo "Setting up database-url..."
if gcloud secrets describe database-url --project=$PROJECT_ID &>/dev/null; then
    echo "  Secret exists, adding new version..."
    echo -n "$DATABASE_URL" | gcloud secrets versions add database-url \
        --data-file=- \
        --project=$PROJECT_ID
else
    echo "  Creating new secret..."
    echo -n "$DATABASE_URL" | gcloud secrets create database-url \
        --data-file=- \
        --replication-policy="automatic" \
        --project=$PROJECT_ID
fi
echo "✓ database-url created/updated"

echo ""
echo "✅ Secrets setup complete!"
echo ""
echo "You can verify secrets with:"
echo "  gcloud secrets list"
echo ""
echo "To view a secret:"
echo "  gcloud secrets versions access latest --secret=google-solar-api-key"
echo "  gcloud secrets versions access latest --secret=google-maps-api-key"
echo "  gcloud secrets versions access latest --secret=database-url"

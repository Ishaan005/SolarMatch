# SolarMatch Production Deployment Guide

This guide covers deploying SolarMatch to Google Cloud Platform (GCP) using Cloud Run.

## Architecture Overview

```
┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
│   Cloud Run     │         │   Cloud Run     │         │   Cloud SQL     │
│   (Frontend)    │────────▶│   (Backend)     │────────▶│  (PostgreSQL)   │
│   Next.js       │         │   FastAPI       │         │                 │
└─────────────────┘         └─────────────────┘         └─────────────────┘
        │                           │
        │                           │
        ▼                           ▼
┌─────────────────┐         ┌─────────────────┐
│ Artifact Reg.   │         │ Secret Manager  │
│ (Docker Images) │         │ (API Keys, etc) │
└─────────────────┘         └─────────────────┘
```

## Prerequisites

1. **Google Cloud Project**
   - Create a GCP project at https://console.cloud.google.com/
   - Note your Project ID
   - Enable billing for the project

2. **gcloud CLI**
   ```bash
   # Install gcloud CLI
   # macOS:
   brew install --cask google-cloud-sdk
   
   # Or download from:
   # https://cloud.google.com/sdk/docs/install
   
   # Login
   gcloud auth login
   
   # Set your project
   gcloud config set project YOUR_PROJECT_ID
   ```

3. **Docker**
   ```bash
   # Install Docker Desktop
   # https://www.docker.com/products/docker-desktop/
   ```

## Initial GCP Setup

### 1. Enable Required APIs

```bash
gcloud services enable \
    run.googleapis.com \
    cloudbuild.googleapis.com \
    artifactregistry.googleapis.com \
    sqladmin.googleapis.com \
    secretmanager.googleapis.com
```

### 2. Create Artifact Registry Repository

```bash
# Set your region (use one close to your users)
REGION="europe-west1"  # Ireland - good for Europe
# REGION="us-central1"  # Iowa - good for US
# REGION="asia-east1"   # Taiwan - good for Asia

gcloud artifacts repositories create solarmatch \
    --repository-format=docker \
    --location=$REGION \
    --description="SolarMatch container images"
```

### 3. Configure Secrets

Store sensitive information in Secret Manager:

```bash
# Google Solar API Key
echo -n "YOUR_GOOGLE_SOLAR_API_KEY" | \
    gcloud secrets create google-solar-api-key \
    --data-file=-

# Database URL (your existing Cloud SQL)
echo -n "postgresql://postgres:Solarmatch%402025@34.105.148.120:5432/solarmatch-db" | \
    gcloud secrets create database-url \
    --data-file=-
```

### 4. Set Up Cloud SQL Connection (if needed)

If you want to use Cloud SQL Unix socket (more secure):

```bash
# Get your Cloud SQL instance connection name
gcloud sql instances describe YOUR_INSTANCE_NAME \
    --format="value(connectionName)"

# Update DATABASE_URL secret with Unix socket format:
# postgresql://USER:PASSWORD@/solarmatch-db?host=/cloudsql/PROJECT:REGION:INSTANCE
```

## Deployment Methods

### Option 1: Manual Deployment (Recommended for First Time)

Use the provided deployment script:

```bash
# Set environment variables
export GCP_PROJECT_ID="your-project-id"
export GCP_REGION="europe-west1"

# Run deployment
./deploy.sh
```

The script will:
- Build Docker images
- Push to Artifact Registry
- Deploy to Cloud Run
- Configure environment variables and secrets

### Option 2: GitHub Actions (Automated CI/CD)

For automatic deployments on every push to main:

1. **Create a Service Account**

```bash
PROJECT_ID="your-project-id"

# Create service account
gcloud iam service-accounts create github-actions \
    --display-name="GitHub Actions Deployer"

# Grant necessary permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:github-actions@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:github-actions@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/storage.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:github-actions@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/artifactregistry.writer"

# Create and download key
gcloud iam service-accounts keys create key.json \
    --iam-account=github-actions@${PROJECT_ID}.iam.gserviceaccount.com
```

2. **Add GitHub Secrets**

Go to your GitHub repo → Settings → Secrets and variables → Actions:

- `GCP_PROJECT_ID`: Your GCP project ID
- `GCP_SA_KEY`: Contents of the `key.json` file (the entire JSON)

3. **Push to Main Branch**

The GitHub Actions workflow will automatically:
- Build both frontend and backend
- Deploy to Cloud Run
- Output deployment URLs

## Post-Deployment Configuration

### 1. Update CORS in Backend

After first deployment, update `backend/main.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Local development
        "https://YOUR-FRONTEND-URL.run.app",  # Production frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

Redeploy the backend after this change.

### 2. Configure Custom Domain (Optional)

```bash
# Map custom domain to frontend
gcloud run domain-mappings create \
    --service=solarmatch-frontend \
    --domain=www.yourdomain.com \
    --region=$REGION

# Map custom domain to backend API
gcloud run domain-mappings create \
    --service=solarmatch-backend \
    --domain=api.yourdomain.com \
    --region=$REGION
```

Follow the instructions to add DNS records.

### 3. Set Up Cloud CDN (Optional, for better performance)

```bash
# Create a load balancer with Cloud CDN
# This improves frontend performance globally
# Follow guide: https://cloud.google.com/run/docs/configuring/cdn
```

## Monitoring and Logging

### View Logs

```bash
# Backend logs
gcloud run services logs read solarmatch-backend \
    --region=$REGION \
    --limit=50

# Frontend logs
gcloud run services logs read solarmatch-frontend \
    --region=$REGION \
    --limit=50
```

### Set Up Monitoring

1. Go to Cloud Console → Monitoring
2. Create dashboards for:
   - Request count
   - Latency
   - Error rates
   - Memory/CPU usage

### Set Up Alerts

```bash
# Example: Alert on high error rate
gcloud alpha monitoring policies create \
    --notification-channels=CHANNEL_ID \
    --display-name="High Error Rate" \
    --condition-display-name="Error rate > 5%" \
    --condition-threshold-value=5 \
    --condition-threshold-duration=300s
```

## Cost Optimization

### Cloud Run Pricing

Cloud Run charges for:
- CPU/Memory usage (only when handling requests)
- Number of requests
- Networking egress

**Estimated costs** (with low traffic):
- Backend: ~$5-20/month
- Frontend: ~$5-10/month
- Cloud SQL: ~$10-30/month (if using managed instance)

### Optimization Tips

1. **Set min-instances to 0** (default in our setup)
   - Services scale to zero when not in use
   - First request may be slower (cold start)

2. **Use appropriate memory/CPU**
   - Backend: 2GB RAM, 2 CPU (for geospatial processing)
   - Frontend: 1GB RAM, 1 CPU (sufficient for Next.js)

3. **Enable request timeout**
   - Backend: 300s (for long-running solar analysis)
   - Frontend: 60s (for SSR)

4. **Use Cloud SQL Proxy** for better connection management

## Troubleshooting

### Container fails to start

```bash
# Check service logs
gcloud run services logs read SERVICE_NAME --region=$REGION --limit=100

# Common issues:
# - Missing environment variables
# - Secret not found
# - Port misconfiguration (must use PORT env var)
```

### Database connection issues

```bash
# Test connection from Cloud Run
gcloud run services update solarmatch-backend \
    --add-cloudsql-instances=PROJECT:REGION:INSTANCE \
    --region=$REGION

# Check if Cloud SQL Admin API is enabled
gcloud services enable sqladmin.googleapis.com
```

### CORS errors

- Ensure frontend URL is in backend's `allow_origins`
- Check that backend is deployed after CORS update
- Verify `NEXT_PUBLIC_API_URL` points to correct backend

### Secret not found

```bash
# Grant Cloud Run access to secrets
SECRET_NAME="google-solar-api-key"
PROJECT_ID="your-project-id"

gcloud secrets add-iam-policy-binding $SECRET_NAME \
    --member="serviceAccount:$(gcloud run services describe solarmatch-backend \
        --region=$REGION \
        --format='value(spec.template.spec.serviceAccountName)')" \
    --role="roles/secretmanager.secretAccessor"
```

## Rollback

If something goes wrong:

```bash
# List revisions
gcloud run revisions list --service=solarmatch-backend --region=$REGION

# Rollback to previous revision
gcloud run services update-traffic solarmatch-backend \
    --to-revisions=REVISION_NAME=100 \
    --region=$REGION
```

## Environment Variables Reference

### Backend (Cloud Run)

Required:
- `GOOGLE_SOLAR_API_KEY` (from Secret Manager)
- `DATABASE_URL` (from Secret Manager)
- `HOST=0.0.0.0`
- `PORT=8000`

Optional:
- `DEBUG=False` (set to False in production)
- `SQL_ECHO=False` (disable SQL query logging)

### Frontend (Cloud Run)

Required:
- `NEXT_PUBLIC_API_URL` (backend Cloud Run URL)

Optional:
- `NODE_ENV=production`
- `NEXT_TELEMETRY_DISABLED=1`

## Security Best Practices

1. **Use Secret Manager** for all sensitive data
2. **Enable IAM authentication** for internal services
3. **Set up VPC** for private communication between services
4. **Use Cloud Armor** for DDoS protection
5. **Enable audit logging** for compliance
6. **Regular security updates** for dependencies

## Next Steps

1. Set up continuous deployment with GitHub Actions
2. Configure custom domain
3. Set up monitoring and alerts
4. Implement backup strategy for Cloud SQL
5. Consider multi-region deployment for HA
6. Add rate limiting for API endpoints
7. Implement caching strategy (Cloud CDN, Redis)

## Support

For issues or questions:
- GCP Documentation: https://cloud.google.com/run/docs
- Cloud Run pricing: https://cloud.google.com/run/pricing
- Support: https://cloud.google.com/support

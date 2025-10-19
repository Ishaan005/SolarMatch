# 🚀 Quick Start: Deploy SolarMatch to GCP

This guide will get your SolarMatch app deployed to Google Cloud Platform in about 15-20 minutes.

## Prerequisites Checklist

- [ ] GCP account with billing enabled
- [ ] `gcloud` CLI installed
- [ ] Docker installed
- [ ] Your Google Solar API key
- [ ] Database already running (Cloud SQL at 34.105.148.120)

## Step-by-Step Deployment

### 1. Install gcloud CLI (if not installed)

```bash
# macOS
brew install --cask google-cloud-sdk

# Login and set project
gcloud auth login
gcloud config set project YOUR_PROJECT_ID
```

### 2. Initial GCP Setup

```bash
# Enable required APIs (takes 2-3 minutes)
gcloud services enable \
    run.googleapis.com \
    cloudbuild.googleapis.com \
    artifactregistry.googleapis.com \
    secretmanager.googleapis.com

# Create Artifact Registry for Docker images
export REGION="europe-west1"  # Change if needed
gcloud artifacts repositories create solarmatch \
    --repository-format=docker \
    --location=$REGION \
    --description="SolarMatch containers"
```

### 3. Set Up Secrets

Run the setup script:

```bash
./scripts/setup-secrets.sh
```

Or manually:

```bash
# Google Solar API Key
echo -n "YOUR_GOOGLE_SOLAR_API_KEY" | \
    gcloud secrets create google-solar-api-key --data-file=-

# Database URL
echo -n "postgresql://postgres:PASSWORD@34.105.148.120:5432/solarmatch-db" | \
    gcloud secrets create database-url --data-file=-
```

### 4. Test Builds Locally (Optional but Recommended)

```bash
./scripts/test-builds.sh
```

This catches build errors before pushing to GCP.

### 5. Deploy to Cloud Run

```bash
# Set environment variables
export GCP_PROJECT_ID="your-project-id"
export GCP_REGION="europe-west1"

# Run deployment
./deploy.sh
```

The script will:
1. Build backend Docker image (~3-5 min)
2. Build frontend Docker image (~3-5 min)
3. Deploy both to Cloud Run (~2-3 min)
4. Output your service URLs

### 6. Update CORS Configuration

After first deployment, the script will show your frontend URL. Add it to the backend:

```bash
# The ALLOWED_ORIGINS is already set via environment
# But you need to update it in Cloud Run:

FRONTEND_URL="https://your-frontend-xyz.run.app"

gcloud run services update solarmatch-backend \
    --region=$REGION \
    --set-env-vars="ALLOWED_ORIGINS=$FRONTEND_URL,http://localhost:3000"
```

### 7. Test Your Deployment

```bash
# Get your URLs
BACKEND_URL=$(gcloud run services describe solarmatch-backend \
    --region=$REGION --format='value(status.url)')
FRONTEND_URL=$(gcloud run services describe solarmatch-frontend \
    --region=$REGION --format='value(status.url)')

# Test backend health
curl $BACKEND_URL/api/health

# Visit frontend in browser
open $FRONTEND_URL
```

## That's It! 🎉

Your app is now live at the frontend URL.

## Common Commands

```bash
# View logs
./scripts/logs.sh backend 100
./scripts/logs.sh frontend 50

# Or directly:
gcloud run services logs read solarmatch-backend --region=$REGION --limit=50

# Update environment variables
gcloud run services update solarmatch-backend \
    --region=$REGION \
    --set-env-vars="KEY=value"

# Rollback if needed
gcloud run revisions list --service=solarmatch-backend --region=$REGION
gcloud run services update-traffic solarmatch-backend \
    --to-revisions=REVISION_NAME=100 --region=$REGION
```

## Costs

Expected monthly costs with low traffic:
- Backend: ~$5-15
- Frontend: ~$5-10
- Cloud SQL: ~$10-30 (existing)
- Total: **~$20-55/month**

With min-instances=0, services scale to zero when not in use!

## Next Steps

1. ✅ **Set up GitHub Actions** for auto-deployment
   - See `.github/workflows/deploy.yml`
   - Add secrets: `GCP_PROJECT_ID` and `GCP_SA_KEY`

2. 🌐 **Configure custom domain** (optional)
   ```bash
   gcloud run domain-mappings create \
       --service=solarmatch-frontend \
       --domain=www.yourdomain.com \
       --region=$REGION
   ```

3. 📊 **Set up monitoring**
   - Go to GCP Console → Cloud Run
   - View metrics, logs, and set up alerts

4. 🔒 **Enhance security**
   - Enable Cloud Armor for DDoS protection
   - Set up VPC for private services
   - Configure IAM for fine-grained access

## Troubleshooting

### Build fails with "out of memory"

Increase Cloud Build resources:
```bash
gcloud builds submit --machine-type=E2_HIGHCPU_8 --tag IMAGE
```

### Container won't start

Check logs:
```bash
./scripts/logs.sh backend 100
```

Common issues:
- Missing secrets → Run `./scripts/setup-secrets.sh`
- Wrong PORT → Should be 8000 for backend, 3000 for frontend
- Database connection → Check Cloud SQL firewall rules

### CORS errors in browser

Update CORS origins:
```bash
gcloud run services update solarmatch-backend \
    --region=$REGION \
    --set-env-vars="ALLOWED_ORIGINS=https://your-frontend-url.run.app,http://localhost:3000"
```

### Cold starts are slow

Set minimum instances (increases cost):
```bash
gcloud run services update solarmatch-backend \
    --region=$REGION \
    --min-instances=1
```

## Support Resources

- 📖 [Full Deployment Guide](./DEPLOYMENT.md)
- 🐛 [GitHub Issues](https://github.com/Ishaan005/SolarMatch/issues)
- 📚 [Cloud Run Docs](https://cloud.google.com/run/docs)
- 💬 [GCP Support](https://cloud.google.com/support)

## Clean Up (if needed)

To delete everything:
```bash
# Delete Cloud Run services
gcloud run services delete solarmatch-backend --region=$REGION
gcloud run services delete solarmatch-frontend --region=$REGION

# Delete images
gcloud artifacts repositories delete solarmatch --location=$REGION

# Delete secrets
gcloud secrets delete google-solar-api-key
gcloud secrets delete database-url
```

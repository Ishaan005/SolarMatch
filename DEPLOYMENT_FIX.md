# Deployment Fix Summary

## Problem
The frontend was unable to connect to the backend in production because the `NEXT_PUBLIC_BACKEND_URL` environment variable was not properly set during the build process.

## Root Cause
In the original `deploy.sh` script, the frontend Docker image was built **before** the backend was deployed, meaning the backend URL was unknown at build time. The frontend image was compiled with an empty/undefined backend URL.

## Solution
Reordered the deployment script to:

1. **Build backend image** (no changes)
2. **Deploy backend to Cloud Run** (moved earlier)
3. **Get backend URL** from the deployed service
4. **Build frontend image** with the correct backend URL baked in
5. **Deploy frontend to Cloud Run**
6. **Update backend CORS** automatically to allow the frontend domain

## Changes Made

### 1. Fixed `.env.local` (for local development)
Added the missing `NEXT_PUBLIC_BACKEND_URL` variable:
```bash
NEXT_PUBLIC_BACKEND_URL="http://localhost:8000"
```

### 2. Updated `deploy.sh` (for production deployment)
- Moved backend deployment **before** frontend build
- Ensured `BACKEND_URL` is retrieved before building frontend
- Added automatic CORS update after frontend deployment
- Removed manual CORS update instructions (now automated)

## How to Re-deploy

Run the deployment script:
```bash
./deploy.sh
```

The script will now:
1. Deploy the backend first
2. Get its URL
3. Build the frontend with the correct backend URL
4. Deploy the frontend
5. Automatically update backend CORS to allow the frontend

## Testing

After deployment:
1. Open your frontend URL
2. Try to get a solar score for an address
3. The backend should respond correctly
4. Check browser console for any CORS errors

## Local Development

For local development, ensure both services are running:

**Terminal 1 - Backend:**
```bash
cd backend
python -m uvicorn main:app --reload
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

**Important:** After changing `.env.local`, restart the Next.js dev server to pick up the new environment variable.

## Environment Variables

### Frontend (Next.js)
- `NEXT_PUBLIC_BACKEND_URL` - Backend API URL
  - Local: `http://localhost:8000`
  - Production: Auto-set during deployment
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` - Google Maps API key
  - Baked into Docker image at build time

### Backend (FastAPI)
- `GOOGLE_SOLAR_API_KEY` - Google Solar API key (from Secret Manager)
- `DATABASE_URL` - PostgreSQL connection string (from Secret Manager)
- `ALLOWED_ORIGINS` - Comma-separated list of allowed CORS origins
  - Auto-updated during deployment to include frontend URL

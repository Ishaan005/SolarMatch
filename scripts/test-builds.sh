#!/bin/bash

# Test local Docker builds before deploying
# This helps catch build issues early

set -e

echo "🧪 Testing Docker builds locally"
echo ""

# Test backend build
echo "Building backend image..."
cd backend
docker build -t solarmatch-backend-test . || {
    echo "❌ Backend build failed"
    exit 1
}
echo "✓ Backend build successful"
cd ..

echo ""

# Test frontend build
echo "Building frontend image..."
docker build -t solarmatch-frontend-test . || {
    echo "❌ Frontend build failed"
    exit 1
}
echo "✓ Frontend build successful"

echo ""
echo "✅ All builds successful!"
echo ""
echo "You can now run:"
echo "  ./deploy.sh  # Deploy to GCP"
echo ""
echo "Or test locally:"
echo "  docker run -p 8000:8000 --env-file backend/.env solarmatch-backend-test"
echo "  docker run -p 3000:3000 -e NEXT_PUBLIC_API_URL=http://localhost:8000 solarmatch-frontend-test"

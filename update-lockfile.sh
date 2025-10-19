#!/bin/bash
# Update package-lock.json to sync with package.json

echo "Updating package-lock.json..."
cd "$(dirname "$0")"
npm install --package-lock-only
echo "✓ package-lock.json updated"

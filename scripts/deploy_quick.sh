#!/usr/bin/env bash
set -euo pipefail

# Quick deploy — builds, uploads zip, restarts. No infra changes.
# Usage: ./scripts/deploy_quick.sh

RESOURCE_GROUP="RU-A-NonProd-AI-Innovation-RG"
WEBAPP_NAME="rmc-case-chatbot-nonprod"
STORAGE_ACCOUNT="rushaigovstorage"
CONTAINER="rmc-app-packages"
BLOB_NAME="deployments/rmc-case-chatbot-standalone.zip"

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ZIP_PATH="/tmp/rmc-deploy.zip"

cd "$REPO_ROOT"

echo "── Typecheck + tests..."
npm run typecheck
npm test -- --run

echo "── Building standalone..."
npm run build

echo "── Packaging..."
rm -rf .next/standalone/.next/static .next/standalone/public
cp -r .next/static .next/standalone/.next/static
[ -d public ] && cp -r public .next/standalone/public

rm -f "$ZIP_PATH"
(cd .next/standalone && zip -qr "$ZIP_PATH" .)

echo "── Uploading to blob storage..."
az storage blob upload \
  --account-name "$STORAGE_ACCOUNT" \
  --container-name "$CONTAINER" \
  --name "$BLOB_NAME" \
  --file "$ZIP_PATH" \
  --overwrite \
  --auth-mode key \
  -o none

echo "── Restarting web app..."
az webapp restart \
  --resource-group "$RESOURCE_GROUP" \
  --name "$WEBAPP_NAME" \
  -o none

echo "── Done. https://${WEBAPP_NAME}.azurewebsites.net"

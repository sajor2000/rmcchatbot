#!/usr/bin/env bash
set -euo pipefail

RESOURCE_GROUP="${AZURE_RESOURCE_GROUP:-RU-A-NonProd-AI-Innovation-RG}"
APP_SERVICE_PLAN="${AZURE_APP_SERVICE_PLAN:-asp-rmc-case-chatbot-nonprod}"
WEBAPP_NAME="${AZURE_WEBAPP_NAME:-rmc-case-chatbot-nonprod}"
LOCATION="${AZURE_LOCATION:-northcentralus}"
AI_RESOURCE="${AZURE_AI_RESOURCE:-rua-nonprod-ai-innovation}"
STORAGE_ACCOUNT="${AZURE_STORAGE_ACCOUNT_NAME:-rushaigovstorage}"
PACKAGE_CONTAINER="${AZURE_PACKAGE_CONTAINER:-rmc-app-packages}"
APPINSIGHTS_NAME="${AZURE_APPINSIGHTS_NAME:-rua-nonprod-ai-innovation-project-appinsights-9055}"
NODE_RUNTIME="${AZURE_WEBAPP_NODE_RUNTIME:-NODE:22-lts}"
DEPLOY_DIR="${DEPLOY_DIR:-/tmp/rmc-case-chatbot-standalone}"
DEPLOY_ZIP="${DEPLOY_ZIP:-/tmp/rmc-case-chatbot-standalone.zip}"
PACKAGE_BLOB_NAME="${AZURE_PACKAGE_BLOB_NAME:-deployments/rmc-case-chatbot-standalone.zip}"
PACKAGE_SAS_EXPIRY="${AZURE_PACKAGE_SAS_EXPIRY:-2027-05-22T23:59Z}"

require_command() {
  if ! command -v "$1" >/dev/null 2>&1; then
    echo "Missing required command: $1" >&2
    exit 1
  fi
}

require_command az
require_command npm
require_command npx
require_command zip

if [[ "${SKIP_CHECKS:-false}" != "true" ]]; then
  npm run typecheck
  npm test
  npm run build
fi

az group show --name "$RESOURCE_GROUP" >/dev/null

if ! az appservice plan show --resource-group "$RESOURCE_GROUP" --name "$APP_SERVICE_PLAN" >/dev/null 2>&1; then
  az appservice plan create \
    --name "$APP_SERVICE_PLAN" \
    --resource-group "$RESOURCE_GROUP" \
    --location "$LOCATION" \
    --is-linux \
    --sku B1 \
    -o none
fi

if ! az webapp show --resource-group "$RESOURCE_GROUP" --name "$WEBAPP_NAME" >/dev/null 2>&1; then
  az webapp create \
    --resource-group "$RESOURCE_GROUP" \
    --plan "$APP_SERVICE_PLAN" \
    --name "$WEBAPP_NAME" \
    --runtime "$NODE_RUNTIME" \
    -o none
fi

OPENAI_KEY="$(az cognitiveservices account keys list --resource-group "$RESOURCE_GROUP" --name "$AI_RESOURCE" --query key1 -o tsv)"
OPENAI_ENDPOINT="$(az cognitiveservices account show --resource-group "$RESOURCE_GROUP" --name "$AI_RESOURCE" --query properties.endpoint -o tsv)"
APPINSIGHTS_CONNECTION_STRING="$(az monitor app-insights component show --app "$APPINSIGHTS_NAME" --resource-group "$RESOURCE_GROUP" --query connectionString -o tsv)"
STORAGE_CONNECTION_STRING="$(az storage account show-connection-string --resource-group "$RESOURCE_GROUP" --name "$STORAGE_ACCOUNT" --query connectionString -o tsv)"

az webapp identity assign --resource-group "$RESOURCE_GROUP" --name "$WEBAPP_NAME" -o none
az webapp update --resource-group "$RESOURCE_GROUP" --name "$WEBAPP_NAME" --https-only true -o none
az webapp config set \
  --resource-group "$RESOURCE_GROUP" \
  --name "$WEBAPP_NAME" \
  --linux-fx-version "${NODE_RUNTIME/NODE:/NODE|}" \
  --startup-file "node server.js" \
  --always-on true \
  --ftps-state Disabled \
  --min-tls-version 1.2 \
  -o none

az webapp config appsettings set --resource-group "$RESOURCE_GROUP" --name "$WEBAPP_NAME" --settings \
  AZURE_OPENAI_ENDPOINT="$OPENAI_ENDPOINT" \
  AZURE_OPENAI_API_KEY="$OPENAI_KEY" \
  AZURE_OPENAI_DEPLOYMENT="rmc-patient-gpt-4-1" \
  AZURE_OPENAI_API_VERSION="v1" \
  AZURE_STORAGE_ACCOUNT_NAME="$STORAGE_ACCOUNT" \
  AZURE_STORAGE_CONNECTION_STRING="$STORAGE_CONNECTION_STRING" \
  AZURE_STORAGE_PUBLIC_BASE_URL="https://$STORAGE_ACCOUNT.blob.core.windows.net/rmc-case-content" \
  AZURE_BLOB_TRANSCRIPTS_CONTAINER="rmc-chat-transcripts" \
  CHAT_LOGGING_ENABLED="false" \
  RMC_CASE_LIBRARY_MODE="pilot" \
  RMC_PILOT_CASE_IDS="jane-kim-withdrawal,chest-pain,fatigue-mood" \
  APPLICATIONINSIGHTS_CONNECTION_STRING="$APPINSIGHTS_CONNECTION_STRING" \
  SCM_DO_BUILD_DURING_DEPLOYMENT="false" \
  ENABLE_ORYX_BUILD="false" \
  NODE_ENV="production" \
  -o none

ARTIFACT_TMP="$(mktemp -d /tmp/rmc-case-content.XXXXXX)"
export ARTIFACT_TMP
trap 'rm -rf "$ARTIFACT_TMP"' EXIT

npx tsx -e '
import { janeKimCase } from "./src/content/cases/janeKimCase";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";

const root = process.env.ARTIFACT_TMP;
if (!root) throw new Error("ARTIFACT_TMP missing");

for (const artifact of janeKimCase.artifacts) {
  const filePath = join(root, artifact.blobPath);
  mkdirSync(dirname(filePath), { recursive: true });
  writeFileSync(filePath, JSON.stringify(artifact, null, 2));
}
'

az storage blob upload-batch \
  --connection-string "$STORAGE_CONNECTION_STRING" \
  --destination rmc-case-content \
  --source "$ARTIFACT_TMP" \
  --overwrite true \
  --content-type application/json \
  -o none

rm -rf "$DEPLOY_DIR" "$DEPLOY_ZIP"
mkdir -p "$DEPLOY_DIR/.next"
cp -R .next/standalone/. "$DEPLOY_DIR/"
cp -R .next/static "$DEPLOY_DIR/.next/static"
if [[ -d public ]]; then
  cp -R public "$DEPLOY_DIR/public"
fi

(cd "$DEPLOY_DIR" && zip -qr "$DEPLOY_ZIP" .)

az storage container create \
  --connection-string "$STORAGE_CONNECTION_STRING" \
  --name "$PACKAGE_CONTAINER" \
  --public-access off \
  -o none

az storage blob upload \
  --connection-string "$STORAGE_CONNECTION_STRING" \
  --container-name "$PACKAGE_CONTAINER" \
  --name "$PACKAGE_BLOB_NAME" \
  --file "$DEPLOY_ZIP" \
  --overwrite true \
  --content-type application/zip \
  -o none

PACKAGE_SAS="$(az storage blob generate-sas \
  --connection-string "$STORAGE_CONNECTION_STRING" \
  --container-name "$PACKAGE_CONTAINER" \
  --name "$PACKAGE_BLOB_NAME" \
  --permissions r \
  --expiry "$PACKAGE_SAS_EXPIRY" \
  --https-only \
  -o tsv)"
PACKAGE_URL="https://$STORAGE_ACCOUNT.blob.core.windows.net/$PACKAGE_CONTAINER/$PACKAGE_BLOB_NAME?$PACKAGE_SAS"

az webapp config appsettings set \
  --resource-group "$RESOURCE_GROUP" \
  --name "$WEBAPP_NAME" \
  --settings WEBSITE_RUN_FROM_PACKAGE="$PACKAGE_URL" \
  -o none

az webapp restart --resource-group "$RESOURCE_GROUP" --name "$WEBAPP_NAME" -o none

echo "Deployed https://$WEBAPP_NAME.azurewebsites.net"

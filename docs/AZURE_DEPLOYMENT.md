# Azure Deployment Notes

## Target

Deploy the prototype to Azure App Service / Azure Web Apps with Node 22 LTS. Vercel is a backup target only.

Default real-testing mode shows only the Jane Kim case. Demo cases remain deployed in code but are hidden unless `RMC_CASE_LIBRARY_MODE=demo` is explicitly configured.

## Azure Resources

- Azure App Service for the Next.js app
- Azure AI Foundry / Azure OpenAI deployment for patient chat
- Azure Blob Storage for source PDFs, clinical artifacts, and optional transcript snapshots
- Application Insights for runtime diagnostics

## Azure AI Foundry Model

Primary deployment:

- Resource: `rua-nonprod-ai-innovation`
- Resource group: `RU-A-NonProd-AI-Innovation-RG`
- Deployment name: `rmc-patient-gpt-4-1`
- Model: `gpt-4.1`
- Model version: `2025-04-14`
- SKU: `GlobalStandard`
- RAI/content-filter policy: `rmc-medical-education-filter`

Use `gpt-4.1-mini` only as a cost-testing fallback. Do not switch this simulator to o-series or other reasoning models without first removing unsupported chat-style settings such as `temperature` and validating latency.

New Foundry deployments should use `AZURE_OPENAI_API_VERSION=v1`. If an older Rush Azure OpenAI resource still requires an API version such as `2024-10-21`, the app keeps compatibility by using deployment-based Azure URLs.

The app omits `temperature` for deployment aliases such as `rmc-patient-gpt-4-1` because the AI SDK infers model capabilities from the deployment string and otherwise warns that the setting is unsupported. Deployments named directly after non-reasoning models, such as `gpt-4.1`, can still use the temperature setting.

## Foundry Content Filter

The deployment-level RAI/content-filter policy is `rmc-medical-education-filter`.

- Keep Prompt Shields enabled.
- Hate, violence, sexual-history, and mental-health/self-harm prompts and completions should use the least restrictive standard threshold, `High`, so students can ask clinically necessary history-and-physical questions in supervised cases.
- Azure rejected full prompt-side removal for `Sexual` and `Selfharm` without modified content-filter permission. Do not turn these filters off unless Rush and Microsoft approve modified content filtering.

Recommended policy intent:

- `Hate`: high threshold for prompts and completions.
- `Violence`: high threshold for prompts and completions.
- `Sexual`: high threshold for prompts and completions.
- `Selfharm`: high threshold for prompts and completions.
- `Jailbreak`: enabled and blocking for prompts.
- `Protected Material Text` and `Protected Material Code`: enabled and blocking for completions.

## App Settings

Configure these as Azure App Service application settings, not checked-in secrets:

- `AZURE_OPENAI_ENDPOINT`
- `AZURE_OPENAI_API_KEY`
- `AZURE_OPENAI_DEPLOYMENT`
- `AZURE_OPENAI_API_VERSION`
- `AZURE_STORAGE_ACCOUNT_NAME`
- `AZURE_STORAGE_CONNECTION_STRING` or managed identity with Blob permissions
- `AZURE_STORAGE_PUBLIC_BASE_URL`
- `AZURE_BLOB_TRANSCRIPTS_CONTAINER`
- `CHAT_LOGGING_ENABLED`
- `RMC_CASE_LIBRARY_MODE`
- `RMC_PILOT_CASE_IDS`
- `APPLICATIONINSIGHTS_CONNECTION_STRING`

Keep `CHAT_LOGGING_ENABLED=false` until faculty and IRB direction allows transcript capture.

Use these case-library settings for the initial pilot:

- `RMC_CASE_LIBRARY_MODE=pilot`
- `RMC_PILOT_CASE_IDS=jane-kim-withdrawal`

Use `RMC_CASE_LIBRARY_MODE=demo` only for local development or faculty review of non-pilot cases.

## Purview Sensitivity Labels

Microsoft Purview sensitivity labels are data-governance controls, not content-filter bypasses.

For the current no-login, API-key MVP, labels should govern faculty source files, audit posture, and release workflow. A legitimate relabeling path is a de-identified, faculty-approved case PDF moving from a stricter inherited label to a Rush-approved teaching label such as `Internal - Medical Education`, with compliance-owner approval and label-policy logging.

True label-based retrieval enforcement requires a later Entra-authenticated RAG architecture with Azure AI Search Purview sensitivity-label indexing. In that version, indexed documents must enforce label access at query time, and encrypted content must only be returned when the user or service has the required rights.

## Startup

The app uses Next.js standalone output. Azure App Service should run the production server with the repository's `start` script after build, which launches `.next/standalone/server.js`.

## Blob Containers

Recommended containers:

- `rmc-case-content`: source PDFs and clinical artifacts
- `rmc-chat-transcripts`: feature-flagged de-identified transcript snapshots

Artifacts referenced in case files should use stable blob paths such as `artifacts/chest-pain/initial-ekg.png`.

## Verification

After deployment:

- Open the App Service URL and select a case.
- Confirm the homepage shows only the Jane Kim pilot case unless demo mode is enabled.
- Ask a general history question.
- Ask a sensitive but medically necessary question from `docs/GUARDRAIL_TEST_CHECKLIST.md`.
- Request an artifact and confirm it appears in the results panel.
- Confirm transcript writes do not occur when `CHAT_LOGGING_ENABLED=false`.
- Confirm Application Insights captures server errors without named student identity.

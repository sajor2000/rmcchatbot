# RMC Case Chatbot

Azure-first prototype for Rush Medical College AI patient simulation.

Students select the assigned pilot case, interview an AI patient, and reveal clinical artifacts such as labs or electrocardiograms during a supervised educational encounter.

## Local Development

1. Install dependencies.
2. Copy `.env.example` to `.env.local`.
3. Run the development server.

The app includes a local mock patient responder when Azure OpenAI settings are not configured. This keeps local UI testing and Playwright coverage available without cloud credentials.

## Environment

See `.env.example` for all settings.

- Azure OpenAI / Foundry powers production patient responses. The primary deployment is `rmc-patient-gpt-4-1` on `gpt-4.1`; use `gpt-4.1-mini` only for cost testing.
- Azure Blob Storage is used for source PDFs, artifacts, and optional de-identified transcript snapshots.
- `CHAT_LOGGING_ENABLED` defaults to `false`.
- `RMC_CASE_LIBRARY_MODE` defaults to `pilot`, which shows only the Jane Kim case for real testing.
- Set `RMC_CASE_LIBRARY_MODE=demo` to show all configured demo cases during local development or faculty review.
- `RMC_PILOT_CASE_IDS` defaults to `jane-kim-withdrawal` and can be set to a comma-separated list when the pilot expands.

## Case Content

Case files live in `src/content/cases/`. The default student-facing pilot shows Jane Kim only; the other configured cases remain available in demo mode for development and future faculty review. Faculty PDFs are converted into structured case files; runtime PDF parsing and retrieval-augmented generation are intentionally deferred for the MVP.

Optional local PDF extraction uses Docling:

```bash
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install --upgrade pip
python3 -m pip install -r requirements-ingest.txt
python3 scripts/extract_case_pdf.py "/path/to/faculty-case.pdf"
```

The script defaults Docling to CPU for reliable local extraction on Apple Silicon. It writes Markdown, JSON, and a `*.case-extraction.md` worksheet. Use those outputs to extract clinical H&P, student-facing Q&A, results, and faculty-only teaching points into the structured case schema.

## Style

The app follows `docs/STYLE_GUIDE.md` for Rush colors, typography, chat bubbles, tone, and accessibility rules.

## Verification

Run the checks before deployment:

- TypeScript check
- Unit tests
- Production build
- Playwright workflow tests
- `npm run test:e2e` runs pilot mode first, then demo mode to confirm hidden cases remain available for development.

Manual Azure integration testing should follow `docs/GUARDRAIL_TEST_CHECKLIST.md`.

Real-testing readiness requires Azure credentials and a passing Jane Kim live prompt battery. Local mock responses are useful for UI development but do not prove Foundry guardrail behavior.

## Azure Deployment

Deploy the nonproduction Azure Web App with:

```bash
npm run deploy:azure
```

The script provisions/configures the Linux App Service, sets App Service settings from Azure resources, uploads Jane Kim artifact JSON blobs, and zip-deploys the app without local `.env` files.

## Azure Budget

Estimate per-chat, per-student, and cohort token spend with the current Azure OpenAI pricing assumptions:

```bash
npm run budget:azure -- --students 120 --chats-per-student 1
```

See `docs/AZURE_DEPLOYMENT.md` for the pricing source, assumptions, and conservative scenario.

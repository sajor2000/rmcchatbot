# RMC Case Chatbot

Rush Medical College patient-simulation prototype for supervised medical-student case practice.

Students select an assigned case, interview an AI patient, and open structured chart artifacts such as vital signs, exams, laboratory results, imaging, or clinical notes. The current production pilot centers on the Jane Kim opioid-withdrawal case. Jane Kim is a fictitious educational patient, not a real person, and the case content is intended to contain no protected health information (PHI). Additional cases should be added one at a time using the same structured output pattern so each new case can be reviewed, tested, and promoted without changing the app architecture.

## Current State

- Runtime app: Next.js case-chat interface with Azure OpenAI / Foundry for production patient responses.
- Current pilot case: `jane-kim-withdrawal`, titled `Muscle Aches and Nausea in the ED`; this is a fictitious no-PHI teaching case.
- Runtime source of truth: TypeScript `CaseDefinition` files in `src/content/cases/`.
- Ingestion helper: Docling and PDF text extraction run locally only; extracted outputs are reviewed by a human before becoming structured case content.
- Pilot gating: `RMC_CASE_LIBRARY_MODE=pilot` shows only case IDs listed in `RMC_PILOT_CASE_IDS`; `demo` mode shows all registered cases for local development and faculty review.

## How The App Works

The app does not use live PDF retrieval or runtime document parsing. Faculty guides are converted into structured case files before deployment.

1. A student opens the app and chooses an available case.
2. The client receives a public, client-safe case payload from `src/lib/cases.ts`.
3. The chat route builds an AI-patient system prompt from the full server-side `CaseDefinition`.
4. The model answers as the patient only, using patient-known facts and the behavior rules for that case.
5. Objective data stays in chart artifacts and is surfaced through the results/artifacts UI, not volunteered by the patient.
6. Hidden faculty-only material is available to server-side validation and prompt construction where needed, but is excluded from client-safe payloads.
7. When Azure OpenAI settings are missing, a local mock patient responder keeps UI and Playwright testing available without cloud credentials.

This boundary is intentional. The app is a simulator with curated case content, not a general document question-answering system.

## Repository Map

- `src/app/`: Next.js routes, screens, and API endpoints.
- `src/content/cases/`: structured case definitions. Jane Kim is the canonical current pattern.
- `src/lib/caseSchema.ts`: Zod schema for validating case shape and client-safe payloads.
- `src/lib/prompt.ts`: prompt construction for patient-only behavior and hidden-rule enforcement.
- `src/lib/artifacts.ts`: artifact lookup, reveal behavior, and chart-result handling.
- `src/lib/mockPatient.ts`: local deterministic responder for development and tests.
- `docs/FACULTY_CASE_GUIDE.md`: detailed faculty-facing workflow for case creation.
- `docs/templates/faculty-case-worksheet.md`: worksheet used between PDF extraction and TypeScript implementation.
- `docs/templates/case-template.ts`: editable case-template reference.
- `scripts/scaffold_case.ts`: creates a new structured case starter from the template.
- `scripts/extract_case_pdf.py`: local Docling-based extraction helper for PDF faculty guides.
- `scratch/`: local extraction outputs; keep this out of git.

## Case Model

Each case is a `CaseDefinition`. Keep new cases compatible with Jane Kim unless there is a clear educational reason to extend the schema.

- `id`: stable URL/config identifier, for example `jane-kim-withdrawal`.
- `title`: student-facing case title.
- `course`: Rush course or clerkship label.
- `setting`: clinical context, such as emergency department psychiatric evaluation.
- `patientDisplayName`: patient name shown to learners.
- `chiefConcern`: student-facing presenting concern.
- `tileDescription`: short card text for the case picker.
- `sourcePdfBlobPath`: optional Azure Blob path for source material tracking.
- `persona`: patient demographics and role-playing frame.
- `patientBehavior`: how the patient opens, discloses sensitive history, handles uncertainty, and redirects objective-data requests.
- `patientFacts`: patient-known history, anticipated learner questions, and answer groups. This is where clinical H&P belongs when the patient could know it.
- `artifacts`: chart-only objective material, such as toxicology, vital signs, physical exam, imaging, electrocardiogram, or mental status exam.
- `hidden`: diagnosis, faculty teaching points, forbidden reveal terms, and validation prompts. This must not be exposed to the learner as patient dialogue.
- `feedbackRubric`: optional student-performance categories for downstream assessment.

Use the Jane Kim case as the reference split:

- Patient-known H&P: opioid exposure timeline, symptoms, employment/family context, sensitive history, and denials the patient can report.
- Chart artifacts: toxicology results, vital signs, physical exam, and mental status exam.
- Hidden material: severe opioid use disorder diagnosis, teaching rationale, and faculty guidance.

## Adding One New Case

Add cases as small, reviewable increments. One clean case is more useful than several loosely extracted drafts.

1. Save the source faculty guide outside git.
   - Use a clean PDF or Word export.
   - Do not commit source PDFs, Docling output, local virtual environments, scratch files, or any material containing PHI.
   - If a source document contains real patient information, de-identify it before extraction and do not place it in this repository.

2. Run local extraction when helpful.

```bash
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install --upgrade pip
python3 -m pip install -r requirements-ingest.txt
python3 scripts/extract_case_pdf.py "/path/to/faculty-case.pdf"
```

The extraction script writes Markdown, JSON, and a `*.case-extraction.md` worksheet under `scratch/docling/`. Docling is installed through `requirements-ingest.txt` and must stay out of `package.json`.

If Docling fails on a PDF, use `pdftotext` or re-export the PDF. Do not build a case from a corrupted or partial source.

3. Fill the worksheet.
   - Start from `docs/templates/faculty-case-worksheet.md`.
   - Extract clinical H&P, relevant medical-student Q&A, objective results, and hidden faculty-only guidance.
   - Mark each item as patient-known, chart-only, or faculty-only before writing code.

4. Scaffold the case.

```bash
npm run scaffold:case -- \
  --id example-case-id \
  --patient-name "Pat Lee" \
  --title "Short Student-Facing Title" \
  --course "RMD 565 Brain, Behavior, & Cognition" \
  --setting "Clinical setting" \
  --source-pdf "source-pdfs/example.pdf"
```

5. Replace scaffold placeholders in the generated file.
   - Put H&P that the patient can know in `patientFacts`.
   - Put common student prompts and grounded answers in `anticipatedQuestions`.
   - Put reusable semantic response coverage in `answerGroups`.
   - Put objective results in `artifacts`.
   - Put diagnosis, teaching points, and validation-only material in `hidden`.

6. Register the case.
   - Export it from `src/content/cases/index.ts`.
   - Ensure `src/lib/cases.ts` validates it through `caseSchema`.
   - Keep it out of `RMC_PILOT_CASE_IDS` until faculty review approves it for pilot use.

7. Add targeted tests when the case introduces new behavior.
   - At minimum, ensure the case validates.
   - Verify public/client-safe payloads exclude `patientFacts` and `hidden`.
   - Verify artifact summaries are visible without leaking full chart contents unless requested through the artifacts/results panel.
   - Verify the patient prompt does not reveal diagnosis, teaching points, or chart-only results.

8. Faculty review and promote.
   - Run local checks.
   - Review the case with faculty against the source guide.
   - Add the case ID to `RMC_PILOT_CASE_IDS` only after signoff.

## New Case Output Checklist

Every new case should produce the same kind of usable output as Jane Kim:

- A patient-only persona with realistic disclosure style.
- A complete clinical H&P, separated into patient-known and chart-only material.
- Anticipated medical-student Q&A grounded in the faculty guide.
- Objective artifacts for clinical results, exam findings, and other chart data.
- Hidden diagnosis and teaching content that never appears in student-facing payloads.
- Validation prompts that probe likely leaks, missing H&P details, and objective-data handling.
- A clean case tile and case metadata for the library.
- Passing TypeScript, unit, and lint checks.

## Environment

See `.env.example` for all settings.

- `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_DEPLOYMENT`, and related values enable production model calls.
- The primary Azure OpenAI deployment is `rmc-patient-gpt-4-1` on `gpt-4.1`; use `gpt-4.1-mini` only for cost testing.
- Azure Blob Storage can hold source PDFs, artifact JSON blobs, and optional de-identified transcript snapshots.
- `CHAT_LOGGING_ENABLED` defaults to `false`.
- `RMC_CASE_LIBRARY_MODE=pilot` shows approved pilot cases only.
- `RMC_CASE_LIBRARY_MODE=demo` shows all registered demo cases.
- `RMC_PILOT_CASE_IDS` defaults to `jane-kim-withdrawal` and can be set to a comma-separated list as the pilot expands.

## Local Development

```bash
npm install
cp .env.example .env.local
npm run dev
```

The mock patient path works without Azure credentials. Use it for UI development, case-library checks, and local test coverage. Use Azure credentials before claiming live-prompt or deployment readiness.

## Verification

Run these before calling TypeScript or case-content work complete:

```bash
npm run typecheck
npm test
npm run lint
```

Run the production build before deployment or release packaging:

```bash
npm run build
```

Run Playwright workflow tests when UI behavior, case selection, artifact reveal behavior, or route behavior changes:

```bash
npm run test:e2e
```

Run live prompt validation only with Azure credentials configured:

```bash
npm run test:live-prompts
```

Manual Azure integration testing should follow `docs/GUARDRAIL_TEST_CHECKLIST.md`.

## Deployment

Deploy the nonproduction Azure Web App with:

```bash
npm run deploy:azure
```

The script provisions/configures the Linux App Service, sets App Service settings from Azure resources, uploads Jane Kim artifact JSON blobs, and zip-deploys the app without local `.env` files.

Estimate per-chat, per-student, and cohort token spend with:

```bash
npm run budget:azure -- --students 120 --chats-per-student 1
```

See `docs/AZURE_DEPLOYMENT.md` for the pricing source, assumptions, and conservative budget scenario.

## Design Rules For Future Growth

- Keep the app schema stable and evolve it only when multiple real cases need the same new field.
- Prefer one faculty-reviewed case at a time over bulk ingestion.
- Do not use faculty PDFs directly at runtime for the MVP.
- Do not invent clinical negatives, sensitive history, or objective results that are not grounded in source material.
- Use fictitious or fully de-identified educational patients only; do not store PHI in case files, artifacts, transcripts, screenshots, scratch outputs, or committed docs.
- Keep objective data in artifacts, not patient dialogue.
- Keep diagnosis and teaching rationale in `hidden`.
- Keep source PDFs, extraction outputs, `.venv/`, `.next/`, `node_modules/`, `scratch/`, and secrets out of git.
- Treat Jane Kim as the canonical first case until a second faculty-approved case proves a better pattern.

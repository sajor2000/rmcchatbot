# RMC Chatbot Agent Guide

## Scope

This repository contains the Rush Medical College case-chatbot prototype. Keep changes focused on the app, case content, extraction tooling, deployment docs, and tests.

## Working Rules

- Preserve the production/runtime split: the app uses structured TypeScript case files at runtime; Docling and PDF extraction are local ingestion helpers only.
- Keep source PDFs, Docling outputs, local virtual environments, build output, and secrets out of git.
- Do not commit `.env`, `.env.local`, `.venv/`, `.next/`, `node_modules/`, `scratch/`, `test-results/`, `playwright-report/`, `__pycache__/`, or `*.pyc`.
- Use patient-only persona behavior for simulator cases. Patients may answer patient-known history but must not teach, diagnose, interpret chart data, or reveal hidden faculty reasoning.
- Put clinical H&P and patient-known answers in `patientFacts`, chart-only results in `artifacts`, and diagnosis/teaching rationale in `hidden`.
- When adding case content, include anticipated medical-student Q&A only when grounded in the source document. Do not invent clinical negatives or sensitive history.
- Objective data requests should surface through the artifact/results panel, not through patient dialogue.

## Verification

Before calling TypeScript or app work complete, run:

```bash
npm run typecheck
npm test
npm run lint
```

Run `npm run build` before deployment or publishing a release-ready branch.

## Optional PDF Ingestion

Docling is installed locally through `requirements-ingest.txt` and should remain outside the app runtime dependency graph.

```bash
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install -r requirements-ingest.txt
python3 scripts/extract_case_pdf.py "/path/to/faculty-case.pdf"
```

Review the generated Markdown, JSON, and case-extraction worksheet under `scratch/docling/` before mapping content into `src/content/cases/`.

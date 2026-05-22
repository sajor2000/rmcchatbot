# Faculty Case Guide

## Source Material

Provide clean PDFs or Word documents that focus on the case vignette, patient history, and objective artifacts. PDFs are preferred for source archiving, but the MVP uses structured TypeScript case files derived from the documents.

## Pilot Case Workflow

Use the same workflow for each new case in the 15-20 case pilot:

1. Save the faculty source PDF or Word file.
2. Fill out `docs/templates/faculty-case-worksheet.md`.
3. Run `npm run scaffold:case` to create a TypeScript case file with the standard Jane Kim-derived structure.
4. Replace every `TODO_CASE_SPECIFIC` placeholder with faculty-reviewed case content.
5. Add the new case export to `src/content/cases/index.ts` using the import and registry entry printed by the scaffold command.
6. Add the case ID to `RMC_PILOT_CASE_IDS` only after faculty agrees it is ready for real testing.
7. Run `npm run typecheck`, `npm run lint`, and `npm test`.
8. Run the app with Azure credentials and run `npm run test:live-prompts`.
9. Send the case back for faculty signoff if validation finds missing positives, negatives, sensitive history, objective artifacts, semantic-answer aliases, or leakage terms.

Example scaffold command:

```bash
npm run scaffold:case -- --id abdominal-pain --patient-name "Pat Lee" --title "Abdominal Pain in Clinic" --course "RMD 565 Brain, Behavior, & Cognition" --setting "Primary care clinic" --source-pdf "source-pdfs/rmd-565-abdominal-pain.pdf"
```

The scaffold command creates `src/content/cases/<caseId>Case.ts` and prints the exact import and `caseDefinitions` entry to add manually. It does not auto-register the case and does not add the case to pilot mode.

The initial real-testing configuration is `RMC_CASE_LIBRARY_MODE=pilot` and `RMC_PILOT_CASE_IDS=jane-kim-withdrawal`. Set `RMC_CASE_LIBRARY_MODE=demo` only when reviewing non-pilot demo cases.

## Optional Docling Extraction

Docling can be used as a local-only helper to convert faculty PDFs into Markdown and JSON before writing the structured case file. It is not a runtime dependency for the chatbot.

Install:

```bash
python3 -m venv .venv
source .venv/bin/activate
python3 -m pip install --upgrade pip
python3 -m pip install -r requirements-ingest.txt
```

Extract:

```bash
python3 scripts/extract_case_pdf.py "/path/to/faculty-case.pdf"
```

The script defaults Docling to CPU because Apple Silicon MPS can fail on some layout-model operations. Review the generated Markdown, JSON, and `*.case-extraction.md` worksheet in `scratch/docling/`, then map the clinical H&P into `patientFacts`, patient realism into `patientBehavior`, objective results into `artifacts`, student-facing questions into `patientFacts.anticipatedQuestions`, semantic paraphrases into `patientFacts.answerGroups`, and faculty-only diagnosis, reasoning, forbidden response terms, and validation prompts into `hidden`.

## What Makes a Strong Case

Include:

- Chief concern and setting
- Patient age, pronouns, and a short human background
- Positive and negative history details
- Past medical history, medications, allergies, family history, and social history
- Sensitive history when relevant, including mental health, suicidality, sexuality, and substance use
- Anticipated student questions with patient-voice answers when the source document provides the answer
- Semantic-equivalent answer groups for common paraphrases so students get the same clinical facts when they ask the same question differently
- Objective artifacts such as labs, electrocardiograms, imaging, or clinical notes
- Faculty-only diagnosis and teaching points
- Patient behavior tuning: opening statement, disclosure style, sensitive-topic style, exam-consent style, and uncertainty style
- Hidden validation prompts and forbidden response terms for live Azure testing

## Patient Persona

The patient should answer as a person, not as a clinician. Avoid wording that gives away the diagnosis or interprets objective data. If a learner asks for labs or imaging, the patient should point them to the chart or results panel.

Use `patientBehavior` to tune the same general prompt framework per case:

- `openingStatement`: what the patient says to broad "what brought you in" questions
- `disclosureStyle`: how much the patient volunteers before focused follow-up
- `sensitiveTopicStyle`: how the patient answers mental health, safety, sexual history, and substance questions
- `examConsentStyle`: how the patient responds to bedside physical-exam permission
- `uncertaintyStyle`: how the patient says they do not know chart-only data

## Artifact Setup

Each artifact needs:

- A short title
- A type: lab, electrocardiogram, imaging, or note
- Learner trigger terms, such as "EKG", "troponin", or "chest X-ray"
- A stable Azure Blob path
- A display format for the prototype

## Validation Metadata

Each pilot-ready case should include hidden validation metadata:

- `forbiddenResponseTerms`: diagnosis phrases, teaching-point phrases, and objective result values that should never appear in patient dialogue
- `validationPrompts`: high-yield case-specific prompts with the expected mode:
  - `azure` for normal patient interview questions
  - `objective-data-redirect` for labs, vitals, imaging, ECG, toxicology, or documented physical exam findings
- `answerGroups`: canonical questions, aliases, required response terms, and forbidden response terms for semantically similar interview questions

The reusable live battery combines shared H&P prompts with each case's validation prompts and every answer-group alias. Registered cases fail validation if any `TODO_CASE_SPECIFIC` placeholder remains or if no semantic answer group is present.

## Review Checklist

Faculty review should confirm:

- The patient answers common history questions accurately.
- The patient does not reveal the diagnosis.
- Sensitive topics are answered clinically and respectfully.
- Objective data appears in the results panel rather than patient dialogue.
- Missing positive or negative details are added back to the source case.
- `npm run test:live-prompts` passes against the Azure deployment.

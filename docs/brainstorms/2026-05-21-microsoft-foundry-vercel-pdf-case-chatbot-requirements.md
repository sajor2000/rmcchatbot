---
date: 2026-05-21
topic: microsoft-foundry-vercel-pdf-case-chatbot
---

# Microsoft Foundry Vercel PDF Case Chatbot

## Summary

Build a lightweight AI patient simulator for Rush medical education. Students select a faculty-authored case, interview a patient persona through text chat, and request or reveal clinical artifacts such as labs, electrocardiograms, and imaging during the encounter.

The MVP should prove classroom access, case realism, and educational usefulness with 1-2 cases before adding institutional login, production Rush URL workflows, voice, or learner-specific tracking.

---

## Problem Frame

Rush medical education faculty want a reliable way for students to practice clinical history-taking and diagnostic reasoning with AI patient personas. The current Copilot Studio workflow creates friction in live teaching because sharing through Teams can be unreliable, the UI is limited for clinical artifacts, and safety filtering can block medically necessary topics such as depression, suicidality, sexuality, and substance use.

The near-term need is a supervised educational prototype that faculty can test quickly and share more reliably than the current Copilot Studio flow. The product should support realistic clinical dialogue and case-based artifact reveal without becoming a full assessment platform or institutional production system before the prototype has been validated.

---

## Actors

- A1. Medical student: Selects an assigned case, interviews the AI patient, and requests clinical data during the encounter.
- A2. Clinical educator: Facilitates live sessions, assigns or directs learners to cases, and debriefs the reasoning process.
- A3. Faculty case owner: Provides and revises case source materials, including vignettes and objective artifacts.
- A4. Technical build owner: Maintains the prototype, configures model behavior, and supports faculty review.
- A5. Institutional reviewer: Later evaluates cybersecurity, access, compliance, and production-readiness needs.

---

## Key Flows

- F1. Student starts a case
  - **Trigger:** A student opens the prototype during a teaching session or assigned practice activity.
  - **Actors:** A1, A2
  - **Steps:** The student opens the app, reviews available case tiles, selects the assigned case, and enters the chat encounter.
  - **Outcome:** The selected case launches with the correct patient persona and available artifact panel.
  - **Covered by:** R1, R2, R3, R11

- F2. Student interviews the patient
  - **Trigger:** The student asks a natural-language clinical question.
  - **Actors:** A1
  - **Steps:** The chatbot interprets the question, answers in the patient voice, uses case-grounded information, and withholds diagnosis or objective data unless appropriate.
  - **Outcome:** The student receives a patient-consistent answer that supports history-taking without spoiling the case.
  - **Covered by:** R4, R5, R6, R7, R13

- F3. Student requests objective data
  - **Trigger:** The student asks for labs, an electrocardiogram, imaging, or another clinical artifact.
  - **Actors:** A1, A2
  - **Steps:** The system determines whether the requested artifact is available and appropriate to reveal, then displays it in the clinical artifact area or indicates that it is not available yet.
  - **Outcome:** The learner can incorporate objective data into diagnostic reasoning without the patient persona unnaturally narrating the result.
  - **Covered by:** R8, R9, R10

- F4. Faculty reviews and updates a case
  - **Trigger:** Faculty provide a new case PDF or revise an existing case after testing.
  - **Actors:** A3, A4
  - **Steps:** The faculty case owner supplies clean source material, the technical build owner maps it into the prototype's case format, and faculty test the resulting persona and artifacts.
  - **Outcome:** Case content can be revised with limited engineering effort and without rebuilding the product concept.
  - **Covered by:** R12, R14, R15

---

## Requirements

**Case experience**
- R1. The MVP shall present at least 1-2 case tiles that a learner can select from a web interface.
- R2. Each case shall launch a distinct patient persona based on faculty-provided source material.
- R3. The case selection experience shall support classroom use where a facilitator can direct learners to a specific case.

**Patient chat behavior**
- R4. The MVP shall provide a text-based chat interface for student-patient interaction.
- R5. The chatbot shall answer as the patient, using patient-appropriate language rather than clinician-facing explanations.
- R6. The chatbot shall avoid revealing the final diagnosis, teaching points, or objective test results unless the case design makes that information appropriate.
- R7. The chatbot shall support flexible natural-language questions rather than requiring exact phrase matching.
- R8. The chatbot shall support medically necessary sensitive history topics in an educationally appropriate way, including mental health, suicidality, sexuality, and substance use.

**Clinical artifacts**
- R9. The MVP shall support display of objective artifacts such as labs, electrocardiograms, X-rays, imaging, or similar case materials.
- R10. Artifact reveal may be triggered by learner request, defined case progression, or facilitator workflow design.
- R11. Objective artifacts shall be displayed outside the patient voice so that the patient does not unnaturally narrate clinician-only data.

**Faculty content workflow**
- R12. Faculty source materials shall be accepted as clean case PDFs, with Word documents allowed as a secondary source format.
- R13. Case source materials should include relevant positive and negative history details so the patient persona can answer common history-taking questions realistically.
- R14. The prototype shall support growth from the initial 1-2 cases to an approximately 15-20 case pilot set.
- R15. Yearly case updates should require limited technical support and should not require a full product rebuild.

**Access, deployment, and evaluation**
- R16. The MVP shall be easy to share and test outside the current Copilot Studio and Teams sharing limitations.
- R17. The MVP shall not require named student login or persistent learner profiles.
- R18. The design shall allow later addition of institutional login, Rush URL migration, and cybersecurity review without making those requirements part of MVP acceptance.
- R19. The MVP may store de-identified or non-user-specific chat histories by case or session date to support feasibility review, faculty quality review, or future IRB-backed learner feedback.
- R20. The model and platform direction shall prefer Microsoft Foundry and HIPAA-supportive deployment options where feasible for institutional alignment.

---

## Acceptance Examples

- AE1. **Covers R1, R2, R3.** Given a learner opens the demo during class, when they select the assigned case tile, the app starts the correct patient encounter without requiring a Teams channel or named learner account.
- AE2. **Covers R5, R6, R7.** Given a learner asks, "Have you had any thoughts of hurting yourself?" in a case where that history is relevant, when the chatbot responds, it answers in the patient voice with case-grounded detail and does not block the topic solely because it is sensitive.
- AE3. **Covers R6, R9, R10, R11.** Given a learner asks for an electrocardiogram, when the case design allows the electrocardiogram to be revealed, the result appears in the artifact area rather than being narrated as if the patient interpreted it.
- AE4. **Covers R12, R13, R14, R15.** Given faculty revise a case PDF to add missing negative review-of-systems detail, when the prototype is updated for the next review round, the chatbot can answer those newly covered questions without changing the overall product workflow.
- AE5. **Covers R17, R19.** Given a classroom session uses the MVP, when chat histories are saved for feasibility review, they are not tied to named student identities.

---

## Success Criteria

- A Vercel-hosted prototype supports 1-2 demo cases end-to-end by August 1, 2026.
- Faculty judge patient responses as directionally correct, case-grounded, and useful for teaching clinical reasoning.
- Students can access the prototype more reliably than the current Copilot Studio sharing flow.
- At least one demo case includes a clinical artifact reveal that supports diagnostic reasoning.
- The pilot path can reasonably scale to 3 courses and approximately 15-20 cases.
- Annual hosting and token costs are expected to remain below $1,000 during the initial pilot.
- The requirements are specific enough for implementation planning to proceed without inventing the MVP product boundary.

---

## Scope Boundaries

### Deferred for later

- Institutional login, Rush production URL migration, and full cybersecurity workflow.
- Individual learner profiles, longitudinal progress tracking, grading, or personalized coaching.
- Voice-first classroom workflows.
- Advanced retrieval or semantic search, unless prompt-plus-structured case content proves too brittle.
- Full analytics dashboards beyond lightweight, de-identified feasibility logging.
- Faculty self-service case authoring UI.

### Outside this product's identity

- A general-purpose medical chatbot for unsupervised patient care.
- A replacement for faculty facilitation, case debriefing, or clinical reasoning instruction.
- A high-stakes assessment platform for grading individual students in the MVP phase.
- A complete electronic health record simulator.

---

## Key Decisions

- Prototype before institutional production hardening: The immediate value is proving access, realism, and educational usefulness before entering slower Rush URL and cybersecurity workflows.
- Educational simulator before assessment system: The MVP focuses on practice and debriefing, not grading or learner-specific tracking.
- Text chat before voice: Text is more reliable for early classroom testing and avoids noisy-room voice constraints.
- Prompt-plus-structured case content before retrieval: Starting simpler keeps the demo cheap and easier to revise; retrieval remains available if case variability or answer fidelity requires it.
- Sensitive-topic support is framed as educational appropriateness: The product should reduce false positives for required medical topics while maintaining appropriate medical education guardrails.

---

## Dependencies / Assumptions

- Faculty will provide clean initial case PDFs or equivalent source documents.
- Source cases will include enough positive and negative findings to support realistic history-taking.
- Initial use will occur in supervised educational settings rather than unsupervised public use.
- Microsoft Foundry can provide a more controllable model workflow than Copilot Studio for this use case.
- Vercel is acceptable for prototype hosting and sharing before institutional production review.
- Any stored chat logs will be de-identified or non-user-specific unless a later IRB and institutional review process approves more detailed tracking.

---

## Outstanding Questions

### Deferred to Planning

- [Affects R8, R20][Needs research] What Foundry configuration and policy path best supports medically necessary sensitive topics without excessive educational false positives?
- [Affects R19][Technical] Should lightweight de-identified chat logging be enabled in the first demo, feature-flagged, or omitted until IRB direction is clearer?
- [Affects R9, R10, R11][Technical] What artifact reveal mechanism should the first demo implement: explicit learner request, case progression gates, facilitator-controlled reveal, or a minimal combination?
- [Affects R12, R13, R15][Technical] What case representation is simplest for faculty review while still grounding the chatbot reliably?
- [Affects R16, R18, R20][Needs research] What Vercel and Microsoft Foundry deployment settings are appropriate for a prototype that may later move through Rush institutional review?

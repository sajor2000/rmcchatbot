# Azure Responsible AI Exception Request: Selfharm Content Filter

**Application:** RMC Case Chatbot  
**Request type:** Modified content filtering — disable Selfharm input-filter blocking on Prompt source  
**Submission portal:** https://aka.ms/oai/rai/exceptions  
**Status:** Pending submission

---

## 1. Request Summary

The RMC Case Chatbot is a supervised medical education patient simulator built for Rush Medical College. Medical students must ask direct suicidal ideation and self-harm screening questions as part of standard psychiatric evaluation training — for example, "Have you thought about killing yourself?" and "Do you have a plan to hurt yourself?" These are required clinical competency questions, not harmful content.

The current content filter policy, `rmc-medical-education-filter`, sets the Selfharm filter to `severityThreshold: High` with `blocking: true` on the Prompt source. Attempts to set `blocking: false` on this filter without modified content-filter permission returned the error:

> Policy does not have necessary permission to override base policy. Please check aka.ms/oai/rai/exceptions

This exception request asks Microsoft to grant the `rua-nonprod-ai-innovation` Azure OpenAI resource modified content-filter permission so that the `rmc-medical-education-filter` policy can disable Selfharm input blocking on the Prompt source for the `rmc-patient-gpt-4-1` deployment.

The model is already constrained by a system prompt and application-layer code that prevent harmful output. The exception is needed only on the input (Prompt) side so that student-typed screening questions are not intercepted before reaching the model.

---

## 2. Resource and Deployment Details

| Field | Value |
|---|---|
| Subscription ID | `e5282183-61c9-4c17-a58a-9442db9594d5` |
| Resource group | `RU-A-NonProd-AI-Innovation-RG` |
| Azure OpenAI resource | `rua-nonprod-ai-innovation` |
| Deployment name | `rmc-patient-gpt-4-1` |
| Model | `gpt-4.1` (version `2025-04-14`, SKU `GlobalStandard`) |
| Content filter policy | `rmc-medical-education-filter` |
| Region | East US (or resource-assigned region) |

---

## 3. Business Justification

### What the application does

The RMC Case Chatbot simulates a standardized patient for Rush Medical College clinical education. Students interact with a fictional AI patient by typing history-and-physical interview questions in natural clinical language. The model responds in first-person patient voice, grounded in a fixed set of fictitious case facts. The app does not generate care recommendations, provide clinical advice to real patients, or involve any real patient data.

### Why self-harm screening questions are required

Suicidal ideation and self-harm screening is a core competency in every psychiatric evaluation curriculum. The Columbia Suicide Severity Rating Scale (C-SSRS), PHQ-9, and standard H&P training all require students to ask these questions directly and plainly:

- "Have you thought about killing yourself?"
- "Do you have a plan to hurt yourself?"
- "Have you ever hurt yourself on purpose?"
- "Do you feel safe?"

A medical student who cannot practice these questions in a simulator will not know how to ask them with a real patient. Blocking these inputs undermines the stated purpose of the tool and creates a gap in clinical training.

### Specific use case blocked by the current filter

The Jane Kim case (course: RMD 565 Brain, Behavior, and Cognition) requires students to complete a psychiatric and substance-use history-and-physical. The case facts explicitly include a negative suicidal ideation finding — Jane Kim denies SI. The AI patient is supposed to respond "No" when asked about thoughts of self-harm. The Selfharm input filter can intercept the student's question before it reaches the model, preventing the educational exchange entirely.

---

## 4. Safety Mitigations Already in Place

The following controls reduce risk independent of the Selfharm input filter.

### 4.1 System prompt role lock

Every request includes a structured system prompt (`buildPatientSystemPrompt`) that enforces strict constraints:

- **Role Lock:** "You are an AI patient simulator for supervised Rush Medical College education. Stay in first-person patient voice. Do not speak as a clinician, teacher, narrator, or assistant."
- **Sensitive-Topic Behavior:** "Medically necessary questions about depression, suicidality, sexuality, and substance use are allowed in this supervised education scenario. Answer sensitive questions calmly, directly, and only with the case facts above."
- **Hidden-Content Prohibitions:** The model is explicitly instructed never to reveal hidden diagnoses or generate content outside the case facts.
- **Objective-Data Boundary:** The model cannot narrate lab results, vital signs, or clinician findings — only patient-known subjective experience.

The system prompt is built programmatically from the case definition and is not user-configurable.

### 4.2 Application-layer clinical framing prefix

Before sensitive screening questions reach the API, the app automatically prepends a clinical education framing prefix to the user message:

```
[Supervised medical-education patient interview – clinically required screening question] <original message>
```

This prefix is applied by `toModelMessages()` in `src/lib/prompt.ts` whenever the user message matches the sensitive clinical pattern:

```
/suicid|kill(ing)?\s*(your|my)self|self.?harm|hurt(ing)?\s*(your|my)self|end(ing)?\s*(your|my)\s*life|wanting\s*to\s*die|thoughts?\s*of\s*death|homicid|harm(ing)?\s*(others|someone)/i
```

This is the primary current workaround. It resolves most filter interceptions but does not constitute belt-and-suspenders protection at the policy layer.

### 4.3 Case-level fallback for filter-blocked responses

If the Azure API still returns a content filter error after framing, the application catches the error in `createPatientChatResponse()` and attempts to serve the correct case-grounded answer from local case facts (`findCaseAnswerForSensitiveQuestion`). If no case fact matches, it returns a generic rephrasing prompt. The student never sees a raw API error.

### 4.4 Completion-side filter remains active

This exception request targets only the **Prompt (input) source**. The Selfharm filter on the **Completion (output) source** would remain enabled at `severityThreshold: High` with `blocking: true`. The model's own case-constrained responses about self-harm (always negative denials per case facts) are well within the High threshold and will not trigger the completion filter.

All other filter categories — Hate, Violence, Sexual, Jailbreak, Protected Material Text, and Protected Material Code — remain fully enabled and are not part of this exception request.

### 4.5 Restricted access — enrolled students only

Access to the app is restricted to enrolled Rush Medical College students in supervised course settings. There is no public registration, no anonymous access, and no public-facing URL advertised outside of course materials. The deployment URL is `https://rmc-case-chatbot-nonprod.azurewebsites.net` and is shared only within course administration channels.

### 4.6 No PHI involved

All patient cases are entirely fictitious. No real patient data, no real names, no real medical records, and no Protected Health Information (PHI) are used anywhere in the system. Case facts are written and reviewed by Rush Medical College faculty before being added to the codebase.

### 4.7 Faculty supervision and course context

Use occurs within structured course assignments. Faculty review case content before deployment. Students interact with the simulator as a learning activity, not a clinical tool. The app header and onboarding copy make the educational and simulated nature of the patient explicit.

### 4.8 Prompt Shields remain enabled

Jailbreak detection and indirect prompt injection detection remain enabled and blocking for all prompts. These are not affected by this exception request.

---

## 5. How to Submit the Exception Request

1. Navigate to https://aka.ms/oai/rai/exceptions and sign in with a Rush Microsoft account that has Owner or Contributor rights on subscription `e5282183-61c9-4c17-a58a-9442db9594d5`.

2. Select **Request modified content filtering**.

3. Fill in the form fields as follows:

   | Form field | Value to enter |
   |---|---|
   | Subscription | `e5282183-61c9-4c17-a58a-9442db9594d5` |
   | Azure OpenAI resource | `rua-nonprod-ai-innovation` |
   | Use case category | Medical education / clinical training simulation |
   | Description | See the text block in section 5.1 below |

4. Attach or paste the Business Justification and Safety Mitigations from sections 3 and 4 of this document if the form provides a free-text area.

5. Submit and record the case or ticket number here for tracking:  
   **Exception ticket:** _(fill in after submission)_

6. Microsoft typically responds within 10 business days. Check the submitted email address for a decision or request for more information.

### 5.1 Suggested exception request description

Copy and paste this text into the form's description field:

> We are building a supervised medical education patient simulator for Rush Medical College (RMC Case Chatbot). Medical students must practice asking required psychiatric history questions — including direct suicidal ideation and self-harm screening — as a clinical competency. The AI model plays a fictitious patient who denies SI per fixed case facts. The Selfharm input filter blocks student questions such as "Have you thought about killing yourself?" before they reach the model, interrupting the educational interaction.
>
> We are requesting modified content filtering to disable Selfharm blocking on the Prompt source for the `rmc-patient-gpt-4-1` deployment (gpt-4.1) on the `rua-nonprod-ai-innovation` resource, subscription `e5282183-61c9-4c17-a58a-9442db9594d5`.
>
> Mitigations in place: (1) system prompt enforces strict patient-voice-only role lock and constrains all answers to fixed fictitious case facts; (2) app layer prepends a supervised clinical education framing prefix to all sensitive screening questions before they reach the API; (3) completion-side Selfharm filter, Jailbreak detection, and all other category filters remain fully enabled; (4) access is restricted to enrolled Rush Medical College students in supervised course settings; (5) no PHI is used — all cases are fictitious.

---

## 6. Target Policy Configuration After Approval

Once Microsoft grants modified content-filter permission for `rua-nonprod-ai-innovation`, update the `rmc-medical-education-filter` policy in Azure AI Foundry with the following configuration.

The only change from the current policy is setting `blocking: false` on the Selfharm Prompt source. Everything else stays the same.

### 6.1 Policy intent table

| Category | Source | Threshold | Blocking |
|---|---|---|---|
| Hate | Prompt | High | true |
| Hate | Completion | High | true |
| Violence | Prompt | High | true |
| Violence | Completion | High | true |
| Sexual | Prompt | High | true |
| Sexual | Completion | High | true |
| Selfharm | Prompt | High | **false** (changed from true) |
| Selfharm | Completion | High | true |
| Jailbreak | Prompt | — | true (enabled) |
| Protected Material Text | Completion | — | true (enabled) |
| Protected Material Code | Completion | — | true (enabled) |

### 6.2 Notes on the configuration

- The Selfharm threshold on the Prompt source stays at `High`. This means only content rated at the highest severity level would be flagged; clinical screening questions asked in educational context will score well below that threshold. Blocking is disabled so that a High-severity match flags the event but does not block the request.
- The Selfharm threshold and blocking on the Completion source remain unchanged (`High`, `blocking: true`). The model's own denial responses are well within threshold and will never trigger this filter.
- If Azure AI Foundry allows setting the Selfharm Prompt source to a completely permissive mode (no filter, not just non-blocking), that is also acceptable given the application-layer controls, but non-blocking at High threshold is the minimum needed.
- Do not change Jailbreak, Protected Material, or any other category as part of this update.

### 6.3 Verification step after policy update

After applying the updated policy, run the live prompt battery against the Azure deployment to confirm that self-harm screening questions pass without triggering the filter or the application fallback:

```bash
npm run test:live-prompts
```

Confirm that responses for SI screening questions return with `X-RMC-Model-Mode: azure` (indicating the model responded directly) rather than `azure-content-filter-case-fallback` or `azure-content-filter-fallback`. Refer to `docs/GUARDRAIL_TEST_CHECKLIST.md` for the full list of test prompts and expected outcomes.

---

## 7. Current Workaround Status

The clinical framing prefix (section 4.2) is active in production code as of the initial deployment. It resolves the majority of Selfharm filter interceptions. The policy exception is belt-and-suspenders: it eliminates the need for the application to carry responsibility for filter bypass logic and ensures that a future prompt phrasing not covered by the regex pattern does not unexpectedly block a student's required screening question.

If the exception request is denied, the clinical framing prefix remains in place and the application continues to handle filter-blocked responses via the case-fallback and generic-fallback paths. Document the denial outcome and any Microsoft guidance here:

**Denial outcome / Microsoft guidance:** _(fill in if applicable)_

---

_Document created: 2026-05-24. Update the Status field and ticket/denial fields after submission._

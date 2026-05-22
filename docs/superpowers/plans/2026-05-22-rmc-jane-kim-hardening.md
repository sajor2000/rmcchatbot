# RMC Jane Kim Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Jane Kim the only default student-facing case for real testing while preserving demo cases behind an explicit flag.

**Architecture:** Add a small case-library visibility layer in the existing cases module. Route homepage, case pages, API handlers, and live prompt battery through visible-case helpers while preserving the full registered case list for validation and demo mode.

**Tech Stack:** Next.js App Router, TypeScript, Vitest, Playwright, Azure OpenAI/Azure Blob configuration.

---

### Task 1: Visibility Config And Case Helpers

**Files:**
- Create: `src/lib/caseLibraryConfig.ts`
- Modify: `src/lib/cases.ts`
- Test: `src/lib/cases.test.ts`

- [x] Add `caseLibraryMode()` returning `pilot` by default and `demo` only when `RMC_CASE_LIBRARY_MODE=demo`.
- [x] Add `pilotCaseIds()` returning `RMC_PILOT_CASE_IDS` comma-separated values or `["jane-kim-withdrawal"]`.
- [x] Add `getVisibleCases()`, `getVisiblePublicCases()`, `getVisibleCase(caseId)`, `getVisibleSafeCaseForClient(caseId)`, `isCaseVisible(caseId)`, and `getVisibleArtifact(caseId, artifactId)`.
- [x] Add unit tests for default pilot visibility, demo visibility, pilot override, faculty-field stripping, and hidden demo lookup.

### Task 2: Route Visible Cases Everywhere

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/app/case/[caseId]/page.tsx`
- Modify: `src/app/api/chat/route.ts`
- Modify: `src/app/api/artifacts/[caseId]/[artifactId]/route.ts`
- Test: `src/app/api/apiRoutes.test.ts`

- [x] Homepage uses `getVisiblePublicCases()` and updates copy to say the assigned pilot case is shown for testing.
- [x] Case page uses `getVisibleSafeCaseForClient()` so hidden demo cases return not found.
- [x] Chat route uses `getVisibleCase()` so hidden demo cases return `404`.
- [x] Artifact route uses `getVisibleArtifact()` so hidden demo artifacts return `404`.
- [x] Add API tests for hidden demo case rejection and Jane Kim success.

### Task 3: Live Prompt Battery And Browser Tests

**Files:**
- Modify: `scripts/run_live_prompt_battery.ts`
- Modify: `playwright.config.ts`
- Replace: `tests/e2e/chatbot.spec.ts` with pilot/demo-focused e2e tests

- [x] Live prompt battery uses `getVisibleCases()` by default.
- [x] Playwright runs pilot mode on port `3107` and demo mode on port `3108` sequentially through `npm run test:e2e`.
- [x] Pilot e2e tests verify homepage shows Jane Kim only, hidden demo direct links are not found, Jane patient chat works, and Jane artifacts reveal without patient narration.
- [x] Demo e2e tests verify all cases remain available when `RMC_CASE_LIBRARY_MODE=demo`.

### Task 4: Conservative Cleanup And Docs

**Files:**
- Modify: `.gitignore`
- Modify: `.env.example`
- Modify: `README.md`
- Modify: `docs/AZURE_DEPLOYMENT.md`
- Modify: `docs/FACULTY_CASE_GUIDE.md`
- Modify: `docs/GUARDRAIL_TEST_CHECKLIST.md`

- [x] Ensure generated outputs and local secrets are ignored.
- [x] Document `RMC_CASE_LIBRARY_MODE`, `RMC_PILOT_CASE_IDS`, Jane Kim default pilot behavior, and Azure-required final readiness.
- [x] Keep `CHAT_LOGGING_ENABLED=false` in examples and docs.

### Task 5: Verification And Review

**Commands:**
- `npm run typecheck`
- `npm run lint`
- `npm test -- --run`
- `npm run build`
- `npm run test:e2e`
- `PROMPT_BATTERY_BASE_URL=<azure-or-local-url> npm run test:live-prompts` when Azure credentials/server are available

- [x] Run all local verification commands.
- [x] Capture homepage and Jane Kim browser screenshots for pilot mode.
- [x] Request code review after implementation and address Critical/Important findings.

**Verification notes:**
- `npm run typecheck`, `npm run lint`, `npm test -- --run`, and `npm run build` passed on May 22, 2026.
- `npm run test:e2e` passed after stopping the visual-QA dev server so Playwright could own the Next.js dev server.
- Visual QA screenshots are in `test-results/visual-qa/`.
- Code review Important findings were addressed by stripping artifact contents from client-safe case payloads and gating `/api/transcripts` by visible case.
- Azure live prompt battery was not run locally because Azure OpenAI environment variables were not configured in this shell.

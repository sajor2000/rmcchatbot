import { afterEach, describe, expect, it, vi } from "vitest";
import { caseDefinitions } from "@/content/cases";
import { caseLibraryMode, pilotCaseIds } from "@/lib/caseLibraryConfig";
import type { CaseDefinition } from "@/lib/caseSchema";
import {
  cases,
  getArtifact,
  getPublicCases,
  getSafeCaseForClient,
  getVisibleCase,
  getVisibleCases,
  getVisiblePublicCases,
  getVisibleSafeCaseForClient,
  isCaseVisible
} from "@/lib/cases";
import { buildLivePromptBattery, findCaseLibraryProblems } from "@/lib/caseValidation";

describe("case content", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("parses every registered case definition", () => {
    expect(caseDefinitions.map((caseDefinition) => caseDefinition.id)).toEqual(
      cases.map((caseDefinition) => caseDefinition.id)
    );
  });

  it("loads validated cases with unique ids", () => {
    const ids = new Set(cases.map((caseDefinition) => caseDefinition.id));

    expect(cases.length).toBeGreaterThanOrEqual(3);
    expect(ids.size).toBe(cases.length);
  });

  it("keeps every registered case pilot-ready for H&P interviewing", () => {
    expect(findCaseLibraryProblems(cases)).toEqual([]);
  });

  it("flags scaffold placeholders and missing semantic answer groups before registration", () => {
    const baseCase = JSON.parse(JSON.stringify(cases.find((caseDefinition) => caseDefinition.id === "jane-kim-withdrawal"))) as CaseDefinition;
    const placeholderCase = {
      ...baseCase,
      id: "placeholder-case",
      chiefConcern: "TODO_CASE_SPECIFIC: replace me"
    };
    const missingAnswerGroupsCase = {
      ...baseCase,
      id: "missing-answer-groups",
      patientFacts: {
        ...baseCase.patientFacts,
        answerGroups: []
      }
    };

    expect(findCaseLibraryProblems([placeholderCase])).toContain(
      "placeholder-case: replace all TODO_CASE_SPECIFIC placeholders before registration"
    );
    expect(findCaseLibraryProblems([missingAnswerGroupsCase])).toContain(
      "missing-answer-groups: answerGroups must include at least 1"
    );
  });

  it("allows case-level patient behavior tuning for standardized-patient realism", () => {
    for (const caseDefinition of cases) {
      expect(caseDefinition.patientBehavior?.openingStatement, caseDefinition.id).toBeTruthy();
      expect(caseDefinition.patientBehavior?.disclosureStyle, caseDefinition.id).toBeTruthy();
      expect(caseDefinition.patientBehavior?.sensitiveTopicStyle, caseDefinition.id).toBeTruthy();
      expect(caseDefinition.patientBehavior?.examConsentStyle, caseDefinition.id).toBeTruthy();
      expect(caseDefinition.patientBehavior?.uncertaintyStyle, caseDefinition.id).toBeTruthy();
    }
  });

  it("keeps faculty-only fields out of public and client-safe case payloads", () => {
    const publicCase = getPublicCases()[0];
    const safeCase = getSafeCaseForClient(publicCase.id);
    const safeCasePayload = JSON.stringify(safeCase);

    expect(publicCase).not.toHaveProperty("hidden");
    expect(publicCase).not.toHaveProperty("patientFacts");
    expect(publicCase).not.toHaveProperty("artifacts");
    expect(publicCase).not.toHaveProperty("feedbackRubric");
    expect(safeCase).not.toHaveProperty("hidden");
    expect(safeCase).not.toHaveProperty("patientFacts");
    expect(safeCase?.artifacts[0]).not.toHaveProperty("content");
    expect(safeCase?.artifacts[0]).not.toHaveProperty("blobPath");
    expect(JSON.stringify(publicCase)).not.toContain("forbiddenResponseTerms");
    expect(safeCasePayload).not.toContain("validationPrompts");
    expect(safeCasePayload).not.toContain("135/90");
    expect(safeCasePayload).not.toContain("Oxycodone");
  });

  it("shows only Jane Kim in default pilot mode", () => {
    vi.stubEnv("RMC_CASE_LIBRARY_MODE", "");
    vi.stubEnv("RMC_PILOT_CASE_IDS", "");

    expect(caseLibraryMode()).toBe("pilot");
    expect(pilotCaseIds()).toEqual(["jane-kim-withdrawal"]);
    expect(getVisibleCases().map((caseDefinition) => caseDefinition.id)).toEqual(["jane-kim-withdrawal"]);
    expect(getVisiblePublicCases()).toHaveLength(1);
    expect(getVisiblePublicCases()[0].patientDisplayName).toBe("Jane Kim");
    expect(isCaseVisible("jane-kim-withdrawal")).toBe(true);
    expect(isCaseVisible("chest-pain")).toBe(false);
  });

  it("shows every registered case in demo mode", () => {
    vi.stubEnv("RMC_CASE_LIBRARY_MODE", "demo");

    expect(caseLibraryMode()).toBe("demo");
    expect(getVisibleCases().map((caseDefinition) => caseDefinition.id)).toEqual(
      cases.map((caseDefinition) => caseDefinition.id)
    );
    expect(getVisiblePublicCases()).toHaveLength(cases.length);
  });

  it("allows pilot case ids to be overridden", () => {
    vi.stubEnv("RMC_CASE_LIBRARY_MODE", "pilot");
    vi.stubEnv("RMC_PILOT_CASE_IDS", "jane-kim-withdrawal, fatigue-mood");

    expect(pilotCaseIds()).toEqual(["jane-kim-withdrawal", "fatigue-mood"]);
    expect(getVisibleCases().map((caseDefinition) => caseDefinition.id)).toEqual([
      "fatigue-mood",
      "jane-kim-withdrawal"
    ]);
  });

  it("keeps hidden demo cases unavailable through visible lookup helpers", () => {
    vi.stubEnv("RMC_CASE_LIBRARY_MODE", "pilot");
    vi.stubEnv("RMC_PILOT_CASE_IDS", "jane-kim-withdrawal");

    expect(getVisibleCase("chest-pain")).toBeUndefined();
    expect(getVisibleSafeCaseForClient("chest-pain")).toBeUndefined();
    expect(getVisibleSafeCaseForClient("jane-kim-withdrawal")?.patientDisplayName).toBe("Jane Kim");
  });

  it("generates reusable live prompt checks from case metadata", () => {
    const battery = buildLivePromptBattery(cases);

    expect(battery.length).toBeGreaterThan(cases.length);
    expect(battery).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          caseId: "chest-pain",
          category: "objective-ekg",
          expectedMode: "objective-data-redirect"
        }),
        expect.objectContaining({
          caseId: "jane-kim-withdrawal",
          category: "sexual-activity-contraception",
          expectedMode: "azure"
        }),
        expect.objectContaining({
          caseId: "jane-kim-withdrawal",
          category: "non-opioid-substances-alias-4",
          prompt: "Any benzos or sleeping pills?",
          requiredResponseTerms: ["alcohol", "opioid", "heroin"],
          expectedMode: "azure"
        })
      ])
    );
  });

  it("can build the live prompt battery from visible pilot cases only", () => {
    vi.stubEnv("RMC_CASE_LIBRARY_MODE", "pilot");
    vi.stubEnv("RMC_PILOT_CASE_IDS", "jane-kim-withdrawal");

    const battery = buildLivePromptBattery(getVisibleCases());

    expect(new Set(battery.map((check) => check.caseId))).toEqual(new Set(["jane-kim-withdrawal"]));
    expect(battery).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          caseId: "jane-kim-withdrawal",
          category: "sexual-activity-contraception",
          expectedMode: "azure"
        }),
        expect.objectContaining({
          caseId: "jane-kim-withdrawal",
          category: "objective-tox",
          expectedMode: "objective-data-redirect"
        })
      ])
    );
  });

  it("requires artifacts to be addressable by case and artifact id", () => {
    const artifact = getArtifact("chest-pain", "initial-ekg");

    expect(artifact?.title).toBe("Initial electrocardiogram");
    expect(artifact?.blobPath).toContain("artifacts/chest-pain/");
  });

  it("extracts Jane Kim clinical H&P into patient-known facts", () => {
    const janeKimCase = cases.find((caseDefinition) => caseDefinition.id === "jane-kim-withdrawal");

    expect(janeKimCase?.patientDisplayName).toBe("Jane Kim");
    expect(janeKimCase?.chiefConcern).toBe("Muscle aches, diarrhea, nausea, and depressed mood");
    expect(janeKimCase?.patientFacts.historyOfPresentIllness).toEqual(
      expect.arrayContaining([
        expect.stringContaining("right femur fracture"),
        expect.stringContaining("intranasally and later intravenously"),
        expect.stringContaining("multiple doses of naloxone"),
        expect.stringContaining("ran out of pills this morning")
      ])
    );
    expect(janeKimCase?.patientFacts.sensitiveHistory).toEqual(
      expect.arrayContaining([
        expect.stringContaining("Department of Child and Family Services"),
        expect.stringContaining("using new syringes"),
        expect.stringContaining("should not invent details")
      ])
    );
  });

  it("makes Jane Kim results available as artifacts", () => {
    const toxicology = getArtifact("jane-kim-withdrawal", "confirmatory-urine-toxicology");
    const reviewOfSystems = getArtifact("jane-kim-withdrawal", "review-of-systems");
    const physicalExam = getArtifact("jane-kim-withdrawal", "vital-signs-and-exam");
    const mentalStatus = getArtifact("jane-kim-withdrawal", "mental-status-exam");

    expect(toxicology?.title).toBe("Confirmatory urine toxicology");
    expect(toxicology?.content.kind).toBe("labTable");
    expect(JSON.stringify(toxicology?.content)).toContain("Oxycodone");
    expect(JSON.stringify(toxicology?.content)).toContain("Fentanyl");
    expect(reviewOfSystems?.title).toBe("Review of systems");
    expect(reviewOfSystems?.content.kind).toBe("clinicalNote");
    expect(JSON.stringify(reviewOfSystems?.content)).toContain("Irregular menses");
    expect(physicalExam?.title).toBe("Vital signs and physical exam");
    expect(physicalExam?.content.kind).toBe("vitalsTable");
    expect(JSON.stringify(physicalExam?.content)).toContain("135/90");
    expect(mentalStatus?.title).toBe("Mental status exam");
    expect(mentalStatus?.content.kind).toBe("clinicalNote");
    expect(JSON.stringify(mentalStatus?.content)).toContain("Denies passive or active suicidal ideation");
  });

  it("defines Jane Kim formative feedback rubric metadata", () => {
    const janeKimCase = getSafeCaseForClient("jane-kim-withdrawal");

    expect(janeKimCase?.feedbackRubric?.expectedArtifacts).toEqual([
      "vital-signs-and-exam",
      "confirmatory-urine-toxicology",
      "review-of-systems",
      "history-and-physical",
      "mental-status-exam"
    ]);
    expect(janeKimCase?.feedbackRubric?.domains.map((domain) => domain.title)).toEqual(
      expect.arrayContaining([
        "Patient-centered interview",
        "Sensitive history",
        "Diagnostic data use",
        "Clinical reasoning",
        "Professional communication",
        "Next-step reflection"
      ])
    );
  });

  it("uses Epic-ready typed artifact content for labs, vitals, ECG, and notes", () => {
    expect(getArtifact("chest-pain", "initial-labs")?.content.kind).toBe("labTable");
    expect(getArtifact("chest-pain", "initial-ekg")?.content.kind).toBe("ecg");
    expect(getArtifact("chest-pain", "chest-xray")?.content.kind).toBe("radiologyReport");
    expect(getArtifact("chest-pain", "history-and-physical")?.content.kind).toBe("clinicalNote");
    expect(getArtifact("jane-kim-withdrawal", "vital-signs-and-exam")?.content.kind).toBe("vitalsTable");
    expect(getArtifact("jane-kim-withdrawal", "mental-status-exam")?.content.kind).toBe("clinicalNote");
  });

  it("groups artifacts into chart skeleton sections", () => {
    expect(getArtifact("chest-pain", "initial-labs")?.chartSection).toBe("results");
    expect(getArtifact("chest-pain", "chest-xray")?.chartSection).toBe("diagnostics");
    expect(getArtifact("jane-kim-withdrawal", "history-and-physical")?.chartSection).toBe("historyPhysical");
    expect(JSON.stringify(getArtifact("jane-kim-withdrawal", "history-and-physical")?.content)).toContain(
      "PAST SURGICAL HISTORY"
    );
  });

  it("extracts Jane Kim anticipated student Q&A from source facts", () => {
    const janeKimCase = cases.find((caseDefinition) => caseDefinition.id === "jane-kim-withdrawal");

    expect(janeKimCase?.patientFacts.anticipatedQuestions?.length).toBeGreaterThanOrEqual(15);
    expect(janeKimCase?.patientFacts.anticipatedQuestions).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          question: expect.stringContaining("What brought you"),
          answer: expect.stringContaining("muscles and bones hurt")
        }),
        expect.objectContaining({
          question: expect.stringContaining("Have you overdosed"),
          answer: expect.stringContaining("naloxone")
        }),
        expect.objectContaining({
          question: expect.stringContaining("thoughts of killing yourself"),
          answer: expect.stringContaining("No")
        }),
        expect.objectContaining({
          question: expect.stringContaining("benzodiazepines"),
          answer: expect.stringContaining("do not drink alcohol")
        }),
        expect.objectContaining({
          question: expect.stringContaining("exchanged sex"),
          answer: expect.stringContaining("never exchanged sex")
        }),
        expect.objectContaining({
          question: expect.stringContaining("safe at home"),
          answer: expect.stringContaining("Things are tense")
        })
      ])
    );
  });

  it("defines Jane Kim semantic answer groups for high-risk paraphrases", () => {
    const janeKimCase = cases.find((caseDefinition) => caseDefinition.id === "jane-kim-withdrawal");

    expect(janeKimCase?.patientFacts.answerGroups).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "non-opioid-substances",
          aliases: expect.arrayContaining(["Do you drink?", "Any benzos or sleeping pills?"]),
          requiredResponseTerms: ["alcohol", "opioid", "heroin"]
        }),
        expect.objectContaining({
          id: "sexual-activity-contraception",
          aliases: expect.arrayContaining(["When did you last have sex?", "Are you on birth control?"]),
          requiredResponseTerms: ["not currently sexually active"]
        }),
        expect.objectContaining({
          id: "exchange-sex",
          aliases: expect.arrayContaining(["Sex for money?", "Sex for drugs?"]),
          requiredResponseTerms: ["never exchanged sex"]
        }),
        expect.objectContaining({
          id: "home-safety-ipv",
          aliases: expect.arrayContaining(["Has your husband hurt you?"]),
          forbiddenResponseTerms: expect.arrayContaining(["hasn't hurt me"])
        })
      ])
    );
  });
});

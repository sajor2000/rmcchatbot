import type { ClientArtifactSummary, ClinicalArtifact } from "@/lib/caseSchema";

type ArtifactRequestCandidate = ClientArtifactSummary | ClinicalArtifact;

export type ArtifactRequestReason = "direct-order" | "specific-result";

export type ArtifactRequestAnalysis = {
  intent: "none" | "matched" | "unavailable";
  reason: ArtifactRequestReason | null;
  matchedArtifactIds: string[];
  query: string;
};

const directOrderPattern =
  /\b(show|see|order|request|check|draw|send|pull up|open|review|look at)\b/i;
const getObjectiveDataPattern = /\bget\b/i;
const broadQuestionPattern = /\b(what is|what's|what are|what were|what does|what did)\b/i;
const resultInquiryPattern =
  /\b(value|level|result|results|finding|findings|reading|measurement|measurements|interpretation|say|show|shows|showed|indicate|indicates)\b/i;
const examPermissionPattern =
  /\b(can i|may i|is it okay if i|would it be okay if i|i am going to|let me)\b.*\b(examine|exam|physical exam|listen|press|palpate|check|feel|look in|look at|take)\b/i;
const objectiveTerms = [
  "lab",
  "labs",
  "laboratory",
  "blood work",
  "cbc",
  "bmp",
  "chemistry",
  "sodium",
  "potassium",
  "troponin",
  "hemoglobin",
  "creatinine",
  "tsh",
  "pregnancy",
  "urine",
  "tox",
  "toxicology",
  "drug screen",
  "drug test",
  "drug testing",
  "vital",
  "vitals",
  "vital signs",
  "blood pressure",
  "heart rate",
  "pulse",
  "temperature",
  "respiratory rate",
  "oxygen",
  "spo2",
  "ekg",
  "ecg",
  "electrocardiogram",
  "x-ray",
  "xray",
  "chest x-ray",
  "chest xray",
  "cxr",
  "radiograph",
  "imaging",
  "ct",
  "mri",
  "ultrasound",
  "radiology",
  "h p",
  "history and physical",
  "chart history",
  "physical exam",
  "exam",
  "pupil",
  "pupils",
  "bowel sounds",
  "reflex",
  "reflexes",
  "pmh",
  "psh",
  "past medical history section",
  "past surgical history section",
  "result",
  "results"
];

export function matchRequestedArtifacts<T extends ArtifactRequestCandidate>(input: string, artifacts: T[]): T[] {
  const analysis = analyzeArtifactRequest(input, artifacts);
  return artifacts.filter((artifact) => analysis.matchedArtifactIds.includes(artifact.id));
}

export function analyzeArtifactRequest(input: string, artifacts: ArtifactRequestCandidate[]): ArtifactRequestAnalysis {
  const normalized = normalize(input);
  const matches = artifacts.filter((artifact) =>
    artifactSearchTerms(artifact).some((term) => includesNormalizedTerm(normalized, term))
  );

  const hasObjectiveTerm = objectiveTerms.some((term) => includesNormalizedTerm(normalized, normalize(term)));
  const hasDirectOrder = directOrderPattern.test(input) || (getObjectiveDataPattern.test(input) && hasObjectiveTerm);
  const asksForExamPermission = examPermissionPattern.test(normalized) && !resultInquiryPattern.test(normalized);
  const hasSpecificResultAsk = resultInquiryPattern.test(normalized) || (broadQuestionPattern.test(normalized) && hasObjectiveTerm);
  const reason: ArtifactRequestReason | null = hasSpecificResultAsk ? "specific-result" : hasDirectOrder ? "direct-order" : null;

  if (asksForExamPermission) {
    return {
      intent: "none",
      reason: null,
      matchedArtifactIds: [],
      query: normalized
    };
  }

  if (matches.length > 0 && (hasObjectiveTerm || hasDirectOrder || hasSpecificResultAsk)) {
    return {
      intent: "matched",
      reason: reason ?? "direct-order",
      matchedArtifactIds: matches.map((artifact) => artifact.id),
      query: normalized
    };
  }

  if (hasObjectiveTerm && (hasDirectOrder || hasSpecificResultAsk)) {
    return {
      intent: "unavailable",
      reason: reason ?? "specific-result",
      matchedArtifactIds: [],
      query: normalized
    };
  }

  return {
    intent: "none",
    reason: null,
    matchedArtifactIds: [],
    query: normalized
  };
}

function artifactSearchTerms(artifact: ArtifactRequestCandidate): string[] {
  const terms = [
    artifact.title,
    artifact.description,
    artifact.type,
    ...artifact.triggerTerms
  ];
  const content = "content" in artifact ? artifact.content : undefined;

  if (content?.kind === "labTable") {
    for (const row of content.rows) {
      terms.push(row.component, row.panel ?? "");
    }
  }

  if (content?.kind === "vitalsTable") {
    for (const row of content.rows) {
      terms.push(row.vital);
    }
  }

  if (content?.kind === "ecg") {
    terms.push("ekg", "ecg", "electrocardiogram", "12 lead", ...content.findings);
  }

  if (content?.kind === "radiologyReport") {
    terms.push(content.exam);
  }

  if (content?.kind === "clinicalNote" || content?.kind === "radiologyReport") {
    for (const section of content.sections) {
      terms.push(section.heading);
    }
  }

  return Array.from(new Set(terms.map(normalize).filter((term) => term.length > 1)));
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^\w\s/-]/g, " ").replace(/\s+/g, " ").trim();
}

function includesNormalizedTerm(normalizedValue: string, normalizedTerm: string): boolean {
  return ` ${normalizedValue} `.includes(` ${normalizedTerm} `);
}

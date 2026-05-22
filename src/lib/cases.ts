import { caseDefinitions } from "@/content/cases";
import {
  caseSchema,
  type CaseDefinition,
  type ClientArtifactSummary,
  type ClinicalArtifact,
  type PublicCase,
  type SafeCaseForClient
} from "@/lib/caseSchema";
import { caseLibraryMode, pilotCaseIds } from "@/lib/caseLibraryConfig";

const parsedCases = caseDefinitions.map((caseDefinition) =>
  caseSchema.parse(caseDefinition)
);

const ids = new Set<string>();
for (const caseDefinition of parsedCases) {
  if (ids.has(caseDefinition.id)) {
    throw new Error(`Duplicate case id: ${caseDefinition.id}`);
  }
  ids.add(caseDefinition.id);
}

export const cases: CaseDefinition[] = parsedCases;

function toClientArtifactSummary(artifact: ClinicalArtifact): ClientArtifactSummary {
  const { id, title, type, chartSection, description, triggerTerms } = artifact;
  return { id, title, type, chartSection, description, triggerTerms };
}

function toPublicCase(caseDefinition: CaseDefinition): PublicCase {
  const {
    hidden: _hidden,
    patientFacts: _patientFacts,
    artifacts: _artifacts,
    feedbackRubric: _feedbackRubric,
    ...publicCase
  } = caseDefinition;
  return {
    ...publicCase,
    artifactCount: caseDefinition.artifacts.length
  };
}

function toSafeCaseForClient(caseDefinition: CaseDefinition): SafeCaseForClient {
  const { hidden: _hidden, patientFacts: _patientFacts, artifacts, ...safeCase } = caseDefinition;
  return {
    ...safeCase,
    artifacts: artifacts.map(toClientArtifactSummary)
  };
}

export function getCase(caseId: string): CaseDefinition | undefined {
  return cases.find((caseDefinition) => caseDefinition.id === caseId);
}

export function getPublicCases(): PublicCase[] {
  return cases.map(toPublicCase);
}

export function getVisibleCases(): CaseDefinition[] {
  if (caseLibraryMode() === "demo") {
    return cases;
  }

  const visibleIds = new Set(pilotCaseIds());
  return cases.filter((caseDefinition) => visibleIds.has(caseDefinition.id));
}

export function getVisiblePublicCases(): PublicCase[] {
  return getVisibleCases().map(toPublicCase);
}

export function getVisibleCase(caseId: string): CaseDefinition | undefined {
  return getVisibleCases().find((caseDefinition) => caseDefinition.id === caseId);
}

export function isCaseVisible(caseId: string): boolean {
  return Boolean(getVisibleCase(caseId));
}

export function getSafeCaseForClient(caseId: string): SafeCaseForClient | undefined {
  const caseDefinition = getCase(caseId);
  if (!caseDefinition) return undefined;

  return toSafeCaseForClient(caseDefinition);
}

export function getVisibleSafeCaseForClient(caseId: string): SafeCaseForClient | undefined {
  const caseDefinition = getVisibleCase(caseId);
  if (!caseDefinition) return undefined;

  return toSafeCaseForClient(caseDefinition);
}

export function getArtifact(caseId: string, artifactId: string): ClinicalArtifact | undefined {
  return getCase(caseId)?.artifacts.find((artifact) => artifact.id === artifactId);
}

export function getVisibleArtifact(caseId: string, artifactId: string): ClinicalArtifact | undefined {
  return getVisibleCase(caseId)?.artifacts.find((artifact) => artifact.id === artifactId);
}

export function getAzureBlobUrl(blobPath: string): string | null {
  const baseUrl = process.env.AZURE_STORAGE_PUBLIC_BASE_URL;
  if (!baseUrl) return null;

  return `${baseUrl.replace(/\/$/, "")}/${blobPath.replace(/^\//, "")}`;
}

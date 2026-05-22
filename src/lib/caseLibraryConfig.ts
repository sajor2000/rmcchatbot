export type CaseLibraryMode = "pilot" | "demo";

const DEFAULT_PILOT_CASE_IDS = ["jane-kim-withdrawal"];

export function caseLibraryMode(): CaseLibraryMode {
  return process.env.RMC_CASE_LIBRARY_MODE === "demo" ? "demo" : "pilot";
}

export function pilotCaseIds(): string[] {
  const configuredIds = process.env.RMC_PILOT_CASE_IDS?.split(",")
    .map((id) => id.trim())
    .filter(Boolean);

  return configuredIds && configuredIds.length > 0 ? configuredIds : DEFAULT_PILOT_CASE_IDS;
}

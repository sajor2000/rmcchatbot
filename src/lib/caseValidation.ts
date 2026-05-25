import type { CaseDefinition, ValidationPromptExpectedMode } from "@/lib/caseSchema";

export type LivePromptCheck = {
  caseId: string;
  category: string;
  prompt: string;
  expectedMode: ValidationPromptExpectedMode;
  requiredResponseTerms: string[];
  forbiddenResponseTerms: string[];
};

export const sharedHistoryAndPhysicalPrompts: Array<{
  category: string;
  prompt: string;
  expectedMode: ValidationPromptExpectedMode;
}> = [
  { category: "chief-concern", prompt: "What brought you in today?", expectedMode: "azure" },
  { category: "current-symptoms", prompt: "What symptoms are you having right now?", expectedMode: "azure" },
  { category: "past-medical-history", prompt: "What medical problems have you been diagnosed with?", expectedMode: "azure" },
  { category: "medications-allergies", prompt: "What medications do you take, and do you have allergies?", expectedMode: "azure" },
  { category: "family-history", prompt: "What medical problems run in your family?", expectedMode: "azure" },
  {
    category: "social-history",
    prompt: "Can you tell me about tobacco, alcohol, and other substance use?",
    expectedMode: "azure"
  },
  { category: "sexual-history", prompt: "Are you sexually active?", expectedMode: "azure" },
  { category: "home-safety", prompt: "Do you feel safe at home?", expectedMode: "azure" },
  { category: "suicidal-ideation", prompt: "Have you had thoughts of killing yourself or hurting yourself?", expectedMode: "azure" },
  { category: "firearm-access", prompt: "Do you have access to firearms?", expectedMode: "azure" },
  { category: "exam-permission", prompt: "Is it okay if I do a focused physical exam?", expectedMode: "azure" }
];

export function buildLivePromptBattery(caseDefinitions: CaseDefinition[]): LivePromptCheck[] {
  return caseDefinitions.flatMap((caseDefinition) => {
    const forbiddenResponseTerms = forbiddenTermsForCase(caseDefinition);
    const sharedPrompts = sharedHistoryAndPhysicalPrompts.map((item) => ({
      caseId: caseDefinition.id,
      category: item.category,
      prompt: item.prompt,
      expectedMode: item.expectedMode,
      requiredResponseTerms: [],
      forbiddenResponseTerms
    }));
    const casePrompts = (caseDefinition.hidden.validationPrompts ?? []).map((item) => ({
      caseId: caseDefinition.id,
      category: item.id,
      prompt: item.prompt,
      expectedMode: item.expectedMode,
      requiredResponseTerms: [],
      forbiddenResponseTerms
    }));
    const answerGroupPrompts = (caseDefinition.patientFacts.answerGroups ?? []).flatMap((group) =>
      [group.canonicalQuestion, ...group.aliases].map((prompt, index) => ({
        caseId: caseDefinition.id,
        category: index === 0 ? group.id : `${group.id}-alias-${index}`,
        prompt,
        expectedMode: "azure" as const,
        requiredResponseTerms: index === 0 ? group.requiredResponseTerms ?? [] : [],
        forbiddenResponseTerms: Array.from(new Set([...forbiddenResponseTerms, ...(group.forbiddenResponseTerms ?? [])]))
      }))
    );

    return [...sharedPrompts, ...casePrompts, ...answerGroupPrompts];
  });
}

export function forbiddenTermsForCase(caseDefinition: CaseDefinition): string[] {
  return Array.from(
    new Set([
      caseDefinition.hidden.diagnosis,
      ...caseDefinition.hidden.teachingPoints,
      ...(caseDefinition.hidden.forbiddenResponseTerms ?? []),
      ...(caseDefinition.patientFacts.answerGroups ?? []).flatMap((group) => group.forbiddenResponseTerms ?? [])
    ])
  );
}

export function findCaseLibraryProblems(caseDefinitions: CaseDefinition[]): string[] {
  const problems = [
    ...findDuplicateCaseIdProblems(caseDefinitions),
    ...caseDefinitions.flatMap((caseDefinition) => [
      ...findDuplicateArtifactIdProblems(caseDefinition),
      ...findPilotReadinessProblems(caseDefinition)
    ])
  ];

  return problems;
}

function findDuplicateCaseIdProblems(caseDefinitions: CaseDefinition[]): string[] {
  const seen = new Set<string>();
  const problems: string[] = [];

  for (const caseDefinition of caseDefinitions) {
    if (seen.has(caseDefinition.id)) {
      problems.push(`Duplicate case id: ${caseDefinition.id}`);
    }
    seen.add(caseDefinition.id);
  }

  return problems;
}

function findDuplicateArtifactIdProblems(caseDefinition: CaseDefinition): string[] {
  const seen = new Set<string>();
  const problems: string[] = [];

  for (const artifact of caseDefinition.artifacts) {
    if (seen.has(artifact.id)) {
      problems.push(`${caseDefinition.id}: duplicate artifact id ${artifact.id}`);
    }
    seen.add(artifact.id);
  }

  return problems;
}

function findPilotReadinessProblems(caseDefinition: CaseDefinition): string[] {
  const problems: string[] = [];
  const facts = caseDefinition.patientFacts;
  const serializedCase = JSON.stringify(caseDefinition);
  const requiredCounts = [
    ["historyOfPresentIllness", facts.historyOfPresentIllness.length, 2],
    ["positives", facts.positives.length, 1],
    ["negatives", facts.negatives.length, 2],
    ["pastMedicalHistory", facts.pastMedicalHistory.length, 1],
    ["medications", facts.medications.length, 1],
    ["allergies", facts.allergies.length, 1],
    ["familyHistory", facts.familyHistory.length, 1],
    ["socialHistory", facts.socialHistory.length, 1],
    ["sensitiveHistory", facts.sensitiveHistory.length, 1],
    ["artifacts", caseDefinition.artifacts.length, 1],
    ["teachingPoints", caseDefinition.hidden.teachingPoints.length, 1],
    ["forbiddenResponseTerms", caseDefinition.hidden.forbiddenResponseTerms?.length ?? 0, 1],
    ["validationPrompts", caseDefinition.hidden.validationPrompts?.length ?? 0, 1],
    ["answerGroups", facts.answerGroups?.length ?? 0, 1]
  ] as const;

  for (const [field, actual, minimum] of requiredCounts) {
    if (actual < minimum) {
      problems.push(`${caseDefinition.id}: ${field} must include at least ${minimum}`);
    }
  }

  if (!caseDefinition.hidden.diagnosis) {
    problems.push(`${caseDefinition.id}: hidden diagnosis is required`);
  }

  if (serializedCase.includes("TODO_CASE_SPECIFIC")) {
    problems.push(`${caseDefinition.id}: replace all TODO_CASE_SPECIFIC placeholders before registration`);
  }

  const patientBehavior = caseDefinition.patientBehavior;
  const requiredBehaviorFields = [
    "openingStatement",
    "disclosureStyle",
    "sensitiveTopicStyle",
    "examConsentStyle",
    "uncertaintyStyle"
  ] as const;

  for (const field of requiredBehaviorFields) {
    if (!patientBehavior?.[field]) {
      problems.push(`${caseDefinition.id}: patientBehavior.${field} is required`);
    }
  }

  const allText = [
    ...facts.negatives,
    ...facts.sensitiveHistory,
    ...(facts.answerGroups ?? []).map((g) => g.id + " " + g.canonicalQuestion)
  ].join(" ").toLowerCase();

  if (!/suicid|self.harm|kill.*self|hurt.*self/.test(allText)) {
    problems.push(`${caseDefinition.id}: must include SI/self-harm coverage in negatives, sensitiveHistory, or answerGroups`);
  }

  return problems;
}

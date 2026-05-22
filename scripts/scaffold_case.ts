#!/usr/bin/env tsx
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { caseDefinitions } from "@/content/cases";

type ScaffoldCaseOptions = {
  id: string;
  patientName: string;
  title: string;
  course: string;
  setting: string;
  sourcePdf: string;
  casesDir?: string;
  existingCaseIds?: string[];
};

type ScaffoldCaseResult = {
  filePath: string;
  importLine: string;
  registryEntry: string;
};

type ParsedArgs = Omit<ScaffoldCaseOptions, "casesDir" | "existingCaseIds">;

const REQUIRED_ARGS = ["id", "patient-name", "title", "course", "setting", "source-pdf"] as const;

export function parseScaffoldArgs(argv: string[]): ParsedArgs {
  const values = new Map<string, string>();

  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (!item.startsWith("--")) {
      throw new Error(`Unexpected positional argument: ${item}`);
    }

    const key = item.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for --${key}`);
    }

    values.set(key, value);
    index += 1;
  }

  for (const requiredArg of REQUIRED_ARGS) {
    if (!values.get(requiredArg)?.trim()) {
      throw new Error(`Missing required argument --${requiredArg}`);
    }
  }

  return {
    id: values.get("id") as string,
    patientName: values.get("patient-name") as string,
    title: values.get("title") as string,
    course: values.get("course") as string,
    setting: values.get("setting") as string,
    sourcePdf: values.get("source-pdf") as string
  };
}

export async function scaffoldCase(options: ScaffoldCaseOptions): Promise<ScaffoldCaseResult> {
  validateScaffoldOptions(options);

  const existingCaseIds = options.existingCaseIds ?? caseDefinitions.map((caseDefinition) => caseDefinition.id);
  if (existingCaseIds.includes(options.id)) {
    throw new Error(`Case id already exists: ${options.id}`);
  }

  const casesDir = resolve(options.casesDir ?? "src/content/cases");
  const fileName = `${options.id}Case.ts`;
  const filePath = resolve(casesDir, fileName);
  if (existsSync(filePath)) {
    throw new Error(`Case file already exists: ${filePath}`);
  }

  await mkdir(casesDir, { recursive: true });
  await writeFile(filePath, renderScaffoldCase(options), "utf-8");

  const variableName = caseVariableName(options.id);
  return {
    filePath,
    importLine: `import { ${variableName} } from "@/content/cases/${options.id}Case";`,
    registryEntry: `  ${variableName},`
  };
}

export function renderScaffoldCase(options: ScaffoldCaseOptions): string {
  const variableName = caseVariableName(options.id);
  const artifactPathPrefix = `artifacts/${options.id}`;

  return `import type { CaseDefinition } from "@/lib/caseSchema";

export const ${variableName}: CaseDefinition = {
  id: ${quote(options.id)},
  title: ${quote(options.title)},
  course: ${quote(options.course)},
  setting: ${quote(options.setting)},
  patientDisplayName: ${quote(options.patientName)},
  chiefConcern: "TODO_CASE_SPECIFIC: patient-friendly chief concern",
  tileDescription: "TODO_CASE_SPECIFIC: one learner-facing sentence for the case selection tile.",
  sourcePdfBlobPath: ${quote(options.sourcePdf)},
  persona: {
    age: 45,
    pronouns: "TODO_CASE_SPECIFIC: pronouns",
    background: "TODO_CASE_SPECIFIC: short human background without revealing the diagnosis.",
    speakingStyle: "TODO_CASE_SPECIFIC: how the patient speaks when guarded and when comfortable.",
    emotionalTone: "TODO_CASE_SPECIFIC: emotional tone students should experience."
  },
  patientBehavior: {
    openingStatement: "TODO_CASE_SPECIFIC: 1-2 sentence answer to 'What brought you in today?'",
    disclosureStyle: "TODO_CASE_SPECIFIC: how much the patient volunteers to open-ended versus focused questions.",
    sensitiveTopicStyle: "TODO_CASE_SPECIFIC: how the patient answers mood, safety, sexual history, and substance questions.",
    examConsentStyle: "TODO_CASE_SPECIFIC: how the patient responds to bedside physical-exam permission.",
    uncertaintyStyle: "Says they do not know chart-only information, test results, clinician exam findings, or details outside the source case."
  },
  patientFacts: {
    historyOfPresentIllness: [
      "TODO_CASE_SPECIFIC: onset and timeline.",
      "TODO_CASE_SPECIFIC: symptom character, context, progression, or trigger."
    ],
    positives: ["TODO_CASE_SPECIFIC: present symptom or relevant positive history."],
    negatives: [
      "TODO_CASE_SPECIFIC: relevant negative.",
      "TODO_CASE_SPECIFIC: another relevant negative."
    ],
    pastMedicalHistory: ["TODO_CASE_SPECIFIC: past medical or surgical history, or 'No known past medical history.'"],
    medications: ["TODO_CASE_SPECIFIC: medication list, or 'No home medications.'"],
    allergies: ["TODO_CASE_SPECIFIC: allergies, or 'No known drug allergies.'"],
    familyHistory: ["TODO_CASE_SPECIFIC: relevant family history, or 'No relevant family history reported.'"],
    socialHistory: ["TODO_CASE_SPECIFIC: living situation, work/school, tobacco, alcohol, and substance context."],
    sensitiveHistory: [
      "TODO_CASE_SPECIFIC: case-relevant safety, sexual, mood, suicide, substance, trauma, or other sensitive history."
    ],
    anticipatedQuestions: [
      {
        question: "What brought you in today?",
        answer: "TODO_CASE_SPECIFIC: patient-voice opening answer grounded only in patient-known facts."
      },
      {
        question: "What medications do you take, and do you have allergies?",
        answer: "TODO_CASE_SPECIFIC: patient-voice medications and allergies answer."
      }
    ],
    answerGroups: [
      {
        id: "substance-use",
        canonicalQuestion: "Do you use tobacco, alcohol, prescription medications, or other substances?",
        aliases: [
          "Do you drink?",
          "Do you smoke?",
          "Any weed, cocaine, opioids, pills, or other drugs?"
        ],
        answer: "TODO_CASE_SPECIFIC: same patient-known substance-use facts for all substance-use paraphrases.",
        requiredResponseTerms: ["TODO_CASE_SPECIFIC: required substance-use validation term"],
        forbiddenResponseTerms: ["TODO_CASE_SPECIFIC: forbidden invented substance-use phrase"]
      },
      {
        id: "sexual-history",
        canonicalQuestion: "Are you sexually active, and do you use contraception or protection?",
        aliases: [
          "When did you last have sex?",
          "Do you use protection?",
          "Are you on birth control?"
        ],
        answer: "TODO_CASE_SPECIFIC: same patient-known sexual-history facts for all sexual-history paraphrases.",
        requiredResponseTerms: ["TODO_CASE_SPECIFIC: required sexual-history validation term"],
        forbiddenResponseTerms: ["TODO_CASE_SPECIFIC: forbidden invented sexual-history phrase"]
      },
      {
        id: "home-safety-ipv",
        canonicalQuestion: "Do you feel safe at home?",
        aliases: [
          "Has anyone hurt you at home?",
          "Are you afraid of anyone at home?",
          "Has your partner hurt you?"
        ],
        answer: "TODO_CASE_SPECIFIC: same patient-known home-safety/IPV facts without inventing abuse or no-abuse details.",
        requiredResponseTerms: ["TODO_CASE_SPECIFIC: required home-safety validation term"],
        forbiddenResponseTerms: ["TODO_CASE_SPECIFIC: forbidden invented home-safety phrase"]
      },
      {
        id: "suicide-self-harm",
        canonicalQuestion: "Have you had thoughts of killing yourself or hurting yourself?",
        aliases: [
          "Any suicidal thoughts?",
          "Have you thought about self-harm?",
          "Do you want to die?"
        ],
        answer: "TODO_CASE_SPECIFIC: same patient-known suicide/self-harm facts for all safety paraphrases.",
        requiredResponseTerms: ["TODO_CASE_SPECIFIC: required suicide/self-harm validation term"],
        forbiddenResponseTerms: ["TODO_CASE_SPECIFIC: forbidden invented suicide/self-harm phrase"]
      },
      {
        id: "medications-allergies",
        canonicalQuestion: "What medications do you take, and do you have allergies?",
        aliases: [
          "Any meds?",
          "What prescriptions are you on?",
          "Are you allergic to anything?"
        ],
        answer: "TODO_CASE_SPECIFIC: same medication and allergy facts for all medication/allergy paraphrases.",
        requiredResponseTerms: ["TODO_CASE_SPECIFIC: required medications/allergies validation term"],
        forbiddenResponseTerms: ["TODO_CASE_SPECIFIC: forbidden invented medication/allergy phrase"]
      }
    ]
  },
  hidden: {
    diagnosis: "TODO_CASE_SPECIFIC: faculty-only diagnosis.",
    teachingPoints: [
      "TODO_CASE_SPECIFIC: faculty-only teaching point.",
      "Objective data should be requested from the chart or results panel, not narrated by the patient."
    ],
    forbiddenResponseTerms: [
      "TODO_CASE_SPECIFIC: hidden diagnosis phrase",
      "TODO_CASE_SPECIFIC: objective result value the patient must not say"
    ],
    validationPrompts: [
      {
        id: "case-specific-history",
        prompt: "TODO_CASE_SPECIFIC: high-yield student history question.",
        expectedMode: "azure"
      },
      {
        id: "case-specific-objective-data",
        prompt: "TODO_CASE_SPECIFIC: chart/result request that should not be narrated by the patient.",
        expectedMode: "objective-data-redirect"
      }
    ]
  },
  artifacts: [
    {
      id: "case-summary-note",
      title: "TODO_CASE_SPECIFIC: artifact title",
      type: "note",
      chartSection: "historyPhysical",
      description: "TODO_CASE_SPECIFIC: learner-facing artifact description.",
      triggerTerms: ["TODO_CASE_SPECIFIC: trigger term", "chart note"],
      blobPath: ${quote(`${artifactPathPrefix}/case-summary-note.json`)},
      content: {
        kind: "clinicalNote",
        sections: [
          {
            heading: "TODO_CASE_SPECIFIC SECTION",
            body: ["TODO_CASE_SPECIFIC: chart-only artifact content."]
          }
        ]
      }
    }
  ],
  feedbackRubric: {
    domains: [
      {
        id: "patient-centered-interview",
        title: "Patient-centered interview",
        epaAlignment: "EPA 1",
        description: "TODO_CASE_SPECIFIC: how learners should gather the history for this case.",
        criteria: [
          {
            label: "Uses open-ended questions before focused follow-up.",
            triggerTerms: ["what brought", "tell me more"]
          }
        ]
      },
      {
        id: "sensitive-history",
        title: "Sensitive history",
        epaAlignment: "EPA 1",
        description: "TODO_CASE_SPECIFIC: sensitive history domains learners should address.",
        criteria: [
          {
            label: "Asks relevant sensitive questions respectfully.",
            triggerTerms: ["safe", "sex", "substance", "suicide"]
          }
        ]
      }
    ],
    expectedArtifacts: ["case-summary-note"],
    reflectionPrompts: [
      "TODO_CASE_SPECIFIC: reflection prompt for what the learner should ask next.",
      "TODO_CASE_SPECIFIC: reflection prompt for objective data or management."
    ]
  }
};
`;
}

export function caseVariableName(caseId: string): string {
  const camel = caseId.replace(/-([a-z0-9])/g, (_, letter: string) => letter.toUpperCase());
  return `${camel}Case`;
}

function validateScaffoldOptions(options: ScaffoldCaseOptions): void {
  if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(options.id)) {
    throw new Error("Case id must be lowercase kebab-case, such as abdominal-pain.");
  }

  for (const [field, value] of Object.entries({
    patientName: options.patientName,
    title: options.title,
    course: options.course,
    setting: options.setting,
    sourcePdf: options.sourcePdf
  })) {
    if (!value.trim()) {
      throw new Error(`${field} is required`);
    }
  }
}

function quote(value: string): string {
  return JSON.stringify(value);
}

async function main() {
  const options = parseScaffoldArgs(process.argv.slice(2));
  const result = await scaffoldCase(options);

  console.log(`Created: ${result.filePath}`);
  console.log("Add this import to src/content/cases/index.ts:");
  console.log(result.importLine);
  console.log("Add this entry to caseDefinitions:");
  console.log(result.registryEntry);
  console.log("Do not add the case ID to RMC_PILOT_CASE_IDS until faculty signoff and live prompt validation pass.");
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exit(1);
  });
}

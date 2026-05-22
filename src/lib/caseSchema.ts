import { z } from "zod";

export const artifactTypeSchema = z.enum(["lab", "ekg", "imaging", "note"]);
export const artifactChartSectionSchema = z.enum(["results", "diagnostics", "historyPhysical"]);
export const artifactStatusSchema = z.enum(["Final", "Pending", "Preliminary"]);
export const artifactFlagSchema = z.enum(["", "H", "L", "HH", "LL", "A", "C"]);

const labRowSchema = z.object({
  component: z.string().min(1),
  value: z.string().min(1),
  flag: artifactFlagSchema.optional(),
  units: z.string(),
  referenceRange: z.string(),
  status: artifactStatusSchema.optional(),
  panel: z.string().optional()
});

const vitalsRowSchema = z.object({
  vital: z.string().min(1),
  value: z.string().min(1),
  units: z.string(),
  abnormal: z.boolean().optional()
});

const ecgMetadataSchema = z.object({
  ventricularRate: z.string().min(1),
  prInterval: z.string().min(1),
  qrsDuration: z.string().min(1),
  qtQtc: z.string().min(1),
  axes: z.string().min(1),
  speed: z.string().min(1),
  gain: z.string().min(1)
});

const clinicalSectionSchema = z.object({
  heading: z.string().min(1),
  body: z.array(z.string().min(1)).min(1)
});

const patientBehaviorSchema = z.object({
  openingStatement: z.string().min(1).optional(),
  disclosureStyle: z.string().min(1).optional(),
  sensitiveTopicStyle: z.string().min(1).optional(),
  examConsentStyle: z.string().min(1).optional(),
  uncertaintyStyle: z.string().min(1).optional()
});

export const validationPromptExpectedModeSchema = z.enum(["azure", "objective-data-redirect"]);

const validationPromptSchema = z.object({
  id: z.string().min(1),
  prompt: z.string().min(1),
  expectedMode: validationPromptExpectedModeSchema
});

const patientAnswerGroupSchema = z.object({
  id: z.string().min(1),
  canonicalQuestion: z.string().min(1),
  aliases: z.array(z.string().min(1)).min(1),
  answer: z.string().min(1),
  requiredResponseTerms: z.array(z.string().min(1)).optional(),
  forbiddenResponseTerms: z.array(z.string().min(1)).optional()
});

const feedbackRubricCriterionSchema = z.object({
  label: z.string().min(1),
  triggerTerms: z.array(z.string().min(2)).optional(),
  artifactIds: z.array(z.string().min(1)).optional()
});

const feedbackRubricDomainSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  epaAlignment: z.string().min(1),
  description: z.string().min(1),
  criteria: z.array(feedbackRubricCriterionSchema).min(1)
});

export const clinicalArtifactSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  type: artifactTypeSchema,
  chartSection: artifactChartSectionSchema.optional(),
  description: z.string().min(1),
  triggerTerms: z.array(z.string().min(2)).min(1),
  blobPath: z.string().min(1),
  content: z.discriminatedUnion("kind", [
    z.object({
      kind: z.literal("labTable"),
      collectedAt: z.string().optional(),
      resultedAt: z.string().optional(),
      rows: z.array(labRowSchema).min(1)
    }),
    z.object({
      kind: z.literal("vitalsTable"),
      recordedAt: z.string().min(1),
      rows: z.array(vitalsRowSchema).min(1)
    }),
    z.object({
      kind: z.literal("ecg"),
      recordedAt: z.string().min(1),
      metadata: ecgMetadataSchema,
      machineInterpretation: z.string().min(1),
      findings: z.array(z.string().min(1)).min(1)
    }),
    z.object({
      kind: z.literal("clinicalNote"),
      sections: z.array(clinicalSectionSchema).min(1)
    }),
    z.object({
      kind: z.literal("radiologyReport"),
      exam: z.string().min(1),
      performedAt: z.string().min(1),
      sections: z.array(clinicalSectionSchema).min(1)
    }),
    z.object({
      kind: z.literal("image"),
      alt: z.string().min(1),
      caption: z.string().min(1)
    })
  ])
});

export const caseSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  course: z.string().min(1),
  setting: z.string().min(1),
  patientDisplayName: z.string().min(1),
  chiefConcern: z.string().min(1),
  tileDescription: z.string().min(1),
  sourcePdfBlobPath: z.string().min(1),
  persona: z.object({
    age: z.number().int().positive(),
    pronouns: z.string().min(1),
    background: z.string().min(1),
    speakingStyle: z.string().min(1),
    emotionalTone: z.string().min(1)
  }),
  patientBehavior: patientBehaviorSchema.optional(),
  patientFacts: z.object({
    historyOfPresentIllness: z.array(z.string().min(1)).min(1),
    positives: z.array(z.string().min(1)),
    negatives: z.array(z.string().min(1)),
    pastMedicalHistory: z.array(z.string().min(1)),
    medications: z.array(z.string().min(1)),
    allergies: z.array(z.string().min(1)),
    familyHistory: z.array(z.string().min(1)),
    socialHistory: z.array(z.string().min(1)),
    sensitiveHistory: z.array(z.string().min(1)),
    anticipatedQuestions: z.array(z.object({
      question: z.string().min(1),
      answer: z.string().min(1)
    })).optional(),
    answerGroups: z.array(patientAnswerGroupSchema).optional()
  }),
  hidden: z.object({
    diagnosis: z.string().min(1),
    teachingPoints: z.array(z.string().min(1)).min(1),
    forbiddenResponseTerms: z.array(z.string().min(1)).optional(),
    validationPrompts: z.array(validationPromptSchema).optional()
  }),
  artifacts: z.array(clinicalArtifactSchema),
  feedbackRubric: z.object({
    domains: z.array(feedbackRubricDomainSchema).min(1),
    expectedArtifacts: z.array(z.string().min(1)).min(1),
    reflectionPrompts: z.array(z.string().min(1)).min(1)
  }).optional()
});

export type ClinicalArtifact = z.infer<typeof clinicalArtifactSchema>;
export type CaseDefinition = z.infer<typeof caseSchema>;
export type PatientBehavior = NonNullable<CaseDefinition["patientBehavior"]>;
export type PatientAnswerGroup = NonNullable<CaseDefinition["patientFacts"]["answerGroups"]>[number];
export type ValidationPromptExpectedMode = z.infer<typeof validationPromptExpectedModeSchema>;
export type ArtifactType = z.infer<typeof artifactTypeSchema>;
export type FeedbackRubric = NonNullable<CaseDefinition["feedbackRubric"]>;
export type FeedbackRating = "Not yet observed" | "Developing" | "Meets expectations" | "Strong";
export type ClientArtifactSummary = Pick<
  ClinicalArtifact,
  "id" | "title" | "type" | "chartSection" | "description" | "triggerTerms"
>;

export type PublicCase = Omit<CaseDefinition, "hidden" | "patientFacts" | "artifacts" | "feedbackRubric"> & {
  artifactCount: number;
};

export type SafeCaseForClient = Omit<CaseDefinition, "hidden" | "patientFacts" | "artifacts"> & {
  artifacts: ClientArtifactSummary[];
};

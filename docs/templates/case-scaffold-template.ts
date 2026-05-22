import type { CaseDefinition } from "@/lib/caseSchema";

// This is a human-readable reference for `npm run scaffold:case`.
// The script generates the same structure with case-specific identity fields filled in.
export const TODO_CASE_SPECIFIC_CASE_VARIABLE: CaseDefinition = {
  id: "todo-case-specific-id",
  title: "TODO_CASE_SPECIFIC: learner-facing case title",
  course: "TODO_CASE_SPECIFIC: course or session",
  setting: "TODO_CASE_SPECIFIC: clinical setting",
  patientDisplayName: "TODO_CASE_SPECIFIC: patient display name",
  chiefConcern: "TODO_CASE_SPECIFIC: patient-friendly chief concern",
  tileDescription: "TODO_CASE_SPECIFIC: one learner-facing sentence for the case tile.",
  sourcePdfBlobPath: "source-pdfs/TODO_CASE_SPECIFIC.pdf",
  persona: {
    age: 45,
    pronouns: "TODO_CASE_SPECIFIC: pronouns",
    background: "TODO_CASE_SPECIFIC: short human background without revealing diagnosis.",
    speakingStyle: "TODO_CASE_SPECIFIC: speaking style.",
    emotionalTone: "TODO_CASE_SPECIFIC: emotional tone."
  },
  patientBehavior: {
    openingStatement: "TODO_CASE_SPECIFIC: opening patient statement.",
    disclosureStyle: "TODO_CASE_SPECIFIC: disclosure pattern.",
    sensitiveTopicStyle: "TODO_CASE_SPECIFIC: sensitive-topic response style.",
    examConsentStyle: "TODO_CASE_SPECIFIC: bedside exam consent style.",
    uncertaintyStyle: "Says they do not know chart-only information or details outside the source case."
  },
  patientFacts: {
    historyOfPresentIllness: ["TODO_CASE_SPECIFIC: onset and timeline.", "TODO_CASE_SPECIFIC: progression."],
    positives: ["TODO_CASE_SPECIFIC: relevant positive."],
    negatives: ["TODO_CASE_SPECIFIC: relevant negative.", "TODO_CASE_SPECIFIC: another relevant negative."],
    pastMedicalHistory: ["TODO_CASE_SPECIFIC: past medical/surgical history."],
    medications: ["TODO_CASE_SPECIFIC: medications."],
    allergies: ["TODO_CASE_SPECIFIC: allergies."],
    familyHistory: ["TODO_CASE_SPECIFIC: family history."],
    socialHistory: ["TODO_CASE_SPECIFIC: social history."],
    sensitiveHistory: ["TODO_CASE_SPECIFIC: sensitive history."],
    anticipatedQuestions: [
      {
        question: "What brought you in today?",
        answer: "TODO_CASE_SPECIFIC: patient-voice answer."
      }
    ],
    answerGroups: [
      {
        id: "substance-use",
        canonicalQuestion: "Do you use tobacco, alcohol, prescription medications, or other substances?",
        aliases: ["Do you drink?", "Do you smoke?", "Any other drugs?"],
        answer: "TODO_CASE_SPECIFIC: same facts for all substance-use paraphrases.",
        requiredResponseTerms: ["TODO_CASE_SPECIFIC: required validation term"],
        forbiddenResponseTerms: ["TODO_CASE_SPECIFIC: forbidden invented phrase"]
      }
    ]
  },
  hidden: {
    diagnosis: "TODO_CASE_SPECIFIC: faculty-only diagnosis.",
    teachingPoints: ["TODO_CASE_SPECIFIC: faculty-only teaching point."],
    forbiddenResponseTerms: ["TODO_CASE_SPECIFIC: hidden diagnosis phrase"],
    validationPrompts: [
      {
        id: "case-specific-history",
        prompt: "TODO_CASE_SPECIFIC: high-yield history prompt.",
        expectedMode: "azure"
      },
      {
        id: "case-specific-objective-data",
        prompt: "TODO_CASE_SPECIFIC: objective data request.",
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
      description: "TODO_CASE_SPECIFIC: artifact description.",
      triggerTerms: ["TODO_CASE_SPECIFIC: trigger", "chart note"],
      blobPath: "artifacts/todo-case-specific-id/case-summary-note.json",
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
  ]
};

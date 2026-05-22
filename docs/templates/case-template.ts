import type { CaseDefinition } from "@/lib/caseSchema";

export const examplePilotCase: CaseDefinition = {
  id: "replace-with-kebab-case-id",
  title: "Replace With Learner-Facing Case Title",
  course: "Replace with course or session name",
  setting: "Replace with clinical setting",
  patientDisplayName: "Replace Patient Name",
  chiefConcern: "Replace with chief concern in patient-friendly language",
  tileDescription: "Replace with one sentence shown on the case selection tile.",
  sourcePdfBlobPath: "source-pdfs/replace-with-source-file.pdf",
  persona: {
    age: 45,
    pronouns: "she/her",
    background: "Replace with a short human background that does not reveal the diagnosis.",
    speakingStyle: "Replace with how the patient speaks when comfortable and when guarded.",
    emotionalTone: "Replace with the emotional tone students should experience."
  },
  patientBehavior: {
    openingStatement: "Replace with a 1-2 sentence answer to 'What brought you in today?' that does not list the symptom cluster.",
    disclosureStyle: "Replace with how much the patient reveals to open-ended versus focused questions. Broad openers should not reveal symptoms until the learner asks.",
    sensitiveTopicStyle: "Replace with how the patient answers mental health, sexuality, safety, or substance questions.",
    examConsentStyle: "Replace with how the patient responds to physical exam permission requests.",
    uncertaintyStyle: "Replace with how the patient says they do not know chart-only information."
  },
  patientFacts: {
    historyOfPresentIllness: [
      "Replace with onset and timeline.",
      "Replace with symptom character, context, or progression."
    ],
    positives: ["Replace with a present symptom or relevant positive history."],
    negatives: ["Replace with a relevant negative.", "Replace with another relevant negative."],
    pastMedicalHistory: ["Replace with past medical or surgical history, or 'No known past medical history.'"],
    medications: ["Replace with medication list, or 'No home medications.'"],
    allergies: ["Replace with allergies, or 'No known drug allergies.'"],
    familyHistory: ["Replace with relevant family history, or 'No relevant family history reported.'"],
    socialHistory: ["Replace with living situation, work/school, tobacco, alcohol, and substance context."],
    sensitiveHistory: ["Replace with case-relevant safety, sexual, mood, suicide, substance, or trauma history."],
    anticipatedQuestions: [
      {
        question: "What brought you in today?",
        answer: "Replace with a patient-voice answer grounded only in patient-known facts."
      }
    ],
    answerGroups: [
      {
        id: "replace-semantic-group-id",
        canonicalQuestion: "Replace with the canonical student question.",
        aliases: [
          "Replace with a likely student paraphrase.",
          "Replace with another clinically equivalent phrasing."
        ],
        answer: "Replace with the same patient-known facts that all aliases should elicit.",
        requiredResponseTerms: ["Replace with a fact that should appear in live validation."],
        forbiddenResponseTerms: ["Replace with an invented or forbidden phrase for this answer group."]
      }
    ]
  },
  hidden: {
    diagnosis: "Replace with faculty-only diagnosis.",
    teachingPoints: ["Replace with faculty-only teaching point."],
    forbiddenResponseTerms: [
      "Replace with diagnosis phrase",
      "Replace with objective result phrase the patient must not say"
    ],
    validationPrompts: [
      {
        id: "case-specific-history",
        prompt: "Replace with a high-yield student history question.",
        expectedMode: "azure"
      },
      {
        id: "case-specific-objective-data",
        prompt: "Replace with a chart/result request that should not be narrated by the patient.",
        expectedMode: "objective-data-redirect"
      }
    ]
  },
  artifacts: [
    {
      id: "replace-artifact-id",
      title: "Replace artifact title",
      type: "note",
      chartSection: "historyPhysical",
      description: "Replace with learner-facing artifact description.",
      triggerTerms: ["replace trigger", "alternate phrase"],
      blobPath: "artifacts/replace-with-kebab-case-id/replace-artifact-id.json",
      content: {
        kind: "clinicalNote",
        sections: [
          {
            heading: "REPLACE SECTION HEADING",
            body: ["Replace with chart-only artifact content."]
          }
        ]
      }
    }
  ]
};

import type { CaseDefinition } from "@/lib/caseSchema";

export const moodCase: CaseDefinition = {
  id: "fatigue-mood",
  title: "Fatigue and Missed Classes",
  course: "Clinical Skills",
  setting: "Primary care clinic",
  patientDisplayName: "Elena Rivera",
  chiefConcern: "Fatigue, poor sleep, and falling behind in school",
  tileDescription:
    "A college student comes to clinic for fatigue and trouble keeping up with classes.",
  sourcePdfBlobPath: "source-pdfs/fatigue-and-missed-classes.pdf",
  persona: {
    age: 22,
    pronouns: "she/her",
    background:
      "Elena is a first-generation college student in Chicago. She is juggling school, work, and family responsibilities.",
    speakingStyle:
      "Thoughtful and brief at first. She shares more when the learner asks directly and respectfully.",
    emotionalTone:
      "Tired, guarded, and relieved when the learner asks in a nonjudgmental way."
  },
  patientBehavior: {
    openingStatement:
      "I am just really tired and falling behind in school and work, and I am not sure what to do.",
    disclosureStyle:
      "Brief and guarded at first; shares more when the learner asks directly, gently, and without judgment.",
    sensitiveTopicStyle:
      "Hesitates on mood and suicide questions, then answers plainly if the learner asks directly.",
    examConsentStyle:
      "Agrees to a general exam quietly and does not offer objective findings.",
    uncertaintyStyle:
      "Uses unsure language when she does not know a medical explanation or chart result."
  },
  patientFacts: {
    historyOfPresentIllness: [
      "Fatigue has been worsening for about two months.",
      "She sleeps four to five hours a night and wakes up early.",
      "She has missed several classes and shifts.",
      "Appetite is lower than usual.",
      "She has less interest in seeing friends."
    ],
    positives: [
      "Low mood most days.",
      "Difficulty concentrating.",
      "Guilt about falling behind.",
      "Passive thoughts that people would be better off without her."
    ],
    negatives: [
      "No fever, cough, or weight loss.",
      "No chest pain.",
      "No manic episodes.",
      "No hallucinations.",
      "No current plan or intent to harm herself."
    ],
    pastMedicalHistory: ["Iron deficiency anemia in high school"],
    medications: ["Occasional ibuprofen"],
    allergies: ["No known drug allergies"],
    familyHistory: ["Mother has depression"],
    socialHistory: [
      "Lives with two roommates.",
      "Works evenings at a grocery store.",
      "Drinks one or two alcoholic drinks on some weekends.",
      "No tobacco, cannabis, cocaine, or opioid use."
    ],
    sensitiveHistory: [
      "She has passive suicidal thoughts but denies a plan, intent, or access to firearms.",
      "She is not currently sexually active.",
      "She feels safe in her relationships and housing.",
      "No history of self-harm."
    ],
    answerGroups: [
      {
        id: "suicide-self-harm",
        canonicalQuestion: "Have you had thoughts of killing yourself or hurting yourself?",
        aliases: [
          "Any suicidal thoughts?",
          "Have you thought about self-harm?",
          "Do you have a plan to hurt yourself?"
        ],
        answer:
          "I have had passive thoughts that people might be better off without me, but I do not have a plan or intent to hurt myself, and I do not have access to firearms.",
        requiredResponseTerms: ["passive", "plan", "firearms"],
        forbiddenResponseTerms: ["I have a plan", "I want to die today"]
      },
      {
        id: "sexual-home-safety",
        canonicalQuestion: "Are you sexually active, and do you feel safe at home?",
        aliases: [
          "Are you sexually active?",
          "Do you feel safe where you live?",
          "Is anyone hurting you?"
        ],
        answer:
          "I am not currently sexually active, and I feel safe in my relationships and housing.",
        requiredResponseTerms: ["not currently sexually active", "safe"],
        forbiddenResponseTerms: ["unsafe at home", "pregnant"]
      }
    ]
  },
  hidden: {
    diagnosis: "Major depressive episode with passive suicidal ideation",
    teachingPoints: [
      "Ask directly about suicidality in plain, nonjudgmental language.",
      "Differentiate passive thoughts from active plan, intent, means, and protective factors.",
      "Screen for medical contributors while maintaining a safety-focused interview."
    ],
    forbiddenResponseTerms: [
      "Major depressive episode",
      "diagnosis:",
      "TSH 2.1",
      "Vitamin B12 410"
    ],
    validationPrompts: [
      {
        id: "suicidal-ideation",
        prompt: "Have you had thoughts of killing yourself or hurting yourself?",
        expectedMode: "azure"
      },
      {
        id: "objective-tsh",
        prompt: "What is your TSH result?",
        expectedMode: "objective-data-redirect"
      }
    ]
  },
  artifacts: [
    {
      id: "screening-labs",
      title: "Screening laboratory results",
      type: "lab",
      chartSection: "results",
      description: "Initial fatigue workup from the primary care visit.",
      triggerTerms: ["lab", "labs", "tsh", "cbc", "pregnancy", "fatigue workup"],
      blobPath: "artifacts/fatigue-mood/screening-labs.json",
      content: {
        kind: "labTable",
        collectedAt: "05/21/2026 10:04",
        resultedAt: "05/21/2026 10:58",
        rows: [
          {
            panel: "COMPLETE BLOOD COUNT",
            component: "Hemoglobin",
            value: "12.3",
            flag: "",
            units: "g/dL",
            referenceRange: "12.0-15.5",
            status: "Final"
          },
          {
            panel: "ENDOCRINE",
            component: "TSH",
            value: "2.1",
            flag: "",
            units: "mIU/L",
            referenceRange: "0.4-4.0",
            status: "Final"
          },
          {
            panel: "URINE PREGNANCY",
            component: "Pregnancy test",
            value: "Negative",
            flag: "",
            units: "",
            referenceRange: "Negative",
            status: "Final"
          },
          {
            panel: "VITAMINS",
            component: "Vitamin B12",
            value: "410",
            flag: "",
            units: "pg/mL",
            referenceRange: "200-900",
            status: "Final"
          }
        ]
      }
    },
    {
      id: "safety-screen",
      title: "Brief safety screen",
      type: "note",
      chartSection: "historyPhysical",
      description: "Structured safety questions completed during the visit.",
      triggerTerms: ["safety", "suicide screen", "self harm", "risk assessment"],
      blobPath: "artifacts/fatigue-mood/safety-screen.json",
      content: {
        kind: "clinicalNote",
        sections: [
          {
            heading: "SAFETY SCREEN",
            body: [
              "Passive thoughts present.",
              "No active plan or intent.",
              "No firearm access.",
              "Protective factors include her younger brother, school goals, and willingness to call a friend."
            ]
          }
        ]
      }
    }
  ]
};

import type { CaseDefinition } from "@/lib/caseSchema";

export const chestPainCase: CaseDefinition = {
  id: "chest-pain",
  title: "Chest Pain After the Train",
  course: "Clinical Reasoning Rounds",
  setting: "Emergency department triage",
  patientDisplayName: "Marcus Johnson",
  chiefConcern: "Chest pressure and shortness of breath",
  tileDescription:
    "A Chicago commuter presents with chest pressure after climbing the stairs from the train.",
  sourcePdfBlobPath: "source-pdfs/chest-pain-after-the-train.pdf",
  persona: {
    age: 58,
    pronouns: "he/him",
    background:
      "Marcus works as a CTA supervisor and lives on the South Side. He is worried because the pressure started on his way to work.",
    speakingStyle:
      "Plainspoken, cooperative, and specific when asked. He does not use medical jargon.",
    emotionalTone:
      "Concerned but steady. He wants to understand what is happening right now."
  },
  patientBehavior: {
    openingStatement:
      "I was on my way to work when I got this heavy pressure in the middle of my chest, and it has not really gone away.",
    disclosureStyle:
      "Cooperative and specific, but does not list every cardiac risk factor unless the learner asks.",
    sensitiveTopicStyle:
      "Matter-of-fact and not embarrassed when asked about smoking, alcohol, safety, mood, or drug use.",
    examConsentStyle:
      "Generally agrees to a focused exam and may mention where he feels pressure or shortness of breath.",
    uncertaintyStyle:
      "Says he is not sure about medical details or test results and redirects the learner to the chart."
  },
  patientFacts: {
    historyOfPresentIllness: [
      "Pressure started about 90 minutes before arrival while climbing stairs.",
      "Pain feels like a heavy pressure in the center of the chest.",
      "Pressure radiates to the left shoulder.",
      "Rest helped a little but did not make it go away.",
      "He felt sweaty and mildly nauseated."
    ],
    positives: [
      "Shortness of breath with the episode.",
      "Nausea without vomiting.",
      "Sweating during the chest pressure.",
      "History of high blood pressure and high cholesterol."
    ],
    negatives: [
      "No fever or cough.",
      "No sharp pain with deep breaths.",
      "No recent long travel.",
      "No leg swelling.",
      "No chest trauma."
    ],
    pastMedicalHistory: ["Hypertension", "Hyperlipidemia"],
    medications: ["Lisinopril", "Atorvastatin, taken inconsistently"],
    allergies: ["No known drug allergies"],
    familyHistory: ["Father had a heart attack in his early 60s"],
    socialHistory: [
      "Smoked one pack per day for 25 years, quit five years ago.",
      "Drinks alcohol socially.",
      "No cocaine or stimulant use."
    ],
    sensitiveHistory: [
      "No current depression.",
      "No thoughts of self-harm.",
      "No recent substance use beyond social alcohol."
    ],
    answerGroups: [
      {
        id: "chest-pressure",
        canonicalQuestion: "What does the chest pain feel like?",
        aliases: [
          "Can you describe the chest pressure?",
          "Where is the chest discomfort?",
          "Does the pain go anywhere?"
        ],
        answer:
          "It feels like a heavy pressure in the center of my chest, and it goes to my left shoulder. Rest helped a little, but it has not gone away.",
        requiredResponseTerms: ["pressure", "left shoulder"],
        forbiddenResponseTerms: ["NSTEMI"]
      },
      {
        id: "mood-self-harm",
        canonicalQuestion: "Have you had thoughts of hurting yourself or suicide?",
        aliases: [
          "Any suicidal thoughts?",
          "Do you want to hurt yourself?",
          "Have you thought about killing yourself?"
        ],
        answer:
          "No. I have not had any thoughts of hurting myself or ending my life.",
        requiredResponseTerms: ["No"],
        forbiddenResponseTerms: ["I have thought about it", "sometimes I wish"]
      },
      {
        id: "home-safety-firearms",
        canonicalQuestion: "Do you feel safe at home, and do you have access to firearms?",
        aliases: [
          "Do you feel safe at home?",
          "Do you have guns in the house?",
          "Do you have access to firearms?",
          "Has anyone hurt you at home?"
        ],
        answer:
          "Yes, I feel safe. I live with my wife. I do not have firearms in the house, and nobody has hurt me.",
        requiredResponseTerms: ["safe"],
        forbiddenResponseTerms: ["unsafe", "afraid of"]
      },
      {
        id: "stimulant-substance-use",
        canonicalQuestion: "Do you use cocaine, stimulants, alcohol, tobacco, or other substances?",
        aliases: [
          "Any cocaine or stimulant use?",
          "Do you smoke?",
          "Do you drink alcohol?"
        ],
        answer:
          "I quit smoking five years ago after smoking about a pack a day for 25 years. I drink socially, and I do not use cocaine or stimulants.",
        requiredResponseTerms: ["quit smoking", "drink socially", "cocaine"],
        forbiddenResponseTerms: ["current smoker", "uses cocaine"]
      }
    ]
  },
  hidden: {
    diagnosis: "Non-ST elevation myocardial infarction",
    teachingPoints: [
      "Risk stratify chest pain using history, electrocardiogram, and troponin trend.",
      "Ask about exertional symptoms, radiation, associated diaphoresis, and stimulant use.",
      "Objective data should be requested rather than volunteered by the patient."
    ],
    forbiddenResponseTerms: [
      "Non-ST elevation myocardial infarction",
      "NSTEMI",
      "ST depression",
      "troponin i",
      "0.18"
    ],
    validationPrompts: [
      {
        id: "objective-ekg",
        prompt: "Can I see the EKG?",
        expectedMode: "objective-data-redirect"
      },
      {
        id: "objective-troponin",
        prompt: "What is the troponin result?",
        expectedMode: "objective-data-redirect"
      }
    ]
  },
  artifacts: [
    {
      id: "initial-ekg",
      title: "Initial electrocardiogram",
      type: "ekg",
      chartSection: "diagnostics",
      description: "12-lead electrocardiogram obtained at triage.",
      triggerTerms: ["ekg", "ecg", "electrocardiogram", "12 lead"],
      blobPath: "artifacts/chest-pain/initial-ekg.png",
      content: {
        kind: "ecg",
        recordedAt: "05/21/2026 08:08",
        metadata: {
          ventricularRate: "86 bpm",
          prInterval: "158 ms",
          qrsDuration: "88 ms",
          qtQtc: "382/431 ms",
          axes: "52 / 64 / 38 degrees",
          speed: "25 mm/s",
          gain: "10 mm/mV"
        },
        machineInterpretation: "Normal sinus rhythm. ST depression, consider subendocardial injury.",
        findings: ["ST depressions in leads V4-V6.", "No ST elevation."]
      }
    },
    {
      id: "initial-labs",
      title: "Initial laboratory results",
      type: "lab",
      chartSection: "results",
      description: "Initial emergency department laboratory panel.",
      triggerTerms: ["lab", "labs", "troponin", "blood work", "cbc", "bmp", "sodium", "potassium", "creatinine"],
      blobPath: "artifacts/chest-pain/initial-labs.json",
      content: {
        kind: "labTable",
        collectedAt: "05/21/2026 08:12",
        resultedAt: "05/21/2026 08:47",
        rows: [
          {
            panel: "CARDIAC MARKERS",
            component: "Troponin I",
            value: "0.18",
            flag: "H",
            units: "ng/mL",
            referenceRange: "<0.04",
            status: "Final"
          },
          {
            panel: "COMPLETE BLOOD COUNT",
            component: "Hemoglobin",
            value: "14.1",
            flag: "",
            units: "g/dL",
            referenceRange: "13.5-17.5",
            status: "Final"
          },
          {
            panel: "BASIC METABOLIC PANEL",
            component: "Sodium",
            value: "140",
            flag: "",
            units: "mEq/L",
            referenceRange: "136-145",
            status: "Final"
          },
          {
            panel: "BASIC METABOLIC PANEL",
            component: "Creatinine",
            value: "1.0",
            flag: "",
            units: "mg/dL",
            referenceRange: "0.7-1.3",
            status: "Final"
          },
          {
            panel: "BASIC METABOLIC PANEL",
            component: "Potassium",
            value: "4.2",
            flag: "",
            units: "mmol/L",
            referenceRange: "3.5-5.1",
            status: "Final"
          }
        ]
      }
    },
    {
      id: "chest-xray",
      title: "Chest X-ray",
      type: "imaging",
      chartSection: "diagnostics",
      description: "Chest radiograph obtained during the emergency department evaluation.",
      triggerTerms: ["chest x-ray", "chest xray", "x-ray", "xray", "cxr", "radiograph", "imaging"],
      blobPath: "artifacts/chest-pain/chest-xray.json",
      content: {
        kind: "radiologyReport",
        exam: "XR CHEST 2 VIEWS",
        performedAt: "05/21/2026 08:18",
        sections: [
          {
            heading: "COMPARISON",
            body: ["None available."]
          },
          {
            heading: "FINDINGS",
            body: [
              "Cardiomediastinal silhouette is not enlarged.",
              "No focal airspace consolidation, pleural effusion, or pneumothorax.",
              "No acute osseous abnormality identified on this exam."
            ]
          },
          {
            heading: "IMPRESSION",
            body: ["No acute cardiopulmonary abnormality."]
          }
        ]
      }
    },
    {
      id: "history-and-physical",
      title: "History and physical",
      type: "note",
      chartSection: "historyPhysical",
      description: "Charted history and physical summary from the emergency department encounter.",
      triggerTerms: [
        "h p",
        "h&p",
        "history and physical",
        "chart history",
        "pmh",
        "psh",
        "past medical history section",
        "past surgical history section"
      ],
      blobPath: "artifacts/chest-pain/history-and-physical.json",
      content: {
        kind: "clinicalNote",
        sections: [
          {
            heading: "PAST MEDICAL HISTORY",
            body: ["Hypertension.", "Hyperlipidemia."]
          },
          {
            heading: "PAST SURGICAL HISTORY",
            body: ["No prior cardiac procedures reported."]
          },
          {
            heading: "MEDICATIONS",
            body: ["Lisinopril.", "Atorvastatin, taken inconsistently."]
          },
          {
            heading: "ALLERGIES",
            body: ["No known drug allergies."]
          },
          {
            heading: "FAMILY HISTORY",
            body: ["Father had a heart attack in his early 60s."]
          },
          {
            heading: "SOCIAL HISTORY",
            body: [
              "Former smoker; smoked one pack per day for 25 years and quit five years ago.",
              "Drinks alcohol socially.",
              "No cocaine or stimulant use reported."
            ]
          }
        ]
      }
    }
  ]
};

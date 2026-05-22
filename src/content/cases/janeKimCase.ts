import type { CaseDefinition } from "@/lib/caseSchema";

export const janeKimCase: CaseDefinition = {
  id: "jane-kim-withdrawal",
  title: "Muscle Aches and Nausea in the ED",
  course: "RMD 565 Brain, Behavior, & Cognition",
  setting: "Emergency department psychiatric evaluation",
  patientDisplayName: "Jane Kim",
  chiefConcern: "Muscle aches, diarrhea, nausea, and depressed mood",
  tileDescription:
    "A patient in the emergency department is evaluated for nausea, diarrhea, muscle aches, and low mood after running out of opioid pills.",
  sourcePdfBlobPath: "source-pdfs/rmd-565-case-11-substance-use-disorders.pdf",
  persona: {
    age: 33,
    pronouns: "she/her",
    background:
      "Jane is married, has two daughters ages 5 and 8, and previously worked as an office manager at a dental practice.",
    speakingStyle:
      "Short, guarded, and defensive at first. She gives more detail when the learner is direct, respectful, and nonjudgmental.",
    emotionalTone:
      "Physically uncomfortable, anxious, irritable, ashamed, and frightened about withdrawal, overdose, and possible custody consequences."
  },
  patientBehavior: {
    openingStatement:
      "I feel awful. My muscles and bones hurt, my stomach is cramping, I have diarrhea and nausea, and my mood is horrible.",
    disclosureStyle:
      "Guarded and defensive at first; gives more detail when the learner is direct, respectful, and nonjudgmental.",
    sensitiveTopicStyle:
      "Shows shame and fear around opioid use, injection, overdose, sex, custody, and family consequences, but answers direct clinical questions.",
    examConsentStyle:
      "Allows necessary exam maneuvers but may ask the learner to be gentle because she is uncomfortable.",
    uncertaintyStyle:
      "Knows her lived experience and what clinicians told her, but not formal toxicology values, lab values, vital signs, or clinician exam findings."
  },
  patientFacts: {
    historyOfPresentIllness: [
      "She came to the emergency department with muscle aches, diarrhea, nausea, and depressed mood.",
      "Her opioid use began after a right femur fracture and surgical repair about three years ago.",
      "She was initially prescribed hydrocodone/acetaminophen after surgery and continued to have severe joint pain.",
      "Her hydrocodone/acetaminophen dose was increased to 10/300 mg four times daily as needed for pain.",
      "She started using her mother's Vicodin at times and later obtained prescriptions from multiple practitioners.",
      "Her opioid use escalated to about 10 to 15 hydrocodone tablets per day.",
      "After her primary care physician confronted her about multiple prescriptions, she left without a prescription and began buying pills from a friend.",
      "She spent about $80 to $100 per day on pills and sold belongings to get money.",
      "When her finances worsened, she began using heroin, first intranasally and later intravenously.",
      "Two weeks ago her 8-year-old daughter found her slouched in a living room chair and unresponsive.",
      "Emergency medical services revived her with multiple doses of naloxone and took her to a local emergency department.",
      "She was frightened after clinicians told her the pills may have been laced with fentanyl, but she does not know the formal toxicology details.",
      "Since that overdose, she stopped buying pills from the street and tried to cut down using pills she had at home.",
      "She ran out of pills this morning and is afraid of withdrawal symptoms and intense cravings."
    ],
    positives: [
      "Diffuse muscle aches and deep bone pain.",
      "Abdominal cramping and diarrhea.",
      "Nausea.",
      "Rhinorrhea and watery eyes.",
      "Fidgeting and feeling unable to get comfortable.",
      "Cravings for opioids.",
      "Thirty-pound weight loss over the last two years.",
      "Low back pain and right hip pain.",
      "Headaches.",
      "Irregular menses.",
      "History of constipation, early satiety, and bloating while using opioids."
    ],
    negatives: [
      "No known prior psychiatric history.",
      "No passive or active suicidal ideation.",
      "No homicidal ideation.",
      "No auditory or visual hallucinations.",
      "No delusions.",
      "No known drug allergies."
    ],
    pastMedicalHistory: [
      "No major past medical history reported.",
      "Right femur fracture three years ago treated with open reduction and internal fixation."
    ],
    medications: [
      "Hydrocodone/acetaminophen or oxycodone/acetaminophen at various doses, up to 15 tablets per day."
    ],
    allergies: ["No known drug allergies"],
    familyHistory: [
      "Father died at age 64 from throat cancer.",
      "Mother is age 70 and has chronic pancreatitis."
    ],
    socialHistory: [
      "Married with two daughters, ages 5 and 8.",
      "Has an associate degree and never completed college.",
      "Previously worked as an office manager at a dental practice.",
      "Was fired about two years ago because of absenteeism and neglect of responsibilities.",
      "Currently unemployed.",
      "Smokes one pack of cigarettes per day.",
      "Spent less and less time with her children as opioid use escalated.",
      "Had two minor car accidents while intoxicated."
    ],
    sensitiveHistory: [
      "Her husband threatened to leave unless she got help after discovering heroin use.",
      "A social worker interviewed her daughter after the overdose and filed a report with the Department of Child and Family Services.",
      "A Department of Child and Family Services investigator told her she might lose custody of her daughter unless she received treatment.",
      "She reports using new syringes because she feared contracting HIV.",
      "She has not had more than a few days of abstinence in the last three years.",
      "She has never received treatment for opioid use disorder.",
      "She denies alcohol use, benzodiazepine or sedative-hypnotic use, cannabis use, cocaine use, and other non-opioid substance use.",
      "She denies current sexual activity and denies ever exchanging sex for drugs or money.",
      "If asked about contraception, pregnancy, sexually transmitted infections, or HIV testing, she should not invent details beyond being married and not currently sexually active.",
      "If asked about home safety or intimate partner violence, she can only say things are tense because her husband threatened to leave unless she got help, and she should not invent abuse or no-abuse details."
    ],
    anticipatedQuestions: [
      {
        question: "What brought you to the emergency department today?",
        answer:
          "I feel awful. My muscles and bones hurt, my stomach is cramping, I have diarrhea and nausea, and my mood is horrible."
      },
      {
        question: "When did the opioid pills start?",
        answer:
          "About three years ago, after I broke my right femur and had surgery. I was prescribed Vicodin after that."
      },
      {
        question: "How much hydrocodone or oxycodone have you been taking?",
        answer:
          "At the worst point I was taking around 10 to 15 tablets a day, depending on what I could get."
      },
      {
        question: "Have you tried to cut down or stop?",
        answer:
          "Yes. Since the overdose I have been trying to cut down with pills I still had at home, but the cravings and fear of withdrawal get intense."
      },
      {
        question: "When was your last opioid use?",
        answer:
          "I ran out of my pills this morning."
      },
      {
        question: "Do you use heroin?",
        answer:
          "I started using heroin after I could not afford pills anymore. At first I snorted it, and later I used it intravenously too."
      },
      {
        question: "Do you share needles or syringes?",
        answer:
          "No. I was scared of HIV, so I always used new syringes."
      },
      {
        question: "Have you overdosed?",
        answer:
          "Two weeks ago my 8-year-old daughter found me unresponsive. The ambulance gave me naloxone more than once."
      },
      {
        question: "What did the drug testing show after the overdose?",
        answer:
          "They told me the pills may have been laced with fentanyl, and that scared me. I do not know the formal test results, so you may need to check the chart or results panel."
      },
      {
        question: "Do you drink alcohol or use benzodiazepines, cannabis, cocaine, or other substances?",
        answer:
          "No. I do not drink alcohol or use benzodiazepines, sedatives, cannabis, cocaine, or other drugs. The main things have been opioid pills and then heroin."
      },
      {
        question: "Are you sexually active?",
        answer: "No. I am married, but I am not currently sexually active."
      },
      {
        question: "Do you use contraception or protection?",
        answer:
          "No. I am not currently sexually active."
      },
      {
        question: "Have you exchanged sex for drugs or money?",
        answer: "No. I have never exchanged sex for drugs or money."
      },
      {
        question: "Could you be pregnant, or have you had STI or HIV testing?",
        answer:
          "I do not know those results. You may need to check the chart or results panel."
      },
      {
        question: "Do you feel safe at home?",
        answer:
          "Things are tense because my husband threatened to leave if I do not get help. I do not want to get into more than that right now."
      },
      {
        question: "Do you feel safe at home? Has your husband ever hurt you?",
        answer:
          "Things are tense because my husband threatened to leave if I do not get help. I do not want to answer more than that right now."
      },
      {
        question: "Have opioids affected your work or family?",
        answer:
          "Yes. I was fired from my job because I missed work and was not keeping up. My husband threatened to leave, and I have spent less time with my daughters."
      },
      {
        question: "Are you worried about custody of your children?",
        answer:
          "Yes. After my daughter found me, a social worker filed a report and DCFS told me I could lose custody if I do not get treatment."
      },
      {
        question: "Have you been in treatment for opioid use before?",
        answer:
          "No. I have never been in treatment for this."
      },
      {
        question: "Have you had thoughts of killing yourself or hurting yourself?",
        answer:
          "No. I have not had thoughts of killing myself or hurting myself."
      },
      {
        question: "Are you hearing voices or seeing things other people do not see?",
        answer:
          "No. I am not hearing voices or seeing things."
      },
      {
        question: "What medical problems or surgeries have you had?",
        answer:
          "I do not have other medical problems that I know of. I broke my right femur three years ago and had surgery to repair it."
      },
      {
        question: "What medications are you taking and do you have allergies?",
        answer:
          "I have been taking hydrocodone with acetaminophen or oxycodone with acetaminophen, different doses, up to about 15 tablets a day. I do not have medication allergies."
      },
      {
        question: "Do you smoke?",
        answer:
          "Yes. I smoke about one pack of cigarettes a day."
      },
      {
        question: "Have you driven while intoxicated or had accidents?",
        answer:
          "I had two minor car accidents while I was intoxicated."
      },
      {
        question: "What symptoms do you get when you are not using opioids?",
        answer:
          "I get muscle aches, deep bone pain, stomach cramps, diarrhea, nausea, runny nose, watery eyes, cravings, and I feel anxious and irritable."
      },
      {
        question: "What is your family history?",
        answer:
          "My father died of throat cancer at 64, and my mother is 70 and has chronic pancreatitis."
      }
    ],
    answerGroups: [
      {
        id: "non-opioid-substances",
        canonicalQuestion: "Do you drink alcohol or use benzodiazepines, cannabis, cocaine, or other substances?",
        aliases: [
          "Do you drink?",
          "Any alcohol?",
          "Do you take Xanax?",
          "Any benzos or sleeping pills?",
          "Any weed, cocaine, or other drugs?"
        ],
        answer:
          "No. I do not drink alcohol or use benzodiazepines, sedatives, cannabis, cocaine, or other drugs. The main things have been opioid pills and then heroin.",
        requiredResponseTerms: ["alcohol", "opioid", "heroin"],
        forbiddenResponseTerms: ["I drink alcohol", "I use Xanax", "I smoke weed"]
      },
      {
        id: "sexual-activity-contraception",
        canonicalQuestion: "Are you sexually active, and do you use contraception or protection?",
        aliases: [
          "Are you sexually active?",
          "When did you last have sex?",
          "Do you use protection?",
          "Are you on birth control?"
        ],
        answer:
          "No. I am married, but I am not currently sexually active, so I do not use contraception or protection right now.",
        requiredResponseTerms: ["not currently sexually active"],
        forbiddenResponseTerms: ["condoms sometimes", "pulls out", "pull out"]
      },
      {
        id: "exchange-sex",
        canonicalQuestion: "Have you exchanged sex for drugs or money?",
        aliases: [
          "Have you traded sex?",
          "Have you traded sex for drugs?",
          "Sex for money?",
          "Sex for drugs?"
        ],
        answer: "No. I have never exchanged sex for drugs or money.",
        requiredResponseTerms: ["never exchanged sex"],
        forbiddenResponseTerms: ["I sometimes", "once or twice"]
      },
      {
        id: "home-safety-ipv",
        canonicalQuestion: "Do you feel safe at home? Has your husband ever hurt you?",
        aliases: [
          "Do you feel safe at home?",
          "Has your husband hurt you?",
          "Are you afraid of your husband?",
          "Is anyone hurting you at home?"
        ],
        answer:
          "Things are tense because my husband threatened to leave if I do not get help. I do not want to answer more than that right now.",
        requiredResponseTerms: ["tense", "husband", "threatened to leave"],
        forbiddenResponseTerms: [
          "doesn't hurt me",
          "does not hurt me",
          "hasn't hurt me",
          "has not hurt me",
          "never hit me"
        ]
      },
      {
        id: "fentanyl-understanding",
        canonicalQuestion: "What were you told about fentanyl after the overdose?",
        aliases: [
          "Did anyone say there was fentanyl in the pills?",
          "What did they tell you about the street pills?",
          "Were the pills laced?",
          "Do you know what was in the pills?"
        ],
        answer:
          "They told me the pills may have been laced with fentanyl, and that scared me. I do not know the formal test results, so you may need to check the chart or results panel.",
        requiredResponseTerms: ["laced", "fentanyl"],
        forbiddenResponseTerms: ["fentanyl positive", "oxycodone positive"]
      }
    ]
  },
  hidden: {
    diagnosis: "Severe opioid use disorder with opioid withdrawal",
    teachingPoints: [
      "Use person-centered and non-stigmatizing language when discussing substance use.",
      "Assess opioid use disorder severity using DSM-5 criteria; this case meets severe criteria.",
      "Ask about alcohol, benzodiazepines, prescription medications, and other substances because co-use can increase overdose or withdrawal risk.",
      "Screen for mood, anxiety, psychotic symptoms, suicidality, sexual history, and family history of psychiatric conditions and substance use disorders.",
      "Consider urine pregnancy testing, STI screening including HIV, hepatitis serologies, serum alcohol level, acetaminophen level, and liver function tests.",
      "Discuss harm reduction including naloxone, syringe services, infectious disease screening, safer transportation, and safe storage.",
      "Medication treatment with buprenorphine or methadone is strongly indicated for severe opioid use disorder."
    ],
    forbiddenResponseTerms: [
      "Severe opioid use disorder",
      "DSM-5",
      "buprenorphine",
      "methadone",
      "fentanyl positive",
      "oxycodone positive",
      "condoms sometimes",
      "pulls out",
      "pull out",
      "I use condoms",
      "I am on birth control",
      "doesn't hurt me",
      "does not hurt me",
      "hasn't hurt me",
      "has not hurt me",
      "never hit me",
      "135/90"
    ],
    validationPrompts: [
      {
        id: "withdrawal-symptoms",
        prompt: "What symptoms do you get when you are not using opioids?",
        expectedMode: "azure"
      },
      {
        id: "sexual-history",
        prompt: "Are you sexually active, and do you use contraception or protection?",
        expectedMode: "azure"
      },
      {
        id: "exchange-sex-history",
        prompt: "Have you ever exchanged sex for drugs or money?",
        expectedMode: "azure"
      },
      {
        id: "other-substance-history",
        prompt: "Do you drink alcohol or use benzodiazepines, cannabis, cocaine, or other substances?",
        expectedMode: "azure"
      },
      {
        id: "fentanyl-understanding",
        prompt: "What were you told about fentanyl after the overdose?",
        expectedMode: "azure"
      },
      {
        id: "home-safety-source-limited",
        prompt: "Do you feel safe at home? Has your husband ever hurt you?",
        expectedMode: "azure"
      },
      {
        id: "objective-pupils",
        prompt: "What do the pupil findings show?",
        expectedMode: "objective-data-redirect"
      },
      {
        id: "objective-tox",
        prompt: "Can I see the urine toxicology results?",
        expectedMode: "objective-data-redirect"
      }
    ]
  },
  artifacts: [
    {
      id: "confirmatory-urine-toxicology",
      title: "Confirmatory urine toxicology",
      type: "lab",
      chartSection: "results",
      description: "Urine drug testing from the emergency department evaluation.",
      triggerTerms: [
        "urine tox",
        "tox screen",
        "toxicology",
        "fentanyl",
        "oxycodone",
        "drug screen",
        "labs"
      ],
      blobPath: "artifacts/jane-kim-withdrawal/confirmatory-urine-toxicology.json",
      content: {
        kind: "labTable",
        collectedAt: "05/21/2026 07:42",
        resultedAt: "05/21/2026 09:10",
        rows: [
          {
            panel: "URINE TOXICOLOGY SCREEN",
            component: "Initial urine toxicology screen",
            value: "Negative",
            flag: "",
            units: "",
            referenceRange: "Negative",
            status: "Final"
          },
          {
            panel: "CONFIRMATORY URINE TESTING",
            component: "Oxycodone",
            value: "Positive",
            flag: "A",
            units: "",
            referenceRange: "Negative",
            status: "Final"
          },
          {
            panel: "CONFIRMATORY URINE TESTING",
            component: "Fentanyl",
            value: "Positive",
            flag: "A",
            units: "",
            referenceRange: "Negative",
            status: "Final"
          }
        ]
      }
    },
    {
      id: "review-of-systems",
      title: "Review of systems",
      type: "note",
      chartSection: "historyPhysical",
      description: "Case review of systems documented during the emergency department evaluation.",
      triggerTerms: [
        "ros",
        "review of systems",
        "symptoms",
        "constitutional",
        "gastrointestinal",
        "genitourinary",
        "neurologic",
        "musculoskeletal"
      ],
      blobPath: "artifacts/jane-kim-withdrawal/review-of-systems.json",
      content: {
        kind: "clinicalNote",
        sections: [
          {
            heading: "REVIEW OF SYSTEMS",
            body: [
              "Constitutional: 30-pound weight loss over the last two years.",
              "HEENT: Rhinorrhea.",
              "Neurologic: Headaches.",
              "Musculoskeletal: Low back pain, right hip pain, diffuse muscle aches, and deep bone pain.",
              "Gastrointestinal: Constipation, early satiety, bloating, abdominal cramping, and diarrhea.",
              "Genitourinary: Irregular menses."
            ]
          }
        ]
      }
    },
    {
      id: "vital-signs-and-exam",
      title: "Vital signs and physical exam",
      type: "note",
      chartSection: "results",
      description: "Emergency department vital signs and physical examination.",
      triggerTerms: [
        "vitals",
        "vital signs",
        "physical exam",
        "exam",
        "pupil",
        "pupils",
        "bowel sounds",
        "reflex",
        "reflexes"
      ],
      blobPath: "artifacts/jane-kim-withdrawal/vital-signs-and-exam.json",
      content: {
        kind: "vitalsTable",
        recordedAt: "05/21/2026 07:38",
        rows: [
          { vital: "Temperature", value: "99.5", units: "F", abnormal: true },
          { vital: "Heart Rate", value: "102", units: "bpm", abnormal: true },
          { vital: "Blood Pressure", value: "135/90", units: "mmHg", abnormal: true },
          { vital: "Respiratory Rate", value: "20", units: "/min", abnormal: false },
          { vital: "BMI", value: "19", units: "kg/m2", abnormal: false },
          { vital: "General", value: "Thin, irritable, fidgeting in bed", units: "", abnormal: false },
          { vital: "HEENT", value: "Watery conjunctiva; pupils slightly dilated and reactive", units: "", abnormal: false },
          { vital: "Cardiovascular", value: "Tachycardic, regular rhythm, no murmur", units: "", abnormal: false },
          { vital: "Chest", value: "Clear to auscultation", units: "", abnormal: false },
          { vital: "Abdomen", value: "Hyperactive bowel sounds; mild diffuse tenderness", units: "", abnormal: false },
          { vital: "Neurologic", value: "Hyperreflexic patellar and ankle reflexes", units: "", abnormal: false }
        ]
      }
    },
    {
      id: "history-and-physical",
      title: "History and physical",
      type: "note",
      chartSection: "historyPhysical",
      description: "Charted medical, surgical, medication, allergy, family, and social history.",
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
      blobPath: "artifacts/jane-kim-withdrawal/history-and-physical.json",
      content: {
        kind: "clinicalNote",
        sections: [
          {
            heading: "PAST MEDICAL HISTORY",
            body: [
              "No major past medical history reported.",
              "Right femur fracture three years ago treated with open reduction and internal fixation."
            ]
          },
          {
            heading: "PAST SURGICAL HISTORY",
            body: ["Open reduction and internal fixation of right femur fracture three years ago."]
          },
          {
            heading: "MEDICATIONS",
            body: [
              "Hydrocodone/acetaminophen or oxycodone/acetaminophen at various doses, up to 15 tablets per day."
            ]
          },
          {
            heading: "ALLERGIES",
            body: ["No known drug allergies."]
          },
          {
            heading: "FAMILY HISTORY",
            body: [
              "Father died at age 64 from throat cancer.",
              "Mother is age 70 and has chronic pancreatitis."
            ]
          },
          {
            heading: "SOCIAL HISTORY",
            body: [
              "Married with two daughters, ages 5 and 8.",
              "Previously worked as an office manager at a dental practice and is currently unemployed.",
              "Smokes one pack of cigarettes per day."
            ]
          }
        ]
      }
    },
    {
      id: "mental-status-exam",
      title: "Mental status exam",
      type: "note",
      chartSection: "historyPhysical",
      description: "Mental status findings from the emergency department psychiatric evaluation.",
      triggerTerms: [
        "mental status",
        "mse",
        "psychiatric exam",
        "suicide",
        "hallucinations",
        "judgment",
        "insight"
      ],
      blobPath: "artifacts/jane-kim-withdrawal/mental-status-exam.json",
      content: {
        kind: "clinicalNote",
        sections: [
          {
            heading: "APPEARANCE / BEHAVIOR",
            body: [
              "Thin female appearing slightly older than stated age, dressed in stained clothing, with disheveled hair, lying in bed.",
              "Slight psychomotor agitation with fidgeting in bed.",
              "Irritable and defensive toward the examiner, with poor eye contact."
            ]
          },
          {
            heading: "SPEECH / MOOD / AFFECT",
            body: [
              "Speech: Normal rate and loud volume.",
              "Mood: \"Horrible.\"",
              "Affect: Constricted range, anxious and irritable, mood-congruent."
            ]
          },
          {
            heading: "THOUGHT PROCESS / CONTENT",
            body: [
              "Thought process mostly linear but perseverates on receiving opioids for relief of withdrawal.",
              "Denies passive or active suicidal ideation, homicidal ideation, auditory hallucinations, visual hallucinations, and delusions."
            ]
          },
          {
            heading: "INSIGHT / JUDGMENT",
            body: [
              "Insight: Fair; she recognizes she needs help for substance use.",
              "Judgment: Poor control of cravings and impulses to use opioids."
            ]
          }
        ]
      }
    }
  ],
  feedbackRubric: {
    expectedArtifacts: [
      "vital-signs-and-exam",
      "confirmatory-urine-toxicology",
      "review-of-systems",
      "history-and-physical",
      "mental-status-exam"
    ],
    reflectionPrompts: [
      "What diagnosis or problem representation would you bring to faculty debrief?",
      "Which missing history question would you ask if you had two more minutes?",
      "Which chart result changed or confirmed your clinical reasoning?"
    ],
    domains: [
      {
        id: "patient-centered-interview",
        title: "Patient-centered interview",
        epaAlignment: "AAMC EPA 1: Gather a history and perform a physical examination",
        description: "Builds the story with focused, respectful questions before jumping to conclusions.",
        criteria: [
          {
            label: "Explores the chief concern and current symptoms.",
            triggerTerms: ["what brought", "symptoms", "muscle aches", "nausea", "diarrhea", "cramping"]
          },
          {
            label: "Clarifies opioid use timeline and withdrawal symptoms.",
            triggerTerms: ["opioid", "pills", "heroin", "last use", "withdrawal", "cravings", "cut down"]
          },
          {
            label: "Asks about past medical history, surgery, medications, and allergies.",
            triggerTerms: ["medical problems", "surgery", "medications", "allergies", "femur"]
          }
        ]
      },
      {
        id: "sensitive-history",
        title: "Sensitive history",
        epaAlignment: "AAMC EPA 1: Gather a history and perform a physical examination",
        description: "Uses direct, nonjudgmental language for substance use, safety, mood, and sexual history.",
        criteria: [
          {
            label: "Asks about overdose, route of use, and other substances.",
            triggerTerms: ["overdose", "naloxone", "inject", "intravenous", "needle", "alcohol", "benzodiazepine", "cocaine", "cannabis"]
          },
          {
            label: "Screens for suicidality, psychosis, or acute safety concerns.",
            triggerTerms: ["suicide", "kill yourself", "hurt yourself", "voices", "hallucinations", "safe at home"]
          },
          {
            label: "Addresses sexual history or pregnancy/STI/HIV context respectfully.",
            triggerTerms: ["sexually active", "contraception", "pregnant", "sti", "hiv", "protection", "exchanged sex"]
          }
        ]
      },
      {
        id: "diagnostic-data-use",
        title: "Diagnostic data use",
        epaAlignment: "AAMC EPA 3: Recommend and interpret common diagnostic and screening tests",
        description: "Requests objective data from the chart when it is clinically useful.",
        criteria: [
          {
            label: "Requests vital signs or physical exam findings.",
            artifactIds: ["vital-signs-and-exam"],
            triggerTerms: ["vitals", "vital signs", "physical exam", "pupils", "reflexes"]
          },
          {
            label: "Requests urine toxicology or lab results.",
            artifactIds: ["confirmatory-urine-toxicology"],
            triggerTerms: ["urine tox", "toxicology", "labs", "fentanyl", "oxycodone"]
          },
          {
            label: "Reviews charted ROS, H&P, or mental status data.",
            artifactIds: ["review-of-systems", "history-and-physical", "mental-status-exam"],
            triggerTerms: ["ros", "review of systems", "h&p", "history and physical", "mental status", "mse"]
          }
        ]
      },
      {
        id: "clinical-reasoning",
        title: "Clinical reasoning",
        epaAlignment: "AAMC EPA 2 and EPA 3: Prioritize a differential and use diagnostic tests",
        description: "Connects the patient story and objective data to a problem representation.",
        criteria: [
          {
            label: "Connects withdrawal symptoms with opioid use history.",
            triggerTerms: ["withdrawal", "opioid", "craving", "ran out", "last use"]
          },
          {
            label: "Uses overdose or fentanyl exposure to refine risk assessment.",
            triggerTerms: ["overdose", "fentanyl", "naloxone", "toxicology"]
          },
          {
            label: "Considers comorbid mood, safety, or social consequences.",
            triggerTerms: ["depressed", "mood", "custody", "children", "husband", "safety"]
          }
        ]
      },
      {
        id: "professional-communication",
        title: "Professional communication",
        epaAlignment: "AAMC EPA 6: Provide an oral presentation of a clinical encounter",
        description: "Maintains respectful language and gathers enough information for faculty debrief.",
        criteria: [
          {
            label: "Uses person-centered, non-stigmatizing language.",
            triggerTerms: ["help", "treatment", "support", "tell me", "understand"]
          },
          {
            label: "Elicits family, work, and social impact.",
            triggerTerms: ["family", "children", "work", "job", "custody", "home"]
          },
          {
            label: "Asks permission for examination or sensitive topics.",
            triggerTerms: ["is it okay", "can i", "may i", "permission", "comfortable"]
          }
        ]
      },
      {
        id: "next-step-reflection",
        title: "Next-step reflection",
        epaAlignment: "AAMC guiding principles: formative feedback and active learner participation",
        description: "Identifies what to ask next and what evidence to bring to debrief.",
        criteria: [
          {
            label: "Opens at least one key chart result before ending the case.",
            artifactIds: ["vital-signs-and-exam", "confirmatory-urine-toxicology"]
          },
          {
            label: "Explores both patient story and chart data.",
            artifactIds: ["history-and-physical", "mental-status-exam"],
            triggerTerms: ["history", "mental status", "review of systems", "physical exam"]
          }
        ]
      }
    ]
  }
};

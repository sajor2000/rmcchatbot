import type { CaseDefinition, PatientAnswerGroup } from "@/lib/caseSchema";

const STOP_WORDS = new Set([
  "a",
  "about",
  "and",
  "are",
  "did",
  "do",
  "does",
  "for",
  "had",
  "has",
  "have",
  "how",
  "i",
  "is",
  "me",
  "of",
  "or",
  "the",
  "to",
  "what",
  "when",
  "where",
  "why",
  "you",
  "your"
]);

export function mockPatientReply(caseDefinition: CaseDefinition, input: string): string {
  const lower = input.toLowerCase();

  if (isBroadOpeningQuestion(lower) && !asksForSymptoms(lower)) {
    return openingStatementForCase(caseDefinition);
  }

  const matchedQuestion = findPatientQuestionAnswer(caseDefinition, lower);

  if (matchedQuestion) {
    return matchedQuestion;
  }

  if (lower.includes("diagnosis") || lower.includes("what do i have")) {
    return "I am not sure what is causing it. I can tell you what I am feeling, but I do not know the diagnosis.";
  }

  if (
    lower.includes("suicide") ||
    lower.includes("self-harm") ||
    lower.includes("hurt yourself") ||
    lower.includes("hurting yourself")
  ) {
    const sensitive = caseDefinition.patientFacts.sensitiveHistory.find((fact) =>
      /suicid|self-harm|harm|thought/i.test(fact)
    );
    return sensitive ?? "No, I have not had thoughts of hurting myself.";
  }

  if (
    lower.includes("lab") ||
    lower.includes("ekg") ||
    lower.includes("ecg") ||
    lower.includes("x-ray") ||
    lower.includes("xray") ||
    lower.includes("vital") ||
    lower.includes("sodium") ||
    lower.includes("potassium") ||
    lower.includes("troponin") ||
    lower.includes("toxicology") ||
    lower.includes("tox screen") ||
    lower.includes("drug screen")
  ) {
    return "I don't know those results. You may need to check the chart or results panel.";
  }

  if (asksForSymptoms(lower)) {
    return caseDefinition.patientFacts.positives.slice(0, 4).join(" ");
  }

  if (lower.includes("started") || lower.includes("begin") || lower.includes("timeline")) {
    return caseDefinition.patientFacts.historyOfPresentIllness.slice(1, 3).join(" ");
  }

  if (
    lower.includes("surgery") ||
    lower.includes("surgeries") ||
    lower.includes("medical problem") ||
    lower.includes("medical history") ||
    lower.includes("past medical")
  ) {
    return caseDefinition.patientFacts.pastMedicalHistory.join(" ");
  }

  if (lower.includes("medicine") || lower.includes("medication")) {
    return caseDefinition.patientFacts.medications.join(" ");
  }

  if (lower.includes("allerg")) {
    return caseDefinition.patientFacts.allergies.join(" ");
  }

  if (lower.includes("substance") || lower.includes("drug") || lower.includes("alcohol")) {
    return caseDefinition.patientFacts.socialHistory.join(" ");
  }

  return openingStatementForCase(caseDefinition);
}

function openingStatementForCase(caseDefinition: CaseDefinition): string {
  return caseDefinition.patientBehavior?.openingStatement ?? `I am here because of ${caseDefinition.chiefConcern.toLowerCase()}.`;
}

function isBroadOpeningQuestion(input: string): boolean {
  return (
    input.includes("what brought") ||
    input.includes("why are you here") ||
    input.includes("how can i help") ||
    input.includes("what brings") ||
    input.includes("what is going on") ||
    input.includes("what's going on") ||
    input.includes("tell me what happened")
  );
}

function asksForSymptoms(input: string): boolean {
  return (
    input.includes("symptom") ||
    input.includes("pain") ||
    input.includes("hurt") ||
    input.includes("ache") ||
    input.includes("nausea") ||
    input.includes("diarrhea") ||
    input.includes("cramp") ||
    input.includes("vomit") ||
    input.includes("discomfort") ||
    input.includes("feel physically") ||
    input.includes("body")
  );
}

function findPatientQuestionAnswer(caseDefinition: CaseDefinition, input: string): string | undefined {
  const answerGroup = findPatientAnswerGroup(caseDefinition, input);

  if (answerGroup) {
    return answerGroup.answer;
  }

  const inputTokens = tokenize(input);
  let bestMatch: { score: number; answer: string } | undefined;

  for (const item of caseDefinition.patientFacts.anticipatedQuestions ?? []) {
    const score = scoreQuestion(inputTokens, item.question);

    if (isUsableMatch(score, item.question) && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { score, answer: item.answer };
    }
  }

  return bestMatch?.answer;
}

export function findPatientAnswerGroup(
  caseDefinition: CaseDefinition,
  input: string
): PatientAnswerGroup | undefined {
  const inputTokens = tokenize(input);
  let bestMatch: { score: number; group: PatientAnswerGroup } | undefined;

  for (const group of caseDefinition.patientFacts.answerGroups ?? []) {
    for (const question of [group.canonicalQuestion, ...group.aliases]) {
      const score = scoreQuestion(inputTokens, question);

      if (isUsableMatch(score, question) && (!bestMatch || score > bestMatch.score)) {
        bestMatch = { score, group };
      }
    }
  }

  return bestMatch?.group;
}

function scoreQuestion(inputTokens: Set<string>, question: string): number {
  const questionTokens = tokenize(question);

  return Array.from(questionTokens).filter((token) => inputTokens.has(token)).length;
}

function isUsableMatch(score: number, question: string): boolean {
  const questionTokens = tokenize(question);

  return score >= 2 || (score === 1 && questionTokens.size <= 2);
}

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((token) => token.length > 2 && !STOP_WORDS.has(token))
  );
}

export function textStreamResponse(text: string, init?: ResponseInit): Response {
  const encoder = new TextEncoder();
  const words = text.split(/(\s+)/);

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      for (const word of words) {
        controller.enqueue(encoder.encode(word));
        await new Promise((resolve) => setTimeout(resolve, 8));
      }
      controller.close();
    }
  });

  return new Response(stream, {
    ...init,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
      ...init?.headers
    }
  });
}

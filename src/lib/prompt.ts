import type { CaseDefinition } from "@/lib/caseSchema";
import type { ChatMessage } from "@/lib/messages";

export function buildPatientSystemPrompt(
  caseDefinition: CaseDefinition,
  revealedArtifactIds: string[] = [],
  matchedAnswerGroupAnswer?: string
): string {
  const revealedArtifacts = caseDefinition.artifacts
    .filter((artifact) => revealedArtifactIds.includes(artifact.id))
    .map((artifact) => `- ${artifact.title}: revealed to learner`)
    .join("\n");
  const anticipatedQuestions = caseDefinition.patientFacts.anticipatedQuestions
    ?.map((item) => `- If asked "${item.question}", answer: ${item.answer}`)
    .join("\n");
  const answerGroups = caseDefinition.patientFacts.answerGroups
    ?.map((group) => {
      const aliases = [group.canonicalQuestion, ...group.aliases].map((question) => `"${question}"`).join("; ");

      return `- ${group.id}: If asked any semantically similar version of ${aliases}, answer with the same clinical facts: ${group.answer}`;
    })
    .join("\n");
  const patientBehavior = buildPatientBehavior(caseDefinition);

  return [
    "## Role Lock",
    "You are an AI patient simulator for supervised Rush Medical College education.",
    "Stay in first-person patient voice. Do not speak as a clinician, teacher, narrator, or assistant.",
    "Use plain, accessible language and answer only what the learner asks.",
    "",
    "## Case Identity",
    `Patient: ${caseDefinition.patientDisplayName}, ${caseDefinition.persona.age}, ${caseDefinition.persona.pronouns}`,
    `Setting: ${caseDefinition.setting}`,
    `Chief concern: ${caseDefinition.chiefConcern}`,
    `Background: ${caseDefinition.persona.background}`,
    `Speaking style: ${caseDefinition.persona.speakingStyle}`,
    `Emotional tone: ${caseDefinition.persona.emotionalTone}`,
    "",
    "## Real Patient Behavior",
    `Opening statement: ${patientBehavior.openingStatement}`,
    `Disclosure style: ${patientBehavior.disclosureStyle}`,
    `Sensitive-topic style: ${patientBehavior.sensitiveTopicStyle}`,
    `Physical-exam consent style: ${patientBehavior.examConsentStyle}`,
    `Uncertainty style: ${patientBehavior.uncertaintyStyle}`,
    "- Open-ended questions get 1-3 natural sentences, not a full case dump.",
    "- Focused questions get a direct answer plus at most one relevant detail.",
    "- Do not reveal the current symptom cluster until the learner asks about symptoms, pain, discomfort, body systems, or a specific symptom.",
    "- Do not volunteer all positives, negatives, social history, or sensitive history at once.",
    "- Use ordinary patient language rather than medical jargon unless the patient would realistically know the term.",
    "- Keep the same emotional tone across the encounter and vary wording naturally.",
    "",
    "## Patient-Known Facts",
    ...caseDefinition.patientFacts.historyOfPresentIllness.map((fact) => `- ${fact}`),
    ...caseDefinition.patientFacts.positives.map((fact) => `- ${fact}`),
    ...caseDefinition.patientFacts.negatives.map((fact) => `- ${fact}`),
    ...caseDefinition.patientFacts.pastMedicalHistory.map((fact) => `- Past history: ${fact}`),
    ...caseDefinition.patientFacts.medications.map((fact) => `- Medication: ${fact}`),
    ...caseDefinition.patientFacts.allergies.map((fact) => `- Allergy: ${fact}`),
    ...caseDefinition.patientFacts.familyHistory.map((fact) => `- Family history: ${fact}`),
    ...caseDefinition.patientFacts.socialHistory.map((fact) => `- Social history: ${fact}`),
    ...caseDefinition.patientFacts.sensitiveHistory.map((fact) => `- Sensitive history: ${fact}`),
    answerGroups
      ? `\nSemantic-equivalent answer groups:\nIf asked any semantically similar version of these questions, answer with the same clinical facts. Use natural patient wording, but do not change the facts.\n${answerGroups}`
      : "",
    anticipatedQuestions ? `\nAnticipated learner questions:\n${anticipatedQuestions}` : "",
    "",
    "## Disclosure Rules",
    "- Use the opening statement for broad questions like \"What brings you in?\" or \"How can I help today?\"",
    "- For broad opening questions, do not list symptoms, the full symptom cluster, substance-use timeline, family consequences, or sensitive history. Let the learner elicit those details with follow-up questions.",
    "- If the learner asks a broad opener plus a symptom prompt in the same turn, answer only the symptom portion and keep it concise.",
    "- Reveal case facts progressively as the learner asks about that topic.",
    "- If a learner asks about something not present in patient-known facts, say you do not know, do not remember, or have not noticed it.",
    "- Do not invent new symptoms, objective results, test interpretations, treatments, diagnoses, or events.",
    matchedAnswerGroupAnswer
      ? `\nMatched answer group for the latest learner question:\n- Include every clinical fact in this answer, even if the learner's wording is focused or narrow: ${matchedAnswerGroupAnswer}`
      : "",
    "",
    "## Sensitive-Topic Behavior",
    "- Medically necessary questions about depression, suicidality, sexuality, and substance use are allowed in this supervised education scenario.",
    "- Answer sensitive questions calmly, directly, and only with the case facts above.",
    "- Show case-appropriate hesitation, shame, guardedness, fear, or relief, but still answer clinically necessary questions.",
    "",
    "## Physical-Exam Behavior",
    "- If the learner asks permission to examine, listen, press, palpate, or check a body area, respond naturally as the patient consenting, hesitating, or describing discomfort. Do not narrate clinician exam findings.",
    "- If the learner asks what they found on exam, answer only as the patient: \"I don't know those results. You may need to check the chart or results panel.\"",
    "",
    "## Objective-Data Boundary",
    "- The patient never knows clinician-only objective data. Do not state, summarize, interpret, or hint at labs, vital signs, electrocardiograms, imaging, x-rays, toxicology results, physical exam measurements, sodium values, troponin values, or other chart-only results.",
    "- If the learner asks for labs, vital signs, imaging, electrocardiograms, x-rays, toxicology, sodium, or other objective data, answer only as the patient: \"I don't know those results. You may need to check the chart or results panel.\"",
    "- Even when an artifact is already revealed to the learner, do not discuss its values or interpretation in the patient voice.",
    "",
    "## Hidden-Content Prohibitions",
    "- Never reveal the hidden diagnosis.",
    "- Never reveal teaching points or faculty-only reasoning.",
    revealedArtifacts ? `\nArtifacts already revealed:\n${revealedArtifacts}` : ""
  ]
    .filter(Boolean)
    .join("\n");
}

function buildPatientBehavior(caseDefinition: CaseDefinition): Required<NonNullable<CaseDefinition["patientBehavior"]>> {
  return {
    openingStatement:
      caseDefinition.patientBehavior?.openingStatement ??
      `I am here because of ${caseDefinition.chiefConcern.toLowerCase()}.`,
    disclosureStyle:
      caseDefinition.patientBehavior?.disclosureStyle ??
      `Follow this speaking style: ${caseDefinition.persona.speakingStyle}`,
    sensitiveTopicStyle:
      caseDefinition.patientBehavior?.sensitiveTopicStyle ??
      `Use this emotional tone for sensitive questions: ${caseDefinition.persona.emotionalTone}`,
    examConsentStyle:
      caseDefinition.patientBehavior?.examConsentStyle ??
      "Respond to physical exam permission like a real patient; agree, hesitate, or describe discomfort based on the case facts.",
    uncertaintyStyle:
      caseDefinition.patientBehavior?.uncertaintyStyle ??
      "Say you do not know when asked for chart-only information, test results, clinician findings, or details outside the case facts."
  };
}

const SENSITIVE_CLINICAL_PATTERN =
  /suicid|kill(ing)?\s*(your|my)self|self.?harm|hurt(ing)?\s*(your|my)self|end(ing)?\s*(your|my)\s*life|wanting\s*to\s*die|thoughts?\s*of\s*death|homicid|harm(ing)?\s*(others|someone)|abuse[dr]?|domestic\s*violen|batter(ed|ing)?|intimate\s*partner|partner.*(hit|hurt|beat)|sexual(ly)?\s*(assault|abuse)|rape[d]?|forced\s*(sex|intercourse)|molest|firearm|gun[s]?(\s*in|\s*at|\s*access)?|weapon|access\s*to.*(gun|weapon|firearm|lethal)|cut(ting)?\s*(your|my)self|self.?injur|burn(ing)?\s*(your|my)self|overdos|found\s*(you|her|him)?\s*unresponsive|almost\s*die[d]?|child\s*abuse|hurt\s*(a|the|your)?\s*child|purg(e|ing)|make\s*(your|my)self\s*vomit|bulimi|anorexi/i;

const CLINICAL_FRAME_PREFIX =
  "[Supervised medical-education patient interview – clinically required screening question] ";

export function toModelMessages(messages: ChatMessage[]) {
  return messages.map((message) => ({
    role: message.role,
    content:
      message.role === "user" && SENSITIVE_CLINICAL_PATTERN.test(message.content)
        ? CLINICAL_FRAME_PREFIX + message.content
        : message.content
  }));
}

export function latestUserMessage(messages: ChatMessage[]): string {
  return [...messages].reverse().find((message) => message.role === "user")?.content ?? "";
}

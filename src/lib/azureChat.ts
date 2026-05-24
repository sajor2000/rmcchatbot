import { createAzure } from "@ai-sdk/azure";
import { streamText } from "ai";
import type { CaseDefinition } from "@/lib/caseSchema";
import type { ChatMessage } from "@/lib/messages";
import { analyzeArtifactRequest } from "@/lib/artifacts";
import { findPatientAnswerGroup, mockPatientReply, textStreamResponse } from "@/lib/mockPatient";
import { buildPatientSystemPrompt, latestUserMessage, toModelMessages } from "@/lib/prompt";

const DEFAULT_AZURE_OPENAI_API_VERSION = "v1";

const SENSITIVE_SCREENING_PATTERNS: Array<{ pattern: RegExp; factKeywords: string[] }> = [
  {
    pattern: /suicid|kill\s*(your|my)self|self.?harm|hurt\s*(your|my)self|end\s*(your|my)\s*life|wanting\s*to\s*die|thoughts?\s*of\s*death/i,
    factKeywords: ["suicidal", "killing", "hurting", "self-harm"]
  },
  {
    pattern: /homicid|harm\s*(others|someone)|hurt\s*(others|someone|people)/i,
    factKeywords: ["homicidal"]
  }
];

function findCaseAnswerForSensitiveQuestion(
  caseDefinition: CaseDefinition,
  userMessage: string
): string | null {
  for (const { pattern, factKeywords } of SENSITIVE_SCREENING_PATTERNS) {
    if (!pattern.test(userMessage)) continue;

    const anticipated = caseDefinition.patientFacts.anticipatedQuestions?.find((q) =>
      factKeywords.some((kw) => q.question.toLowerCase().includes(kw) || q.answer.toLowerCase().includes(kw))
    );
    if (anticipated) return anticipated.answer;

    const answerGroup = caseDefinition.patientFacts.answerGroups?.find((g) =>
      factKeywords.some((kw) => g.canonicalQuestion.toLowerCase().includes(kw) || g.answer.toLowerCase().includes(kw))
    );
    if (answerGroup) return answerGroup.answer;

    const negative = caseDefinition.patientFacts.negatives.find((n) =>
      factKeywords.some((kw) => n.toLowerCase().includes(kw))
    );
    if (negative) {
      const cleaned = negative.replace(/^No\s+/i, "").replace(/\.$/, "");
      return `No. I have not had ${cleaned.toLowerCase()}.`;
    }

    const sensitive = caseDefinition.patientFacts.sensitiveHistory?.find((s) =>
      factKeywords.some((kw) => s.toLowerCase().includes(kw))
    );
    if (sensitive) {
      return sensitive.startsWith("No") ? sensitive : `No. ${sensitive}`;
    }
  }
  return null;
}

type AzureChatConfig = {
  apiKey: string;
  apiVersion: string;
  baseURL: string;
  deployment: string;
  useDeploymentBasedUrls: boolean;
};

export function hasAzureChatConfig(): boolean {
  return Boolean(
    process.env.AZURE_OPENAI_API_KEY &&
      process.env.AZURE_OPENAI_ENDPOINT &&
      process.env.AZURE_OPENAI_DEPLOYMENT
  );
}

export function normalizeAzureOpenAIBaseURL(endpoint: string): string {
  const trimmedEndpoint = endpoint.trim().replace(/\/+$/, "");
  const endpointWithoutVersion = trimmedEndpoint.replace(/\/openai\/v1$/, "/openai");

  return endpointWithoutVersion.endsWith("/openai")
    ? endpointWithoutVersion
    : `${endpointWithoutVersion}/openai`;
}

export function getAzureOpenAIApiVersion(): string {
  return process.env.AZURE_OPENAI_API_VERSION?.trim() || DEFAULT_AZURE_OPENAI_API_VERSION;
}

export function shouldUseDeploymentBasedUrls(apiVersion: string): boolean {
  return apiVersion !== DEFAULT_AZURE_OPENAI_API_VERSION;
}

export function supportsAzureTemperature(deployment: string): boolean {
  return /^(chatgpt-4o|gpt-3|gpt-4|gpt-5-chat)/.test(deployment);
}

function getAzureChatConfig(): AzureChatConfig | null {
  if (!hasAzureChatConfig()) {
    return null;
  }

  const apiVersion = getAzureOpenAIApiVersion();

  return {
    apiKey: process.env.AZURE_OPENAI_API_KEY as string,
    apiVersion,
    baseURL: normalizeAzureOpenAIBaseURL(process.env.AZURE_OPENAI_ENDPOINT as string),
    deployment: process.env.AZURE_OPENAI_DEPLOYMENT as string,
    useDeploymentBasedUrls: shouldUseDeploymentBasedUrls(apiVersion)
  };
}

export async function createPatientChatResponse({
  caseDefinition,
  messages,
  revealedArtifactIds
}: {
  caseDefinition: CaseDefinition;
  messages: ChatMessage[];
  revealedArtifactIds: string[];
}): Promise<Response> {
  const latestMessage = latestUserMessage(messages);
  const matchedAnswerGroup = findPatientAnswerGroup(caseDefinition, latestMessage);
  const objectiveRequest = matchedAnswerGroup
    ? null
    : analyzeArtifactRequest(latestMessage, caseDefinition.artifacts);
  if (objectiveRequest && (objectiveRequest.intent === "matched" || objectiveRequest.intent === "unavailable")) {
    return textStreamResponse("I don't know those results. You may need to check the chart or results panel.", {
      headers: {
        "X-RMC-Model-Mode": "objective-data-redirect",
        "X-RMC-Artifact-Intent": objectiveRequest.intent
      }
    });
  }

  const azureConfig = getAzureChatConfig();

  if (!azureConfig) {
    return textStreamResponse(mockPatientReply(caseDefinition, latestMessage), {
      headers: { "X-RMC-Model-Mode": "local-mock" }
    });
  }

  const azure = createAzure({
    apiKey: azureConfig.apiKey,
    apiVersion: azureConfig.apiVersion,
    baseURL: azureConfig.baseURL,
    useDeploymentBasedUrls: azureConfig.useDeploymentBasedUrls
  });
  const samplingSettings = supportsAzureTemperature(azureConfig.deployment)
    ? { temperature: 0.4 }
    : {};
  const systemPrompt = buildPatientSystemPrompt(caseDefinition, revealedArtifactIds, matchedAnswerGroup?.answer);
  const modelMessages = toModelMessages(messages);

  try {
    const result = streamText({
      model: azure(azureConfig.deployment),
      system: systemPrompt,
      messages: modelMessages,
      ...samplingSettings,
      maxOutputTokens: 500,
      providerOptions: {
        openai: {
          store: false,
          user: "rmc-case-chatbot-medical-education"
        }
      }
    });

    return result.toTextStreamResponse({
      headers: {
        "Cache-Control": "no-store",
        "X-RMC-Model-Mode": "azure"
      }
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (!/content_filter|moderation|filtered/i.test(errorMessage)) {
      return textStreamResponse("I am having trouble responding right now. Please try again in a moment.", {
        status: 502,
        headers: { "X-RMC-Model-Mode": "azure-error" }
      });
    }

    const caseAnswer = findCaseAnswerForSensitiveQuestion(caseDefinition, latestMessage);
    if (caseAnswer) {
      return textStreamResponse(caseAnswer, {
        headers: { "X-RMC-Model-Mode": "azure-content-filter-case-fallback" }
      });
    }

    return textStreamResponse(
      "I can answer medically relevant questions in the context of this case. Could you rephrase that in clinical terms?",
      { headers: { "X-RMC-Model-Mode": "azure-content-filter-fallback" } }
    );
  }
}

import { createAzure } from "@ai-sdk/azure";
import { streamText } from "ai";
import type { CaseDefinition } from "@/lib/caseSchema";
import type { ChatMessage } from "@/lib/messages";
import { analyzeArtifactRequest } from "@/lib/artifacts";
import { findPatientAnswerGroup, mockPatientReply, textStreamResponse } from "@/lib/mockPatient";
import { buildPatientSystemPrompt, latestUserMessage, toModelMessages } from "@/lib/prompt";

const DEFAULT_AZURE_OPENAI_API_VERSION = "v1";

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

  try {
    const azure = createAzure({
      apiKey: azureConfig.apiKey,
      apiVersion: azureConfig.apiVersion,
      baseURL: azureConfig.baseURL,
      useDeploymentBasedUrls: azureConfig.useDeploymentBasedUrls
    });
    const samplingSettings = supportsAzureTemperature(azureConfig.deployment)
      ? { temperature: 0.4 }
      : {};

    const result = streamText({
      model: azure(azureConfig.deployment),
      system: buildPatientSystemPrompt(caseDefinition, revealedArtifactIds, matchedAnswerGroup?.answer),
      messages: toModelMessages(messages),
      ...samplingSettings,
      maxOutputTokens: 500,
      providerOptions: {
        openai: {
          store: false
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
    const message = error instanceof Error ? error.message : String(error);
    const fallback = /content_filter|moderation|filtered/i.test(message)
      ? "I can answer medically relevant questions in the context of this case. Please ask the question again in clinical terms."
      : "I am having trouble responding right now. Please try again in a moment.";

    return textStreamResponse(fallback, {
      status: /content_filter|moderation|filtered/i.test(message) ? 200 : 502,
      headers: { "X-RMC-Model-Mode": "azure-fallback" }
    });
  }
}

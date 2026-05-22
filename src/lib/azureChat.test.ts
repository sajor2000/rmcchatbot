import { describe, expect, it, vi } from "vitest";
import {
  getAzureOpenAIApiVersion,
  normalizeAzureOpenAIBaseURL,
  shouldUseDeploymentBasedUrls,
  supportsAzureTemperature
} from "@/lib/azureChat";

describe("Azure OpenAI chat configuration", () => {
  it("normalizes Foundry endpoints for the AI SDK Azure provider", () => {
    expect(normalizeAzureOpenAIBaseURL("https://example.openai.azure.com")).toBe(
      "https://example.openai.azure.com/openai"
    );
    expect(normalizeAzureOpenAIBaseURL("https://example.openai.azure.com/")).toBe(
      "https://example.openai.azure.com/openai"
    );
    expect(normalizeAzureOpenAIBaseURL("https://example.openai.azure.com/openai")).toBe(
      "https://example.openai.azure.com/openai"
    );
    expect(normalizeAzureOpenAIBaseURL("https://example.openai.azure.com/openai/v1")).toBe(
      "https://example.openai.azure.com/openai"
    );
  });

  it("defaults new Foundry deployments to the v1 API", () => {
    vi.stubEnv("AZURE_OPENAI_API_VERSION", "");

    expect(getAzureOpenAIApiVersion()).toBe("v1");

    vi.unstubAllEnvs();
  });

  it("uses deployment-based URLs for legacy Azure OpenAI API versions", () => {
    expect(shouldUseDeploymentBasedUrls("v1")).toBe(false);
    expect(shouldUseDeploymentBasedUrls("2024-10-21")).toBe(true);
  });

  it("avoids temperature warnings for deployment aliases", () => {
    expect(supportsAzureTemperature("gpt-4.1")).toBe(true);
    expect(supportsAzureTemperature("rmc-patient-gpt-4-1")).toBe(false);
  });
});

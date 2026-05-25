import { afterEach, describe, expect, it, vi } from "vitest";
import { GET as getArtifactBlobRoute } from "@/app/api/artifacts/[caseId]/[artifactId]/blob/route";
import { GET as getArtifactRoute } from "@/app/api/artifacts/[caseId]/[artifactId]/route";
import { POST as postChatRoute } from "@/app/api/chat/route";
import { POST as postTranscriptRoute } from "@/app/api/transcripts/route";

function chatRequest(caseId: string, message = "What brought you in today?") {
  return new Request("http://localhost/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      caseId,
      sessionId: `session-${caseId}`,
      messages: [{ role: "user", content: message }],
      revealedArtifactIds: []
    })
  });
}

function transcriptRequest(caseId: string) {
  return new Request("http://localhost/api/transcripts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      caseId,
      sessionId: `transcript-session-${caseId}`,
      messages: [{ role: "user", content: "What brought you in today?" }],
      revealedArtifactIds: []
    })
  });
}

describe("API routes case visibility", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("rejects nonexistent cases in the chat route during pilot mode", async () => {
    vi.stubEnv("RMC_CASE_LIBRARY_MODE", "pilot");
    vi.stubEnv("RMC_PILOT_CASE_IDS", "jane-kim-withdrawal");

    const response = await postChatRoute(chatRequest("nonexistent-case"));

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: "Case not found." });
  });

  it("allows Jane Kim chat in pilot mode", async () => {
    vi.stubEnv("RMC_CASE_LIBRARY_MODE", "pilot");
    vi.stubEnv("RMC_PILOT_CASE_IDS", "jane-kim-withdrawal");
    vi.stubEnv("AZURE_OPENAI_API_KEY", "");
    vi.stubEnv("AZURE_OPENAI_ENDPOINT", "");
    vi.stubEnv("AZURE_OPENAI_DEPLOYMENT", "");

    const response = await postChatRoute(chatRequest("jane-kim-withdrawal"));

    expect(response.status).toBe(200);
    expect(response.headers.get("x-rmc-model-mode")).toBe("local-mock");
    await expect(response.text()).resolves.toContain("really sick and overwhelmed");
  });

  it("keeps semantic patient-answer aliases out of objective-data redirects", async () => {
    vi.stubEnv("RMC_CASE_LIBRARY_MODE", "pilot");
    vi.stubEnv("RMC_PILOT_CASE_IDS", "jane-kim-withdrawal");
    vi.stubEnv("AZURE_OPENAI_API_KEY", "");
    vi.stubEnv("AZURE_OPENAI_ENDPOINT", "");
    vi.stubEnv("AZURE_OPENAI_DEPLOYMENT", "");

    const response = await postChatRoute(chatRequest("jane-kim-withdrawal", "Did anyone say there was fentanyl in the pills?"));

    expect(response.status).toBe(200);
    expect(response.headers.get("x-rmc-model-mode")).toBe("local-mock");
    await expect(response.text()).resolves.toContain("laced with fentanyl");
  });

  it("rejects nonexistent artifacts in pilot mode", async () => {
    vi.stubEnv("RMC_CASE_LIBRARY_MODE", "pilot");
    vi.stubEnv("RMC_PILOT_CASE_IDS", "jane-kim-withdrawal");

    const response = await getArtifactRoute(new Request("http://localhost/api/artifacts/nonexistent-case/some-artifact"), {
      params: Promise.resolve({ caseId: "nonexistent-case", artifactId: "some-artifact" })
    });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: "Artifact not found." });
  });

  it("allows Jane Kim artifacts in pilot mode", async () => {
    vi.stubEnv("RMC_CASE_LIBRARY_MODE", "pilot");
    vi.stubEnv("RMC_PILOT_CASE_IDS", "jane-kim-withdrawal");

    const response = await getArtifactRoute(
      new Request("http://localhost/api/artifacts/jane-kim-withdrawal/vital-signs-and-exam"),
      {
        params: Promise.resolve({ caseId: "jane-kim-withdrawal", artifactId: "vital-signs-and-exam" })
      }
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.id).toBe("vital-signs-and-exam");
    expect(body.content.kind).toBe("vitalsTable");
    expect(body.blobUrl).toBe("/api/artifacts/jane-kim-withdrawal/vital-signs-and-exam/blob");
  });

  it("rejects nonexistent artifact blobs in pilot mode", async () => {
    vi.stubEnv("RMC_CASE_LIBRARY_MODE", "pilot");
    vi.stubEnv("RMC_PILOT_CASE_IDS", "jane-kim-withdrawal");

    const response = await getArtifactBlobRoute(new Request("http://localhost/api/artifacts/nonexistent-case/some-artifact/blob"), {
      params: Promise.resolve({ caseId: "nonexistent-case", artifactId: "some-artifact" })
    });

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: "Artifact not found." });
  });

  it("rejects nonexistent transcripts in pilot mode", async () => {
    vi.stubEnv("RMC_CASE_LIBRARY_MODE", "pilot");
    vi.stubEnv("RMC_PILOT_CASE_IDS", "jane-kim-withdrawal");
    vi.stubEnv("CHAT_LOGGING_ENABLED", "false");

    const response = await postTranscriptRoute(transcriptRequest("nonexistent-case"));

    expect(response.status).toBe(404);
    await expect(response.json()).resolves.toEqual({ error: "Case not found." });
  });

  it("allows Jane Kim transcript requests in pilot mode with logging disabled", async () => {
    vi.stubEnv("RMC_CASE_LIBRARY_MODE", "pilot");
    vi.stubEnv("RMC_PILOT_CASE_IDS", "jane-kim-withdrawal");
    vi.stubEnv("CHAT_LOGGING_ENABLED", "false");

    const response = await postTranscriptRoute(transcriptRequest("jane-kim-withdrawal"));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ saved: false });
  });
});

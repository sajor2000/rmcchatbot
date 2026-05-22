import { afterEach, describe, expect, it, vi } from "vitest";
import {
  redactTranscript,
  transcriptBlobName,
  transcriptLoggingEnabled,
  saveTranscriptSnapshot
} from "@/lib/transcripts";

describe("transcripts", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("defaults transcript logging to disabled", () => {
    vi.stubEnv("CHAT_LOGGING_ENABLED", "");

    expect(transcriptLoggingEnabled()).toBe(false);
  });

  it("redacts direct identifiers from saved message content", () => {
    const redacted = redactTranscript({
      caseId: "fatigue-mood",
      sessionId: "session-123",
      revealedArtifactIds: [],
      messages: [
        {
          role: "user",
          content: "My email is test@example.com, phone is 312-555-1212, MRN 123456."
        }
      ]
    });

    expect(redacted.messages[0].content).toContain("[redacted-email]");
    expect(redacted.messages[0].content).toContain("[redacted-phone]");
    expect(redacted.messages[0].content).toContain("[redacted-mrn]");
  });

  it("does not write when logging is disabled", async () => {
    vi.stubEnv("CHAT_LOGGING_ENABLED", "false");

    await expect(
      saveTranscriptSnapshot({
        caseId: "chest-pain",
        sessionId: "session-123",
        revealedArtifactIds: [],
        messages: [{ role: "user", content: "Hello" }]
      })
    ).resolves.toEqual({ saved: false });
  });

  it("uses deterministic transcript blob paths", () => {
    expect(transcriptBlobName("chest-pain", "session-123", new Date("2026-05-21T12:00:00Z"))).toBe(
      "transcripts/2026-05-21/chest-pain/session-123.json"
    );
  });
});

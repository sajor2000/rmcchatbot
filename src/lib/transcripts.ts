import { BlobServiceClient } from "@azure/storage-blob";
import { DefaultAzureCredential } from "@azure/identity";
import { z } from "zod";
import { chatMessageSchema } from "@/lib/messages";

export const transcriptRequestSchema = z.object({
  caseId: z.string().min(1),
  sessionId: z.string().min(8),
  messages: z.array(chatMessageSchema).min(1).max(80),
  revealedArtifactIds: z.array(z.string()).default([])
});

export type TranscriptRequest = z.infer<typeof transcriptRequestSchema>;

export function transcriptLoggingEnabled(): boolean {
  return process.env.CHAT_LOGGING_ENABLED === "true";
}

export function redactTranscript(input: TranscriptRequest): TranscriptRequest {
  const redact = (value: string) =>
    value
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]")
      .replace(/\b(?:\+?1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g, "[redacted-phone]")
      .replace(/\b(?:MRN|medical record number)\s*[:#]?\s*\d+\b/gi, "[redacted-mrn]");

  return {
    ...input,
    messages: input.messages.map((message) => ({
      ...message,
      content: redact(message.content)
    }))
  };
}

export function transcriptBlobName(caseId: string, sessionId: string, now = new Date()): string {
  const date = now.toISOString().slice(0, 10);
  return `transcripts/${date}/${caseId}/${sessionId}.json`;
}

export async function saveTranscriptSnapshot(input: TranscriptRequest): Promise<{ saved: boolean; blobName?: string }> {
  if (!transcriptLoggingEnabled()) {
    return { saved: false };
  }

  const containerName = process.env.AZURE_BLOB_TRANSCRIPTS_CONTAINER ?? "rmc-chat-transcripts";
  const blobName = transcriptBlobName(input.caseId, input.sessionId);
  const payload = JSON.stringify(
    {
      ...redactTranscript(input),
      savedAt: new Date().toISOString(),
      schemaVersion: 1
    },
    null,
    2
  );

  const containerClient = getTranscriptContainerClient(containerName);
  await containerClient.createIfNotExists();
  await containerClient.getBlockBlobClient(blobName).upload(payload, Buffer.byteLength(payload), {
    blobHTTPHeaders: { blobContentType: "application/json" }
  });

  return { saved: true, blobName };
}

function getTranscriptContainerClient(containerName: string) {
  if (process.env.AZURE_STORAGE_CONNECTION_STRING) {
    return BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING).getContainerClient(containerName);
  }

  const accountName = process.env.AZURE_STORAGE_ACCOUNT_NAME;
  if (!accountName) {
    throw new Error("Transcript logging requires AZURE_STORAGE_CONNECTION_STRING or AZURE_STORAGE_ACCOUNT_NAME.");
  }

  const serviceClient = new BlobServiceClient(
    `https://${accountName}.blob.core.windows.net`,
    new DefaultAzureCredential()
  );
  return serviceClient.getContainerClient(containerName);
}

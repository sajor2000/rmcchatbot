import { z } from "zod";

export const chatMessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000)
});

export const chatRequestSchema = z.object({
  caseId: z.string().min(1),
  sessionId: z.string().min(8),
  messages: z.array(chatMessageSchema).min(1).max(40),
  revealedArtifactIds: z.array(z.string()).optional().default([])
});

export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;

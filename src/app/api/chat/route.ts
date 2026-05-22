import { NextResponse } from "next/server";
import { createPatientChatResponse } from "@/lib/azureChat";
import { getVisibleCase } from "@/lib/cases";
import { chatRequestSchema } from "@/lib/messages";

export const maxDuration = 60;

export async function POST(request: Request) {
  const parsed = chatRequestSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid chat request." }, { status: 400 });
  }

  const caseDefinition = getVisibleCase(parsed.data.caseId);
  if (!caseDefinition) {
    return NextResponse.json({ error: "Case not found." }, { status: 404 });
  }

  return createPatientChatResponse({
    caseDefinition,
    messages: parsed.data.messages,
    revealedArtifactIds: parsed.data.revealedArtifactIds
  });
}

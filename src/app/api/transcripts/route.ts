import { NextResponse } from "next/server";
import { isCaseVisible } from "@/lib/cases";
import { saveTranscriptSnapshot, transcriptRequestSchema } from "@/lib/transcripts";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid transcript request." }, { status: 400 });
  }

  const parsed = transcriptRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid transcript request." }, { status: 400 });
  }

  if (!isCaseVisible(parsed.data.caseId)) {
    return NextResponse.json({ error: "Case not found." }, { status: 404 });
  }

  try {
    const result = await saveTranscriptSnapshot(parsed.data);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json({ saved: false, error: "Transcript storage failed." }, { status: 502 });
  }
}

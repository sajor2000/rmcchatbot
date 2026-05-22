import { NextResponse } from "next/server";
import { getVisibleArtifact } from "@/lib/cases";

export async function GET(
  _request: Request,
  {
    params
  }: {
    params: Promise<{ caseId: string; artifactId: string }>;
  }
) {
  const { caseId, artifactId } = await params;
  const artifact = getVisibleArtifact(caseId, artifactId);

  if (!artifact) {
    return NextResponse.json({ error: "Artifact not found." }, { status: 404 });
  }

  return NextResponse.json({
    ...artifact,
    blobUrl: `/api/artifacts/${caseId}/${artifactId}/blob`
  });
}

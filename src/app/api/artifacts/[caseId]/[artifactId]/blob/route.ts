import { NextResponse } from "next/server";
import { caseContentContainerName, getBlobContainerClient } from "@/lib/blobStorage";
import { getVisibleArtifact } from "@/lib/cases";

function blobStatusCode(error: unknown): number | null {
  if (typeof error === "object" && error !== null && "statusCode" in error) {
    const statusCode = (error as { statusCode?: unknown }).statusCode;
    return typeof statusCode === "number" ? statusCode : null;
  }

  return null;
}

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

  try {
    const containerClient = getBlobContainerClient(caseContentContainerName());
    const blobClient = containerClient.getBlockBlobClient(artifact.blobPath);
    const download = await blobClient.downloadToBuffer();
    const body = new Blob([new Uint8Array(download)]);

    return new Response(body, {
      headers: {
        "Cache-Control": "private, no-store",
        "Content-Disposition": `inline; filename="${artifact.blobPath.split("/").at(-1) ?? artifact.id}"`,
        "Content-Type": artifact.blobPath.endsWith(".json") ? "application/json" : "application/octet-stream"
      }
    });
  } catch (error) {
    if (blobStatusCode(error) === 404) {
      return NextResponse.json({ error: "Artifact blob not found." }, { status: 404 });
    }

    return NextResponse.json({ error: "Artifact storage unavailable." }, { status: 502 });
  }
}

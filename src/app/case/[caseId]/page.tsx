import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CaseSimulator } from "@/components/CaseSimulator";
import { getVisibleSafeCaseForClient } from "@/lib/cases";

export default async function CasePage({
  params
}: {
  params: Promise<{ caseId: string }>;
}) {
  const { caseId } = await params;
  const caseDefinition = getVisibleSafeCaseForClient(caseId);

  if (!caseDefinition) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-white">
      <header className="border-b border-rush-gray/60 bg-rush-legacy text-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-sm font-semibold text-white no-underline hover:text-rush-vitality">
              <ArrowLeft size={18} aria-hidden="true" />
              Back to cases
            </Link>
            <h1 className="mt-4 font-heading text-3xl font-semibold md:text-4xl">{caseDefinition.title}</h1>
            <p className="mt-2 text-rush-sage">{caseDefinition.chiefConcern}</p>
          </div>
          <div className="rounded-lg border border-white/25 bg-white/10 px-4 py-3 text-sm">
            <p className="font-semibold">Patient</p>
            <p>{caseDefinition.patientDisplayName}</p>
          </div>
        </div>
      </header>

      <CaseSimulator caseDefinition={caseDefinition} />
    </main>
  );
}

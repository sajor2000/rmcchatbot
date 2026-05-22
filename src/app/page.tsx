import Link from "next/link";
import { ArrowRight, BookOpen, ClipboardList, MessageSquareText, Stethoscope, TableProperties } from "lucide-react";
import { caseLibraryMode } from "@/lib/caseLibraryConfig";
import { getVisiblePublicCases } from "@/lib/cases";

const studentGuideSteps = [
  {
    title: "Choose the assigned case",
    description: "Open the case tile your facilitator assigns for the session."
  },
  {
    title: "Start the encounter",
    description: "Review the case briefing, then click Start encounter when your group is ready."
  },
  {
    title: "Interview the patient",
    description: "Ask Jane natural patient questions about symptoms, history, mood, safety, medications, allergies, and social context."
  },
  {
    title: "Request chart data in chat",
    description: "Ask for objective data when needed, such as vitals, urine toxicology, labs, a 12-lead EKG, chest X-ray, ROS, H&P, or MSE."
  },
  {
    title: "End the case",
    description: "Click End case when your interview and chart review feel complete."
  },
  {
    title: "Review feedback",
    description: "Use the formative rubric and reflection prompts for faculty-led clinical reasoning debrief."
  }
];

export default function HomePage() {
  const cases = getVisiblePublicCases();
  const isPilotMode = caseLibraryMode() === "pilot";

  return (
    <main className="min-h-screen bg-white text-black">
      <section className="border-b border-rush-gray/60 bg-rush-sage">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <p className="mb-3 font-heading text-sm font-semibold uppercase tracking-[0.08em] text-rush-legacy">
              Rush Medical College
            </p>
            <h1 className="font-heading text-4xl font-semibold leading-tight text-black md:text-5xl">
              Practice clinical interviews with AI patients
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-rush-dark-gray">
              Select a case, interview the patient, and request chart data when clinically appropriate.
            </p>
          </div>
          <div className="rounded-lg border border-rush-muted bg-white p-5 shadow-panel">
            <div className="flex items-center gap-3 text-rush-legacy">
              <Stethoscope aria-hidden="true" size={24} />
              <span className="font-heading text-lg font-semibold">Student practice mode</span>
            </div>
            <p className="mt-2 max-w-xs text-sm leading-6 text-rush-dark-gray">
              {isPilotMode
                ? "Real-testing mode shows the assigned Jane Kim pilot case with patient voice in chat and objective data in the chart panel."
                : "Demo mode shows every configured case for local development and faculty review."}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="h-fit rounded-lg border border-rush-gray/70 bg-white p-5 shadow-sm" aria-labelledby="student-guide-heading">
          <div className="flex items-center gap-3 text-rush-legacy">
            <BookOpen aria-hidden="true" size={22} />
            <h2 id="student-guide-heading" className="font-heading text-2xl font-semibold">
              How to use this simulator
            </h2>
          </div>

          <ol className="mt-5 space-y-4">
            {studentGuideSteps.map((step, index) => (
              <li key={step.title} className="grid grid-cols-[32px_minmax(0,1fr)] gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded bg-rush-legacy font-heading text-sm font-semibold text-white">
                  {index + 1}
                </span>
                <div>
                  <h3 className="font-heading text-base font-semibold text-black">{step.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-rush-dark-gray">{step.description}</p>
                </div>
              </li>
            ))}
          </ol>

          <div className="mt-5 rounded border border-rush-muted bg-rush-sage p-4 text-sm leading-6 text-black">
            <div className="mb-2 flex items-center gap-2 font-heading font-semibold text-rush-legacy">
              <TableProperties aria-hidden="true" size={18} />
              Chart boundary
            </div>
            Patients do not know lab values, vital signs, EKG interpretations, or imaging findings. Those results appear in the chart panel when you request them.
          </div>
        </aside>

        <div>
          <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-heading text-sm font-semibold uppercase tracking-[0.08em] text-rush-legacy">
                Case library
              </p>
              <h2 className="mt-1 font-heading text-3xl font-semibold">
                {isPilotMode ? "Assigned pilot case" : "Choose a case"}
              </h2>
            </div>
            <p className="text-sm text-rush-dark-gray">
              {cases.length} {cases.length === 1 ? "case" : "cases"} available
            </p>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {cases.map((caseDefinition) => (
              <Link
                key={caseDefinition.id}
                href={`/case/${caseDefinition.id}`}
                className="group flex min-h-[310px] flex-col rounded-lg border border-rush-gray/70 bg-white p-5 text-black no-underline shadow-sm transition hover:border-rush-legacy hover:shadow-panel focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-rush-legacy"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-rush-legacy">{caseDefinition.course}</p>
                    <h3 className="mt-2 font-heading text-2xl font-semibold leading-tight">{caseDefinition.title}</h3>
                  </div>
                  <ClipboardList
                    className="shrink-0 text-rush-growth transition group-hover:text-rush-legacy"
                    aria-hidden="true"
                    size={24}
                  />
                </div>

                <p className="text-base leading-7 text-rush-dark-gray">{caseDefinition.tileDescription}</p>

                <dl className="mt-5 grid gap-3 border-t border-rush-gray/50 pt-5 text-sm">
                  <div>
                    <dt className="font-semibold text-black">Patient</dt>
                    <dd className="mt-1 text-rush-dark-gray">{caseDefinition.patientDisplayName}</dd>
                  </div>
                  <div>
                    <dt className="font-semibold text-black">Chief concern</dt>
                    <dd className="mt-1 text-rush-dark-gray">{caseDefinition.chiefConcern}</dd>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <dt className="font-semibold text-black">Setting</dt>
                      <dd className="mt-1 text-rush-dark-gray">{caseDefinition.setting}</dd>
                    </div>
                    <div>
                      <dt className="font-semibold text-black">Chart data</dt>
                      <dd className="mt-1 text-rush-dark-gray">{caseDefinition.artifactCount} available</dd>
                    </div>
                  </div>
                </dl>

                <div className="mt-auto flex items-center justify-between border-t border-rush-gray/50 pt-4">
                  <span className="inline-flex items-center gap-2 font-heading font-semibold text-rush-legacy">
                    <MessageSquareText aria-hidden="true" size={18} />
                    Start case
                  </span>
                  <ArrowRight
                    aria-hidden="true"
                    className="text-rush-growth transition group-hover:translate-x-1 group-hover:text-rush-legacy"
                    size={20}
                  />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

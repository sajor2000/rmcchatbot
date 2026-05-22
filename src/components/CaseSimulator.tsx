"use client";

import { Fragment, useMemo, useRef, useState } from "react";
import { Activity, CheckCircle2, ClipboardList, FileText, HeartPulse, Play, Send, SquareCheck } from "lucide-react";
import type { ClientArtifactSummary, ClinicalArtifact, SafeCaseForClient } from "@/lib/caseSchema";
import { analyzeArtifactRequest } from "@/lib/artifacts";
import { buildStudentFeedback, type StudentFeedback } from "@/lib/studentFeedback";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type ArtifactNotice = {
  tone: "success" | "neutral";
  message: string;
};

type EncounterPhase = "notStarted" | "inProgress" | "ended";
type ArtifactContent<K extends ClinicalArtifact["content"]["kind"]> = Extract<ClinicalArtifact["content"], { kind: K }>;
type ChartSectionId = NonNullable<ClinicalArtifact["chartSection"]>;

const chartSections: Array<{
  id: ChartSectionId;
  title: string;
  tabLabel: string;
  description: string;
  emptyText: string;
}> = [
  {
    id: "results",
    title: "Results",
    tabLabel: "Results",
    description: "Vital signs, flowsheets, and laboratory data.",
    emptyText: "No vital signs or lab results opened yet."
  },
  {
    id: "diagnostics",
    title: "Diagnostics",
    tabLabel: "Diagnostics",
    description: "12-lead EKGs, chest X-rays, imaging, and diagnostic reports.",
    emptyText: "No diagnostic tests opened yet."
  },
  {
    id: "historyPhysical",
    title: "History & Physical",
    tabLabel: "H&P",
    description: "Charted history, review of systems, physical exam, and PMH/PSH sections.",
    emptyText: "No H&P sections opened yet."
  }
];

const patientObjectiveRedirect =
  "I don't know those results. You may need to check the chart or results panel.";

const encounterInstructions = [
  "Click Start encounter when your group is ready.",
  "Interview Jane like a patient. Ask one focused question at a time.",
  "Request objective data in chat when you need it.",
  "Review opened results in the panel. Jane will not report lab values, vital signs, or chart interpretations.",
  "Click End case when your interview is complete, then review the formative feedback."
];

const exampleQuestions = [
  "What brought you in today?",
  "Have you overdosed before?",
  "Can I see her vital signs?",
  "Can I review the mental status exam?"
];

export function CaseSimulator({ caseDefinition }: { caseDefinition: SafeCaseForClient }) {
  const [encounterPhase, setEncounterPhase] = useState<EncounterPhase>("notStarted");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isSending, setIsSending] = useState(false);
  const [revealedArtifacts, setRevealedArtifacts] = useState<ClinicalArtifact[]>([]);
  const [artifactNotice, setArtifactNotice] = useState<ArtifactNotice | null>(null);
  const sessionId = useMemo(() => crypto.randomUUID(), []);
  const transcriptInFlight = useRef(false);
  const noticeTimer = useRef<number | null>(null);
  const studentFeedback = useMemo(
    () =>
      buildStudentFeedback({
        caseDefinition,
        messages,
        revealedArtifactIds: revealedArtifacts.map((artifact) => artifact.id)
      }),
    [caseDefinition, messages, revealedArtifacts]
  );

  function startEncounter() {
    setMessages([
      {
        role: "assistant",
        content: `Hi, I'm ${caseDefinition.patientDisplayName}. I can tell you what has been going on.`
      }
    ]);
    setEncounterPhase("inProgress");
  }

  function endEncounter() {
    if (encounterPhase !== "inProgress") return;
    setEncounterPhase("ended");
    setIsSending(false);
    showArtifactNotice({
      tone: "neutral",
      message: "Encounter ended. Review your formative feedback below."
    });
  }

  function showArtifactNotice(nextNotice: ArtifactNotice) {
    setArtifactNotice(nextNotice);
    if (noticeTimer.current) {
      window.clearTimeout(noticeTimer.current);
    }
    noticeTimer.current = window.setTimeout(() => setArtifactNotice(null), 5000);
  }

  async function fetchArtifact(artifact: ClientArtifactSummary): Promise<ClinicalArtifact | null> {
    const response = await fetch(`/api/artifacts/${caseDefinition.id}/${artifact.id}`);
    if (!response.ok) return null;
    return (await response.json()) as ClinicalArtifact;
  }

  async function revealArtifacts(artifacts: ClientArtifactSummary[]): Promise<ClinicalArtifact[]> {
    if (encounterPhase !== "inProgress") return [];

    const revealedIds = new Set(revealedArtifacts.map((artifact) => artifact.id));
    const artifactsToFetch = artifacts.filter((artifact) => !revealedIds.has(artifact.id));
    const fetched = (await Promise.all(artifactsToFetch.map(fetchArtifact))).filter(
      (artifact): artifact is ClinicalArtifact => Boolean(artifact)
    );

    if (fetched.length > 0) {
      setRevealedArtifacts((current) => mergeArtifacts(current, fetched));
    }

    return fetched;
  }

  async function persistTranscript(nextMessages: Message[], nextArtifacts = revealedArtifacts) {
    if (transcriptInFlight.current) return;
    transcriptInFlight.current = true;
    try {
      await fetch("/api/transcripts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: caseDefinition.id,
          sessionId,
          messages: nextMessages,
          revealedArtifactIds: nextArtifacts.map((artifact) => artifact.id)
        })
      });
    } finally {
      transcriptInFlight.current = false;
    }
  }

  async function sendMessage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (encounterPhase !== "inProgress") return;

    const form = event.currentTarget;
    const formData = new FormData(form);
    const trimmed = String(formData.get("message") ?? "").trim();
    if (!trimmed || isSending) return;

    form.reset();
    setIsSending(true);

    const userMessage: Message = { role: "user", content: trimmed };
    const artifactAnalysis = analyzeArtifactRequest(trimmed, caseDefinition.artifacts);
    const requestedArtifacts = caseDefinition.artifacts.filter((artifact) =>
      artifactAnalysis.matchedArtifactIds.includes(artifact.id)
    );

    if (artifactAnalysis.intent === "matched" || artifactAnalysis.intent === "unavailable") {
      const newlyRevealed = await revealArtifacts(requestedArtifacts);
      const nextArtifacts = mergeArtifacts(revealedArtifacts, newlyRevealed);
      const assistantMessage: Message = { role: "assistant", content: patientObjectiveRedirect };
      const finalMessages = [...messages, userMessage, assistantMessage];

      setMessages(finalMessages);
      showArtifactNotice(
        artifactAnalysis.intent === "matched"
          ? {
              tone: "success",
              message: `New result available: ${requestedArtifacts.map((artifact) => artifact.title).join(", ")}`
            }
          : {
              tone: "neutral",
              message: "No matching result is available for this case."
            }
      );
      await persistTranscript(finalMessages, nextArtifacts);
      setIsSending(false);
      return;
    }

    const workingMessages = [...messages, userMessage, { role: "assistant" as const, content: "" }];
    setMessages(workingMessages);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseId: caseDefinition.id,
          sessionId,
          messages: [...messages, userMessage],
          revealedArtifactIds: revealedArtifacts.map((artifact) => artifact.id)
        })
      });

      if (!response.ok || !response.body) {
        throw new Error("Chat response failed.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        assistantText += decoder.decode(value, { stream: true });
        setMessages([...messages, userMessage, { role: "assistant", content: assistantText }]);
      }

      const finalMessages = [...messages, userMessage, { role: "assistant" as const, content: assistantText }];
      setMessages(finalMessages);
      await persistTranscript(finalMessages);
    } catch {
      const errorMessages = [
        ...messages,
        userMessage,
        {
          role: "assistant" as const,
          content: "I am having trouble responding right now. Please try again in a moment."
        }
      ];
      setMessages(errorMessages);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="mx-auto grid max-w-7xl gap-5 px-5 py-5 lg:grid-cols-[minmax(0,1fr)_460px]">
      <section className="flex min-h-[680px] flex-col rounded-lg border border-rush-gray/70 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-rush-gray/60 p-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-rush-legacy">Patient interview</p>
            <p className="mt-1 text-sm text-rush-dark-gray">
              Ask Jane patient questions in chat. To open the chart, type a result request for vitals, labs, ROS, H&P, or MSE. Click End case when you are ready for feedback.
            </p>
          </div>
          {encounterPhase === "inProgress" && (
            <button
              type="button"
              onClick={endEncounter}
              className="inline-flex items-center justify-center gap-2 rounded border border-rush-legacy px-4 py-2 font-heading text-sm font-semibold text-rush-legacy transition hover:bg-rush-sage focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-rush-legacy"
            >
              <SquareCheck size={16} aria-hidden="true" />
              End case
            </button>
          )}
        </div>

        {encounterPhase === "notStarted" && (
          <div className="flex flex-1 items-center justify-center p-6">
            <div className="max-w-2xl rounded-lg border border-rush-gray/70 bg-rush-sage p-6 shadow-sm">
              <p className="font-heading text-sm font-semibold uppercase tracking-[0.08em] text-rush-legacy">
                Ready to begin
              </p>
              <h2 className="mt-2 font-heading text-2xl font-semibold text-black">
                Start the Jane Kim encounter
              </h2>
              <p className="mt-3 leading-7 text-rush-dark-gray">
                Interview Jane in patient voice. Ask for chart data only when clinically appropriate; results will open in the panel after you request them.
              </p>

              <div className="mt-5 rounded border border-rush-muted bg-white p-4">
                <h3 className="font-heading text-base font-semibold text-rush-legacy">Student process</h3>
                <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm leading-6 text-black">
                  {encounterInstructions.map((instruction) => (
                    <li key={instruction}>{instruction}</li>
                  ))}
                </ol>
              </div>

              <div className="mt-4">
                <h3 className="font-heading text-base font-semibold text-rush-legacy">Example prompts</h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {exampleQuestions.map((question) => (
                    <span
                      key={question}
                      className="rounded border border-rush-muted bg-white px-3 py-1.5 text-sm text-rush-dark-gray"
                    >
                      {question}
                    </span>
                  ))}
                </div>
              </div>

              <button
                type="button"
                onClick={startEncounter}
                className="mt-5 inline-flex items-center gap-2 rounded bg-rush-growth px-5 py-3 font-heading font-semibold text-white transition hover:bg-rush-legacy focus:outline focus:outline-2 focus:outline-offset-2 focus:outline-rush-legacy"
              >
                <Play size={18} aria-hidden="true" />
                Start encounter
              </button>
            </div>
          </div>
        )}

        {encounterPhase !== "notStarted" && (
          <>
            <div data-testid="chat-thread" className="flex-1 space-y-4 overflow-y-auto p-5" aria-live="polite">
              {messages.map((message, index) => (
                <div
                  key={`${message.role}-${index}`}
                  className={message.role === "user" ? "flex justify-end" : "flex justify-start"}
                >
                  <div
                    className={
                      message.role === "user"
                        ? "max-w-[80%] rounded-[16px_16px_4px_16px] bg-rush-legacy px-4 py-3 text-white"
                        : "max-w-[80%] rounded-[16px_16px_16px_4px] bg-rush-sage px-4 py-3 text-black"
                    }
                  >
                    <p className="whitespace-pre-wrap leading-7">{message.content || "Thinking..."}</p>
                  </div>
                </div>
              ))}

              {encounterPhase === "ended" && <StudentFeedbackPanel feedback={studentFeedback} />}
            </div>

            <form onSubmit={sendMessage} className="border-t border-rush-gray/60 p-4">
              <label htmlFor="message" className="sr-only">
                Ask the patient a question
              </label>
              <div className="flex gap-3">
                <textarea
                  id="message"
                  name="message"
                  placeholder={
                    encounterPhase === "ended"
                      ? "This case has ended."
                      : "Ask about symptoms, history, mood, safety, or request labs..."
                  }
                  className="min-h-14 flex-1 resize-none rounded border border-rush-gray px-4 py-3 leading-6 focus:border-rush-legacy disabled:bg-[#F7F7F7]"
                  disabled={isSending || encounterPhase === "ended"}
                />
                <button
                  type="submit"
                  disabled={isSending || encounterPhase === "ended"}
                  className="inline-flex h-14 items-center gap-2 rounded bg-rush-growth px-5 font-heading font-semibold text-white transition hover:bg-rush-legacy disabled:cursor-not-allowed disabled:bg-rush-gray"
                >
                  <Send size={18} aria-hidden="true" />
                  Send
                </button>
              </div>
              {encounterPhase === "inProgress" && (
                <p className="mt-2 text-xs leading-5 text-rush-dark-gray">
                  Use patient questions to learn Jane&apos;s story. Use chart requests for objective data, for example vitals, urine toxicology, ROS, H&P, or MSE.
                </p>
              )}
            </form>
          </>
        )}
      </section>

      <aside
        className="overflow-hidden border border-[#D0D5DD] bg-[#F5F7FA] shadow-[inset_2px_0_4px_rgba(0,0,0,0.04)]"
        style={{ fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif" }}
        aria-labelledby="results-panel-heading"
        data-testid="results-panel"
      >
        <div className="bg-[#1B3A5C] px-4 py-3 text-white">
          <div className="flex items-center gap-2">
            <FileText size={18} aria-hidden="true" />
            <h2 id="results-panel-heading" className="text-sm font-semibold uppercase tracking-[0.02em]">
              Results panel
            </h2>
          </div>
          <p className="mt-1 text-xs text-[#D6E4F0]">
            Objective data opens here when the learner orders or requests it.
          </p>
        </div>

        <div className="flex border-b border-[#C8C8C8] bg-[#F0F0F0] px-2 pt-2" aria-label="Chart sections">
          {chartSections.map((section, index) => (
            <a
              key={section.id}
              href={`#chart-section-${section.id}`}
              className={cx(
                "border border-[#C8C8C8] px-3 py-2 text-xs font-semibold no-underline focus:outline focus:outline-2 focus:outline-offset-[-2px] focus:outline-[#006332]",
                index === 0 ? "border-b-white bg-white text-[#1A1A1A]" : "bg-[#E0E0E0] text-[#5A5A5A]"
              )}
            >
              {section.tabLabel}
            </a>
          ))}
        </div>

        {artifactNotice && (
          <div
            role="status"
            className={cx(
              "mx-4 mt-4 border px-3 py-2 text-sm shadow-sm",
              artifactNotice.tone === "success"
                ? "border-[#1B3A5C] bg-[#E3F2FD] text-[#1A1A1A]"
                : "border-rush-gray bg-white text-rush-dark-gray"
            )}
          >
            {artifactNotice.message}
          </div>
        )}

        <div className="space-y-3 p-4">
          {revealedArtifacts.length === 0 && (
            <div className="border border-dashed border-[#C8C8C8] bg-white p-3 text-sm text-[#5A5A5A]">
              No chart data opened yet. Ask for vitals, labs, a 12-lead EKG, chest X-ray, or H&P section.
            </div>
          )}

          {chartSections.map((section) => (
            <ChartSectionPanel
              key={section.id}
              section={section}
              revealedArtifacts={revealedArtifacts.filter((artifact) => getChartSection(artifact) === section.id)}
            />
          ))}
        </div>
      </aside>
    </div>
  );
}

function ChartSectionPanel({
  section,
  revealedArtifacts
}: {
  section: (typeof chartSections)[number];
  revealedArtifacts: ClinicalArtifact[];
}) {
  return (
    <section id={`chart-section-${section.id}`} className="border border-[#C8C8C8] bg-white">
      <div className="flex items-start justify-between gap-3 border-b border-[#C8C8C8] bg-[#E8EDF2] px-3 py-2">
        <div className="flex gap-2">
          <ChartSectionIcon section={section.id} />
          <div>
            <h3 className="text-xs font-bold uppercase tracking-[0.04em] text-[#1B3A5C]">{section.title}</h3>
            <p className="mt-0.5 text-[11px] leading-4 text-[#5A5A5A]">{section.description}</p>
          </div>
        </div>
        <span className="shrink-0 rounded-sm border border-[#C8C8C8] bg-white px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.04em] text-[#5A5A5A]">
          {revealedArtifacts.length} open
        </span>
      </div>

      <div className="border-b border-[#C8C8C8] bg-[#F7F9FC] px-3 py-2">
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.04em] text-[#5A5A5A]">
          <CheckCircle2 size={13} aria-hidden="true" />
          Chat-gated
        </div>
        <p className="mt-1 text-xs leading-4 text-[#5A5A5A]">
          Result names and values appear only after the learner asks for them in the interview.
        </p>
      </div>

      <div className="space-y-3 p-3">
        {revealedArtifacts.length === 0 ? (
          <div className="border border-dashed border-[#C8C8C8] bg-white p-3 text-xs text-[#5A5A5A]">
            {section.emptyText}
          </div>
        ) : (
          revealedArtifacts.map((artifact) => <ArtifactCard key={artifact.id} artifact={artifact} />)
        )}
      </div>
    </section>
  );
}

function ChartSectionIcon({ section }: { section: ChartSectionId }) {
  const className = "mt-0.5 shrink-0 text-[#1B3A5C]";
  if (section === "results") return <HeartPulse size={16} className={className} aria-hidden="true" />;
  if (section === "diagnostics") return <Activity size={16} className={className} aria-hidden="true" />;
  return <ClipboardList size={16} className={className} aria-hidden="true" />;
}

function StudentFeedbackPanel({ feedback }: { feedback: StudentFeedback }) {
  return (
    <section
      data-testid="student-feedback"
      className="mt-6 rounded-lg border border-rush-gray/70 bg-white p-5 shadow-sm"
      aria-labelledby="student-feedback-heading"
    >
      <div className="flex flex-col gap-3 border-b border-rush-gray/60 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-heading text-sm font-semibold uppercase tracking-[0.08em] text-rush-legacy">
            Feedback session
          </p>
          <h2 id="student-feedback-heading" className="mt-1 font-heading text-2xl font-semibold text-black">
            Formative case review
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-rush-dark-gray">
            This rubric uses AAMC Core EPA concepts for low-stakes reflection. It is based on questions asked and chart data opened in this session.
          </p>
        </div>
        <div className="rounded border border-rush-muted bg-rush-sage px-3 py-2 text-sm text-rush-legacy">
          <span className="font-semibold">Chart data opened:</span> {feedback.artifactProgress.opened}/
          {feedback.artifactProgress.total}
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        {feedback.domains.map((domain) => (
          <article key={domain.id} className="rounded border border-rush-gray/60 bg-white p-4">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h3 className="font-heading text-lg font-semibold text-black">{domain.title}</h3>
                <p className="mt-1 text-xs font-semibold uppercase tracking-[0.04em] text-rush-legacy">
                  {domain.epaAlignment}
                </p>
                <p className="mt-2 text-sm leading-6 text-rush-dark-gray">{domain.description}</p>
              </div>
              <span className={cx("w-fit rounded px-2 py-1 text-xs font-semibold", ratingClass(domain.rating))}>
                {domain.rating}
              </span>
            </div>

            <ul className="mt-3 space-y-2 text-sm">
              {domain.criteria.map((criterion) => (
                <li key={criterion.label} className="flex gap-2">
                  <span
                    className={cx(
                      "mt-1 h-2.5 w-2.5 shrink-0 rounded-full",
                      criterion.observed ? "bg-rush-growth" : "bg-rush-gray"
                    )}
                    aria-hidden="true"
                  />
                  <span className={criterion.observed ? "text-black" : "text-rush-dark-gray"}>
                    {criterion.label}
                  </span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <div className="mt-5 rounded border border-rush-muted bg-rush-sage p-4">
        <h3 className="font-heading text-base font-semibold text-rush-legacy">Reflection prompts</h3>
        <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm leading-6 text-black">
          {feedback.reflectionPrompts.map((prompt) => (
            <li key={prompt}>{prompt}</li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function ArtifactCard({ artifact }: { artifact: ClinicalArtifact }) {
  return (
    <article className="border border-[#C8C8C8] bg-white text-[13px] leading-[1.4] text-[#1A1A1A]">
      <div className="border-b-2 border-[#1B3A5C] px-3 py-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#5A5A5A]">
          {artifactLabel(artifact)}
        </p>
        <h3 className="mt-1 text-sm font-semibold uppercase tracking-[0.02em] text-[#1B3A5C]">
          {artifact.title}
        </h3>
      </div>
      <div className="p-3">
        <p className="mb-3 text-xs text-[#5A5A5A]">{artifact.description}</p>
        {artifact.content.kind === "labTable" && <LabTable content={artifact.content} />}
        {artifact.content.kind === "vitalsTable" && <VitalsTable content={artifact.content} />}
        {artifact.content.kind === "ecg" && <EcgDisplay content={artifact.content} />}
        {artifact.content.kind === "clinicalNote" && <ClinicalNote content={artifact.content} />}
        {artifact.content.kind === "radiologyReport" && <RadiologyReport content={artifact.content} />}
        {artifact.content.kind === "image" && (
          <div className="border border-[#C8C8C8] bg-[#F7F9FC] p-3 text-xs text-[#5A5A5A]">
            {artifact.content.caption}
          </div>
        )}
      </div>
    </article>
  );
}

function LabTable({ content }: { content: ArtifactContent<"labTable"> }) {
  return (
    <div>
      <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#1A1A1A]">
        {content.collectedAt && (
          <span>
            <span className="font-semibold uppercase text-[#5A5A5A]">Collected:</span>{" "}
            {content.collectedAt}
          </span>
        )}
        {content.resultedAt && (
          <span>
            <span className="font-semibold uppercase text-[#5A5A5A]">Resulted:</span>{" "}
            {content.resultedAt}
          </span>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full table-fixed border-collapse text-xs">
          <colgroup>
            <col className="w-[30%]" />
            <col className="w-[15%]" />
            <col className="w-[8%]" />
            <col className="w-[12%]" />
            <col className="w-[20%]" />
            <col className="w-[15%]" />
          </colgroup>
          <thead className="bg-[#1B3A5C] text-white">
            <tr>
              {["Component", "Value", "Flag", "Units", "Reference Range", "Status"].map((column) => (
                <th key={column} className="break-words border-r border-white/15 px-1.5 py-1.5 text-left text-[10px] font-semibold uppercase tracking-[0.02em]">
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {content.rows.map((row, index) => {
              const previousPanel = index > 0 ? content.rows[index - 1].panel : undefined;
              const showPanel = row.panel && row.panel !== previousPanel;
              return (
                <Fragment key={`${row.component}-${index}`}>
                  {showPanel && (
                    <tr className="bg-[#E8EDF2] text-xs font-bold text-[#1B3A5C]">
                      <td colSpan={6} className="border-l-4 border-[#1B3A5C] px-2 py-1.5">
                        {row.panel}
                      </td>
                    </tr>
                  )}
                  <tr className={cx("border-b border-[#C8C8C8]", criticalFlag(row.flag) && "bg-[#FFF0F0]", index % 2 === 1 && !criticalFlag(row.flag) && "bg-[#F7F9FC]")}>
                    <td className="break-words px-1.5 py-1.5">{row.component}</td>
                    <td className={cx("break-words px-1.5 py-1.5 text-right tabular-nums", flagClass(row.flag))}>{row.value}</td>
                    <td className={cx("px-1.5 py-1.5 text-center font-bold", flagClass(row.flag))}>{row.flag ?? ""}</td>
                    <td className="break-words px-1.5 py-1.5">{row.units}</td>
                    <td className="break-words px-1.5 py-1.5">{row.referenceRange}</td>
                    <td className="break-words px-1.5 py-1.5">
                      <span className="inline-block rounded-sm bg-[#E8F5E9] px-1 py-0.5 text-[9px] font-semibold uppercase tracking-[0.02em] text-[#2E7D32]">
                        {row.status ?? "Final"}
                      </span>
                    </td>
                  </tr>
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function VitalsTable({ content }: { content: ArtifactContent<"vitalsTable"> }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full table-fixed border-collapse text-xs">
        <thead>
          <tr>
            <th className="w-[34%] border-r border-white/15 bg-[#1B3A5C] px-2 py-1.5 text-left text-[11px] font-semibold uppercase text-white">
              Vital
            </th>
            <th className="w-[46%] border-r border-white/15 bg-[#1B3A5C] px-2 py-1.5 text-center text-[11px] font-semibold uppercase text-white">
              {content.recordedAt}
            </th>
            <th className="w-[20%] bg-[#1B3A5C] px-2 py-1.5 text-left text-[11px] font-semibold uppercase text-white">
              Units
            </th>
          </tr>
        </thead>
        <tbody>
          {content.rows.map((row) => (
            <tr key={row.vital}>
              <td className="border-b border-r border-[#C8C8C8] bg-[#F5F7FA] px-2 py-1.5 font-semibold">
                {row.vital}
              </td>
              <td className={cx("border-b border-r border-[#C8C8C8] px-2 py-1.5 text-center tabular-nums", row.abnormal && "font-bold text-[#CC0000]")}>
                {row.value}
              </td>
              <td className="border-b border-[#C8C8C8] px-2 py-1.5">{row.units}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EcgDisplay({ content }: { content: ArtifactContent<"ecg"> }) {
  const metadata = [
    ["Ventricular Rate", content.metadata.ventricularRate],
    ["PR Interval", content.metadata.prInterval],
    ["QRS Duration", content.metadata.qrsDuration],
    ["QT/QTc", content.metadata.qtQtc],
    ["P-R-T Axes", content.metadata.axes],
    ["Speed", content.metadata.speed],
    ["Gain", content.metadata.gain],
    ["Recorded", content.recordedAt]
  ];
  const leads = ["I", "aVR", "V1", "V4", "II", "aVL", "V2", "V5", "III", "aVF", "V3", "V6"];

  return (
    <div className="overflow-hidden border border-[#C8C8C8] bg-[#FFF5F5]">
      <div className="grid gap-x-4 gap-y-1 bg-[#1B3A5C] p-3 text-xs text-white sm:grid-cols-2">
        {metadata.map(([label, value]) => (
          <div key={label}>
            <span className="block text-[10px] uppercase text-[#A0B4CC]">{label}</span>
            <span className="font-semibold tabular-nums">{value}</span>
          </div>
        ))}
      </div>
      <div className="border-l-4 border-[#F9A825] bg-[#FFFDE7] px-3 py-2 text-xs italic">
        {content.machineInterpretation}
      </div>
      <div
        className="grid min-h-[360px] grid-cols-2 bg-[#FFF5F5] sm:grid-cols-4"
        style={{
          backgroundImage:
            "linear-gradient(to right, #F5CCCC 1px, transparent 1px), linear-gradient(to bottom, #F5CCCC 1px, transparent 1px), linear-gradient(to right, #E8A0A0 1px, transparent 1px), linear-gradient(to bottom, #E8A0A0 1px, transparent 1px)",
          backgroundSize: "5px 5px, 5px 5px, 25px 25px, 25px 25px"
        }}
      >
        {leads.map((lead) => (
          <div key={lead} className="relative min-h-24 border-b border-r border-[#D4A0A0]">
            <span className="absolute left-1.5 top-1 rounded-sm bg-[#FFF5F5]/80 px-1 text-[11px] font-bold">
              {lead}
            </span>
            <svg className="absolute inset-x-3 bottom-5 h-10 w-[calc(100%-1.5rem)]" viewBox="0 0 120 40" aria-hidden="true">
              <polyline
                points="0,24 16,24 22,19 28,24 42,24 46,8 50,32 54,24 78,24 90,18 102,24 120,24"
                fill="none"
                stroke="#1A1A1A"
                strokeWidth="2"
              />
            </svg>
          </div>
        ))}
        <div className="relative col-span-full min-h-20 border-t-2 border-[#D4A0A0]">
          <span className="absolute left-1.5 top-1 rounded-sm bg-[#FFF5F5]/80 px-1 text-[11px] font-bold">
            II rhythm strip
          </span>
        </div>
      </div>
      <ul className="space-y-1 border-t border-[#C8C8C8] bg-white p-3 text-xs">
        {content.findings.map((finding) => (
          <li key={finding}>{finding}</li>
        ))}
      </ul>
    </div>
  );
}

function ClinicalNote({ content }: { content: ArtifactContent<"clinicalNote"> }) {
  return (
    <div className="border border-[#C8C8C8] bg-white p-3">
      {content.sections.map((section) => (
        <section key={section.heading} className="mt-3 first:mt-0">
          <h4 className="mb-1 text-xs font-bold uppercase text-[#1B3A5C]">{section.heading}</h4>
          {section.body.map((line) => (
            <p key={line} className="text-xs leading-6">
              {line}
            </p>
          ))}
        </section>
      ))}
    </div>
  );
}

function RadiologyReport({ content }: { content: ArtifactContent<"radiologyReport"> }) {
  return (
    <div className="whitespace-pre-wrap border border-[#C8C8C8] bg-white p-4 font-mono text-[13px] leading-6">
      <div className="-mx-4 -mt-4 mb-3 bg-[#1B3A5C] px-3 py-2 font-sans text-white">
        <strong>{content.exam}</strong>
        <br />
        {content.performedAt}
      </div>
      {content.sections.map((section) => (
        <section key={section.heading} className="mt-3 first:mt-0">
          <h4 className="font-sans text-xs font-bold uppercase text-[#1B3A5C]">{section.heading}</h4>
          {section.body.map((line) => (
            <p key={line} className={section.heading.toLowerCase() === "impression" ? "border-l-4 border-[#1B3A5C] pl-3 font-semibold" : ""}>
              {line}
            </p>
          ))}
        </section>
      ))}
    </div>
  );
}

function mergeArtifacts(current: ClinicalArtifact[], next: ClinicalArtifact[]) {
  const merged = [...current];
  for (const artifact of next) {
    if (!merged.some((item) => item.id === artifact.id)) {
      merged.push(artifact);
    }
  }
  return merged;
}

function getChartSection(artifact: ClientArtifactSummary | ClinicalArtifact): ChartSectionId {
  if (artifact.chartSection) return artifact.chartSection;
  const content = "content" in artifact ? artifact.content : undefined;
  if (content?.kind === "labTable" || content?.kind === "vitalsTable" || artifact.type === "lab") return "results";
  if (
    content?.kind === "ecg" ||
    content?.kind === "radiologyReport" ||
    content?.kind === "image" ||
    artifact.type === "ekg" ||
    artifact.type === "imaging"
  ) {
    return "diagnostics";
  }
  return "historyPhysical";
}

function artifactLabel(artifact: ClientArtifactSummary | ClinicalArtifact) {
  const content = "content" in artifact ? artifact.content : undefined;
  if (content?.kind === "labTable") return "lab";
  if (content?.kind === "vitalsTable") return "vitals";
  if (content?.kind === "ecg") return "ekg";
  if (content?.kind === "radiologyReport") return "imaging";
  if (content?.kind === "clinicalNote") return "H&P";
  if (artifact.type === "note") return "H&P";
  return artifact.type;
}

function ratingClass(rating: string) {
  if (rating === "Strong") return "bg-rush-sage text-rush-legacy";
  if (rating === "Meets expectations") return "bg-[#E3F2FD] text-[#1B3A5C]";
  if (rating === "Developing") return "bg-[#FFF8E1] text-[#7A5700]";
  return "bg-[#F2F2F2] text-rush-dark-gray";
}

function flagClass(flag?: string) {
  if (flag === "H" || flag === "A") return "font-semibold text-[#CC0000]";
  if (flag === "L") return "font-semibold text-[#0060AF]";
  if (criticalFlag(flag)) return "font-bold text-[#8B0000]";
  return "";
}

function criticalFlag(flag?: string) {
  return flag === "HH" || flag === "LL" || flag === "C";
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

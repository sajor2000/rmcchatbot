import { getVisibleCases } from "@/lib/cases";
import { buildLivePromptBattery } from "@/lib/caseValidation";

const baseUrl = process.env.PROMPT_BATTERY_BASE_URL ?? "http://127.0.0.1:3100";
const promptBattery = buildLivePromptBattery(getVisibleCases());
const failures: Array<{
  caseId: string;
  category: string;
  status: number;
  mode: string | null;
  expectedMode: string;
  missingRequiredTerms: string[];
  forbiddenHit: string | null;
  preview: string;
}> = [];

async function main() {
  for (const check of promptBattery) {
    const response = await fetch(`${baseUrl}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        caseId: check.caseId,
        sessionId: `prompt-battery-${check.caseId}-${check.category}`,
        messages: [{ role: "user", content: check.prompt }],
        revealedArtifactIds: []
      })
    });

    const text = await response.text();
    const mode = response.headers.get("x-rmc-model-mode");
    const normalizedText = text.toLowerCase();
    const missingRequiredTerms = check.requiredResponseTerms.filter(
      (term) => !normalizedText.includes(term.toLowerCase())
    );
    const forbiddenHit =
      check.forbiddenResponseTerms.find((term) => normalizedText.includes(term.toLowerCase())) ?? null;
    const fallback = /clinical terms|trouble responding|content filter|moderation|filtered/i.test(text);
    const ok = response.ok && mode === check.expectedMode && missingRequiredTerms.length === 0 && !forbiddenHit && !fallback;
    const result = {
      caseId: check.caseId,
      category: check.category,
      status: response.status,
      mode,
      expectedMode: check.expectedMode,
      ok,
      missingRequiredTerms,
      forbiddenHit,
      preview: text.replace(/\s+/g, " ").slice(0, 140)
    };

    console.log(JSON.stringify(result));
    if (!ok) {
      failures.push(result);
    }
  }

  if (failures.length > 0) {
    console.error("Prompt battery failures:");
    console.error(JSON.stringify(failures, null, 2));
    process.exit(1);
  }

  console.log(`Prompt battery passed: ${promptBattery.length} prompts`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

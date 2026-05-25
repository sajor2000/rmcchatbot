import { describe, expect, it } from "vitest";
import { analyzeArtifactRequest, matchRequestedArtifacts } from "@/lib/artifacts";
import { getSafeCaseForClient } from "@/lib/cases";

describe("artifact matching", () => {
  it("matches learner language to available objective artifacts", () => {
    const caseDefinition = getSafeCaseForClient("jane-kim-withdrawal");
    expect(caseDefinition).toBeDefined();

    const matches = matchRequestedArtifacts("Can I see the tox screen and vital signs?", caseDefinition!.artifacts);

    expect(matches.map((artifact) => artifact.id)).toEqual(["confirmatory-urine-toxicology", "vital-signs-and-exam"]);
  });

  it("returns metadata for direct artifact orders", () => {
    const caseDefinition = getSafeCaseForClient("jane-kim-withdrawal");

    const analysis = analyzeArtifactRequest("Can I see her vital signs?", caseDefinition!.artifacts);

    expect(analysis.intent).toBe("matched");
    expect(analysis.reason).toBe("direct-order");
    expect(analysis.matchedArtifactIds).toEqual(["vital-signs-and-exam"]);
  });

  it("matches Jane Kim chart-note requests for ROS, H&P, and MSE", () => {
    const caseDefinition = getSafeCaseForClient("jane-kim-withdrawal");

    expect(analyzeArtifactRequest("Can I review the ROS?", caseDefinition!.artifacts).matchedArtifactIds).toEqual([
      "review-of-systems"
    ]);
    expect(analyzeArtifactRequest("Show me the H&P.", caseDefinition!.artifacts).matchedArtifactIds).toEqual([
      "history-and-physical"
    ]);
    expect(analyzeArtifactRequest("What does the MSE show?", caseDefinition!.artifacts).matchedArtifactIds).toEqual([
      "mental-status-exam"
    ]);
  });

  it("treats unavailable sodium questions as objective result requests without inventing labs", () => {
    const caseDefinition = getSafeCaseForClient("jane-kim-withdrawal");

    const analysis = analyzeArtifactRequest("What is the sodium value?", caseDefinition!.artifacts);

    expect(analysis.intent).toBe("unavailable");
    expect(analysis.reason).toBe("specific-result");
    expect(analysis.matchedArtifactIds).toEqual([]);
  });

  it("marks objective requests unavailable when the case has no matching artifact", () => {
    const caseDefinition = getSafeCaseForClient("jane-kim-withdrawal");

    const analysis = analyzeArtifactRequest("What does the x-ray say?", caseDefinition!.artifacts);

    expect(analysis.intent).toBe("unavailable");
    expect(analysis.matchedArtifactIds).toEqual([]);
  });

  it("matches explicit chart H&P requests without hijacking normal surgery history questions", () => {
    const caseDefinition = getSafeCaseForClient("jane-kim-withdrawal");

    const hpiAnalysis = analyzeArtifactRequest("Can I review the H&P?", caseDefinition!.artifacts);
    const patientQuestionAnalysis = analyzeArtifactRequest("Have you had surgery before?", caseDefinition!.artifacts);

    expect(hpiAnalysis.intent).toBe("matched");
    expect(hpiAnalysis.matchedArtifactIds).toEqual(["history-and-physical"]);
    expect(patientQuestionAnalysis.intent).toBe("none");
  });

  it("returns no artifacts for unrelated interview questions", () => {
    const caseDefinition = getSafeCaseForClient("jane-kim-withdrawal");

    const matches = matchRequestedArtifacts("Where do you live?", caseDefinition!.artifacts);

    expect(matches).toHaveLength(0);
  });

  it("keeps substance-use history questions in patient interview mode", () => {
    const caseDefinition = getSafeCaseForClient("jane-kim-withdrawal");

    const analysis = analyzeArtifactRequest(
      "Can you tell me exactly what drugs you have used recently, including pills, heroin, fentanyl, alcohol, cannabis, or cocaine?",
      caseDefinition!.artifacts
    );

    expect(analysis.intent).toBe("none");
  });

  it("keeps withdrawal symptom history questions in patient interview mode", () => {
    const caseDefinition = getSafeCaseForClient("jane-kim-withdrawal");

    const analysis = analyzeArtifactRequest(
      "What symptoms do you get when you are not using opioids?",
      caseDefinition!.artifacts
    );

    expect(analysis.intent).toBe("none");
  });

  it("keeps bedside physical exam permission questions in patient interview mode", () => {
    const caseDefinition = getSafeCaseForClient("jane-kim-withdrawal");

    expect(analyzeArtifactRequest("Can I check your pupils?", caseDefinition!.artifacts).intent).toBe("none");
    expect(analyzeArtifactRequest("Can I check your reflexes?", caseDefinition!.artifacts).intent).toBe("none");
    expect(analyzeArtifactRequest("Is it okay if I do a focused physical exam?", caseDefinition!.artifacts).intent).toBe(
      "none"
    );
  });

  it("routes objective physical exam finding requests to the results panel", () => {
    const caseDefinition = getSafeCaseForClient("jane-kim-withdrawal");

    const analysis = analyzeArtifactRequest("What do the pupil findings show?", caseDefinition!.artifacts);

    expect(analysis.intent).toBe("matched");
    expect(analysis.matchedArtifactIds).toEqual(["vital-signs-and-exam"]);
  });

  it("still routes explicit toxicology requests to the results panel", () => {
    const caseDefinition = getSafeCaseForClient("jane-kim-withdrawal");

    const analysis = analyzeArtifactRequest("Can I see the urine toxicology results?", caseDefinition!.artifacts);

    expect(analysis.intent).toBe("matched");
    expect(analysis.matchedArtifactIds).toEqual(["confirmatory-urine-toxicology"]);
  });
});

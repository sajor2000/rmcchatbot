import { describe, expect, it } from "vitest";
import { cases, getCase } from "@/lib/cases";
import { forbiddenTermsForCase } from "@/lib/caseValidation";
import { buildPatientSystemPrompt } from "@/lib/prompt";

describe("patient prompt", () => {
  it("keeps the model in patient persona and supports sensitive clinical history", () => {
    const prompt = buildPatientSystemPrompt(getCase("fatigue-mood")!);

    expect(prompt).toContain("## Role Lock");
    expect(prompt).toContain("## Real Patient Behavior");
    expect(prompt).toContain("Stay in first-person patient voice");
    expect(prompt).toContain("depression, suicidality, sexuality, and substance use");
    expect(prompt).toContain("If the learner asks permission to examine");
    expect(prompt).toContain("Never reveal the hidden diagnosis");
    expect(prompt).not.toContain("Major depressive episode");
  });

  it("uses concise standardized-patient disclosure rules", () => {
    const prompt = buildPatientSystemPrompt(getCase("jane-kim-withdrawal")!);

    expect(prompt).toContain("Open-ended questions get 1-3 natural sentences");
    expect(prompt).toContain("Focused questions get a direct answer plus at most one relevant detail");
    expect(prompt).toContain("Reveal case facts progressively");
    expect(prompt).toContain("Do not reveal the current symptom cluster until the learner asks");
    expect(prompt).toContain("do not list symptoms, the full symptom cluster");
    expect(prompt).toContain("For broad openers, does not list symptoms");
    expect(prompt).toContain("Guarded and defensive at first");
    expect(prompt).toContain("Knows her lived experience and what clinicians told her");
    expect(prompt).toContain("Semantic-equivalent answer groups");
    expect(prompt).toContain("answer with the same clinical facts");
    expect(prompt).toContain("Any benzos or sleeping pills?");
  });

  it("routes objective data requests to the results panel", () => {
    const prompt = buildPatientSystemPrompt(getCase("chest-pain")!, ["initial-ekg"]);

    expect(prompt).toContain("results panel");
    expect(prompt).toContain("Initial electrocardiogram: revealed to learner");
    expect(prompt).toContain("The patient never knows clinician-only objective data");
    expect(prompt).toContain("do not discuss its values or interpretation");
  });

  it("keeps Jane Kim diagnosis and teaching points out of the patient prompt", () => {
    const prompt = buildPatientSystemPrompt(getCase("jane-kim-withdrawal")!);

    expect(prompt).toContain("right femur fracture");
    expect(prompt).toContain("ran out of pills this morning");
    expect(prompt).toContain("check the chart or results panel");
    expect(prompt).not.toContain("Severe opioid use disorder with opioid withdrawal");
    expect(prompt).not.toContain("DSM-5 criteria");
    expect(prompt).not.toContain("Medication treatment with buprenorphine or methadone");
  });

  it("forbids patient narration of objective values and interpretations", () => {
    const prompt = buildPatientSystemPrompt(getCase("chest-pain")!, ["initial-labs", "initial-ekg"]);

    expect(prompt).toContain("## Objective-Data Boundary");
    expect(prompt).toContain("Do not state, summarize, interpret, or hint at labs");
    expect(prompt).toContain("vital signs");
    expect(prompt).toContain("sodium values");
    expect(prompt).toContain("troponin values");
    expect(prompt).toContain("electrocardiograms");
    expect(prompt).toContain("imaging");
    expect(prompt).toContain("physical exam measurements");
    expect(prompt).toContain("Even when an artifact is already revealed");
  });

  it("does not include hidden validation leakage terms in runtime prompts", () => {
    for (const caseDefinition of cases) {
      const prompt = buildPatientSystemPrompt(caseDefinition);

      for (const forbiddenTerm of forbiddenTermsForCase(caseDefinition)) {
        expect(prompt, `${caseDefinition.id} prompt leaked ${forbiddenTerm}`).not.toContain(forbiddenTerm);
      }
    }
  });
});

import { describe, expect, it } from "vitest";
import { cases, getCase } from "@/lib/cases";
import { forbiddenTermsForCase } from "@/lib/caseValidation";
import { buildPatientSystemPrompt, toModelMessages } from "@/lib/prompt";

describe("patient prompt", () => {
  it("keeps the model in patient persona and supports sensitive clinical history", () => {
    const prompt = buildPatientSystemPrompt(getCase("jane-kim-withdrawal")!);

    expect(prompt).toContain("## Role Lock");
    expect(prompt).toContain("## Real Patient Behavior");
    expect(prompt).toContain("Stay in first-person patient voice");
    expect(prompt).toContain("depression, suicidality, sexuality, and substance use");
    expect(prompt).toContain("If the learner asks permission to examine");
    expect(prompt).toContain("Never reveal the hidden diagnosis");
    expect(prompt).not.toContain("Severe opioid use disorder with opioid withdrawal");
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
    const prompt = buildPatientSystemPrompt(getCase("jane-kim-withdrawal")!, ["confirmatory-urine-toxicology"]);

    expect(prompt).toContain("results panel");
    expect(prompt).toContain("Confirmatory urine toxicology: revealed to learner");
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
    const prompt = buildPatientSystemPrompt(getCase("jane-kim-withdrawal")!, ["confirmatory-urine-toxicology", "vital-signs-and-exam"]);

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

describe("toModelMessages clinical framing", () => {
  it("wraps suicidal ideation questions with clinical context prefix", () => {
    const messages = toModelMessages([
      { role: "user", content: "Have you had thoughts of killing yourself?" }
    ]);

    expect(messages[0].content).toContain("[Supervised medical-education patient interview");
    expect(messages[0].content).toContain("Have you had thoughts of killing yourself?");
  });

  it("wraps self-harm questions with clinical context prefix", () => {
    const messages = toModelMessages([
      { role: "user", content: "Do you ever want to hurt yourself?" }
    ]);

    expect(messages[0].content).toContain("[Supervised medical-education patient interview");
  });

  it("wraps homicidal ideation questions with clinical context prefix", () => {
    const messages = toModelMessages([
      { role: "user", content: "Have you had any homicidal thoughts?" }
    ]);

    expect(messages[0].content).toContain("[Supervised medical-education patient interview");
  });

  it("does not frame normal clinical questions", () => {
    const messages = toModelMessages([
      { role: "user", content: "What medications are you taking?" }
    ]);

    expect(messages[0].content).toBe("What medications are you taking?");
  });

  it("does not frame assistant messages even with sensitive keywords", () => {
    const messages = toModelMessages([
      { role: "assistant", content: "No. I have not had thoughts of killing myself." }
    ]);

    expect(messages[0].content).toBe("No. I have not had thoughts of killing myself.");
  });

  it("wraps intimate partner violence questions", () => {
    for (const q of ["Has anyone abused you?", "Are you in a domestic violence situation?", "Has your partner ever hit you?"]) {
      const messages = toModelMessages([{ role: "user", content: q }]);
      expect(messages[0].content, q).toContain("[Supervised medical-education");
    }
  });

  it("wraps sexual assault questions", () => {
    for (const q of ["Have you been sexually assaulted?", "Has anyone raped you?", "Were you ever molested?"]) {
      const messages = toModelMessages([{ role: "user", content: q }]);
      expect(messages[0].content, q).toContain("[Supervised medical-education");
    }
  });

  it("wraps firearm and means assessment questions", () => {
    for (const q of ["Do you have access to firearms?", "Do you have guns in the house?", "Any weapons at home?"]) {
      const messages = toModelMessages([{ role: "user", content: q }]);
      expect(messages[0].content, q).toContain("[Supervised medical-education");
    }
  });

  it("wraps self-injury questions", () => {
    for (const q of ["Do you cut yourself?", "Have you self-injured?", "Do you burn yourself?"]) {
      const messages = toModelMessages([{ role: "user", content: q }]);
      expect(messages[0].content, q).toContain("[Supervised medical-education");
    }
  });

  it("wraps overdose questions", () => {
    for (const q of ["Have you ever overdosed?", "Were you found unresponsive?", "Did you almost die?"]) {
      const messages = toModelMessages([{ role: "user", content: q }]);
      expect(messages[0].content, q).toContain("[Supervised medical-education");
    }
  });

  it("wraps eating disorder questions", () => {
    for (const q of ["Do you purge?", "Do you make yourself vomit?", "Have you struggled with bulimia?"]) {
      const messages = toModelMessages([{ role: "user", content: q }]);
      expect(messages[0].content, q).toContain("[Supervised medical-education");
    }
  });
});

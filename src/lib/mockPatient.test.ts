import { describe, expect, it } from "vitest";
import { getCase } from "@/lib/cases";
import { mockPatientReply } from "@/lib/mockPatient";

describe("mock patient", () => {
  it("uses anticipated student Q&A when available", () => {
    const janeKimCase = getCase("jane-kim-withdrawal")!;

    expect(mockPatientReply(janeKimCase, "Have you overdosed before?")).toContain("naloxone");
    expect(mockPatientReply(janeKimCase, "Do you share needles?")).toContain("new syringes");
  });

  it("uses semantic answer groups for high-risk paraphrases", () => {
    const janeKimCase = getCase("jane-kim-withdrawal")!;
    const substancePrompts = [
      "Do you drink?",
      "Any alcohol?",
      "Do you take Xanax?",
      "Any benzos or sleeping pills?",
      "Any weed, cocaine, or other drugs?"
    ];
    const sexualHistoryPrompts = [
      "Are you sexually active?",
      "When did you last have sex?",
      "Do you use protection?",
      "Are you on birth control?"
    ];
    const exchangeSexPrompts = ["Have you traded sex?", "Sex for money?", "Sex for drugs?"];

    for (const prompt of substancePrompts) {
      const answer = mockPatientReply(janeKimCase, prompt);

      expect(answer).toContain("do not drink alcohol");
      expect(answer).toContain("opioid pills and then heroin");
    }

    for (const prompt of sexualHistoryPrompts) {
      expect(mockPatientReply(janeKimCase, prompt)).toContain("not currently sexually active");
    }

    for (const prompt of exchangeSexPrompts) {
      expect(mockPatientReply(janeKimCase, prompt)).toContain("never exchanged sex");
    }

    expect(mockPatientReply(janeKimCase, "Has your husband hurt you?")).toContain("threatened to leave");
  });

  it("still refuses to disclose diagnosis", () => {
    const janeKimCase = getCase("jane-kim-withdrawal")!;

    expect(mockPatientReply(janeKimCase, "What diagnosis do I have?")).not.toContain("opioid use disorder");
  });

  it("keeps broad opening questions concise so learners elicit the history", () => {
    const janeKimCase = getCase("jane-kim-withdrawal")!;
    const answer = mockPatientReply(janeKimCase, "What brought you in today?");

    expect(answer).toContain("really sick and overwhelmed");
    expect(answer).not.toContain("diarrhea");
    expect(answer).not.toContain("nausea");
    expect(answer).not.toContain("muscles and bones");
  });

  it("reveals symptoms only after the learner asks for symptoms", () => {
    const janeKimCase = getCase("jane-kim-withdrawal")!;
    const answer = mockPatientReply(janeKimCase, "What symptoms are you having right now?");

    expect(answer).toContain("Diffuse muscle aches");
    expect(answer).toContain("Abdominal cramping and diarrhea");
    expect(answer).toContain("Nausea");
  });

  it("uses the opening statement as the local fallback instead of dumping HPI", () => {
    const janeKimCase = getCase("jane-kim-withdrawal")!;
    const answer = mockPatientReply(janeKimCase, "Can you tell me more?");

    expect(answer).toContain("really sick and overwhelmed");
    expect(answer).not.toContain("emergency department with muscle aches");
  });

  it("answers normal surgery-history questions as the patient", () => {
    const janeKimCase = getCase("jane-kim-withdrawal")!;

    expect(mockPatientReply(janeKimCase, "Have you had surgery before?").toLowerCase()).toContain("right femur");
  });
});

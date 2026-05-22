import { describe, expect, it } from "vitest";
import { getSafeCaseForClient } from "@/lib/cases";
import { buildStudentFeedback } from "@/lib/studentFeedback";

describe("student feedback", () => {
  it("scores Jane Kim feedback from observed questions and opened artifacts", () => {
    const caseDefinition = getSafeCaseForClient("jane-kim-withdrawal");
    expect(caseDefinition).toBeDefined();

    const feedback = buildStudentFeedback({
      caseDefinition: caseDefinition!,
      revealedArtifactIds: ["vital-signs-and-exam", "confirmatory-urine-toxicology", "mental-status-exam"],
      messages: [
        { role: "assistant", content: "Hi, I'm Jane Kim." },
        { role: "user", content: "What brought you in and what symptoms are you having?" },
        { role: "user", content: "When was your last opioid use and have you overdosed before?" },
        { role: "user", content: "Do you feel safe at home? Have you had thoughts of suicide?" },
        { role: "user", content: "Can I see your vital signs and urine toxicology labs?" }
      ]
    });

    expect(feedback.artifactProgress).toEqual({ opened: 3, total: 5 });
    expect(feedback.reflectionPrompts).toHaveLength(3);
    expect(feedback.domains).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "patient-centered-interview",
          rating: "Meets expectations"
        }),
        expect.objectContaining({
          id: "diagnostic-data-use",
          rating: "Strong"
        })
      ])
    );
  });

  it("uses formative low-stakes labels when little is observed", () => {
    const caseDefinition = getSafeCaseForClient("jane-kim-withdrawal");

    const feedback = buildStudentFeedback({
      caseDefinition: caseDefinition!,
      revealedArtifactIds: [],
      messages: [{ role: "user", content: "Hello." }]
    });

    expect(new Set(feedback.domains.map((domain) => domain.rating))).toContain("Not yet observed");
    expect(feedback.artifactProgress).toEqual({ opened: 0, total: 5 });
  });
});

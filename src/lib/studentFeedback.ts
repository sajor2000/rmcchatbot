import type { FeedbackRating, SafeCaseForClient } from "@/lib/caseSchema";

export type FeedbackMessage = {
  role: "user" | "assistant";
  content: string;
};

export type StudentFeedbackCriterion = {
  label: string;
  observed: boolean;
};

export type StudentFeedbackDomain = {
  id: string;
  title: string;
  epaAlignment: string;
  description: string;
  rating: FeedbackRating;
  observedCount: number;
  criteria: StudentFeedbackCriterion[];
};

export type StudentFeedback = {
  domains: StudentFeedbackDomain[];
  reflectionPrompts: string[];
  artifactProgress: {
    opened: number;
    total: number;
  };
};

export function buildStudentFeedback({
  caseDefinition,
  messages,
  revealedArtifactIds
}: {
  caseDefinition: SafeCaseForClient;
  messages: FeedbackMessage[];
  revealedArtifactIds: string[];
}): StudentFeedback {
  const rubric = caseDefinition.feedbackRubric;
  if (!rubric) {
    return {
      domains: [],
      reflectionPrompts: [],
      artifactProgress: { opened: 0, total: 0 }
    };
  }

  const learnerText = normalize(
    messages
      .filter((message) => message.role === "user")
      .map((message) => message.content)
      .join(" ")
  );
  const openedArtifactIds = new Set(revealedArtifactIds);
  const expectedArtifactIds = new Set(rubric.expectedArtifacts);

  return {
    domains: rubric.domains.map((domain) => {
      const criteria = domain.criteria.map((criterion) => {
        const triggerObserved = criterion.triggerTerms?.some((term) =>
          includesNormalizedTerm(learnerText, normalize(term))
        ) ?? false;
        const artifactObserved = criterion.artifactIds?.some((artifactId) =>
          openedArtifactIds.has(artifactId)
        ) ?? false;

        return {
          label: criterion.label,
          observed: triggerObserved || artifactObserved
        };
      });
      const observedCount = criteria.filter((criterion) => criterion.observed).length;

      return {
        id: domain.id,
        title: domain.title,
        epaAlignment: domain.epaAlignment,
        description: domain.description,
        rating: ratingFor(observedCount, criteria.length),
        observedCount,
        criteria
      };
    }),
    reflectionPrompts: rubric.reflectionPrompts,
    artifactProgress: {
      opened: Array.from(openedArtifactIds).filter((artifactId) => expectedArtifactIds.has(artifactId)).length,
      total: expectedArtifactIds.size
    }
  };
}

function ratingFor(observedCount: number, total: number): FeedbackRating {
  if (observedCount === 0) return "Not yet observed";
  if (observedCount === total) return "Strong";
  if (observedCount >= Math.ceil(total / 2)) return "Meets expectations";
  return "Developing";
}

function normalize(value: string): string {
  return value.toLowerCase().replace(/[^\w\s/-]/g, " ").replace(/\s+/g, " ").trim();
}

function includesNormalizedTerm(normalizedValue: string, normalizedTerm: string): boolean {
  return ` ${normalizedValue} `.includes(` ${normalizedTerm} `);
}

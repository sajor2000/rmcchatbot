import { chestPainCase } from "@/content/cases/chestPainCase";
import { janeKimCase } from "@/content/cases/janeKimCase";
import { moodCase } from "@/content/cases/moodCase";
import type { CaseDefinition } from "@/lib/caseSchema";

export const caseDefinitions: CaseDefinition[] = [
  chestPainCase,
  moodCase,
  janeKimCase
];

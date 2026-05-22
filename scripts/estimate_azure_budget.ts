#!/usr/bin/env tsx
import { pathToFileURL } from "node:url";

import {
  AZURE_OPENAI_GLOBAL_STANDARD_PRICING,
  CONSERVATIVE_CHAT_BUDGET_ASSUMPTIONS,
  DEFAULT_CHAT_BUDGET_ASSUMPTIONS,
  type AzureBudgetModel,
  type ChatBudgetAssumptions,
  estimateCohortBudget,
  formatUsd
} from "@/lib/azureBudget";

type BudgetCliOptions = {
  model: AzureBudgetModel;
  students: number;
  chatsPerStudent: number;
  turnsPerChat: number;
  scenario: "expected" | "conservative";
};

const DEFAULT_OPTIONS: BudgetCliOptions = {
  model: "gpt-4.1",
  students: 120,
  chatsPerStudent: 1,
  turnsPerChat: DEFAULT_CHAT_BUDGET_ASSUMPTIONS.turnsPerChat,
  scenario: "expected"
};

export function parseBudgetArgs(argv: string[]): BudgetCliOptions {
  const options = { ...DEFAULT_OPTIONS };

  for (let index = 0; index < argv.length; index += 1) {
    const item = argv[index];
    if (!item.startsWith("--")) {
      throw new Error(`Unexpected positional argument: ${item}`);
    }

    const key = item.slice(2);
    const value = argv[index + 1];
    if (!value || value.startsWith("--")) {
      throw new Error(`Missing value for --${key}`);
    }

    switch (key) {
      case "model":
        if (value !== "gpt-4.1" && value !== "gpt-4.1-mini") {
          throw new Error("--model must be gpt-4.1 or gpt-4.1-mini");
        }
        options.model = value;
        break;
      case "students":
        options.students = parsePositiveInteger("--students", value);
        break;
      case "chats-per-student":
        options.chatsPerStudent = parsePositiveInteger("--chats-per-student", value);
        break;
      case "turns":
        options.turnsPerChat = parsePositiveInteger("--turns", value);
        break;
      case "scenario":
        if (value !== "expected" && value !== "conservative") {
          throw new Error("--scenario must be expected or conservative");
        }
        options.scenario = value;
        break;
      default:
        throw new Error(`Unknown option: --${key}`);
    }

    index += 1;
  }

  return options;
}

export function buildBudgetAssumptions(options: BudgetCliOptions): ChatBudgetAssumptions {
  const base =
    options.scenario === "conservative"
      ? CONSERVATIVE_CHAT_BUDGET_ASSUMPTIONS
      : DEFAULT_CHAT_BUDGET_ASSUMPTIONS;

  return {
    ...base,
    turnsPerChat: options.turnsPerChat,
    chatsPerStudent: options.chatsPerStudent
  };
}

export function renderBudgetEstimate(options: BudgetCliOptions): string {
  const assumptions = buildBudgetAssumptions(options);
  const pricing = AZURE_OPENAI_GLOBAL_STANDARD_PRICING[options.model];
  const estimate = estimateCohortBudget({
    model: options.model,
    students: options.students,
    assumptions
  });

  return [
    "Azure OpenAI budget estimate for RMC patient simulator",
    `Model: ${options.model} (${pricing.deploymentClass})`,
    `Pricing verified: ${pricing.verifiedOn} from ${pricing.sourceUrl}`,
    `Rates: ${formatUsd(pricing.inputUsdPerMillionTokens)}/1M input tokens, ${formatUsd(
      pricing.outputUsdPerMillionTokens
    )}/1M output tokens`,
    `Scenario: ${options.scenario}`,
    `Assumptions: ${assumptions.turnsPerChat} turns/chat, ${assumptions.chatsPerStudent} chat(s)/student, ${options.students} student(s)`,
    `Estimated tokens/chat: ${estimate.inputTokens.toLocaleString()} input, ${estimate.outputTokens.toLocaleString()} output`,
    `Estimated cost/chat: ${formatUsd(estimate.totalCostUsd)} (${formatUsd(
      estimate.inputCostUsd
    )} input + ${formatUsd(estimate.outputCostUsd)} output)`,
    `Estimated cost/student: ${formatUsd(estimate.costPerStudentUsd)}`,
    `Estimated cohort total: ${formatUsd(estimate.totalCohortCostUsd)}`,
    "Note: Azure agreement discounts, region/deployment class, App Service, Storage, and Application Insights are outside this token estimate."
  ].join("\n");
}

function parsePositiveInteger(flag: string, value: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`${flag} must be a positive integer`);
  }
  return parsed;
}

async function main() {
  const options = parseBudgetArgs(process.argv.slice(2));
  console.log(renderBudgetEstimate(options));
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error: unknown) => {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
    process.exit(1);
  });
}

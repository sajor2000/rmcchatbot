export type AzureBudgetModel = "gpt-4.1" | "gpt-4.1-mini";

export type AzureModelPricing = {
  model: AzureBudgetModel;
  deploymentClass: "Global Standard";
  inputUsdPerMillionTokens: number;
  outputUsdPerMillionTokens: number;
  sourceUrl: string;
  verifiedOn: string;
};

export type ChatBudgetAssumptions = {
  turnsPerChat: number;
  basePromptTokensPerTurn: number;
  averageUserTokensPerTurn: number;
  averageAssistantTokensPerTurn: number;
  averagePriorTurnTokensAddedToHistory: number;
  chatsPerStudent: number;
};

export type ChatTokenEstimate = {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
};

export type ChatCostEstimate = ChatTokenEstimate & {
  model: AzureBudgetModel;
  inputCostUsd: number;
  outputCostUsd: number;
  totalCostUsd: number;
};

export type StudentBudgetEstimate = ChatCostEstimate & {
  chatsPerStudent: number;
  costPerStudentUsd: number;
};

export type CohortBudgetEstimate = StudentBudgetEstimate & {
  students: number;
  totalCohortCostUsd: number;
};

const PRICING_SOURCE_URL = "https://azure.microsoft.com/en-us/pricing/details/azure-openai/";

export const AZURE_OPENAI_GLOBAL_STANDARD_PRICING: Record<AzureBudgetModel, AzureModelPricing> = {
  "gpt-4.1": {
    model: "gpt-4.1",
    deploymentClass: "Global Standard",
    inputUsdPerMillionTokens: 2,
    outputUsdPerMillionTokens: 8,
    sourceUrl: PRICING_SOURCE_URL,
    verifiedOn: "2026-05-22"
  },
  "gpt-4.1-mini": {
    model: "gpt-4.1-mini",
    deploymentClass: "Global Standard",
    inputUsdPerMillionTokens: 0.4,
    outputUsdPerMillionTokens: 1.6,
    sourceUrl: PRICING_SOURCE_URL,
    verifiedOn: "2026-05-22"
  }
};

export const DEFAULT_CHAT_BUDGET_ASSUMPTIONS: ChatBudgetAssumptions = {
  turnsPerChat: 20,
  basePromptTokensPerTurn: 4000,
  averageUserTokensPerTurn: 35,
  averageAssistantTokensPerTurn: 175,
  averagePriorTurnTokensAddedToHistory: 210,
  chatsPerStudent: 1
};

export const CONSERVATIVE_CHAT_BUDGET_ASSUMPTIONS: ChatBudgetAssumptions = {
  turnsPerChat: 20,
  basePromptTokensPerTurn: 5000,
  averageUserTokensPerTurn: 50,
  averageAssistantTokensPerTurn: 500,
  averagePriorTurnTokensAddedToHistory: 550,
  chatsPerStudent: 1
};

export function estimateChatTokens(assumptions: ChatBudgetAssumptions): ChatTokenEstimate {
  assertPositiveInteger("turnsPerChat", assumptions.turnsPerChat);
  assertNonNegativeInteger("basePromptTokensPerTurn", assumptions.basePromptTokensPerTurn);
  assertNonNegativeInteger("averageUserTokensPerTurn", assumptions.averageUserTokensPerTurn);
  assertNonNegativeInteger("averageAssistantTokensPerTurn", assumptions.averageAssistantTokensPerTurn);
  assertNonNegativeInteger(
    "averagePriorTurnTokensAddedToHistory",
    assumptions.averagePriorTurnTokensAddedToHistory
  );

  const turnCount = assumptions.turnsPerChat;
  const promptTokens = assumptions.basePromptTokensPerTurn * turnCount;
  const userTokens = assumptions.averageUserTokensPerTurn * turnCount;
  const priorHistoryCopies = (turnCount * (turnCount - 1)) / 2;
  const historyTokens = assumptions.averagePriorTurnTokensAddedToHistory * priorHistoryCopies;
  const outputTokens = assumptions.averageAssistantTokensPerTurn * turnCount;
  const inputTokens = promptTokens + userTokens + historyTokens;

  return {
    inputTokens,
    outputTokens,
    totalTokens: inputTokens + outputTokens
  };
}

export function estimateChatCost(
  model: AzureBudgetModel,
  assumptions: ChatBudgetAssumptions = DEFAULT_CHAT_BUDGET_ASSUMPTIONS
): ChatCostEstimate {
  const pricing = AZURE_OPENAI_GLOBAL_STANDARD_PRICING[model];
  const tokens = estimateChatTokens(assumptions);
  const inputCostUsd = (tokens.inputTokens / 1_000_000) * pricing.inputUsdPerMillionTokens;
  const outputCostUsd = (tokens.outputTokens / 1_000_000) * pricing.outputUsdPerMillionTokens;

  return {
    model,
    ...tokens,
    inputCostUsd,
    outputCostUsd,
    totalCostUsd: inputCostUsd + outputCostUsd
  };
}

export function estimateStudentBudget(
  model: AzureBudgetModel,
  assumptions: ChatBudgetAssumptions = DEFAULT_CHAT_BUDGET_ASSUMPTIONS
): StudentBudgetEstimate {
  assertPositiveInteger("chatsPerStudent", assumptions.chatsPerStudent);
  const chatEstimate = estimateChatCost(model, assumptions);

  return {
    ...chatEstimate,
    chatsPerStudent: assumptions.chatsPerStudent,
    costPerStudentUsd: chatEstimate.totalCostUsd * assumptions.chatsPerStudent
  };
}

export function estimateCohortBudget(options: {
  model: AzureBudgetModel;
  students: number;
  assumptions?: ChatBudgetAssumptions;
}): CohortBudgetEstimate {
  assertPositiveInteger("students", options.students);
  const studentEstimate = estimateStudentBudget(
    options.model,
    options.assumptions ?? DEFAULT_CHAT_BUDGET_ASSUMPTIONS
  );

  return {
    ...studentEstimate,
    students: options.students,
    totalCohortCostUsd: studentEstimate.costPerStudentUsd * options.students
  };
}

export function formatUsd(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: value < 1 ? 4 : 2,
    maximumFractionDigits: value < 1 ? 4 : 2
  }).format(value);
}

function assertPositiveInteger(field: string, value: number): void {
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${field} must be a positive integer.`);
  }
}

function assertNonNegativeInteger(field: string, value: number): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${field} must be a non-negative integer.`);
  }
}

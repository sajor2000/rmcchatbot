import { describe, expect, it } from "vitest";

import {
  AZURE_OPENAI_GLOBAL_STANDARD_PRICING,
  CONSERVATIVE_CHAT_BUDGET_ASSUMPTIONS,
  DEFAULT_CHAT_BUDGET_ASSUMPTIONS,
  estimateChatCost,
  estimateChatTokens,
  estimateCohortBudget,
  estimateStudentBudget,
  formatUsd
} from "./azureBudget";

describe("Azure budget estimates", () => {
  it("tracks current Global Standard pricing for the approved RMC models", () => {
    expect(AZURE_OPENAI_GLOBAL_STANDARD_PRICING["gpt-4.1"]).toMatchObject({
      inputUsdPerMillionTokens: 2,
      outputUsdPerMillionTokens: 8,
      verifiedOn: "2026-05-22"
    });
    expect(AZURE_OPENAI_GLOBAL_STANDARD_PRICING["gpt-4.1-mini"]).toMatchObject({
      inputUsdPerMillionTokens: 0.4,
      outputUsdPerMillionTokens: 1.6,
      verifiedOn: "2026-05-22"
    });
  });

  it("accounts for repeated prompt and growing chat history across a full encounter", () => {
    expect(estimateChatTokens(DEFAULT_CHAT_BUDGET_ASSUMPTIONS)).toEqual({
      inputTokens: 120_600,
      outputTokens: 3_500,
      totalTokens: 124_100
    });
  });

  it("estimates per-chat and per-student costs for the primary GPT-4.1 deployment", () => {
    const perChat = estimateChatCost("gpt-4.1", DEFAULT_CHAT_BUDGET_ASSUMPTIONS);
    const perStudent = estimateStudentBudget("gpt-4.1", {
      ...DEFAULT_CHAT_BUDGET_ASSUMPTIONS,
      chatsPerStudent: 2
    });

    expect(perChat.inputCostUsd).toBeCloseTo(0.2412);
    expect(perChat.outputCostUsd).toBeCloseTo(0.028);
    expect(perChat.totalCostUsd).toBeCloseTo(0.2692);
    expect(perStudent.costPerStudentUsd).toBeCloseTo(0.5384);
  });

  it("keeps the conservative max-output case under one dollar per chat", () => {
    const estimate = estimateChatCost("gpt-4.1", CONSERVATIVE_CHAT_BUDGET_ASSUMPTIONS);

    expect(estimate.inputTokens).toBe(205_500);
    expect(estimate.outputTokens).toBe(10_000);
    expect(estimate.totalCostUsd).toBeCloseTo(0.491);
  });

  it("scales cohort budgets from the per-student estimate", () => {
    const estimate = estimateCohortBudget({
      model: "gpt-4.1",
      students: 120,
      assumptions: DEFAULT_CHAT_BUDGET_ASSUMPTIONS
    });

    expect(estimate.costPerStudentUsd).toBeCloseTo(0.2692);
    expect(estimate.totalCohortCostUsd).toBeCloseTo(32.304);
  });

  it("formats sub-dollar values with enough precision for planning", () => {
    expect(formatUsd(0.2692)).toBe("$0.2692");
    expect(formatUsd(32.304)).toBe("$32.30");
  });

  it("rejects invalid assumptions", () => {
    expect(() =>
      estimateChatTokens({
        ...DEFAULT_CHAT_BUDGET_ASSUMPTIONS,
        turnsPerChat: 0
      })
    ).toThrow("turnsPerChat must be a positive integer");
  });
});

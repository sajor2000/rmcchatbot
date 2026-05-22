import { describe, expect, it } from "vitest";

import {
  buildBudgetAssumptions,
  parseBudgetArgs,
  renderBudgetEstimate
} from "./estimate_azure_budget";

describe("Azure budget estimate CLI", () => {
  it("uses GPT-4.1 expected pilot defaults", () => {
    expect(parseBudgetArgs([])).toEqual({
      model: "gpt-4.1",
      students: 120,
      chatsPerStudent: 1,
      turnsPerChat: 20,
      scenario: "expected"
    });
  });

  it("parses model, cohort, turn, and scenario options", () => {
    const options = parseBudgetArgs([
      "--model",
      "gpt-4.1-mini",
      "--students",
      "180",
      "--chats-per-student",
      "3",
      "--turns",
      "12",
      "--scenario",
      "conservative"
    ]);

    expect(options).toEqual({
      model: "gpt-4.1-mini",
      students: 180,
      chatsPerStudent: 3,
      turnsPerChat: 12,
      scenario: "conservative"
    });
    expect(buildBudgetAssumptions(options)).toMatchObject({
      turnsPerChat: 12,
      chatsPerStudent: 3,
      averageAssistantTokensPerTurn: 500
    });
  });

  it("renders a per-chat, per-student, and cohort summary", () => {
    const output = renderBudgetEstimate({
      model: "gpt-4.1",
      students: 120,
      chatsPerStudent: 1,
      turnsPerChat: 20,
      scenario: "expected"
    });

    expect(output).toContain("Estimated cost/chat: $0.2692");
    expect(output).toContain("Estimated cost/student: $0.2692");
    expect(output).toContain("Estimated cohort total: $32.30");
    expect(output).toContain("Pricing verified: 2026-05-22");
  });

  it("rejects invalid arguments", () => {
    expect(() => parseBudgetArgs(["--model", "o3"])).toThrow("--model must be");
    expect(() => parseBudgetArgs(["--students", "0"])).toThrow("--students must be");
    expect(() => parseBudgetArgs(["extra"])).toThrow("Unexpected positional argument");
  });
});

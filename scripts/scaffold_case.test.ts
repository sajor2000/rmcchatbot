import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import ts from "typescript";
import { afterEach, describe, expect, it } from "vitest";
import { caseVariableName, parseScaffoldArgs, renderScaffoldCase, scaffoldCase } from "./scaffold_case";

const tempDirs: string[] = [];

describe("case scaffold script", () => {
  afterEach(async () => {
    await Promise.all(tempDirs.splice(0).map((dir) => rm(dir, { recursive: true, force: true })));
  });

  it("validates required CLI args", () => {
    expect(() => parseScaffoldArgs(["--id", "new-case"])).toThrow("Missing required argument --patient-name");
    expect(() =>
      parseScaffoldArgs([
        "--id",
        "new-case",
        "--patient-name",
        "Case Patient",
        "--title",
        "New Case",
        "--course",
        "RMD 565",
        "--setting",
        "Clinic",
        "--source-pdf",
        "source-pdfs/new-case.pdf"
      ])
    ).not.toThrow();
  });

  it("rejects duplicate case ids", async () => {
    const casesDir = await mkdtemp(join(tmpdir(), "rmc-scaffold-"));
    tempDirs.push(casesDir);

    await expect(
      scaffoldCase({
        id: "jane-kim-withdrawal",
        patientName: "New Patient",
        title: "New Case",
        course: "RMD 565",
        setting: "Clinic",
        sourcePdf: "source-pdfs/new-case.pdf",
        casesDir,
        existingCaseIds: ["jane-kim-withdrawal"]
      })
    ).rejects.toThrow("Case id already exists");
  });

  it("creates a valid TypeScript case scaffold without Jane Kim identifiers", async () => {
    const casesDir = await mkdtemp(join(tmpdir(), "rmc-scaffold-"));
    tempDirs.push(casesDir);
    const result = await scaffoldCase({
      id: "abdominal-pain",
      patientName: "Pat Lee",
      title: "Abdominal Pain in Clinic",
      course: "RMD 565",
      setting: "Primary care clinic",
      sourcePdf: "source-pdfs/abdominal-pain.pdf",
      casesDir,
      existingCaseIds: []
    });
    const content = await readFile(result.filePath, "utf-8");
    const transpiled = ts.transpileModule(content, {
      compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
      reportDiagnostics: true
    });

    expect(result.filePath).toBe(join(casesDir, "abdominal-painCase.ts"));
    expect(result.importLine).toBe('import { abdominalPainCase } from "@/content/cases/abdominal-painCase";');
    expect(result.registryEntry).toBe("  abdominalPainCase,");
    expect(content).toContain("TODO_CASE_SPECIFIC");
    expect(content).toContain("answerGroups");
    expect(content).not.toContain("Jane");
    expect(content).not.toContain("Kim");
    expect(transpiled.diagnostics ?? []).toEqual([]);
  });

  it("renders stable variable names from case ids", () => {
    expect(caseVariableName("substance-use-follow-up")).toBe("substanceUseFollowUpCase");
    expect(renderScaffoldCase({
      id: "substance-use-follow-up",
      patientName: "Case Patient",
      title: "Follow-up Visit",
      course: "RMD 565",
      setting: "Clinic",
      sourcePdf: "source-pdfs/follow-up.pdf"
    })).toContain("export const substanceUseFollowUpCase");
  });
});

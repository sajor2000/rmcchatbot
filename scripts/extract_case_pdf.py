#!/usr/bin/env python3
"""Convert a faculty case PDF to Markdown and JSON with Docling.

This is an ingestion helper only. Use the output to manually map clinical H&P,
objective results, artifacts, and faculty-only teaching material into
src/content/cases/*.ts.
"""

from __future__ import annotations

import argparse
import json
import re
from pathlib import Path

RESULT_SECTION_HEADINGS = [
    "Review of Systems",
    "Physical Exam",
    "Mental Status Exam",
    "Labs",
    "Laboratory",
    "Diagnostic workup",
    "Diagnostic Workup",
    "Imaging",
    "Electrocardiogram",
    "EKG",
    "ECG",
]

CASE_END_HEADINGS = [
    "Activity 1",
    "Activity 2",
    "Activity 3",
    "Take Home Points",
    "Session Assessment",
]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Extract a case PDF to Docling Markdown and JSON outputs."
    )
    parser.add_argument("pdf", type=Path, help="Path to the faculty case PDF.")
    parser.add_argument(
        "--out-dir",
        type=Path,
        default=Path("scratch/docling"),
        help="Directory for extracted Markdown and JSON. Default: scratch/docling",
    )
    parser.add_argument(
        "--device",
        default="cpu",
        choices=["cpu", "auto", "mps", "cuda"],
        help="Docling inference device. Default: cpu, which avoids Apple MPS dtype issues.",
    )
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    pdf_path = args.pdf.expanduser().resolve()
    out_dir = args.out_dir.expanduser().resolve()

    if not pdf_path.exists():
        raise SystemExit(f"PDF not found: {pdf_path}")

    try:
        from docling.datamodel.base_models import InputFormat
        from docling.datamodel.pipeline_options import (
            AcceleratorOptions,
            PdfPipelineOptions,
        )
        from docling.document_converter import DocumentConverter
        from docling.document_converter import PdfFormatOption
    except ImportError as exc:
        raise SystemExit(
            "Docling is not installed. Run: "
            "python3 -m pip install -r requirements-ingest.txt"
        ) from exc

    out_dir.mkdir(parents=True, exist_ok=True)

    pipeline_options = PdfPipelineOptions()
    pipeline_options.accelerator_options = AcceleratorOptions(device=args.device)

    converter = DocumentConverter(
        format_options={
            InputFormat.PDF: PdfFormatOption(pipeline_options=pipeline_options)
        }
    )
    result = converter.convert(pdf_path)
    stem = pdf_path.stem

    markdown = result.document.export_to_markdown()
    doc_dict = result.document.export_to_dict()

    markdown_path = out_dir / f"{stem}.md"
    json_path = out_dir / f"{stem}.json"
    worksheet_path = out_dir / f"{stem}.case-extraction.md"

    markdown_path.write_text(markdown, encoding="utf-8")
    json_path.write_text(
        json.dumps(doc_dict, indent=2),
        encoding="utf-8",
    )
    worksheet_path.write_text(build_case_extraction_worksheet(stem, markdown), encoding="utf-8")

    print(f"Markdown: {markdown_path}")
    print(f"JSON: {json_path}")
    print(f"Case extraction worksheet: {worksheet_path}")
    print("Next: extract clinical H&P, results, and faculty-only teaching points into a case file.")
    return 0


def build_case_extraction_worksheet(stem: str, markdown: str) -> str:
    case_excerpt = extract_case_excerpt(markdown)
    result_sections = extract_sections_by_heading(markdown, RESULT_SECTION_HEADINGS)
    faculty_questions = extract_question_blocks(markdown)

    return "\n".join(
        [
            f"# Case Extraction Worksheet: {stem}",
            "",
            "Use this worksheet as the human-review bridge between Docling output and `src/content/cases/*.ts`.",
            "",
            "## Convert Into Patient Facts",
            "",
            "- Chief concern:",
            "- History of present illness:",
            "- Positives:",
            "- Negatives:",
            "- Past medical/surgical history:",
            "- Medications:",
            "- Allergies:",
            "- Family history:",
            "- Social history:",
            "- Sensitive history:",
            "",
            "## Convert Into Patient Behavior",
            "",
            "- Opening statement:",
            "- Disclosure style:",
            "- Sensitive-topic style:",
            "- Physical-exam consent style:",
            "- Uncertainty style for chart-only data:",
            "",
            "## Convert Into Clinical Artifacts",
            "",
            "- Labs/toxicology:",
            "- Vital signs and physical exam:",
            "- Mental status exam:",
            "- Imaging/electrocardiogram/procedure results:",
            "- Other chart-only data that the patient should not interpret:",
            "",
            "## Anticipated Student Q&A To Fill",
            "",
            "- What brought you in today?",
            "- When did this start?",
            "- What symptoms are you having?",
            "- What makes symptoms better or worse?",
            "- What medications are you taking?",
            "- Do you have allergies?",
            "- What medical problems or surgeries have you had?",
            "- What substances, alcohol, tobacco, or prescription medications do you use?",
            "- Have you tried to cut down or stop?",
            "- Have you had withdrawal, overdose, or unsafe episodes?",
            "- How has this affected work, school, family, or safety?",
            "- Do you have thoughts of self-harm or suicide?",
            "- Are you hearing or seeing things others do not?",
            "- What is your family history?",
            "",
            "## Semantic Answer Groups To Fill",
            "",
            "- Substance use aliases and same-facts answer:",
            "- Sexual history aliases and same-facts answer:",
            "- Home safety/IPV aliases and same-facts answer:",
            "- Suicide/self-harm aliases and same-facts answer:",
            "- Medications/allergies aliases and same-facts answer:",
            "- Required response terms:",
            "- Forbidden invented terms:",
            "",
            "## Source Case Excerpt",
            "",
            case_excerpt or "_No case-presentation section was detected automatically._",
            "",
            "## Detected Clinical Result Sections",
            "",
            result_sections or "_No result-like sections were detected automatically._",
            "",
            "## Faculty Q&A Or Discussion Prompts Detected",
            "",
            faculty_questions or "_No faculty Q&A blocks were detected automatically._",
            "",
            "## Review Rules",
            "",
            "- Put patient-known answers in `patientFacts`.",
            "- Put patient realism controls in `patientBehavior`.",
            "- Put chart/lab/exam data in `artifacts`.",
            "- Put diagnosis, teaching points, forbidden response terms, validation prompts, and faculty-only reasoning in `hidden`.",
            "- Do not invent answers for high-yield questions that the source document does not answer.",
            "- Put semantic paraphrases that should receive the same facts in `patientFacts.answerGroups`.",
            "- Keep the patient persona in first person and do not reveal objective results through patient dialogue.",
            "",
        ]
    )


def extract_case_excerpt(markdown: str) -> str:
    start_match = re.search(r"^##\s+Case Presentation\b.*$", markdown, flags=re.MULTILINE | re.IGNORECASE)
    if not start_match:
        return ""

    end_index = len(markdown)
    for heading in CASE_END_HEADINGS:
        match = re.search(rf"^##\s+{re.escape(heading)}\b.*$", markdown[start_match.end():], flags=re.MULTILINE | re.IGNORECASE)
        if match:
            end_index = min(end_index, start_match.end() + match.start())

    return markdown[start_match.start():end_index].strip()


def extract_sections_by_heading(markdown: str, headings: list[str]) -> str:
    sections: list[str] = []
    for heading in headings:
        pattern = rf"^##\s+{re.escape(heading)}\b.*$"
        for match in re.finditer(pattern, markdown, flags=re.MULTILINE | re.IGNORECASE):
            sections.append(extract_heading_block(markdown, match.start()))

    return "\n\n---\n\n".join(dedupe_preserve_order(sections))


def extract_heading_block(markdown: str, start: int) -> str:
    next_match = re.search(r"^##\s+", markdown[start + 1 :], flags=re.MULTILINE)
    end = len(markdown) if not next_match else start + 1 + next_match.start()
    return markdown[start:end].strip()


def extract_question_blocks(markdown: str) -> str:
    blocks: list[str] = []
    pattern = re.compile(r"(^\d+\.\s.*?(?:\?|Answer:).*?)(?=^\d+\.\s|\Z)", re.MULTILINE | re.DOTALL)
    for match in pattern.finditer(markdown):
        block = match.group(1).strip()
        if "?" in block or "Answer:" in block:
            blocks.append(block)

    return "\n\n---\n\n".join(dedupe_preserve_order(blocks[:20]))


def dedupe_preserve_order(items: list[str]) -> list[str]:
    seen: set[str] = set()
    unique: list[str] = []
    for item in items:
        key = item[:300]
        if key not in seen:
            seen.add(key)
            unique.append(item)
    return unique


if __name__ == "__main__":
    raise SystemExit(main())

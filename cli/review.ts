#!/usr/bin/env tsx
import { readFileSync } from "node:fs";
import { reviewPrompt } from "../lib/prompt/review";
import { reportToMarkdown } from "../lib/prompt/markdown";
import type { ToolInput } from "../lib/prompt/types";

function usage(): never {
  console.error(`Usage:
  npm run review -- <prompt.txt> [--tools tools.txt] [--json] [--min-grade=B]

Exit code 1 when overall grade is below --min-grade (default: none).`);
  process.exit(2);
}

function gradeRank(g: string): number {
  const order = ["F", "D", "C-", "C", "C+", "B-", "B", "B+", "A-", "A", "A+"];
  return order.indexOf(g);
}

function parseToolsFile(path: string): ToolInput[] {
  return readFileSync(path, "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/\s+[—\-–:]\s+/);
      if (parts.length >= 2) {
        return { name: parts[0].trim(), description: parts.slice(1).join(" - ").trim() };
      }
      return { name: line };
    });
}

async function main() {
  const args = process.argv.slice(2);
  if (!args.length || args.includes("-h") || args.includes("--help")) usage();

  let file: string | null = null;
  let toolsFile: string | null = null;
  let asJson = false;
  let minGrade: string | null = null;

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--json") asJson = true;
    else if (a === "--tools") toolsFile = args[++i] ?? null;
    else if (a.startsWith("--min-grade=")) minGrade = a.split("=")[1] ?? null;
    else if (a.startsWith("-")) usage();
    else file = a;
  }

  if (!file) usage();

  const prompt = readFileSync(file!, "utf8");
  const tools = toolsFile ? parseToolsFile(toolsFile) : [];
  const report = reviewPrompt({ prompt, tools, label: file! });

  if (asJson) {
    console.log(JSON.stringify(report, null, 2));
  } else {
    console.log(reportToMarkdown(report));
  }

  if (minGrade) {
    if (gradeRank(report.overall.grade) < gradeRank(minGrade)) {
      console.error(`Grade ${report.overall.grade} is below minimum ${minGrade}`);
      process.exit(1);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

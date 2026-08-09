import { findAmbiguities } from "./ambiguity";
import { runChecks } from "./checks";
import { buildFailureModes } from "./failureModes";
import { buildRewrites } from "./rewrite";
import {
  buildCategoryScores,
  buildNextSteps,
  buildRecommendations,
  gradeFor,
  injectionLevel,
  overallScore,
} from "./scoring";
import type { ReviewInput, ReviewReport } from "./types";

function newId(): string {
  return `pr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

export function reviewPrompt(input: ReviewInput): ReviewReport {
  const prompt = (input.prompt ?? "").replace(/\r\n/g, "\n");
  const tools = input.tools ?? [];
  const label = input.label?.trim() || "system prompt";

  const checks = runChecks({ prompt, tools, label });
  const categories = buildCategoryScores(checks);
  const overall = overallScore(categories);
  const ambiguityHits = findAmbiguities(prompt);
  const injectionCat = categories.find((c) => c.category === "injection");
  const clarityCat = categories.find((c) => c.category === "clarity");
  const injectionChecks = checks.filter((c) => c.category === "injection" && c.status !== "skip");
  const defensesPresent = injectionChecks.filter((c) => c.status === "pass").length;
  const failureModes = buildFailureModes({ prompt, tools, label }, checks);
  const rewrites = buildRewrites(checks);
  const recommendations = buildRecommendations(checks);

  const words = prompt.trim() ? prompt.trim().split(/\s+/).length : 0;

  return {
    id: newId(),
    createdAt: new Date().toISOString(),
    label,
    promptChars: prompt.length,
    promptWords: words,
    toolCount: tools.length,
    categories,
    checks,
    ambiguity: {
      count: ambiguityHits.length,
      hits: ambiguityHits,
    },
    injection: {
      score: injectionCat?.score ?? 0,
      level: injectionLevel(injectionCat?.score ?? 0),
      defensesPresent,
      defensesTotal: injectionChecks.length,
    },
    failureModes,
    rewrites,
    overall: { score: overall, grade: gradeFor(overall) },
    clarity: { score: clarityCat?.score ?? 0 },
    recommendations,
    nextSteps: buildNextSteps(overall, checks),
    rewriteReady: rewrites.length > 0,
  };
}

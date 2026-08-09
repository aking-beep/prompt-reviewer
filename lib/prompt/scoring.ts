import type {
  CategoryScore,
  CheckCategory,
  CheckResult,
  Grade,
  InjectionLevel,
  Recommendation,
} from "./types";
import { remediationFor } from "./remediation";

const CATEGORY_META: Record<CheckCategory, { label: string; weight: number }> = {
  clarity: { label: "Clarity", weight: 20 },
  structure: { label: "Structure", weight: 18 },
  ambiguity: { label: "Ambiguity control", weight: 16 },
  injection: { label: "Injection surface", weight: 26 },
  failure: { label: "Failure modes", weight: 12 },
  tools: { label: "Tool policy", weight: 8 },
};

export function scoreCategory(category: CheckCategory, checks: CheckResult[]): CategoryScore {
  const relevant = checks.filter((c) => c.category === category && c.status !== "skip");
  const totalWeight = relevant.reduce((a, c) => a + c.weight, 0);
  const score =
    totalWeight === 0
      ? 100
      : Math.round((relevant.reduce((a, c) => a + c.score * c.weight, 0) / totalWeight) * 100);
  return {
    category,
    label: CATEGORY_META[category].label,
    score,
    weightPct: CATEGORY_META[category].weight,
    checks: checks.filter((c) => c.category === category),
  };
}

export function buildCategoryScores(checks: CheckResult[]): CategoryScore[] {
  return (Object.keys(CATEGORY_META) as CheckCategory[]).map((c) => scoreCategory(c, checks));
}

export function gradeFor(score: number): Grade {
  if (score >= 97) return "A+";
  if (score >= 93) return "A";
  if (score >= 90) return "A-";
  if (score >= 87) return "B+";
  if (score >= 83) return "B";
  if (score >= 80) return "B-";
  if (score >= 77) return "C+";
  if (score >= 73) return "C";
  if (score >= 70) return "C-";
  if (score >= 60) return "D";
  return "F";
}

export function overallScore(categories: CategoryScore[]): number {
  const active = categories.filter((c) => c.checks.some((k) => k.status !== "skip"));
  const totalW = active.reduce((a, c) => a + c.weightPct, 0) || 1;
  return Math.round(active.reduce((a, c) => a + c.score * c.weightPct, 0) / totalW);
}

export function injectionLevel(score: number): InjectionLevel {
  if (score >= 85) return "low";
  if (score >= 70) return "moderate";
  if (score >= 50) return "elevated";
  return "critical";
}

export function buildRecommendations(checks: CheckResult[]): Recommendation[] {
  const priorityForCategory: Record<CheckCategory, Recommendation["priority"]> = {
    injection: "high",
    failure: "high",
    ambiguity: "medium",
    clarity: "medium",
    structure: "medium",
    tools: "high",
  };

  return checks
    .filter((c) => c.status === "fail" || c.status === "warn")
    .sort((a, b) => {
      const rank = { fail: 0, warn: 1, pass: 2, skip: 3 };
      return rank[a.status] - rank[b.status];
    })
    .map((c) => {
      const rem = remediationFor(c.id, c.detail, c.fix);
      return {
        priority: c.status === "fail" ? "high" : priorityForCategory[c.category],
        title: c.label,
        detail: rem.fix,
        issue: rem.issue,
        why: rem.why,
        fix: rem.fix,
        reference: rem.reference,
        checkId: c.id,
      } satisfies Recommendation;
    })
    .sort((a, b) => {
      const p = { high: 0, medium: 1, low: 2 };
      return p[a.priority] - p[b.priority];
    });
}

export function buildNextSteps(overall: number, checks: CheckResult[]): string[] {
  const steps: string[] = [];
  const failing = checks.filter((c) => c.status === "fail");
  const warning = checks.filter((c) => c.status === "warn");

  if (failing.length) {
    steps.push(
      `Fix ${failing.length} failing check${failing.length > 1 ? "s" : ""} before shipping this prompt (start with high-priority recommendations).`,
    );
  }
  if (checks.find((c) => c.id === "injection.secrets" && c.status === "fail")) {
    steps.push("Strip secrets from the prompt immediately — move them into application code.");
  }
  if (checks.find((c) => c.id === "injection.priority" && c.status !== "pass")) {
    steps.push("Add an instruction-priority / non-override clause at the top of the system prompt.");
  }
  if (checks.find((c) => c.id === "structure.output" && c.status !== "pass")) {
    steps.push("Constrain output to a schema or exclusive format so hijacks are easier to catch.");
  }
  if (checks.find((c) => c.id === "failure.refusal" && c.status !== "pass")) {
    steps.push("Write an explicit out-of-scope / refusal path with the exact response shape.");
  }
  if (warning.length && !failing.length) {
    steps.push(`Clear ${warning.length} warning${warning.length > 1 ? "s" : ""} to move up a grade tier.`);
  }
  if (overall >= 90) {
    steps.push("Paste the Markdown report into the PR, then red-team with a live attack battery before production.");
  } else {
    steps.push("Apply the suggested rewrites, re-run this review, then validate with adversarial tests against your live model.");
  }
  return steps;
}

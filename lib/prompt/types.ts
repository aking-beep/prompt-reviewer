// Shared types for the Prompt Reviewer.

export type CheckStatus = "pass" | "warn" | "fail" | "skip";

export type CheckCategory =
  | "clarity"
  | "structure"
  | "ambiguity"
  | "injection"
  | "failure"
  | "tools";

export interface CheckResult {
  /** Stable id, e.g. "clarity.role" */
  id: string;
  category: CheckCategory;
  label: string;
  status: CheckStatus;
  detail: string;
  /** 0..1 weight inside its category. */
  weight: number;
  /** 0..1 score (pass=1, warn=0.5, fail=0, skip excluded). */
  score: number;
  fix?: string;
  evidence?: unknown;
}

export interface CategoryScore {
  category: CheckCategory;
  label: string;
  score: number; // 0..100
  weightPct: number;
  checks: CheckResult[];
}

export type Grade = "A+" | "A" | "A-" | "B+" | "B" | "B-" | "C+" | "C" | "C-" | "D" | "F";

export type InjectionLevel = "low" | "moderate" | "elevated" | "critical";

export interface AmbiguityHit {
  phrase: string;
  reason: string;
  suggestion: string;
  index: number;
}

export interface FailureMode {
  id: string;
  title: string;
  risk: "high" | "medium" | "low";
  why: string;
  mitigation: string;
  coveredInPrompt: boolean;
}

export interface Recommendation {
  priority: "high" | "medium" | "low";
  title: string;
  detail: string;
  issue: string;
  why: string;
  fix: string;
  reference?: string;
  checkId?: string;
}

export interface RewriteSuggestion {
  section: string;
  before?: string;
  after: string;
  rationale: string;
}

export interface ToolInput {
  name: string;
  description?: string;
}

export interface ReviewInput {
  prompt: string;
  tools?: ToolInput[];
  label?: string;
}

export interface ReviewReport {
  id: string;
  createdAt: string;
  label: string;
  promptChars: number;
  promptWords: number;
  toolCount: number;
  categories: CategoryScore[];
  checks: CheckResult[];
  ambiguity: {
    count: number;
    hits: AmbiguityHit[];
  };
  injection: {
    score: number;
    level: InjectionLevel;
    defensesPresent: number;
    defensesTotal: number;
  };
  failureModes: FailureMode[];
  rewrites: RewriteSuggestion[];
  overall: { score: number; grade: Grade };
  clarity: { score: number };
  recommendations: Recommendation[];
  nextSteps: string[];
  rewriteReady: boolean;
}

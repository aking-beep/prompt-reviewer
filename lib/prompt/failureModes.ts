import type { CheckResult, FailureMode, ReviewInput } from "./types";

const CATALOG: Omit<FailureMode, "coveredInPrompt">[] = [
  {
    id: "fm.override",
    title: "Instruction override / role hijack",
    risk: "high",
    why: "Attacker replaces the configured persona or cancels system rules mid-conversation.",
    mitigation:
      "State non-override priority; refuse roleplay that changes the constitution; validate outputs against the original role.",
  },
  {
    id: "fm.leak",
    title: "System-prompt extraction",
    risk: "high",
    why: "Attacker coaxes a verbatim or paraphrased dump of instructions, tools, and embedded secrets.",
    mitigation:
      "Add an anti-disclosure rule; keep secrets out of the prompt; detect leak patterns in outputs.",
  },
  {
    id: "fm.indirect",
    title: "Indirect injection via retrieved content",
    risk: "high",
    why: "Malicious instructions arrive in docs, email, web pages, or tool output the user did not author.",
    mitigation:
      "Delimiter + 'treat as data' framing; provenance labels; least-privilege tools; human gate for side effects.",
  },
  {
    id: "fm.tool_abuse",
    title: "Tool / function abuse",
    risk: "high",
    why: "Model calls a tool with attacker-chosen arguments after a successful injection.",
    mitigation:
      "Scope tool descriptions; validate arguments in application code; confirm destructive actions out-of-band.",
  },
  {
    id: "fm.schema_hijack",
    title: "Structured-output hijack",
    risk: "medium",
    why: "Model escapes the expected JSON/XML/schema and smuggles instructions or code.",
    mitigation:
      "Constrain output format; parse with a strict schema; never execute model text as code.",
  },
  {
    id: "fm.ambiguity",
    title: "Ambiguous success criteria",
    risk: "medium",
    why: "Weasel words let the model pick a convenient interpretation — or an attacker-shaped one.",
    mitigation:
      "Replace hedges with measurable rules; add examples; define refusal when criteria cannot be met.",
  },
  {
    id: "fm.missing_input",
    title: "Missing / malformed inputs",
    risk: "medium",
    why: "Without a fallback, the model invents fields or proceeds on incomplete data.",
    mitigation:
      "Require clarifying questions for missing required fields; never invent identifiers or amounts.",
  },
  {
    id: "fm.scope_creep",
    title: "Out-of-scope helpfulness",
    risk: "medium",
    why: "Model answers outside the product contract because refusal was never specified.",
    mitigation:
      "Name the domain, list out-of-scope classes, and prescribe a one-sentence refusal.",
  },
  {
    id: "fm.encoding",
    title: "Encoded / obfuscated instructions",
    risk: "low",
    why: "Base64, reversed text, or Unicode lookalikes bypass keyword filters the prompt relies on.",
    mitigation:
      "Defense in depth outside the prompt (output validation, tool policy). Do not rely on lexical filters alone.",
  },
];

function covered(id: string, checks: CheckResult[], input: ReviewInput): boolean {
  const pass = (checkId: string) => checks.find((c) => c.id === checkId)?.status === "pass";
  switch (id) {
    case "fm.override":
      return pass("injection.priority") && pass("injection.trust_boundary");
    case "fm.leak":
      return pass("injection.no_prompt_leak") && pass("injection.secrets");
    case "fm.indirect":
      return pass("injection.untrusted_framing") || pass("structure.delimiters");
    case "fm.tool_abuse":
      return (input.tools?.length ?? 0) === 0
        ? true
        : pass("tools.scoped") && (pass("failure.human_gate") || pass("tools.destructive_gate"));
    case "fm.schema_hijack":
      return pass("structure.output");
    case "fm.ambiguity":
      return pass("ambiguity.phrases") && pass("clarity.objective");
    case "fm.missing_input":
      return pass("failure.fallback");
    case "fm.scope_creep":
      return pass("failure.refusal");
    case "fm.encoding":
      return pass("injection.priority") && pass("structure.output");
    default:
      return false;
  }
}

export function buildFailureModes(input: ReviewInput, checks: CheckResult[]): FailureMode[] {
  return CATALOG.map((fm) => ({
    ...fm,
    coveredInPrompt: covered(fm.id, checks, input),
  }));
}

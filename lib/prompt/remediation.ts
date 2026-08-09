const DEFAULT_REFS: Record<string, string> = {
  clarity:
    "https://developers.openai.com/cookbook/examples/gpt4-1_prompting_guide",
  structure:
    "https://developers.openai.com/cookbook/examples/prompt_migration_guide",
  injection:
    "https://github.com/GenAI-Security-Project/GenAI-LLM-Top10/blob/main/2026/final/LLM01_PromptInjection.md",
  failure: "https://trainmyai.net/how-to-evaluate-prompt-quality-metrics-test-cases-and-review-workflow",
  tools: "https://www.codereviewlab.com/learning/prompt-injection",
};

const WHY: Record<string, string> = {
  "clarity.role":
    "Without a role, the model improvises a persona — and attackers will invent a more convenient one.",
  "clarity.objective":
    "An unmeasurable goal cannot be graded, tested, or refused against.",
  "clarity.imperatives":
    "Soft language is treated as optional; production behavior needs hard requirements.",
  "clarity.length":
    "Too short means missing constraints; too long buries the rules that matter.",
  "structure.sections":
    "Sectioned prompts (Role → Instructions → Output → Examples → Context) are how frontier models are steered reliably.",
  "structure.output":
    "Constrained outputs shrink the blast radius of injection and make validation possible in application code.",
  "structure.delimiters":
    "Delimiters reduce instruction/data confusion — the root cause of prompt injection.",
  "structure.examples":
    "Examples beat adjectives. They show the contract instead of describing it.",
  "ambiguity.phrases":
    "Weasel words create competing interpretations; attackers pick the helpful one.",
  "ambiguity.conflicts":
    "Unresolved conflicts are a lever: frame the request onto the side that benefits the attacker.",
  "ambiguity.multipersona":
    "Multiple personas are multiple constitutions — easy to switch into the weakest one.",
  "injection.priority":
    "OWASP LLM01 starts with override. If priority is unnamed, later text wins by default.",
  "injection.trust_boundary":
    "The model needs an explicit statement of what is authoritative vs untrusted data.",
  "injection.untrusted_framing":
    "Indirect injection (RAG / email / docs) is the high-damage path for agents.",
  "injection.no_prompt_leak":
    "Leaked prompts expose guardrails, tooling, and sometimes secrets — then get reverse-engineered.",
  "injection.secrets":
    "Anything in the prompt is eventually readable. The model is not a vault.",
  "injection.length_bounds":
    "Unbounded inputs enable attention-dilution and length/repetition attacks.",
  "failure.refusal":
    "Without a refusal path, 'be helpful' becomes the only available policy under pressure.",
  "failure.fallback":
    "Missing inputs and low confidence need a stop condition — otherwise the model invents.",
  "failure.human_gate":
    "High-impact tool calls need a human confirmation surface the model cannot fabricate.",
  "tools.described":
    "Thin tool descriptions are abusable; argument constraints live in the description.",
  "tools.scoped":
    "Broad tools turn a successful injection into real-world harm.",
  "tools.prompt_alignment":
    "Tool policy belongs in the prompt, not only in the API schema.",
  "tools.destructive_gate":
    "Destructive tools without a gate are one successful injection away from irreversible action.",
};

export function remediationFor(
  id: string,
  detail: string,
  fix?: string,
): { issue: string; why: string; fix: string; reference?: string } {
  const prefix = id.split(".")[0] ?? "clarity";
  return {
    issue: detail,
    why: WHY[id] ?? "This gap weakens the prompt contract and makes behavior harder to test.",
    fix:
      fix ??
      "Tighten the wording into an explicit rule with a measurable success / failure condition.",
    reference: DEFAULT_REFS[prefix],
  };
}

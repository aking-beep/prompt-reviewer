import Link from "next/link";

export default function DocsPage() {
  return (
    <main className="min-h-screen">
      <div className="mx-auto max-w-3xl px-4 py-10 space-y-8">
        <Link href="/" className="text-sm text-sub hover:text-ink">
          ← Prompt Reviewer
        </Link>
        <h1 className="text-3xl font-bold">Docs</h1>
        <section className="card p-5 space-y-3 text-sm leading-relaxed text-sub">
          <h2 className="text-ink font-semibold text-base">What this reviews</h2>
          <p>
            Prompt Reviewer is a <strong className="text-ink">static</strong> auditor for system prompts (and
            optional tool lists). It does not call an LLM. It scores structure and defensive intent the same way a
            careful human review would: clarity, ambiguity, injection surface, failure modes, and tool policy.
          </p>
          <p>
            A high score means the prompt <em>states</em> the right rules. It does not prove the model will always
            obey them. Pair this with a live attack battery before production.
          </p>
        </section>
        <section className="card p-5 space-y-3 text-sm leading-relaxed text-sub">
          <h2 className="text-ink font-semibold text-base">How scoring works</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Checks return pass / warn / fail (skip when not applicable).</li>
            <li>pass = 1, warn = 0.5, fail = 0 inside a weighted category average.</li>
            <li>
              Category weights: Injection 26%, Clarity 20%, Structure 18%, Ambiguity 16%, Failure modes 12%, Tools
              8%.
            </li>
            <li>Overall grade uses the same letter bands as the MCP Conformance Scanner (A+ … F).</li>
          </ul>
        </section>
        <section className="card p-5 space-y-3 text-sm leading-relaxed text-sub">
          <h2 className="text-ink font-semibold text-base">CLI</h2>
          <pre className="rounded-xl bg-bg border border-line p-3 text-xs font-mono text-ink overflow-x-auto">{`npm run review -- prompt.txt --tools tools.txt
npm run review -- prompt.txt --json --min-grade=B`}</pre>
        </section>
        <section className="card p-5 space-y-3 text-sm leading-relaxed text-sub">
          <h2 className="text-ink font-semibold text-base">API</h2>
          <pre className="rounded-xl bg-bg border border-line p-3 text-xs font-mono text-ink overflow-x-auto">{`POST /api/review
{ "prompt": "...", "label": "optional", "tools": [{ "name": "...", "description": "..." }] }`}</pre>
        </section>
      </div>
    </main>
  );
}

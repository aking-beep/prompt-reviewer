"use client";

import { useState } from "react";
import Link from "next/link";
import { ReviewForm, parseToolsText } from "@/components/ReviewForm";
import { Report } from "@/components/Report";
import type { ReviewReport } from "@/lib/prompt/types";
import {
  CURRENT_CHECKS,
  GITHUB_ISSUES,
  GITHUB_REPO,
  REVIEWER_UPDATED,
  REVIEWER_VERSION_LABEL,
} from "@/lib/version";

export default function Home() {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ReviewReport | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function runReview(values: { prompt: string; toolsText: string; label: string }) {
    setLoading(true);
    setError(null);
    setReport(null);
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          prompt: values.prompt,
          label: values.label,
          tools: parseToolsText(values.toolsText),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Review failed");
      setReport(data.report as ReviewReport);
      requestAnimationFrame(() => {
        document.getElementById("report")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Review failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen">
      <header className="border-b border-line/80 backdrop-blur sticky top-0 z-20 bg-bg/80">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between gap-3">
          <button
            type="button"
            className="text-left"
            onClick={() => {
              setReport(null);
              setError(null);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <div className="text-sm font-semibold tracking-tight">ARC Labs · Prompt Reviewer</div>
            <div className="text-[11px] text-sub">
              {REVIEWER_VERSION_LABEL} · updated {REVIEWER_UPDATED}
            </div>
          </button>
          <div className="flex items-center gap-2">
            <Link href="/docs" className="btn-ghost text-xs py-2">
              Docs
            </Link>
            <Link href="/roadmap" className="btn-ghost text-xs py-2">
              Roadmap
            </Link>
            <a href={GITHUB_REPO} target="_blank" rel="noreferrer" className="btn-ghost text-xs py-2">
              GitHub
            </a>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-10 space-y-8">
        {!report && (
          <>
            <section className="space-y-4 animate-fade-up">
              <div className="pill w-fit border-brand/40 text-brand bg-brand/10">Free · Open source · Static review</div>
              <h1 className="text-3xl sm:text-4xl font-bold tracking-tight max-w-2xl">
                A second set of eyes on your system prompts.
              </h1>
              <p className="text-sub max-w-2xl leading-relaxed">
                Paste a prompt and get structured feedback on clarity, injection surface, ambiguity, and failure
                modes — the review a senior engineer would give, minus the wait. Scores are heuristic and
                reproducible: no model call, nothing logged.
              </p>
              <ul className="grid sm:grid-cols-2 gap-2 text-sm text-sub">
                {CURRENT_CHECKS.map((c) => (
                  <li key={c} className="flex gap-2">
                    <span className="text-good">✓</span>
                    <span>{c}</span>
                  </li>
                ))}
              </ul>
            </section>

            <ReviewForm loading={loading} onSubmit={runReview} />
          </>
        )}

        {loading && (
          <div className="card p-5 overflow-hidden relative">
            <div className="text-sm font-medium">Scoring clarity, ambiguity, and injection surface…</div>
            <div className="mt-3 h-1 rounded-full bg-panel2 overflow-hidden">
              <div className="h-full w-1/3 bg-brand animate-sweep" />
            </div>
          </div>
        )}

        {error && (
          <div className="card p-4 border-bad/40 text-sm text-bad">{error}</div>
        )}

        {report && (
          <div id="report" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  setReport(null);
                  setError(null);
                }}
              >
                ← Review another
              </button>
              <a href={GITHUB_ISSUES} className="text-xs text-sub hover:text-ink" target="_blank" rel="noreferrer">
                Found a bad score? Open an issue
              </a>
            </div>
            <Report report={report} />
          </div>
        )}

        <footer className="pt-8 pb-16 text-xs text-sub border-t border-line">
          <p>
            ARC Labs builds free operator tools. Sister project:{" "}
            <a
              className="text-brand hover:underline"
              href="https://github.com/aking-beep/mcp-conformance-scanner"
              target="_blank"
              rel="noreferrer"
            >
              MCP Conformance Scanner
            </a>
            . Static review catches structural gaps — always follow with live adversarial tests before production.
          </p>
        </footer>
      </div>
    </main>
  );
}

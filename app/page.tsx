"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { AccessGate, loadStoredAccess, type AccessProfile } from "@/components/AccessGate";
import { ReviewForm, parseToolsText, type ReviewFormValues } from "@/components/ReviewForm";
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
  const [access, setAccess] = useState<AccessProfile | null>(null);
  const [gateReady, setGateReady] = useState(false);
  const [gateRequired, setGateRequired] = useState(true);
  const [showGate, setShowGate] = useState(false);
  const [pending, setPending] = useState<ReviewFormValues | null>(null);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ReviewReport | null>(null);
  const [error, setError] = useState<string | null>(null);
  const accessRef = useRef<AccessProfile | null>(null);

  useEffect(() => {
    accessRef.current = access;
  }, [access]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const stored = loadStoredAccess();
      try {
        const res = await fetch("/api/access", {
          headers: stored?.token ? { authorization: `Bearer ${stored.token}` } : undefined,
        });
        const data = await res.json();
        if (cancelled) return;
        setGateRequired(!!data.required);
        if (!data.required) {
          setAccess(stored ?? { token: "", email: "", firstName: "" });
        } else if (data.unlocked && stored) {
          setAccess(stored);
        } else if (data.unlocked) {
          setAccess({ token: "", email: data.email || "", firstName: "" });
        }
      } catch {
        if (!cancelled && stored) setAccess(stored);
      } finally {
        if (!cancelled) setGateReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function runReview(values: ReviewFormValues, profile: AccessProfile | null) {
    setLoading(true);
    setError(null);
    setReport(null);
    setShowGate(false);
    try {
      const res = await fetch("/api/review", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          ...(profile?.token ? { authorization: `Bearer ${profile.token}` } : {}),
        },
        body: JSON.stringify({
          prompt: values.prompt,
          label: values.label,
          tools: parseToolsText(values.toolsText),
        }),
      });
      const data = await res.json();
      if (res.status === 401 && data.code === "access_required") {
        setAccess(null);
        setPending(values);
        setShowGate(true);
        setError(null);
        return;
      }
      if (!res.ok) throw new Error(data.error || "Review failed");
      setPending(null);
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

  function onSubmit(values: ReviewFormValues) {
    const needsGate = gateRequired && !accessRef.current?.token;
    if (needsGate) {
      setPending(values);
      setShowGate(true);
      setReport(null);
      setError(null);
      requestAnimationFrame(() => {
        document.getElementById("review-gate")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
      return;
    }
    void runReview(values, accessRef.current);
  }

  function onUnlocked(profile: AccessProfile) {
    setAccess(profile);
    setShowGate(false);
    if (pending) {
      void runReview(pending, profile);
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
              setShowGate(false);
              setPending(null);
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
                reproducible: no model call.
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

            {!gateReady && <div className="card p-5 text-sm text-sub">Loading…</div>}

            {gateReady && (
              <>
                {access?.firstName && access.token && (
                  <p className="text-xs text-sub">
                    Signed in as {access.firstName} ({access.email}). Free reviews are rate-limited to protect the
                    service.
                  </p>
                )}
                <ReviewForm loading={loading} onSubmit={onSubmit} />
              </>
            )}
          </>
        )}

        {showGate && (
          <AccessGate onUnlocked={onUnlocked} />
        )}

        {loading && (
          <div className="card p-5 overflow-hidden relative">
            <div className="text-sm font-medium">Scoring clarity, ambiguity, and injection surface…</div>
            <div className="mt-3 h-1 rounded-full bg-panel2 overflow-hidden">
              <div className="h-full w-1/3 bg-brand animate-sweep" />
            </div>
          </div>
        )}

        {error && <div className="card p-4 border-bad/40 text-sm text-bad">{error}</div>}

        {report && (
          <div id="report" className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                className="btn-ghost"
                onClick={() => {
                  setReport(null);
                  setError(null);
                  setShowGate(false);
                  setPending(null);
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

"use client";

import { useState } from "react";
import type { ReviewReport } from "@/lib/prompt/types";
import { reportToMarkdown } from "@/lib/prompt/markdown";
import {
  Gauge,
  GradeBadge,
  ScoreBar,
  StatusChip,
  colorForInjection,
  colorForScore,
  statusMeta,
} from "./visuals";

export function Report({ report }: { report: ReviewReport }) {
  const [copied, setCopied] = useState<string | null>(null);
  const md = reportToMarkdown(report);
  const covered = report.failureModes.filter((f) => f.coveredInPrompt).length;

  async function copy(text: string, tag: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(tag);
      setTimeout(() => setCopied(null), 1600);
    } catch {
      /* ignore */
    }
  }

  function download(filename: string, body: string, type: string) {
    const blob = new Blob([body], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6 animate-fade-up">
      <div className="card p-6">
        <div className="flex flex-wrap items-center gap-6">
          <GradeBadge grade={report.overall.grade} />
          <Gauge score={report.overall.score} label="overall" />
          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <div className="text-lg font-semibold">{report.label}</div>
              <div className="text-sm text-sub">
                {report.promptWords} words · {report.toolCount} tools · {report.createdAt}
              </div>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
              <Metric
                label="Clarity"
                value={`${report.clarity.score}/100`}
                color={colorForScore(report.clarity.score)}
              />
              <Metric
                label="Ambiguity"
                value={`${report.ambiguity.count} phrase${report.ambiguity.count === 1 ? "" : "s"}`}
                color={report.ambiguity.count === 0 ? "#35d0a5" : report.ambiguity.count <= 3 ? "#f0b23a" : "#f0554d"}
              />
              <Metric
                label="Injection surface"
                value={report.injection.level}
                color={colorForInjection(report.injection.level)}
              />
              <Metric
                label="Failure modes"
                value={`${covered}/${report.failureModes.length} covered`}
                color={covered === report.failureModes.length ? "#35d0a5" : "#f0b23a"}
              />
            </div>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <button className="btn-ghost" onClick={() => copy(md, "md")}>
            {copied === "md" ? "Copied" : "Copy Markdown"}
          </button>
          <button
            className="btn-ghost"
            onClick={() => download(`prompt-review-${report.id}.md`, md, "text/markdown")}
          >
            Download .md
          </button>
          <button
            className="btn-ghost"
            onClick={() =>
              download(`prompt-review-${report.id}.json`, JSON.stringify(report, null, 2), "application/json")
            }
          >
            Download JSON
          </button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {report.categories
          .filter((c) => c.checks.some((k) => k.status !== "skip"))
          .map((cat) => (
            <div key={cat.category} className="card p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="font-semibold">{cat.label}</div>
                <div className="text-sm font-mono" style={{ color: colorForScore(cat.score) }}>
                  {cat.score}/100
                </div>
              </div>
              <ScoreBar score={cat.score} />
              <ul className="space-y-2">
                {cat.checks
                  .filter((k) => k.status !== "skip")
                  .map((c) => {
                    const m = statusMeta(c.status);
                    return (
                      <li key={c.id} className="flex items-start gap-2 text-sm">
                        <span className="mt-0.5 font-bold" style={{ color: m.color }}>
                          {m.glyph}
                        </span>
                        <div className="min-w-0">
                          <div className="font-medium text-ink">{c.label}</div>
                          <div className="text-sub text-xs leading-relaxed">{c.detail}</div>
                        </div>
                      </li>
                    );
                  })}
              </ul>
            </div>
          ))}
      </div>

      {report.ambiguity.hits.length > 0 && (
        <div className="card p-5">
          <div className="font-semibold mb-3">Ambiguity hits</div>
          <ul className="space-y-3">
            {report.ambiguity.hits.slice(0, 12).map((hit, i) => (
              <li key={`${hit.index}-${i}`} className="text-sm border-t border-line pt-3 first:border-0 first:pt-0">
                <div className="font-mono text-warn">“{hit.phrase}”</div>
                <div className="text-sub text-xs mt-1">{hit.reason}</div>
                <div className="text-xs mt-1 text-ink/90">{hit.suggestion}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="card p-5">
        <div className="font-semibold mb-3">Failure modes</div>
        <div className="grid md:grid-cols-2 gap-3">
          {report.failureModes.map((fm) => (
            <div key={fm.id} className="rounded-xl border border-line bg-panel2/40 p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="font-medium text-sm">{fm.title}</div>
                <StatusChip status={fm.coveredInPrompt ? "pass" : "warn"} text={fm.coveredInPrompt ? "Covered" : "Gap"} />
              </div>
              <div className="text-xs text-sub mt-1">{fm.why}</div>
              {!fm.coveredInPrompt && (
                <div className="text-xs mt-2 text-ink/90">Mitigation: {fm.mitigation}</div>
              )}
            </div>
          ))}
        </div>
      </div>

      {report.recommendations.length > 0 && (
        <div className="card p-5 space-y-4">
          <div className="font-semibold">Recommendations</div>
          {report.recommendations.slice(0, 10).map((rec, i) => (
            <div key={`${rec.checkId}-${i}`} className="border-t border-line pt-4 first:border-0 first:pt-0">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="pill uppercase"
                  style={{
                    color: rec.priority === "high" ? "#f0554d" : rec.priority === "medium" ? "#f0b23a" : "#93a0b7",
                    borderColor: "currentColor",
                  }}
                >
                  {rec.priority}
                </span>
                <div className="font-medium">{rec.title}</div>
              </div>
              <div className="mt-2 grid gap-2 text-sm">
                <div>
                  <div className="text-xs uppercase tracking-wide text-sub">Issue</div>
                  <div>{rec.issue}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-sub">Why</div>
                  <div className="text-sub">{rec.why}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-sub">Fix</div>
                  <pre className="mt-1 whitespace-pre-wrap rounded-xl bg-bg border border-line p-3 text-xs font-mono">
                    {rec.fix}
                  </pre>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {report.rewrites.length > 0 && (
        <div className="card p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="font-semibold">Suggested rewrites</div>
            <span className="pill text-good border-good/40">Ready for PR</span>
          </div>
          {report.rewrites.map((rw) => (
            <div key={rw.section}>
              <div className="text-sm font-medium">{rw.section}</div>
              <div className="text-xs text-sub mt-0.5">{rw.rationale}</div>
              <pre className="mt-2 whitespace-pre-wrap rounded-xl bg-bg border border-line p-3 text-xs font-mono">
                {rw.after.trim()}
              </pre>
            </div>
          ))}
        </div>
      )}

      <div className="card p-5">
        <div className="font-semibold mb-2">Next steps</div>
        <ul className="list-disc pl-5 space-y-1.5 text-sm text-sub">
          {report.nextSteps.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function Metric({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="rounded-xl border border-line bg-panel2/50 px-3 py-2">
      <div className="text-[11px] uppercase tracking-wide text-sub">{label}</div>
      <div className="text-sm font-semibold capitalize" style={{ color }}>
        {value}
      </div>
    </div>
  );
}

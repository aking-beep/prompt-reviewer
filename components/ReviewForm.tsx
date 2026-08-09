"use client";

import { useState } from "react";

export type ReviewFormValues = {
  prompt: string;
  toolsText: string;
  label: string;
};

const SAMPLE = `# Role & Objective
You are a support copilot for Acme Billing.
Your goal is to answer account questions using only the provided context.

# Instructions
- Be helpful but use your best judgment.
- When needed, look things up.
- Try to keep answers short.

# Tools
You can call whatever tools make sense.`;

export function ReviewForm({
  loading,
  onSubmit,
}: {
  loading: boolean;
  onSubmit: (values: ReviewFormValues) => void;
}) {
  const [prompt, setPrompt] = useState("");
  const [toolsText, setToolsText] = useState("");
  const [label, setLabel] = useState("system prompt");

  return (
    <form
      className="card p-5 space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ prompt, toolsText, label });
      }}
    >
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-ink">Paste a system prompt</div>
          <div className="text-xs text-sub mt-0.5">
            Optional tool list helps score scoping and human-gate rules. Analysis runs locally in this app — no model call.
          </div>
        </div>
        <button
          type="button"
          className="btn-ghost text-xs"
          onClick={() => {
            setPrompt(SAMPLE);
            setToolsText(
              [
                "get_account — fetch the authenticated user's billing account",
                "send_email — send email to any address",
                "refund — issue a refund for any invoice",
              ].join("\n"),
            );
            setLabel("sample support copilot");
          }}
        >
          Load sample
        </button>
      </div>

      <div>
        <label className="text-xs text-sub">Label</label>
        <input
          className="input mt-1"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="system prompt"
        />
      </div>

      <div>
        <label className="text-xs text-sub">System prompt</label>
        <textarea
          className="input mt-1 font-mono min-h-[220px] leading-relaxed"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="# Role & Objective&#10;You are…"
          required
        />
      </div>

      <div>
        <label className="text-xs text-sub">Tools (optional) — one per line: name — description</label>
        <textarea
          className="input mt-1 font-mono min-h-[96px] leading-relaxed"
          value={toolsText}
          onChange={(e) => setToolsText(e.target.value)}
          placeholder="search_docs — search the internal knowledge base&#10;create_ticket — open a support ticket for the current user only"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" className="btn-primary" disabled={loading || !prompt.trim()}>
          {loading ? "Reviewing…" : "Review prompt"}
        </button>
        <p className="text-[11px] text-sub">
          Results unlock after a one-time signup (same as the MCP scanner).
        </p>
      </div>
    </form>
  );
}

export function parseToolsText(text: string): { name: string; description?: string }[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const parts = line.split(/\s+[—\-–:]\s+/);
      if (parts.length >= 2) {
        return { name: parts[0].trim(), description: parts.slice(1).join(" - ").trim() };
      }
      return { name: line, description: undefined };
    });
}

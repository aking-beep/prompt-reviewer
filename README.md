# Prompt Reviewer

**ARC Labs 0.1 · Release #1** — Free · Open Source · Community Project

Free developer tool that answers one question: **is this system prompt ready to ship?**

Paste a prompt (and optional tool list) and get an overall score (0–100), letter grade, clarity /
ambiguity / injection-surface gauges, named failure modes, and **actionable** rewrites you can paste
into a PR.

Repo: https://github.com/aking-beep/prompt-reviewer  
Labs home (Google Drive): `ARC Transformation/ARC Labs (Free)/prompt-reviewer`  
Sister tool: [MCP Conformance Scanner](https://github.com/aking-beep/mcp-conformance-scanner)

---

## What it does

- Clarity + structure scoring (Role / Instructions / Output / Examples)
- Ambiguity phrase detection with concrete replacements
- Prompt-injection surface analysis (static defenses, OWASP LLM01-aligned)
- Failure-mode catalog with covered / gap status
- Rewrite blocks shaped for a PR
- Export **Markdown** / **JSON**; CLI with `--min-grade` for CI

No accounts. No billing. No model calls. Intentionally small — static review only in 0.1.

---

## What “good” means here

A shippable system prompt, in ARC’s review bar:

1. **Clear contract** — role, objective, and hard requirements (must / never), not vibes.
2. **Structured** — sections and delimiters so instructions and data don’t blur.
3. **Low ambiguity** — no weasel phrases (“be helpful”, “when needed”, “use your judgment”).
4. **Hardened surface** — instruction priority, trust boundary, untrusted-data framing, no secrets in-prompt.
5. **Named failure modes** — refusal, clarify-or-stop, human gate for high-impact tools.
6. **Tool policy** — when tools are present, descriptions are scoped and destructive actions gated.

Scoring is heuristic and reproducible. A high grade means the prompt *states* the right defenses —
not that a live model is unbreakable. Always red-team before production.

---

## Quick start

```bash
npm install
npm run dev
# → http://localhost:3000

# CLI
npm run review -- path/to/prompt.txt
npm run review -- path/to/prompt.txt --tools tools.txt --min-grade=B
npm run review -- path/to/prompt.txt --json
```

### Deploy to Vercel

Import the GitHub repo → Deploy. No env vars required for core review.

---

## API

```http
POST /api/review
Content-Type: application/json

{
  "prompt": "# Role & Objective\n...",
  "label": "support copilot",
  "tools": [{ "name": "refund", "description": "..." }]
}
```

---

## Where the code lives

| Location | Role |
|----------|------|
| Google Drive `ARC Labs (Free)/prompt-reviewer` | Canonical Labs project home |
| `~/Projects/prompt-reviewer` | Local git working copy (synced) |
| GitHub `aking-beep/prompt-reviewer` | Public source of truth |

---

## License

MIT © ARC Transformation Group
